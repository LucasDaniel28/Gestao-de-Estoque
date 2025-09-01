import React, { useState, useEffect } from 'react';
import { 
  buscarCadastros, 
  buscarCadastroPorCPF, 
  buscarCadastrosPorNome,
  buscarCadastrosPorPeriodo,
  criarCadastro,
  atualizarCadastro,
  removerCadastro,
  Cadastro,
  NovoCadastro
} from '../services/firebase';
import { toast } from 'react-toastify';
import { useDeviceSync } from '../hooks/useDeviceSync';
import DeviceSyncStatus from './DeviceSyncStatus';
import PatientDetailModal from './PatientDetailModal';

// === Firebase Storage ===
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../firebase';

/** -------- Helpers para imagem (únicos) -------- */

// Se vier path do Storage => resolve com getDownloadURL; se já for URL => mantém
const getFirebaseImageUrl = async (maybePathOrUrl?: string): Promise<string> => {
  if (!maybePathOrUrl) return "";

  // Já é link público do Firebase Storage
  if (maybePathOrUrl.includes("firebasestorage.googleapis.com")) {
    return maybePathOrUrl;
  }

  // Link interno da API storage.googleapis.com/download/storage/v1
  if (maybePathOrUrl.includes("/download/storage/v1")) {
    try {
      // Extrai o path após /o/
      const pathMatch = decodeURIComponent(maybePathOrUrl).match(/\/o\/([^?]+)/);
      if (pathMatch?.[1]) {
        return await getDownloadURL(ref(storage, pathMatch[1]));
      }
    } catch (err) {
      console.error("Erro ao converter URL API em URL pública:", err);
    }
    return "";
  }

  // Se for apenas path puro
  try {
    return await getDownloadURL(ref(storage, maybePathOrUrl));
  } catch (e) {
    console.error("Erro ao buscar imagem:", e);
    return "";
  }
};


// Aplica a resolução de URL em uma lista de cadastros
const withResolvedUrl = async (list: Cadastro[]): Promise<Cadastro[]> =>
  Promise.all(
    list.map(async (c) => ({
      ...c,
      url: await getFirebaseImageUrl(c.url),
    }))
  );

