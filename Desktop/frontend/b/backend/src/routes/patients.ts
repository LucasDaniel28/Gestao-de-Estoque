import { Router, Request, Response } from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { HikvisionClient } from '../services/hikvisionClient';
import { hikvisionConfig, uploadConfig } from '../config/hikvision';
import { 
  Patient, 
  PatientCreateRequest, 
  PatientUpdateRequest, 
  ApiResponse 
} from '../types';
import path from 'path';
import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
import xml2js from 'xml2js';

const router = Router();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// Instância do cliente Hikvision
const hikvisionClient = new HikvisionClient(hikvisionConfig);

/**
 * Middleware para tratamento de erros de validação
 */
const handleValidationErrors = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array(),
      timestamp: new Date().toISOString()
    });
  }
  next();
};

/**
 * Middleware para tratamento de erros gerais
 */
const errorHandler = (error: Error, req: Request, res: Response, next: Function) => {
  console.error('Erro na rota:', error);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: error.message,
    timestamp: new Date().toISOString()
  });
};

/**
 * GET /api/patients
 * Lista todos os pacientes cadastrados no dispositivo Hikvision
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Verifica se o dispositivo está online
    const isOnline = await hikvisionClient.checkDeviceStatus();
    if (!isOnline) {
      return res.status(503).json({
        success: false,
        message: 'Dispositivo Hikvision não está acessível',
        timestamp: new Date().toISOString()
      });
    }

    // Lista usuários do dispositivo
    const hikvisionUsers = await hikvisionClient.listUsers();
    
    // Converte para formato de pacientes
    const patients: Patient[] = hikvisionUsers.map(user => ({
      employeeNo: user.employeeNo,
      name: user.name,
      registrationDate: user.userValidBeginTime ? String(user.userValidBeginTime) : new Date().toISOString().split('T')[0],
      status: 'active' as const
    })) as Patient[];

    const response: ApiResponse<Patient[]> = {
      success: true,
      message: 'Pacientes listados com sucesso',
      data: patients,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    errorHandler(error instanceof Error ? error : new Error(String(error)), req, res, () => {});
  }
});

/**
 * POST /api/patients
 * Cadastra um novo paciente no dispositivo Hikvision
 */
