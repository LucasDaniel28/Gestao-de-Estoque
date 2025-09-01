import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { 
  Users, 
  Plus, 
  Settings, 
  Activity,
  Wifi,
  WifiOff,
  Home,
  Database,
  Cloud
} from 'lucide-react';
import { PatientForm } from './components/PatientForm';
import PatientList from './components/PatientList';
import DeviceStatus from './components/DeviceStatus';
import FirebaseData from './components/FirebaseData';
import { DeviceStatus as DeviceStatusType } from './types';
import apiService from './services/api';
import PatientEditPage from './components/PatientEditPage';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App: React.FC = () => {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatusType>({ status: 'offline' });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statistics, setStatistics] = useState({
    total: 0,
    maxRegistrationsDate: '',
    maxRegistrationsCount: 0,
    minRegistrationsDate: '',
    minRegistrationsCount: 0,
    registrationsByDate: {}
  });

  useEffect(() => {
    checkDeviceStatus();
    loadStatistics();
    const interval = setInterval(() => {
      checkDeviceStatus();
      loadStatistics();
    }, 30000); // Verifica a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const checkDeviceStatus = async () => {
    try {
      const status = await apiService.getDeviceStatus();
      setDeviceStatus(status);
    } catch (error) {
      console.error('Erro ao verificar status do dispositivo:', error);
      setDeviceStatus({ status: 'offline' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      console.log('🔄 Carregando estatísticas do Firebase...');
      const stats = await apiService.getPatientStatistics();
      console.log('✅ Estatísticas carregadas:', stats);
      setStatistics(stats);
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas do Firebase:', error);
      // Mantém as estatísticas anteriores em caso de erro
    }
  };

  const handlePatientSuccess = () => {
    setActiveTab('patients');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'patients', label: 'Pessoas', icon: Users },
    { id: 'register', label: 'Novo Cadastro', icon: Plus },
    { id: 'firebase', label: 'Dados Firebase', icon: Cloud },
    { id: 'device', label: 'Dispositivo', icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard - Sistema Reconhecimento Facial</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">Cadastro</h3>
                    <p className="text-gray-600">Gerenciar cadastros</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('patients')}
                  className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Ver cadastros
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Plus className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">Novo Cadastro</h3>
                    <p className="text-gray-600">Adicionar cadastro</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('register')}
                  className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Cadastrar
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Cloud className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">Dados Firebase</h3>
                    <p className="text-gray-600">Visualizar cadastros</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('firebase')}
                  className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Ver Dados
                </button>
              </div>
            </div>

            {/* Novos cards de estatísticas baseados no Firebase */}
            <div className="mb-4">
              <div className="flex items-center justify-center mb-4">
                               <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                 📊 Estatísticas baseadas nos dias dos eventos (Firebase)
               </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                                         <h3 className="text-lg font-semibold text-gray-800">Total de Cadastrados</h3>
                     <p className="text-3xl font-bold text-blue-600">{statistics.total}</p>
                     <p className="text-xs text-gray-500">📱 Baseado nos dias dos eventos</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Dia do Evento com Mais Cadastros</h3>
                    <p className="text-xl font-semibold text-green-600">
                      {statistics.maxRegistrationsDate ? `Dia ${statistics.maxRegistrationsDate}` : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">{statistics.maxRegistrationsCount} pessoas</p>
                    <p className="text-xs text-gray-500">📱 Baseado nos dias dos eventos</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Dia do Evento com Menos Cadastros</h3>
                    <p className="text-xl font-semibold text-orange-600">
                      {statistics.minRegistrationsDate ? `Dia ${statistics.minRegistrationsDate}` : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">{statistics.minRegistrationsCount} pessoas</p>
                    <p className="text-xs text-gray-500">📱 Baseado nos dias dos eventos</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Activity className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            <DeviceStatus
              deviceStatus={deviceStatus}
              onRefresh={checkDeviceStatus}
              onStatusChange={(status) => setDeviceStatus({ status: status as any })}
            />
          </div>
        );

      case 'patients':
        return <PatientList onRefresh={() => {}} />;

      case 'register':
        return (
          <div className="max-w-2xl mx-auto mt-8">
            <PatientForm
              onPatientCreated={handlePatientSuccess}
              onCancel={() => setActiveTab('dashboard')}
            />
          </div>
        );

      case 'firebase':
        return <FirebaseData />;

      case 'device':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Status do Dispositivo</h1>
            <DeviceStatus
              deviceStatus={deviceStatus}
              onRefresh={checkDeviceStatus}
              onStatusChange={(status) => setDeviceStatus({ status: status as any })}
            />
          </div>
        );

      default:
        return <div>Página não encontrada</div>;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-800">Sistema Reconhecimento Facial</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  deviceStatus.status === 'online' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {deviceStatus.status === 'online' ? (
                    <Wifi className="h-4 w-4 mr-2" />
                  ) : (
                    <WifiOff className="h-4 w-4 mr-2" />
                  )}
                  {deviceStatus.status === 'online' ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          {renderContent()}
        </main>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
};

export default App; 