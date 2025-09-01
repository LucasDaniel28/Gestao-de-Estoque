import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Users, 
  Search, 
  Trash2, 
  Edit, 
  Eye,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import apiService from '../services/api';
import { PatientForm } from './PatientForm';
import { Patient } from '../types';
import { useNavigate } from 'react-router-dom';

interface PatientWithFace extends Patient {
  faceURL: string;
}

interface PatientListProps {
  onRefresh?: () => void;
}

const PatientList: React.FC<PatientListProps> = ({ onRefresh }) => {
  const [patients, setPatients] = useState<PatientWithFace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingPatient, setDeletingPatient] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPatientsWithFaces();
      const patientsWithDefaults = data.map((p: any) => ({
        employeeNo: p.employeeNo,
        name: p.name,
        faceURL: p.faceURL,
        registrationDate: p.registrationDate || '',
        status: p.status || 'active',
      }));
      setPatients(patientsWithDefaults);
    } catch (error) {
      toast.error('Erro ao carregar pessoas');
      console.error('Erro ao buscar pessoas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.employeeNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'discharged':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'discharged':
        return 'Alta';
      default:
        return 'Desconhecido';
    }
  };

  const handleEdit = (patient: PatientWithFace) => {
    navigate(`/Pessoas/${patient.employeeNo}/editar`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando pessoas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Users className="w-6 h-6 mr-2 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Pessoas Cadastradas</h2>
        </div>
        <button
          onClick={fetchPatients}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nome ou matrícula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredPatients.length} pessoas(s) encontrado(s)
      </div>

      {/* Patients List */}
      {filteredPatients.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhuma pessoa encontrado' : 'Nenhuma pessoa cadastrada'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Tente ajustar os termos de busca'
              : 'Comece cadastrando a primeira pessoa'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredPatients.map((patient) => (
              <li key={patient.employeeNo}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {patient.faceURL ? (
                        <img
                          src={patient.faceURL}
                          alt={patient.name}
                          className="h-12 w-12 rounded-full object-cover border border-gray-300"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-lg font-medium text-blue-600">
                            {patient.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {patient.name}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span className="mr-4">Matrícula: {patient.employeeNo}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="ml-4 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    onClick={() => handleEdit(patient)}
                  >
                    <Edit className="inline w-4 h-4 mr-1" /> Editar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PatientList; 