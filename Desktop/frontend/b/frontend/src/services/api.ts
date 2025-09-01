import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  Patient, 
  PatientCreateRequest, 
  PatientUpdateRequest, 
  ApiResponse, 
  DeviceStatus 
} from '../types';

/**
 * Cliente HTTP para comunicação com a API do backend
 */
class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para tratamento de erros
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Erro na API:', error);
        
        if (error.response?.status === 503) {
          throw new Error('Dispositivo Hikvision não está acessível. Verifique a conexão.');
        }
        
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        
        throw new Error('Erro na comunicação com o servidor');
      }
    );
  }

  /**
   * Lista todos os pacientes
   */
  async getPatients(): Promise<Patient[]> {
    try {
      const response: AxiosResponse<ApiResponse<Patient[]>> = await this.client.get('/api/patients');
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      throw error;
    }
  }

  /**
   * Cadastra um novo paciente
   */
  async createPatient(patientData: FormData): Promise<Patient> {
    const response = await this.client.post('/api/patients', patientData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Atualiza dados de um paciente
   */
  async updatePatient(employeeNo: string, patientData: PatientUpdateRequest): Promise<Patient> {
    try {
      const response: AxiosResponse<ApiResponse<Patient>> = await this.client.put(`/api/patients/${employeeNo}`, patientData);
      return response.data.data!;
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      throw error;
    }
  }

  /**
   * Remove um paciente
   */
  async deletePatient(employeeNo: string): Promise<void> {
    try {
      await this.client.delete(`/api/patients/${employeeNo}`);
    } catch (error) {
      console.error('Erro ao deletar paciente:', error);
      throw error;
    }
  }

  /**
   * Faz upload da foto de rosto de um paciente
   */
  async uploadFace(employeeNo: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.client.defaults.baseURL}/patients/${employeeNo}/face`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Falha ao enviar foto facial');
    }
  }

  /**
   * Remove a foto de rosto de um paciente
   */
  async deleteFace(employeeNo: string): Promise<void> {
    try {
      await this.client.delete(`/api/patients/${employeeNo}/face`);
    } catch (error) {
      console.error('Erro ao deletar face:', error);
      throw error;
    }
  }

  /**
   * Verifica o status do dispositivo Hikvision
   */
  async getDeviceStatus(): Promise<DeviceStatus> {
    try {
      const response: AxiosResponse<ApiResponse<DeviceStatus>> = await this.client.get('/api/patients/status');
      return response.data.data!;
    } catch (error) {
      console.error('Erro ao verificar status do dispositivo:', error);
      return {
        status: 'offline'
      };
    }
  }

  /**
   * Verifica se a API está funcionando
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response: AxiosResponse = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Erro no health check:', error);
      return false;
    }
  }

  /**
   * Lista todos os pacientes com foto facial (direto do dispositivo)
   */
  async getPatientsWithFaces(): Promise<{ employeeNo: string; name: string; faceURL: string }[]> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { employeeNo: string; name: string; faceURL: string }[] }> = await this.client.get('/api/patients/faces');
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar pacientes com foto:', error);
      throw error;
    }
  }

  /**
   * Captura uma foto facial diretamente do terminal e retorna a imagem em base64
   */
  async captureFaceFromTerminal(): Promise<{ imageBase64: string; tempFile: string }> {
    const response = await this.client.post('/api/patients/capture-face');
    return response.data;
  }

  /**
   * Cadastro completo na Face Picture Library (nome, ID, foto)
   */
  async registerFacePictureLibrary(data: {
    name: string;
    customHumanID: string;
    tempFile: string;
    FDID?: string;
    sex?: 'male' | 'female' | 'unknown';
    bornTime?: string;
    certificateType?: string;
    certificateNumber?: string;
    phoneNumber?: string;
  }): Promise<any> {
    const response = await this.client.post('/api/patients/face-picture-library', data);
    return response.data;
  }

  async createFaceLibrary(): Promise<any> {
    const response = await fetch(`${this.client.defaults.baseURL}/patients/face-library`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Falha ao criar biblioteca facial');
    }
    
    return response.json();
  }

  /**
   * Busca estatísticas dos pacientes (baseado no Firebase)
   */
  async getPatientStatistics(): Promise<{
    total: number;
    maxRegistrationsDate: string;
    maxRegistrationsCount: number;
    minRegistrationsDate: string;
    minRegistrationsCount: number;
    registrationsByDate: { [key: string]: number };
  }> {
    try {
      // Importa a função do Firebase dinamicamente para evitar dependências circulares
      const { calcularEstatisticasDetalhadas } = await import('./firebase');
      return await calcularEstatisticasDetalhadas();
    } catch (error) {
      console.error('Erro ao buscar estatísticas do Firebase:', error);
      // Retorna dados vazios em caso de erro
      return {
        total: 0,
        maxRegistrationsDate: '',
        maxRegistrationsCount: 0,
        minRegistrationsDate: '',
        minRegistrationsCount: 0,
        registrationsByDate: {}
      };
    }
  }
}

// Instância singleton do serviço de API
export const apiService = new ApiService();
export default apiService; 