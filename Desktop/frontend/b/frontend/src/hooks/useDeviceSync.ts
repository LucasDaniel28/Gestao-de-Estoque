import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

interface SyncState {
  deviceOnline: boolean;
  lastSync: Date | null;
  pendingSyncs: number;
  totalSynced: number;
  isChecking: boolean;
}

interface SyncResult {
  success: boolean;
  message: string;
  error?: string;
}

export const useDeviceSync = () => {
  const [syncState, setSyncState] = useState<SyncState>({
    deviceOnline: false,
    lastSync: null,
    pendingSyncs: 0,
    totalSynced: 0,
    isChecking: false
  });

  const [syncHistory, setSyncHistory] = useState<Array<{
    id: string;
    timestamp: Date;
    success: boolean;
    message: string;
    cadastroId: string;
    cadastroNome: string;
  }>>([]);

  // Verificar status do dispositivo
  const checkDeviceStatus = useCallback(async () => {
    try {
      setSyncState(prev => ({ ...prev, isChecking: true }));
      
      const deviceStatus = await apiService.getDeviceStatus();
      const isOnline = deviceStatus.status === 'online';
      
      setSyncState(prev => ({
        ...prev,
        deviceOnline: isOnline,
        isChecking: false
      }));

      return isOnline;
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        deviceOnline: false,
        isChecking: false
      }));
      return false;
    }
  }, []);

  // Sincronizar um cadastro específico
  const syncCadastro = useCallback(async (cadastro: {
    id: string;
    cpf: string;
    nome: string;
    url: string;
  }): Promise<SyncResult> => {
    try {
      // Verificar se dispositivo está online
      const isOnline = await checkDeviceStatus();
      if (!isOnline) {
        return {
          success: false,
          message: 'Dispositivo Hikvision não está acessível'
        };
      }

      // Baixar imagem do Firebase Storage
      const response = await fetch(cadastro.url);
      if (!response.ok) {
        throw new Error('Falha ao baixar imagem do Firebase Storage');
      }

      const blob = await response.blob();
      const file = new File([blob], `cadastro-${cadastro.cpf}.jpg`, { type: 'image/jpeg' });

      // Criar FormData para envio
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('employeeNo', cadastro.cpf);
      formData.append('name', cadastro.nome);

      // Enviar para o dispositivo
      await apiService.createPatient(formData);

      // Atualizar estado de sincronização
      const syncRecord = {
        id: Date.now().toString(),
        timestamp: new Date(),
        success: true,
        message: `Cadastro de ${cadastro.nome} sincronizado com sucesso`,
        cadastroId: cadastro.id,
        cadastroNome: cadastro.nome
      };

      setSyncHistory(prev => [syncRecord, ...prev.slice(0, 49)]); // Manter apenas os últimos 50
      setSyncState(prev => ({
        ...prev,
        lastSync: new Date(),
        totalSynced: prev.totalSynced + 1
      }));

      return {
        success: true,
        message: `Cadastro de ${cadastro.nome} sincronizado com sucesso`
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      const syncRecord = {
        id: Date.now().toString(),
        timestamp: new Date(),
        success: false,
        message: `Falha ao sincronizar ${cadastro.nome}: ${errorMessage}`,
        cadastroId: cadastro.id,
        cadastroNome: cadastro.nome
      };

      setSyncHistory(prev => [syncRecord, ...prev.slice(0, 49)]);

      return {
        success: false,
        message: `Falha ao sincronizar cadastro`,
        error: errorMessage
      };
    }
  }, [checkDeviceStatus]);

  // Sincronizar múltiplos cadastros
  const syncMultipleCadastros = useCallback(async (cadastros: Array<{
    id: string;
    cpf: string;
    nome: string;
    url: string;
  }>): Promise<{
    total: number;
    success: number;
    failed: number;
    results: SyncResult[];
  }> => {
    const results: SyncResult[] = [];
    let success = 0;
    let failed = 0;

    for (const cadastro of cadastros) {
      try {
        const result = await syncCadastro(cadastro);
        results.push(result);
        
        if (result.success) {
          success++;
        } else {
          failed++;
        }

        // Pequena pausa entre sincronizações para não sobrecarregar o dispositivo
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        const result: SyncResult = {
          success: false,
          message: 'Erro inesperado durante sincronização',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        };
        
        results.push(result);
        failed++;
      }
    }

    return { total: cadastros.length, success, failed, results };
  }, [syncCadastro]);

  // Limpar histórico de sincronização
  const clearSyncHistory = useCallback(() => {
    setSyncHistory([]);
  }, []);

  // Verificar status periodicamente
  useEffect(() => {
    checkDeviceStatus();
    const interval = setInterval(checkDeviceStatus, 30000); // A cada 30 segundos
    
    return () => clearInterval(interval);
  }, [checkDeviceStatus]);

  return {
    syncState,
    syncHistory,
    checkDeviceStatus,
    syncCadastro,
    syncMultipleCadastros,
    clearSyncHistory
  };
};
