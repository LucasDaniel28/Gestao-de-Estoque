import React, { useState, useEffect } from 'react';
import { X, User, Calendar, FileText, Paperclip, Users } from 'lucide-react';
import { buscarDependentesPorResponsavel } from '../services/firebase';
import { Dependente } from '../types';

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: {
    id: string;
    nome: string;
    cpf: string;
    data_criacao: Date;
    dias: number;
    url: string;
    base64?: string;
    fotoFinal?: string;
    anexos?: string[];
    dependentes?: number;
  } | null;
}

const PatientDetailModal: React.FC<PatientDetailModalProps> = ({ isOpen, onClose, patient }) => {
  const [dependentes, setDependentes] = useState<Dependente[]>([]);
  const [loadingDependentes, setLoadingDependentes] = useState(false);

  useEffect(() => {
    if (isOpen && patient && patient.cpf) {
      carregarDependentes();
    }
  }, [isOpen, patient]);

  const carregarDependentes = async () => {
    if (!patient?.cpf) return;
    
    setLoadingDependentes(true);
    try {
      const dependentesData = await buscarDependentesPorResponsavel(patient.cpf);
      setDependentes(dependentesData);
    } catch (error) {
      console.error('Erro ao carregar dependentes:', error);
    } finally {
      setLoadingDependentes(false);
    }
  };

  if (!isOpen || !patient) return null;

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarDataDependente = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dataString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Detalhes do Cadastro</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Foto do Paciente */}
          <div className="flex justify-center">
            {patient.url ? (
              <img
                src={patient.url}
                alt={`Foto de ${patient.nome}`}
                className="w-32 h-32 object-cover rounded-full border-4 border-blue-100 shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/ariana.jpg';
                }}
              />
            ) : patient.fotoFinal ? (
              <img
                src={patient.fotoFinal}
                alt={`Foto de ${patient.nome}`}
                className="w-32 h-32 object-cover rounded-full border-4 border-blue-100 shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-semibold text-gray-800">{patient.nome}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">CPF</p>
                  <p className="font-semibold text-gray-800">{patient.cpf}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Data de Criação</p>
                  <p className="font-semibold text-gray-800">{formatarData(patient.data_criacao)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">Dias de Permanência</p>
                  <p className="font-semibold text-gray-800">{patient.dias}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-500">Dependentes</p>
                  <p className="font-semibold text-gray-800">{dependentes.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Dependentes */}
          {dependentes.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-red-500" />
                Dependentes ({dependentes.length})
              </h3>
              

              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dependentes.map((dependente) => (
                  <div key={dependente.id} className="bg-gray-50 rounded-lg p-4 border">
                    {/* Foto do Dependente */}
                    <div className="flex justify-center mb-3">
                      {dependente.foto && dependente.foto.trim() !== '' ? (
                        <div className="relative">
                          <img
                            src={dependente.foto}
                            alt={`Foto de ${dependente.nome}`}
                            className="w-20 h-20 object-cover rounded-full border-2 border-red-200 shadow-md"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '/ariana.jpg';
                              console.warn(`Falha ao carregar imagem do dependente ${dependente.nome}:`, dependente.foto);
                            }}
                            onLoad={() => {
                              console.log(`Imagem carregada com sucesso para ${dependente.nome}:`, dependente.foto);
                            }}
                          />
                          {/* Indicador de carregamento */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-xs text-white font-medium">Ver Foto</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center relative">
                          <User className="h-10 w-10 text-gray-400" />
                          <span className="text-xs text-gray-500 text-center mt-12">Sem Foto</span>
                        </div>
                      )}
                    </div>

                    {/* Informações do Dependente */}
                    <div className="space-y-2 text-center">
                      <h4 className="font-semibold text-gray-800 text-sm">{dependente.nome}</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p><span className="font-medium">CPF/RG:</span> {dependente.cpf_certidao_rg}</p>
                        <p><span className="font-medium">Idade:</span> {dependente.idade}</p>
                        <p><span className="font-medium">Relação:</span> {dependente.relacao_responsavel}</p>
                        <p><span className="font-medium">Data:</span> {formatarDataDependente(dependente.dateTime)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campo de Anexos */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Paperclip className="h-5 w-5 mr-2 text-blue-500" />
              Anexos ({patient.anexos ? patient.anexos.length : 0})
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              {patient.anexos && patient.anexos.length > 0 ? (
                <div className="space-y-2">
                  {patient.anexos.map((anexo, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-700">
                          {anexo.includes('/') ? anexo.split('/').pop() : anexo}
                        </span>
                      </div>
                      <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                        Baixar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Paperclip className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Nenhum anexo disponível</p>
                  <p className="text-xs text-gray-400 mt-1">Anexos serão carregados do Firebase</p>
                </div>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex space-x-3 pt-4 border-t">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              Editar Cadastro
            </button>
            <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
              Enviar para Dispositivo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailModal;