const FirebaseData: React.FC = () => {
  const [cadastros, setCadastros] = useState<Cadastro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'cpf' | 'nome' | 'periodo'>('all');
  const [periodoDias, setPeriodoDias] = useState(7);
  
  // Hook de sincronização
  const { syncState, syncHistory, syncCadastro, syncMultipleCadastros } = useDeviceSync();
  
  // Estados para formulário
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NovoCadastro>({
    cpf: '',
    nome: '',
    dias: 0,
    url: '',
    anexos: [],
    dependentes: 0
  });

  // Estado para modal de detalhes
  const [selectedPatient, setSelectedPatient] = useState<Cadastro | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    carregarCadastros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarCadastros = async () => {
    try {
      setLoading(true);
      const data = await buscarCadastros();
      const cadastrosComUrl = await withResolvedUrl(data);
      setCadastros(cadastrosComUrl);
    } catch (error) {
      toast.error('Erro ao carregar cadastros');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Funções para modal de detalhes
  const openPatientModal = (patient: Cadastro) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const closePatientModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
  };

  const handleSearch = async () => {
    if (searchType !== 'periodo' && !searchTerm.trim()) {
      await carregarCadastros();
      return;
    }

    try {
      setLoading(true);
      let results: Cadastro[] = [];

      switch (searchType) {
        case 'cpf': {
          const cadastro = await buscarCadastroPorCPF(searchTerm.trim());
          results = cadastro ? [cadastro] : [];
          break;
        }
        case 'nome': {
          results = await buscarCadastrosPorNome(searchTerm.trim());
          break;
        }
        case 'periodo': {
          // Usa o estado periodoDias, que já está atrelado ao input numérico
          results = await buscarCadastrosPorPeriodo(Number.isFinite(periodoDias) ? periodoDias : 7);
          break;
        }
        default: {
          results = await buscarCadastros();
        }
      }

      const withUrls = await withResolvedUrl(results);
      setCadastros(withUrls);
    } catch (error) {
      toast.error('Erro na busca');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await atualizarCadastro(editingId, formData);
        toast.success('Cadastro atualizado com sucesso!');
        setEditingId(null);
      } else {
        await criarCadastro(formData);
        toast.success('Cadastro criado com sucesso!');
      }
      
      setFormData({ cpf: '', nome: '', dias: 0, url: '', anexos: [], dependentes: 0 });
      setShowForm(false);
      await carregarCadastros();
    } catch (error) {
      toast.error('Erro ao salvar cadastro');
      console.error(error);
    }
  };

  const handleEdit = (cadastro: Cadastro) => {
    setEditingId(cadastro.id);
    // Mantém o que está salvo (pode ser path ou URL), sem resolver aqui.
    setFormData({
      cpf: cadastro.cpf,
      nome: cadastro.nome,
      dias: cadastro.dias,
      url: cadastro.url,
      anexos: cadastro.anexos || [],
      dependentes: cadastro.dependentes || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cadastro?')) {
      try {
        await removerCadastro(id);
        toast.success('Cadastro removido com sucesso!');
        await carregarCadastros();
      } catch (error) {
        toast.error('Erro ao remover cadastro');
        console.error(error);
      }
    }
  };

  // Enviar cadastro para o dispositivo Hikvision
  const handleSendToDevice = async (cadastro: Cadastro) => {
    if (!cadastro.url) {
      toast.error('Este cadastro não possui foto para enviar ao dispositivo');
      return;
    }

    try {
      // Garante URL resolvida (limpa e com token válido)
      const ensuredUrl = await getFirebaseImageUrl(cadastro.url);
      if (!ensuredUrl) {
        toast.error('Não foi possível obter a imagem do Firebase Storage.');
        return;
      }

      const result = await syncCadastro({
        id: cadastro.id,
        cpf: cadastro.cpf,
        nome: cadastro.nome,
        url: ensuredUrl,
      });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Erro ao enviar cadastro para o dispositivo');
      console.error(error);
    }
  };

  // Sincronizar todos
  const handleSyncAll = async () => {
    const cadastrosComFoto = cadastros.filter(c => c.url);
    
    if (cadastrosComFoto.length === 0) {
      toast.info('Nenhum cadastro com foto encontrado para sincronizar');
      return;
    }

    if (!window.confirm(`Deseja sincronizar ${cadastrosComFoto.length} cadastro(s) com o dispositivo?`)) {
      return;
    }

    try {
      toast.info('Iniciando sincronização em lote...');
      
      // Garante que todas as URLs estão resolvidas antes do envio
      const preparados = await Promise.all(
        cadastrosComFoto.map(async (c) => ({
          ...c,
          url: await getFirebaseImageUrl(c.url),
        }))
      );

      const result = await syncMultipleCadastros(preparados);
      
      toast.success(
        `Sincronização concluída! ${result.success} sucesso(s), ${result.failed} falha(s)`
      );
      
      if (result.failed > 0) {
        console.log('Detalhes das falhas:', result.results.filter(r => !r.success));
      }
      
    } catch (error) {
      toast.error('Erro durante sincronização em lote');
      console.error(error);
    }
  };

  const formatarData = (data: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(data));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Dados do Firebase - Agente de Gestão de Acesso
        </h1>

        {/* Status de Sincronização */}
        <div className="mb-6">
          <DeviceSyncStatus />
        </div>

        {/* Barra de Busca */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os cadastros</option>
              <option value="cpf">Buscar por CPF</option>
              <option value="nome">Buscar por nome</option>
              <option value="periodo">Últimos X dias</option>
            </select>

            {searchType === 'periodo' && (
              <input
                type="number"
                value={periodoDias}
                onChange={(e) => setPeriodoDias(parseInt(e.target.value))}
                placeholder="Dias"
                className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-20"
              />
            )}

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                searchType === 'cpf' ? 'Digite o CPF' :
                searchType === 'nome' ? 'Digite o nome' :
                searchType === 'periodo' ? 'Digite para buscar (opcional)' :
                'Digite para buscar...'
              }
              className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              Buscar
            </button>

            <button
              onClick={() => {
                setSearchTerm('');
                setSearchType('all');
                carregarCadastros();
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({ cpf: '', nome: '', dias: 0, url: '', anexos: [], dependentes: 0 });
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500"
          >
            + Novo Cadastro
          </button>

          {cadastros.filter(c => c.url).length > 0 && (
            <button
              onClick={handleSyncAll}
              disabled={!syncState.deviceOnline}
              className={`px-6 py-3 rounded-md focus:ring-2 focus:ring-blue-500 ${
                syncState.deviceOnline
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              🔄 Sincronizar Todos ({cadastros.filter(c => c.url).length})
            </button>
          )}
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Editar Cadastro' : 'Novo Cadastro'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="CPF"
                  required
                  className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome completo"
                  required
                  className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={formData.dias}
                  onChange={(e) => setFormData({ ...formData, dias: parseInt(e.target.value) })}
                  placeholder="Dias"
                  required
                  className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="Path do Storage (ex: cadastros/123.jpg) ou URL completa"
                  required
                  className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={formData.dependentes}
                  onChange={(e) => setFormData({ ...formData, dependentes: parseInt(e.target.value) || 0 })}
                  placeholder="Quantidade de dependentes"
                  min="0"
                  className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <div className="px-3 py-2 border rounded-md bg-gray-50">
                  <p className="text-sm text-gray-600">Anexos serão gerenciados via Firebase Storage</p>
                  <p className="text-xs text-gray-400">Funcionalidade em desenvolvimento</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                >
                  {editingId ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ cpf: '', nome: '', dias: 0, url: '', anexos: [], dependentes: 0 });
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Cadastros */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Foto & Envio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Dias
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Anexos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Dependentes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cadastros.map((cadastro) => (
                <tr key={cadastro.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col items-center space-y-3">
                      {cadastro.url ? (
                        <>
                          <img
                            src={cadastro.url}
                            alt={cadastro.nome}
                            className="h-16 w-16 rounded-lg object-cover border-2 border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '/ariana.jpg';
                            }}
                          />
                          <button
                            onClick={() => handleSendToDevice(cadastro)}
                            disabled={!syncState.deviceOnline}
                            className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                              syncState.deviceOnline
                                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            📤 Enviar para Dispositivo
                          </button>
                          <span className="text-xs text-gray-500 text-center">
                            {cadastro.url.includes('firebasestorage') ? 'Firebase Storage' : 'URL Externa'}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-500 text-center">Sem Foto</span>
                          </div>
                          <span className="text-xs text-gray-400 text-center">Não é possível enviar</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <button
                      onClick={() => openPatientModal(cadastro)}
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
                    >
                      {cadastro.nome}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cadastro.cpf}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cadastro.dias}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cadastro.anexos ? cadastro.anexos.length : 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cadastro.dependentes ? String(cadastro.dependentes).split(',').length : 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(cadastro)}
                        className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cadastro.id)}
                        className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mensagem quando não há dados */}
        {cadastros.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            Nenhum cadastro encontrado.
          </div>
        )}

                 {/* Estatísticas */}
         <div className="mt-6 p-4 bg-blue-50 rounded-lg">
           <h3 className="text-lg font-semibold text-blue-800 mb-2">Estatísticas</h3>
           <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
             <div>
               <span className="font-medium">Total de cadastros:</span> {cadastros.length}
             </div>
             <div>
               <span className="font-medium">Com foto:</span> {cadastros.filter(c => c.url).length}
             </div>
             <div>
               <span className="font-medium">Com anexos:</span> {cadastros.filter(c => c.anexos && c.anexos.length > 0).length}
             </div>
             <div>
               <span className="font-medium">Com dependentes:</span> {cadastros.filter(c => c.dependentes && c.dependentes > 0).length}
             </div>
             <div>
               <span className="font-medium">Média de dias:</span> {
                 cadastros.length > 0 
                   ? Math.round(cadastros.reduce((acc, c) => acc + c.dias, 0) / cadastros.length)
                   : 0
               }
             </div>
           </div>
         </div>

        {/* Histórico de Sincronização */}
        {syncHistory.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Histórico de Sincronização</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {syncHistory.slice(0, 10).map((record) => (
                <div
                  key={record.id}
                  className={`p-3 rounded-lg border ${
                    record.success
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      <strong>{record.cadastroNome}</strong> - {record.message}
                    </span>
                    <span className="text-xs text-gray-500">
                      {record.timestamp.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações sobre envio para dispositivo */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">ℹ️ Informações sobre Envio para Dispositivo</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• <strong>Fotos:</strong> Apenas cadastros com fotos podem ser enviados para o dispositivo Hikvision</p>
            <p>• <strong>Processo:</strong> A foto é baixada do Firebase Storage e enviada via API do sistema</p>
            <p>• <strong>Status:</strong> O botão "Enviar para Dispositivo" aparece apenas para cadastros com fotos válidas</p>
            <p>• <strong>Verificação:</strong> O sistema verifica automaticamente se o dispositivo está online antes do envio</p>
            <p>• <strong>Sincronização em Lote:</strong> Use o botão "Sincronizar Todos" para enviar múltiplos cadastros de uma vez</p>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Paciente */}
      <PatientDetailModal
        isOpen={isModalOpen}
        onClose={closePatientModal}
        patient={selectedPatient}
      />
    </div>
  );
};

export default FirebaseData;
