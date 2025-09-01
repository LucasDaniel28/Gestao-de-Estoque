import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PatientForm } from './PatientForm';
import { Patient } from '../types';
import apiService from '../services/api';

const PatientEditPage: React.FC = () => {
  const { employeeNo } = useParams<{ employeeNo: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const patients = await apiService.getPatients();
        const found = patients.find(p => p.employeeNo === employeeNo);
        if (!found) {
          setError('Cadastro não encontrado');
        } else {
          setPatient(found);
        }
      } catch (err: any) {
        setError('Erro ao buscar pessoa');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [employeeNo]);

  if (loading) {
    return <div className="p-8 text-center">Carregando dados do cadastro...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }
  if (!patient) {
    return null;
  }
  return (
    <div className="max-w-xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Editar Cadastro</h1>
      <PatientForm
        initialData={patient}
        mode="edit"
        onPatientUpdated={() => navigate('/')} // Volta para a lista após editar
        onCancel={() => navigate('/')}
      />
    </div>
  );
};

export default PatientEditPage; 