router.post('/', upload.single('photo'), [
  body('employeeNo')
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Matrícula deve ter entre 1 e 20 caracteres'),
  body('name')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome deve ter entre 1 e 100 caracteres'),
  body('gender')
    .optional()
    .isIn(['M', 'F', 'O'])
    .withMessage('Gênero deve ser M, F ou O'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Data de nascimento deve estar no formato ISO 8601'),
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { employeeNo, name, gender, dateOfBirth, tempFile } = req.body;
    
    let imagePath: string;
    if (tempFile) {
      imagePath = require('path').join('uploads', tempFile);
    } else if (req.file) {
      imagePath = req.file.path;
    } else {
      return res.status(400).json({ 
        error: 'Foto é obrigatória para cadastro com facial' 
      });
    }

    console.log('Iniciando cadastro de paciente com facial:', { employeeNo, name, imagePath });

    // 1. Verificar se o dispositivo está online
    const isOnline = await hikvisionClient.checkDeviceStatus();
    if (!isOnline) {
      return res.status(503).json({ 
        error: 'Dispositivo Hikvision não está acessível' 
      });
    }

    // 2. Tentar criar biblioteca facial (se não existir)
    console.log('Tentando criar biblioteca facial...');
    try {
      const createLibResult = await hikvisionClient.createFaceLibrary({
        id: '1',
        name: 'Biblioteca Principal',
        maxCapacity: 1000,
        faceThreshold: 80,
        customInfo: 'Biblioteca criada automaticamente pelo sistema',
        customFaceLibID: 'main_lib',
        autoUpdata: true,
        qualityThreshold: 50
      });
      
      if (createLibResult.statusCode === 1) {
        console.log('Biblioteca facial criada com sucesso');
      } else {
        console.log('Biblioteca facial já existe ou erro na criação:', createLibResult);
      }
    } catch (error) {
      console.log('Erro ao criar biblioteca facial (pode já existir):', error);
    }

    // 3. Cadastrar usuário no dispositivo
    console.log('Cadastrando usuário no dispositivo...');
    const patient: Patient = {
      employeeNo,
      name,
      gender: gender || 'O',
      dateOfBirth: dateOfBirth || undefined,
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    const userResult = await hikvisionClient.createUser(patient);
    if (userResult.statusCode !== 1) {
      console.error('Erro ao cadastrar usuário:', userResult);
      return res.status(500).json({ 
        error: 'Falha ao cadastrar usuário no dispositivo',
        details: userResult.errorMsg 
      });
    }
    console.log('Usuário cadastrado com sucesso no dispositivo');

    // 4. Enviar foto facial via FaceDataRecord (protocolo ISAPI padrão)
    console.log('Enviando foto facial via FaceDataRecord (protocolo ISAPI)...');
    const faceResult = await hikvisionClient.uploadFaceDataRecordXml({
      FDID: '1',
      FPID: employeeNo,
      imagePath: imagePath
    });

    if (faceResult.statusCode !== 1) {
      console.error('Erro ao enviar foto facial:', JSON.stringify(faceResult, null, 2));
      if (faceResult?.rawResponse) {
        console.error('Detalhe ISAPI:', faceResult.rawResponse);
      }
      // Mesmo com erro na foto, o usuário foi cadastrado
      return res.status(207).json({ 
        message: 'Usuário cadastrado, mas falha no envio da foto facial',
        userStatus: 'success',
        faceStatus: 'error',
        details: faceResult.errorMsg 
      });
    }

    console.log('Cadastro completo realizado com sucesso');
    return res.status(201).json({
      message: 'Paciente cadastrado com sucesso no dispositivo',
      employeeNo,
      name,
      userStatus: 'success',
      faceStatus: 'success'
    });

  } catch (error: any) {
    console.error('Erro no cadastro de paciente:', error);
    return res.status(500).json({ 
      error: 'Erro interno no servidor',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * PUT /api/patients/:employeeNo
 * Atualiza dados de um paciente existente
 */
router.put('/:employeeNo', [
  body('name')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('dateOfBirth')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Data de nascimento deve estar no formato YYYY-MM-DD'),
  body('gender')
    .optional({ checkFalsy: true })
    .isIn(['M', 'F', 'O'])
    .withMessage('Gênero deve ser M, F ou O'),
  body('phone')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Telefone deve ter no máximo 20 caracteres'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Email deve ser válido'),
  body('address')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Endereço deve ter no máximo 200 caracteres'),
  body('emergencyContact')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contato de emergência deve ter no máximo 100 caracteres'),
  body('bloodType')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Tipo sanguíneo deve ter no máximo 10 caracteres'),
  body('allergies')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Alergias devem ter no máximo 500 caracteres'),
  body('medicalHistory')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Histórico médico deve ter no máximo 1000 caracteres'),
  body('insurance')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Plano de saúde deve ter no máximo 100 caracteres'),
  body('status')
    .optional({ checkFalsy: true })
    .isIn(['active', 'inactive', 'discharged'])
    .withMessage('Status deve ser active, inactive ou discharged'),
  handleValidationErrors
], async (req: Request, res: Response) => {
  try {
    const { employeeNo } = req.params;
    const updateData: PatientUpdateRequest = req.body;

    // Verifica se o dispositivo está online
    const isOnline = await hikvisionClient.checkDeviceStatus();
    if (!isOnline) {
      return res.status(503).json({
        success: false,
        message: 'Dispositivo Hikvision não está acessível',
        timestamp: new Date().toISOString()
      });
    }

    // Busca o paciente atual
    const hikvisionUsers = await hikvisionClient.listUsers();
    const currentUser = hikvisionUsers.find(user => user.employeeNo === employeeNo);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Paciente não encontrado',
        timestamp: new Date().toISOString()
      });
    }

    // Cria objeto paciente atualizado
    const updatedPatient: Patient = {
      employeeNo: currentUser.employeeNo || '',
      name: updateData.name || currentUser.name || '',
      dateOfBirth: updateData.dateOfBirth,
      gender: updateData.gender,
      phone: updateData.phone,
      email: updateData.email,
      address: updateData.address,
      emergencyContact: updateData.emergencyContact,
      bloodType: updateData.bloodType,
      allergies: updateData.allergies,
      medicalHistory: updateData.medicalHistory,
      insurance: updateData.insurance,
      registrationDate: currentUser.userValidBeginTime ? String(currentUser.userValidBeginTime) : new Date().toISOString().split('T')[0],
      status: updateData.status || 'active'
    };

    // Atualiza no dispositivo Hikvision
    const result = await hikvisionClient.updateUser(employeeNo || '', updatedPatient);

    if (result.statusCode === 1) {
      const response: ApiResponse<Patient> = {
        success: true,
        message: 'Paciente atualizado com sucesso',
        data: updatedPatient,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } else {
      throw new Error(`Erro ao atualizar paciente: ${result.statusString}`);
    }
  } catch (error) {
    errorHandler(error instanceof Error ? error : new Error(String(error)), req, res, () => {});
  }
});

/**
 * DELETE /api/patients/:employeeNo
 * Remove um paciente do dispositivo Hikvision
 */
router.delete('/:employeeNo', async (req: Request, res: Response) => {
  try {
    const { employeeNo } = req.params;

    // Verifica se o dispositivo está online
    const isOnline = await hikvisionClient.checkDeviceStatus();
    if (!isOnline) {
      return res.status(503).json({
        success: false,
        message: 'Dispositivo Hikvision não está acessível',
        timestamp: new Date().toISOString()
      });
    }

    // Remove o usuário do dispositivo Hikvision
    const result = await hikvisionClient.deleteUser(employeeNo || '');

    if (result.statusCode === 1) {
      const response: ApiResponse = {
        success: true,
        message: 'Paciente removido com sucesso do dispositivo Hikvision',
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } else {
      throw new Error(`Erro ao remover paciente: ${result.statusString}`);
    }
  } catch (error) {
    errorHandler(error instanceof Error ? error : new Error(String(error)), req, res, () => {});
  }
});

/**
 * POST /api/patients/:employeeNo/face
 * Cadastra uma foto de rosto para um paciente
 */
router.post('/:employeeNo/face', upload.single('faceImage'), async (req: Request, res: Response) => {
  try {
    const { employeeNo } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem foi enviada',
        timestamp: new Date().toISOString()
      });
    }

    // Verifica se o dispositivo está online
    const isOnline = await hikvisionClient.checkDeviceStatus();
    if (!isOnline) {
      return res.status(503).json({
        success: false,
        message: 'Dispositivo Hikvision não está acessível',
        timestamp: new Date().toISOString()
      });
    }

    // Verifica se o paciente existe
    const hikvisionUsers = await hikvisionClient.listUsers();
    const patient = hikvisionUsers.find(user => user.employeeNo === employeeNo);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente não encontrado',
        timestamp: new Date().toISOString()
      });
    }

    // Faz upload da face para o dispositivo Hikvision
    const fs = require('fs');
    const path = require('path');
    const tempFilename = `face-upload-${Date.now()}.jpg`;
    const tempFilePath = path.join('uploads', tempFilename);
    fs.writeFileSync(tempFilePath, file.buffer);
    const result = await hikvisionClient.uploadFacePictureLibrary({
      name: 'Face Upload',
      customHumanID: employeeNo || '',
      imagePath: tempFilePath,
      FDID: '1'
    });
    fs.unlinkSync(tempFilePath);

    if (result.statusCode === 1) {
      const response: ApiResponse = {
        success: true,
        message: 'Foto de rosto cadastrada com sucesso no dispositivo Hikvision',
        timestamp: new Date().toISOString()
      };
      res.status(201).json(response);
    } else {
      throw new Error(`Erro ao cadastrar foto de rosto: ${result.statusString}`);
    }
  } catch (error) {
    errorHandler(error instanceof Error ? error : new Error(String(error)), req, res, () => {});
  }
});

