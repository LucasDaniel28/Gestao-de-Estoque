import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Settings, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Loader2,
  Server,
  Cpu,
  HardDrive,
  Network,
  Clock,
  Info
} from 'lucide-react';
import { DeviceStatus as DeviceStatusType } from '../types';
import { apiService } from '../services/api';

interface DeviceStatusProps {
  deviceStatus: DeviceStatusType;
  onRefresh: () => void;
  onStatusChange?: (status: string) => void;
}

const DeviceStatus: React.FC<DeviceStatusProps> = ({ deviceStatus, onRefresh, onStatusChange }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState<string>('checking');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast.success('Status do dispositivo atualizado');
    } catch (error) {
      toast.error('Erro ao atualizar status do dispositivo');
    } finally {
      setIsRefreshing(false);
    }
  };

  const checkDeviceStatus = async () => {
    try {
      setLoading(true);
      setStatus('checking');
      
      const response = await apiService.getDeviceStatus();
      
      if (response.status === 'online') {
        setStatus('online');
        setDeviceInfo(response.deviceInfo);
        setMessage('Dispositivo conectado e funcionando');
        onStatusChange?.('online');
      } else {
        setStatus('offline');
        setMessage('Dispositivo não está acessível');
        onStatusChange?.('offline');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setStatus('error');
      setMessage('Erro ao verificar status do dispositivo');
      onStatusChange?.('error');
    } finally {
      setLoading(false);
    }
  };

  const createFaceLibrary = async () => {
    try {
      setLoading(true);
      setMessage('Criando biblioteca facial...');
      
      const result = await apiService.createFaceLibrary();
      
      setMessage('Biblioteca facial criada com sucesso!');
      console.log('Biblioteca facial criada:', result);
    } catch (error) {
      console.error('Erro ao criar biblioteca facial:', error);
      setMessage('Erro ao criar biblioteca facial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDeviceStatus();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'offline':
        return 'text-red-600 bg-red-100';
      case 'error':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return '🟢';
      case 'offline':
        return '🔴';
      case 'error':
        return '🟡';
      default:
        return '⏳';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Settings className="w-6 h-6 mr-2 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Status do Dispositivo</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Atualizar
        </button>
      </div>

      {/* Status Card */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {status === 'online' ? (
                <Wifi className="h-8 w-8 text-green-600" />
              ) : (
                <WifiOff className="h-8 w-8 text-red-600" />
              )}
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Status de Conexão
                </dt>
                <dd className={`text-lg font-medium ${getStatusColor()}`}>
                  {status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Erro'}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Mensagem */}
      {message && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800">{message}</p>
        </div>
      )}

      {/* Device Information */}
      {status === 'online' && deviceInfo && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Device Name */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Server className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Nome do Dispositivo
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {deviceInfo.deviceName || 'N/A'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Model */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Cpu className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Modelo
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {deviceInfo.model || 'N/A'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Serial Number */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <HardDrive className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Número de Série
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {deviceInfo.serialNumber || 'N/A'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* MAC Address */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Network className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Endereço MAC
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {deviceInfo.macAddress || 'N/A'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Firmware Version */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Info className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Versão do Firmware
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {deviceInfo.firmwareVersion || 'N/A'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Firmware Date */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Data do Firmware
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatDate(deviceInfo.firmwareReleasedDate)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Message */}
      {status === 'offline' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <WifiOff className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Dispositivo Offline
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  O dispositivo Hikvision DS-K1T342MFWX não está acessível. 
                  Verifique se:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>O dispositivo está ligado e conectado à rede</li>
                  <li>O IP configurado está correto</li>
                  <li>As credenciais de acesso estão válidas</li>
                  <li>Não há firewall bloqueando a conexão</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Information */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Informações de Conexão
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Protocolo</dt>
              <dd className="mt-1 text-sm text-gray-900">HTTP/HTTPS</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Autenticação</dt>
              <dd className="mt-1 text-sm text-gray-900">HTTP Digest</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">API</dt>
              <dd className="mt-1 text-sm text-gray-900">ISAPI</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Timeout</dt>
              <dd className="mt-1 text-sm text-gray-900">30 segundos</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex space-x-3">
        <button
          onClick={createFaceLibrary}
          disabled={loading || status !== 'online'}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Criando...' : 'Criar Biblioteca Facial'}
        </button>
        
        <button
          onClick={checkDeviceStatus}
          disabled={loading}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Verificar Status'}
        </button>
      </div>
    </div>
  );
};

export default DeviceStatus; 