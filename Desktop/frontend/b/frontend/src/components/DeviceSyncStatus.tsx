import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import apiService from '../services/api';

interface SyncStatus {
  deviceOnline: boolean;
  lastSync: Date | null;
  pendingSyncs: number;
  totalSynced: number;
}

const DeviceSyncStatus: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    deviceOnline: false,
    lastSync: null,
    pendingSyncs: 0,
    totalSynced: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDeviceStatus();
    const interval = setInterval(checkDeviceStatus, 10000); // Verifica a cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const checkDeviceStatus = async () => {
    try {
      setLoading(true);
      const deviceStatus = await apiService.getDeviceStatus();
      
      setSyncStatus(prev => ({
        ...prev,
        deviceOnline: deviceStatus.status === 'online'
      }));
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        deviceOnline: false
      }));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (loading) {
      return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
    }
    
    if (syncStatus.deviceOnline) {
      return <Wifi className="h-5 w-5 text-green-500" />;
    }
    
    return <WifiOff className="h-5 w-5 text-red-500" />;
  };

  const getStatusText = () => {
    if (loading) return 'Verificando...';
    if (syncStatus.deviceOnline) return 'Dispositivo Online';
    return 'Dispositivo Offline';
  };

  const getStatusColor = () => {
    if (loading) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (syncStatus.deviceOnline) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Status de Sincronização</h3>
        <button
          onClick={checkDeviceStatus}
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Atualizar
        </button>
      </div>

      <div className="space-y-4">
        {/* Status do Dispositivo */}
        <div className={`flex items-center p-3 rounded-lg border ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="ml-2 font-medium">{getStatusText()}</span>
        </div>

        {/* Estatísticas de Sincronização */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {syncStatus.totalSynced}
            </div>
            <div className="text-sm text-gray-600">Total Sincronizado</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {syncStatus.pendingSyncs}
            </div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
        </div>

        {/* Última Sincronização */}
        {syncStatus.lastSync && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                Última sincronização: {syncStatus.lastSync.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        )}

        {/* Avisos */}
        {!syncStatus.deviceOnline && !loading && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-800">
                Dispositivo offline. Não é possível sincronizar cadastros.
              </span>
            </div>
          </div>
        )}

        {syncStatus.deviceOnline && syncStatus.pendingSyncs > 0 && (
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                {syncStatus.pendingSyncs} cadastro(s) aguardando sincronização.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceSyncStatus;
