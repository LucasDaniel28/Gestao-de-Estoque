"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HikvisionClient = void 0;
const axios_1 = __importDefault(require("axios"));
const digest_fetch_1 = __importDefault(require("digest-fetch"));
const form_data_1 = __importDefault(require("form-data"));
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = __importDefault(require("fs"));
const xml2js_1 = __importDefault(require("xml2js"));
class HikvisionClient {
    constructor(config) {
        this.config = config;
        this.client = new digest_fetch_1.default(config.username, config.password, { algorithm: 'MD5' });
    }
    getUrl(path) {
        if (path.startsWith('http'))
            return path;
        return `${this.config.baseUrl}${path}`;
    }
    async processImage(imageBuffer) {
        try {
            const processedImage = await (0, sharp_1.default)(imageBuffer)
                .resize(640, 480, { fit: 'cover' })
                .jpeg({ quality: 85 })
                .toBuffer();
            return processedImage;
        }
        catch (error) {
            throw new Error(`Erro ao processar imagem: ${error}`);
        }
    }
    patientToHikvisionUser(patient) {
        return {
            employeeNo: patient.employeeNo,
            name: patient.name,
            userType: 0,
            userNo: "",
            userStatus: 0,
            gender: 1,
            password: "",
            localRight: 1,
            doorRight: 1,
            rightPlan: [
                {
                    doorNo: 1,
                    planTemplateNo: "1"
                }
            ],
            userVerifyMode: 2,
            userValidBeginTime: new Date().toISOString().split('T')[0],
            userValidEndTime: '2099-12-31',
            userValidTimeType: 0,
            userValidCount: 0,
            maxOpenDoorTime: 0,
            openDoorTime: 0,
            roomNumber: "1",
            floorNumber: "1"
        };
    }
    async parseHikvisionResponse(response) {
        const contentType = response.headers?.get?.('content-type') || response.headers?.['content-type'] || '';
        let data = response.data || (typeof response.text === 'function' ? await response.text() : response.body);
        if (typeof data === 'object') {
            return { success: true, data, format: 'json' };
        }
        if (contentType.includes('json') || (typeof data === 'string' && data.trim().startsWith('{'))) {
            try {
                const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
                return { success: true, data: jsonData, format: 'json' };
            }
            catch (e) { }
        }
        if (contentType.includes('xml') || (typeof data === 'string' && data.trim().startsWith('<'))) {
            try {
                const xmlData = await xml2js_1.default.parseStringPromise(data);
                return { success: true, data: xmlData, format: 'xml' };
            }
            catch (e) {
                console.log('Falha no parsing XML:', e.message);
            }
        }
        return { success: false, error: 'Formato não reconhecido' };
    }
    extractXmlData(xmlString, tagName) {
        if (!xmlString || typeof xmlString !== 'string')
            return null;
        const regex = new RegExp(`<${tagName}>([\s\S]*?)<\/${tagName}>`, 'i');
        const match = xmlString.match(regex);
        return match && match[1] ? match[1].trim() : null;
    }
    async listUsers() {
        try {
            const searchXml = `
        <UserInfoSearchCond version="2.0" xmlns="http://www.hikvision.com/ver20/XMLSchema">
          <searchID>1</searchID>
          <searchResultPosition>0</searchResultPosition>
          <maxResults>1000</maxResults>
        </UserInfoSearchCond>
      `;
            const url = this.getUrl('/ISAPI/AccessControl/UserInfo/Search');
            const response = await this.client.fetch(url, {
                method: 'POST',
                body: searchXml,
                headers: { 'Content-Type': 'application/xml' }
            });
            const parsed = await this.parseHikvisionResponse(response);
            if (parsed.success) {
                const users = parsed.data.UserInfoSearchResult.UserInfo;
                return users.map((user) => ({
                    employeeNo: user.employeeNo || '',
                    name: user.name || '',
                    faceId: user.faceId || '',
                    cardNo: user.cardNo || '',
                    userType: parseInt(user.userType) || 0,
                    localRight: parseInt(user.localRight) || 0,
                    userVerifyMode: parseInt(user.userVerifyMode) || 0,
                    rightPlan: parseInt(user.rightPlan) || 0,
                    maxOpenDoorTime: parseInt(user.maxOpenDoorTime) || 0,
                    openDoorTime: parseInt(user.openDoorTime) || 0,
                    roomNumber: parseInt(user.roomNumber) || 0,
                    floorNumber: parseInt(user.floorNumber) || 0,
                    userValidBeginTime: user.userValidBeginTime || '',
                    userValidEndTime: user.userValidEndTime || '',
                    userValidTimeType: parseInt(user.userValidTimeType) || 0,
                    userValidCount: parseInt(user.userValidCount) || 0
                }));
            }
            return [];
        }
        catch (error) {
            console.error('Erro ao listar usuários:', error);
            throw new Error(`Falha ao listar usuários: ${error}`);
        }
    }
    async createUser(patient) {
        try {
            const hikvisionUser = this.patientToHikvisionUser(patient);
            const beginTime = hikvisionUser.userValidBeginTime + "T00:00:00";
            const endTime = "2037-12-31T23:59:59";
            const userData = {
                UserInfo: {
                    employeeNo: hikvisionUser.employeeNo,
                    name: hikvisionUser.name,
                    userType: "normal",
                    Valid: {
                        enable: true,
                        beginTime,
                        endTime,
                        timeType: "local"
                    },
                    password: "",
                    doorRight: "1",
                    RightPlan: [
                        {
                            doorNo: 1,
                            planTemplateNo: "1"
                        }
                    ],
                    gender: "unknown"
                }
            };
            console.log('JSON enviado ao Hikvision:');
            console.log(JSON.stringify(userData, null, 2));
            const url = `${this.config.baseUrl}/ISAPI/AccessControl/UserInfo/Record?format=json`;
            const response = await this.client.fetch(url, {
                method: 'POST',
                body: JSON.stringify(userData),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            const parsed = await this.parseHikvisionResponse(response);
            if (parsed.success) {
                return { statusCode: 1, statusString: 'OK' };
            }
            else {
                return { statusCode: 4, statusString: 'Erro', errorMsg: parsed.error };
            }
        }
        catch (error) {
            console.error('Erro ao criar usuário no Hikvision:', error);
            throw error;
        }
    }
    async updateUser(employeeNo, patient) {
        try {
            const hikvisionUser = this.patientToHikvisionUser(patient);
            const userData = {
                UserInfo: {
                    version: '2.0',
                    xmlns: 'http://www.hikvision.com/ver20/XMLSchema',
                    employeeNo: employeeNo,
                    name: hikvisionUser.name,
                    userType: hikvisionUser.userType,
                    localRight: hikvisionUser.localRight,
                    userVerifyMode: hikvisionUser.userVerifyMode,
                    rightPlan: hikvisionUser.rightPlan,
                    maxOpenDoorTime: hikvisionUser.maxOpenDoorTime,
                    openDoorTime: hikvisionUser.openDoorTime,
                    roomNumber: hikvisionUser.roomNumber,
                    floorNumber: hikvisionUser.floorNumber,
                    userValidBeginTime: hikvisionUser.userValidBeginTime,
                    userValidEndTime: hikvisionUser.userValidEndTime,
                    userValidTimeType: hikvisionUser.userValidTimeType,
                    userValidCount: hikvisionUser.userValidCount
                }
            };
            console.log('JSON enviado ao Hikvision:');
            console.log(JSON.stringify(userData, null, 2));
            const url = this.getUrl(`/ISAPI/AccessControl/UserInfo/Modify?employeeNo=${employeeNo}`);
            const response = await this.client.fetch(url, {
                method: 'PUT',
                body: JSON.stringify(userData),
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Resposta do Hikvision:');
            console.log(JSON.stringify(response.data, null, 2));
            const parsed = await this.parseHikvisionResponse(response);
            if (parsed.success) {
                return { statusCode: 1, statusString: 'OK' };
            }
            else {
                return { statusCode: 4, statusString: 'Erro', errorMsg: parsed.error };
            }
        }
        catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw new Error(`Falha ao atualizar usuário: ${error}`);
        }
    }
    async deleteUser(employeeNo) {
        try {
            const url = this.getUrl(`/ISAPI/AccessControl/UserInfo/Delete?employeeNo=${employeeNo}`);
            const response = await this.client.fetch(url, { method: 'DELETE' });
            const parsed = await this.parseHikvisionResponse(response);
            if (parsed.success) {
                return { statusCode: 1, statusString: 'OK' };
            }
            else {
                return { statusCode: 4, statusString: 'Erro', errorMsg: parsed.error };
            }
        }
        catch (error) {
            console.error('Erro ao deletar usuário:', error);
            throw new Error(`Falha ao deletar usuário: ${error}`);
        }
    }
    async uploadFaceDataRecord({ employeeNo, imagePath, FDID = '1', faceLibType = 'blackFD' }) {
        const imageBuffer = fs_1.default.readFileSync(imagePath);
        const processedImage = await this.processImage(imageBuffer);
        const form = new form_data_1.default();
        form.append('faceLibType', faceLibType);
        form.append('FDID', FDID);
        form.append('FPID', employeeNo);
        form.append('faceImage', processedImage, {
            filename: `${employeeNo}.jpg`,
            contentType: 'image/jpeg'
        });
        const url = this.getUrl('/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json');
        const response = await axios_1.default.post(url, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': 'Basic ' + Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')
            },
            timeout: 20000,
            validateStatus: () => true
        });
        return response.data;
    }
    async deleteFace(faceId, FDID = '1') {
        try {
            const url = this.getUrl('/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json');
            const body = {
                FaceDataRecordList: [{
                        FDID,
                        faceID: faceId
                    }]
            };
            const response = await this.client.fetch(url, {
                method: 'DELETE',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' }
            });
            const parsed = await this.parseHikvisionResponse(response);
            if (parsed.success) {
                return { statusCode: 1, statusString: 'OK' };
            }
            else {
                return { statusCode: 4, statusString: 'Erro', errorMsg: parsed.error };
            }
        }
        catch (error) {
            console.error('Erro ao deletar face:', error);
            throw new Error(`Falha ao deletar face: ${error}`);
        }
    }
    async checkDeviceStatus() {
        try {
            const url = this.getUrl('/ISAPI/System/deviceInfo');
            const response = await this.client.fetch(url, { method: 'GET' });
            return response.status === 200;
        }
        catch (error) {
            console.error('Dispositivo não está acessível:', error);
            return false;
        }
    }
    async getDeviceInfo() {
        try {
            const url = this.getUrl('/ISAPI/System/deviceInfo');
            const response = await this.client.fetch(url, { method: 'GET' });
            const parsed = await this.parseHikvisionResponse(response);
            if (parsed.success) {
                return parsed.data;
            }
            else {
                throw new Error(parsed.error || 'Erro ao obter informações do dispositivo');
            }
        }
        catch (error) {
            console.error('Erro ao obter informações do dispositivo:', error);
            throw new Error(`Falha ao obter informações do dispositivo: ${error}`);
        }
    }
    async listFaceLibraries() {
        const url = this.getUrl('/ISAPI/Intelligent/FDLib');
        const response = await this.client.fetch(url, { method: 'GET', headers: { 'Accept': 'application/xml' } });
        const parsed = await this.parseHikvisionResponse(response);
        if (parsed.success && parsed.data && parsed.data.FDLibList && parsed.data.FDLibList.FDLib) {
            return parsed.data.FDLibList.FDLib;
        }
        return [];
    }
    async uploadFacePictureLibrary({ name, customHumanID, imagePath, FDID, sex = 'unknown', bornTime = '', certificateType = '', certificateNumber = '', phoneNumber = '' }) {
        let realFDID = FDID;
        if (!realFDID) {
            const libs = await this.listFaceLibraries();
            if (!libs.length) {
                return { statusCode: 4, statusString: 'Erro', errorMsg: 'Nenhuma biblioteca facial encontrada no dispositivo.' };
            }
            realFDID = libs[0].id?.[0] || libs[0].FDID?.[0] || '1';
        }
        const imageBuffer = fs_1.default.readFileSync(imagePath);
        const processedImage = await this.processImage(imageBuffer);
        let faceAppendData = `
      <name>${name}</name>
      <sex>${sex}</sex>
      ${bornTime ? `<bornTime>${bornTime}</bornTime>` : ''}
      ${certificateType ? `<certificateType>${certificateType}</certificateType>` : ''}
      ${certificateNumber ? `<certificateNumber>${certificateNumber}</certificateNumber>` : ''}
      ${phoneNumber ? `<phoneNumber>${phoneNumber}</phoneNumber>` : ''}
      <customHumanID>${customHumanID}</customHumanID>
    `;
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <PictureUploadData version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
        <FDID>${realFDID}</FDID>
        <FaceAppendData>
          ${faceAppendData.trim()}
        </FaceAppendData>
      </PictureUploadData>`;
        const form = new form_data_1.default();
        form.append('PictureUploadData', xml, { contentType: 'application/xml' });
        form.append('face_picture', processedImage, {
            filename: `${customHumanID}.jpg`,
            contentType: 'image/jpeg'
        });
        const url = this.getUrl('/ISAPI/Intelligent/FDLib/pictureUpload');
        const headers = form.getHeaders();
        const body = form.getBuffer();
        const response = await this.client.fetch(url, {
            method: 'POST',
            headers,
            body
        });
        const parsed = await this.parseHikvisionResponse(response);
        if (parsed.success) {
            return {
                statusCode: 1,
                statusString: 'OK',
                rawResponse: parsed.data ? JSON.stringify(parsed.data) : ''
            };
        }
        else {
            return {
                statusCode: 4,
                statusString: 'Erro',
                errorMsg: parsed.error || 'Erro desconhecido',
                rawResponse: parsed.data ? JSON.stringify(parsed.data) : ''
            };
        }
    }
    async createFaceLibrary({ id, name, maxCapacity = 1000, faceThreshold = 80, customInfo = '', customFaceLibID = '', autoUpdata = true, qualityThreshold = 50 }) {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CreateFDLibList xmlns="http://www.isapi.org/ver20/XMLSchema" version="2.0">
  <CreateFDLib>
    <id>${id}</id>
    <name>${name}</name>
    <maxCapacity>${maxCapacity}</maxCapacity>
    <thresholdValue>${faceThreshold}</thresholdValue>
    <customInfo>${customInfo}</customInfo>
    <customFaceLibID>${customFaceLibID}</customFaceLibID>
    <autoUpdata>${autoUpdata}</autoUpdata>
    <qualityThreshold>${qualityThreshold}</qualityThreshold>
  </CreateFDLib>
</CreateFDLibList>`;
        const url = this.getUrl('/ISAPI/Intelligent/FDLib');
        const response = await this.client.fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/xml' },
            body: xml
        });
        const parsed = await this.parseHikvisionResponse(response);
        if (parsed.success) {
            return {
                statusCode: 1,
                statusString: 'OK',
                rawResponse: parsed.data ? JSON.stringify(parsed.data) : ''
            };
        }
        else {
            return {
                statusCode: 4,
                statusString: 'Erro',
                errorMsg: parsed.error || 'Erro desconhecido',
                rawResponse: parsed.data ? JSON.stringify(parsed.data) : ''
            };
        }
    }
    async uploadFaceDataRecordXml({ FDID = '1', FPID, imagePath, faceLibType = 'blackFD' }) {
        try {
            const xml = `<?xml version="1.0" encoding="UTF-8"?>
<FaceDataRecord version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <FDID>${FDID}</FDID>
  <FPID>${FPID}</FPID>
  <faceLibType>${faceLibType}</faceLibType>
</FaceDataRecord>`;
            const form = new form_data_1.default();
            form.append('FaceDataRecord', xml, { contentType: 'application/xml' });
            const imageBuffer = fs_1.default.readFileSync(imagePath);
            form.append('FaceImage', imageBuffer, {
                filename: `${FPID}.jpg`,
                contentType: 'image/jpeg'
            });
            const url = this.getUrl('/ISAPI/Intelligent/FDLib/FaceDataRecord');
            const headers = form.getHeaders();
            const response = await this.client.fetch(url, {
                method: 'POST',
                headers,
                body: form.getBuffer()
            });
            const parsed = await this.parseHikvisionResponse(response);
            if (parsed.success) {
                return {
                    statusCode: 1,
                    statusString: 'OK',
                    rawResponse: parsed.data ? JSON.stringify(parsed.data) : ''
                };
            }
            else {
                return {
                    statusCode: 4,
                    statusString: 'Erro',
                    errorMsg: parsed.error || 'Erro desconhecido',
                    rawResponse: parsed.data ? JSON.stringify(parsed.data) : ''
                };
            }
        }
        catch (error) {
            return {
                statusCode: 4,
                statusString: 'Erro',
                errorMsg: error instanceof Error ? error.message : 'Erro desconhecido',
                rawResponse: ''
            };
        }
    }
    getClient() {
        return this.client;
    }
}
exports.HikvisionClient = HikvisionClient;
//# sourceMappingURL=hikvisionClient.js.map