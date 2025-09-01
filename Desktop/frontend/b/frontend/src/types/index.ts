// Tipos para o sistema de pacientes hospitalares - Frontend

export interface Patient {
  employeeNo: string; // Matrícula do paciente
  name: string; // Nome completo do paciente
  dateOfBirth?: string; // Data de nascimento (YYYY-MM-DD)
  gender?: 'M' | 'F' | 'O'; // Gênero: Masculino, Feminino, Outro
  phone?: string; // Telefone de contato
  email?: string; // Email de contato
  address?: string; // Endereço completo
  emergencyContact?: string; // Contato de emergência
  bloodType?: string; // Tipo sanguíneo
  allergies?: string; // Alergias conhecidas
  medicalHistory?: string; // Histórico médico
  insurance?: string; // Plano de saúde
  registrationDate: string; // Data de cadastro
  status: 'active' | 'inactive' | 'discharged'; // Status do paciente
}

export interface PatientCreateRequest {
  employeeNo: string;
  name: string;
  photo: FileList; // Campo para upload de foto
  gender?: 'M' | 'F' | 'O';
  dateOfBirth?: string;
}

export interface PatientUpdateRequest {
  name?: string;
  dateOfBirth?: string;
  gender?: 'M' | 'F' | 'O';
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  insurance?: string;
  status?: 'active' | 'inactive' | 'discharged';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface DeviceStatus {
  status: 'online' | 'offline';
  deviceInfo?: {
    deviceName?: string;
    deviceID?: string;
    model?: string;
    serialNumber?: string;
    macAddress?: string;
    firmwareVersion?: string;
    firmwareReleasedDate?: string;
    deviceType?: string;
    hardwareVersion?: string;
  };
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    message?: string;
  };
}

export interface UploadedFile {
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Tipos para o formulário de cadastro
export interface PatientFormData {
  employeeNo: string;
  name: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'O' | '';
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  bloodType: string;
  allergies: string;
  medicalHistory: string;
  insurance: string;
}

// Tipos para filtros e busca
export interface PatientFilters {
  status?: 'active' | 'inactive' | 'discharged';
  gender?: 'M' | 'F' | 'O';
  bloodType?: string;
  search?: string;
}

// Tipos para paginação
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Tipos para estatísticas
export interface PatientStats {
  total: number;
  active: number;
  inactive: number;
  discharged: number;
  byGender: {
    male: number;
    female: number;
    other: number;
  };
  byBloodType: {
    [key: string]: number;
  };
}

// Tipos para dependentes
export interface Dependente {
  id: string;
  cpf_certidao_rg: string;
  nome: string;
  idade: string;
  relacao_responsavel: string;
  responsavel_cpf: string;
  foto: string;
  dateTime: string;
}

// Interface para cadastro com dependentes
export interface CadastroComDependentes {
  id: string;
  cpf: string;
  nome: string;
  data_criacao: Date;
  dias: number;
  url: string;
  base64?: string;
  fotoFinal?: string;
  anexos?: string[];
  dependentes?: number;
  listaDependentes?: Dependente[];
} 