/**
 * DELETE /api/patients/:employeeNo/face
 * Remove a foto de rosto de um paciente
 */
router.delete('/:employeeNo/face', async (req: Request, res: Response) => {
  try {
    const { employeeNo } = req.params;
    const { faceId, FDID } = req.body;

    // Verifica se o dispositivo está online
    const isOnline = await hikvisionClient.checkDeviceStatus();
    if (!isOnline) {
      return res.status(503).json({
        success: false,
        message: 'Dispositivo Hikvision não está acessível',
        timestamp: new Date().toISOString()
      });
    }

    let resolvedFaceId = faceId;
    let resolvedFDID = FDID || '1';

    // Se não veio faceId, buscar pelo employeeNo
    if (!resolvedFaceId && employeeNo) {
      // Buscar faceId via FDSearch
      const fdSearchUrl = hikvisionClient.getUrl('/ISAPI/Intelligent/FDLib/FDSearch?format=json');
      const searchBody = {
        faceLibType: 'blackFD',
        searchResultPosition: 0,
        maxResults: 100,
        FPID: employeeNo
      };
      const response = await hikvisionClient.getClient().fetch(fdSearchUrl, {
        method: 'POST',
        body: JSON.stringify(searchBody),
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });
      const data = await response.json();
      if (data.MatchList && data.MatchList.length > 0) {
        resolvedFaceId = data.MatchList[0].faceID;
        resolvedFDID = data.MatchList[0].FDID || resolvedFDID;
      } else {
        return res.status(404).json({ success: false, message: 'Face não encontrada para este usuário.' });
      }
    }

    // Remove a face do dispositivo Hikvision
    if (!resolvedFaceId || !resolvedFDID) {
      return res.status(400).json({ success: false, message: 'faceId e FDID são obrigatórios para remover a foto facial.' });
    }
    const result = await hikvisionClient.deleteFace(String(resolvedFaceId), String(resolvedFDID));

    if (result.statusCode === 1) {
      const response: ApiResponse = {
        success: true,
        message: 'Foto de rosto removida com sucesso do dispositivo Hikvision',
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } else {
      throw new Error(`Erro ao remover foto de rosto: ${result.statusString}`);
    }
  } catch (error) {
    errorHandler(error instanceof Error ? error : new Error(String(error)), req, res, () => {});
  }
});

/**
 * GET /api/patients/status
 * Verifica o status do dispositivo Hikvision
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const isOnline = await hikvisionClient.checkDeviceStatus();
    
    if (isOnline) {
      const deviceInfo = await hikvisionClient.getDeviceInfo();
      const response: ApiResponse = {
        success: true,
        message: 'Dispositivo Hikvision está online',
        data: {
          status: 'online',
          deviceInfo: deviceInfo
        },
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        message: 'Dispositivo Hikvision está offline',
        data: {
          status: 'offline'
        },
        timestamp: new Date().toISOString()
      };
      res.status(503).json(response);
    }
  } catch (error) {
    errorHandler(error instanceof Error ? error : new Error(String(error)), req, res, () => {});
  }
});

/**
 * GET /api/patients/raw
 * Retorna o JSON bruto dos usuários cadastrados no dispositivo Hikvision
 */
router.get('/raw', async (req: Request, res: Response) => {
  try {
    // Busca os dados brutos do dispositivo
    const url = hikvisionConfig.baseUrl + '/ISAPI/AccessControl/UserInfo/Search?format=json';
    const searchBody = {
      UserInfoSearchCond: {
        searchID: "1",
        searchResultPosition: 0,
        maxResults: 50
      }
    };
    const response = await hikvisionClient.getClient().fetch(url, {
      method: 'POST',
      body: JSON.stringify(searchBody),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar dados brutos do dispositivo'
    });
  }
});

/**
 * GET /api/patients/faces
 * Lista todos os pacientes cadastrados no dispositivo Hikvision, incluindo a URL da foto facial
 */
router.get('/faces', async (req: Request, res: Response) => {
  try {
    // Verifica se o dispositivo está online
    const isOnline = await hikvisionClient.checkDeviceStatus();
    if (!isOnline) {
      return res.status(503).json({
        success: false,
        message: 'Dispositivo Hikvision não está acessível',
        timestamp: new Date().toISOString()
      });
    }

    // Consulta o endpoint FDSearch do Hikvision
    const fdSearchUrl = hikvisionClient.getUrl('/ISAPI/Intelligent/FDLib/FDSearch?format=json');
    const searchBody = {
      faceLibType: "blackFD",
      FDID: "1",
      searchResultPosition: 0,
      maxResults: 100
    };
    const response = await hikvisionClient.getClient().fetch(fdSearchUrl, {
      method: 'POST',
      body: JSON.stringify(searchBody),
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    });
    const data = await response.json();

    if (!data.MatchList) {
      return res.status(200).json({ success: true, data: [], timestamp: new Date().toISOString() });
    }

    // Garante que MatchList seja sempre um array
    const matchList = Array.isArray(data.MatchList) ? data.MatchList : [data.MatchList];

    // Para cada FPID, buscar o nome usando UserInfo/Search
    const patients = await Promise.all(matchList.map(async (user: any) => {
      const employeeNo = user.FPID || user.employeeNo || '';
      let name = '';
      if (employeeNo) {
        const userInfoUrl = hikvisionClient.getUrl('/ISAPI/AccessControl/UserInfo/Search?format=json');
        const userInfoBody = {
          UserInfoSearchCond: {
            searchID: "1",
            searchResultPosition: 0,
            maxResults: 1,
            EmployeeNoList: [
              { employeeNo }
            ]
          }
        };
        try {
          const userInfoResp = await hikvisionClient.getClient().fetch(userInfoUrl, {
            method: 'POST',
            body: JSON.stringify(userInfoBody),
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
          });
          const userInfoData = await userInfoResp.json();
          if (userInfoData.UserInfoSearch && userInfoData.UserInfoSearch.UserInfo && userInfoData.UserInfoSearch.UserInfo.length > 0) {
            name = userInfoData.UserInfoSearch.UserInfo[0].name || '';
          }
        } catch (e) {
          // Se falhar, mantém name como ''
        }
      }
      return {
        employeeNo,
        name,
        faceURL: user.faceURL || ''
      };
    }));

    res.json({ success: true, data: patients, timestamp: new Date().toISOString() });
  } catch (error) {
    errorHandler(error instanceof Error ? error : new Error(String(error)), req, res, () => {});
  }
});

// Novo endpoint: captura facial do terminal e retorna base64
router.post('/capture-face', async (req, res) => {
  try {
    // 1. Aciona o terminal para capturar a face e já recebe a imagem
    const captureXml = `
      <CaptureFaceData version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
        <CaptureFaceDataCond>
          <captureInfrared>true</captureInfrared>
          <dataType>binary</dataType>
        </CaptureFaceDataCond>
      </CaptureFaceData>
    `;
    const response = await hikvisionClient.getClient().fetch(
      hikvisionClient.getUrl('/ISAPI/AccessControl/CaptureFaceData'),
      {
        method: 'POST',
        body: captureXml,
        headers: { 'Content-Type': 'application/xml', 'Accept': 'multipart/related' }
      }
    );
    const buffer = Buffer.from(await response.arrayBuffer ? await response.arrayBuffer() : await response.buffer());

    // Procura o início e fim do JPEG
    const start = buffer.indexOf(Buffer.from([0xFF, 0xD8]));
    const end = buffer.indexOf(Buffer.from([0xFF, 0xD9]));
    if (start === -1 || end === -1) {
      return res.status(500).json({ success: false, message: 'Não foi possível encontrar uma imagem JPEG válida.' });
    }
    const jpeg = buffer.slice(start, end + 2);
    const filename = `face-capture-${Date.now()}.jpg`;
    const filepath = require('path').join('uploads', filename);
    require('fs').writeFileSync(filepath, jpeg);
    const faceBase64 = jpeg.toString('base64');
    res.json({ success: true, imageBase64: `data:image/jpeg;base64,${faceBase64}`, tempFile: filename });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Erro ao capturar imagem facial' });
  }
});

// Endpoint para consultar a capacidade de captura de face do dispositivo Hikvision
router.get('/capture-face-capacity', async (req, res) => {
  try {
    const response = await hikvisionClient.getClient().fetch(
      hikvisionClient.getUrl('/ISAPI/AccessControl/CaptureFaceData'),
      {
        method: 'GET',
        headers: { 'Accept': 'application/xml' }
      }
    );
    const xml = await response.text();
    res.type('application/xml').send(xml);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Erro ao consultar capacidade de captura facial' });
  }
});

// Novo endpoint: cadastro completo na Face Picture Library
router.post('/face-picture-library', async (req, res) => {
  try {
    const { name, customHumanID, FDID, sex, bornTime, certificateType, certificateNumber, phoneNumber, tempFile } = req.body;
    if (!name || !customHumanID || !tempFile) {
      return res.status(400).json({ success: false, message: 'Nome, ID e tempFile são obrigatórios.' });
    }
    const imagePath = require('path').join('uploads', tempFile);
    const result = await hikvisionClient.uploadFacePictureLibrary({
      name,
      customHumanID,
      imagePath,
      FDID: FDID || '1',
      sex: sex || 'unknown',
      bornTime: bornTime || '',
      certificateType: certificateType || '',
      certificateNumber: certificateNumber || '',
      phoneNumber: phoneNumber || ''
    });
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Erro ao cadastrar na Face Picture Library:', error);
    res.status(500).json({ success: false, message: 'Erro ao cadastrar na Face Picture Library', error: error.message });
  }
});

// Endpoint para criar biblioteca facial
router.post('/face-library', async (req: Request, res: Response) => {
  try {
    console.log('Criando biblioteca facial...');
    
    const result = await hikvisionClient.createFaceLibrary({
      id: '1',
      name: 'Biblioteca Principal',
      maxCapacity: 1000,
      faceThreshold: 80,
      customInfo: 'Biblioteca criada automaticamente pelo sistema',
      customFaceLibID: 'main_lib',
      autoUpdata: true,
      qualityThreshold: 50
    });

    if (result.statusCode === 1) {
      return res.status(201).json({
        message: 'Biblioteca facial criada com sucesso',
        result
      });
    } else {
      return res.status(400).json({
        error: 'Falha ao criar biblioteca facial',
        details: result.errorMsg || result
      });
    }
  } catch (error: any) {
    console.error('Erro ao criar biblioteca facial:', error);
    return res.status(500).json({
      error: 'Erro interno no servidor',
      details: error.message
    });
  }
});

// Endpoint para verificar status do dispositivo
router.get('/device-status', async (req: Request, res: Response) => {
  try {
    const isOnline = await hikvisionClient.checkDeviceStatus();
    const deviceInfo = await hikvisionClient.getDeviceInfo();
    
    return res.json({
      online: isOnline,
      deviceInfo
    });
  } catch (error) {
    console.error('Erro ao verificar status do dispositivo:', error);
    return res.status(500).json({
      error: 'Erro ao verificar status do dispositivo',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/patients/statistics
 * Retorna estatísticas dos pacientes cadastrados (baseado no Firebase)
 */
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    // Busca dados do Firebase via frontend
    // Como o backend não tem acesso direto ao Firebase, vamos retornar dados simulados
    // ou criar um endpoint que recebe os dados do frontend
    
    // Por enquanto, retorna dados vazios para indicar que deve usar Firebase
    const statistics = {
      total: 0,
      maxRegistrationsDate: '',
      maxRegistrationsCount: 0,
      minRegistrationsDate: '',
      minRegistrationsCount: 0,
      registrationsByDate: {},
      source: 'firebase'
    };

    res.json({
      success: true,
      data: statistics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/patients/statistics/firebase
 * Recebe estatísticas calculadas pelo frontend baseadas no Firebase
 */
router.post('/statistics/firebase', async (req: Request, res: Response) => {
  try {
    const { total, maxRegistrationsDate, maxRegistrationsCount, minRegistrationsDate, minRegistrationsCount, registrationsByDate } = req.body;
    
    const statistics = {
      total: total || 0,
      maxRegistrationsDate: maxRegistrationsDate || '',
      maxRegistrationsCount: maxRegistrationsCount || 0,
      minRegistrationsDate: minRegistrationsDate || '',
      minRegistrationsCount: minRegistrationsCount || 0,
      registrationsByDate: registrationsByDate || {},
      source: 'firebase'
    };

    res.json({
      success: true,
      data: statistics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao processar estatísticas do Firebase:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar estatísticas do Firebase',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 