import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { PatientCreateRequest, Patient } from '../types';
import { apiService } from '../services/api';
import { criarCadastro, buscarCadastroPorCPF } from '../services/firebase';

interface PatientFormProps {
  onPatientCreated?: () => void;
  onPatientUpdated?: () => void;
  onCancel?: () => void;
  initialData?: Patient;
  mode?: 'edit' | 'create';
}

async function generateUniqueEmployeeNo(): Promise<string> {
  // Como não temos employeeNo na estrutura de cadastros, vamos usar um identificador único
  // baseado no timestamp para evitar duplicatas
  const newNo = `EMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return newNo;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  onPatientCreated,
  onPatientUpdated,
  onCancel,
  initialData,
  mode = 'create'
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [tempFile, setTempFile] = useState<string | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues
  } = useForm<PatientCreateRequest & { cpf: string; cns: string }>({
    defaultValues: initialData
      ? { name: initialData.name }
      : {}
  });

  const handleCaptureFace = async () => {
    try {
      const res = await apiService.captureFaceFromTerminal();
      setCapturedImage(res.imageBase64);
      setTempFile(res.tempFile);
      toast.success('Imagem capturada com sucesso!');
    } catch {
      toast.error('Erro ao capturar imagem do terminal');
    }
  };

  const handleConsultCPF = async () => {
    const cpf = getValues('cpf');
    if (!cpf) {
      toast.error('Informe o CPF para consultar.');
      return;
    }
    setIsConsulting(true);
    try {
      const cadastro = await buscarCadastroPorCPF(cpf);
      if (!cadastro) {
        toast.info('Nenhum cadastro encontrado com esse CPF.');
        setValue('name', '');
        setValue('cns', '');
        setCapturedImage(null);
        return;
      }
      
      setValue('name', cadastro.nome || '');
      // Data de nascimento não está na estrutura de cadastros, então mantém vazio
      setValue('cns', '');
      if (cadastro.fotoFinal) {
        setCapturedImage(cadastro.fotoFinal);
      } else {
        setCapturedImage(null);
      }
      toast.success('Dados carregados do Firebase!');
    } catch (err) {
      toast.error('Erro ao consultar CPF.');
    } finally {
      setIsConsulting(false);
    }
  };

  const handleConfirm = async () => {
    const name = getValues('name');
    const cpf = getValues('cpf');
    
    if (!name || !cpf) {
      toast.error('Nome e CPF são obrigatórios para confirmar.');
      return;
    }
    
    setIsConfirming(true);
    try {
      const formData = new FormData();
      formData.append('employeeNo', cpf); // Usando CPF como identificador
      formData.append('name', name);
      
      if (capturedImage) {
        const byteString = atob(capturedImage.split(',')[1] || '');
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: 'image/jpeg' });
        formData.append('photo', blob, 'photo.jpg');
      }
      
      await apiService.createPatient(formData);
      toast.success('Dados enviados para o dispositivo com sucesso!');
    } catch (err) {
      toast.error('Erro ao enviar dados para o dispositivo.');
    } finally {
      setIsConfirming(false);
    }
  };

  const onSubmit = async (data: PatientCreateRequest & { cpf: string; cns: string }) => {
    if (!capturedImage && (!data.photo || data.photo.length === 0) && mode !== 'edit') {
      toast.error('Foto é obrigatória');
      return;
    }
    if (!data.cpf) {
      toast.error('CPF é obrigatório');
      return;
    }
    if (!data.cns) {
      toast.error('Data de nascimento é obrigatória');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'edit' && initialData) {
        // edição via API externa
        await apiService.updatePatient(initialData.employeeNo, { name: data.name });
        toast.success('Cadastro atualizado com sucesso!');
        onPatientUpdated?.();
      } else {
        // 1) gerar matrícula única
        const employeeNo = await generateUniqueEmployeeNo();

        // 2) enviar pro seu endpoint/device (sem CPF/CNS)
        const formData = new FormData();
        formData.append('employeeNo', employeeNo);
        formData.append('name', data.name);
        if (tempFile) {
          formData.append('tempFile', tempFile);
        } else if (data.photo && data.photo.length > 0) {
          formData.append('photo', data.photo[0]);
        }
        await apiService.createPatient(formData);

        // 3) gravar no Firestore usando a estrutura correta da coleção 'cadastros'
        const novoCadastro = {
          cpf: data.cpf,
          nome: data.name,
          dias: 0, // Valor padrão, pode ser ajustado conforme necessário
          url: '', // Será preenchido quando a foto for processada
          anexos: [], // Array vazio por padrão
          dependentes: 0 // Valor padrão
        };
        
        await criarCadastro(novoCadastro);

        toast.success(`Pessoa cadastrado com sucesso! Matrícula: ${employeeNo}`);
        reset();
        setCapturedImage(null);
        setTempFile(null);
        onPatientCreated?.();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao cadastrar/atualizar pessoa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {mode === 'edit' ? 'Editar Pessoa' : 'Cadastrar Pessoa'}
      </h2>

      <button
        type="button"
        onClick={handleCaptureFace}
        className="mb-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
      >
        Capturar Foto do Terminal
      </button>

      {capturedImage && (
        <div className="mb-4">
          <img
            src={capturedImage}
            alt="Foto capturada"
            className="w-48 h-48 object-cover rounded"
          />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo *
          </label>
          <input
            id="name"
            {...register('name', { required: 'Nome é obrigatório' })}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o nome completo"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        {/* CPF */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
              CPF *
            </label>
            <input
              id="cpf"
              {...register('cpf', { required: true })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="000.000.000-00"
            />
            {errors.cpf && <p className="text-red-500 text-sm">CPF é obrigatório</p>}
          </div>
          <button
            type="button"
            onClick={handleConsultCPF}
            disabled={isConsulting}
            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 disabled:opacity-50"
          >
            {isConsulting ? 'Consultando...' : 'Consultar'}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            {isConfirming ? 'Confirmando...' : 'Confirmar'}
          </button>
        </div>

        {/* Data de Nascimento */}
        <div>
          <label htmlFor="cns" className="block text-sm font-medium text-gray-700 mb-1">
            Data de Nascimento *
          </label>
          <input
            id="cns"
            type="date"
            {...register('cns', { required: true })}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="dd/mm/aaaa"
          />
          {errors.cns && <p className="text-red-500 text-sm">Data de nascimento é obrigatória</p>}
        </div>

        {/* Foto do Paciente */}
        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">
            Foto da Pessoa *
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            {...register('photo', { required: !capturedImage })}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            disabled={!!capturedImage}
          />
          {errors.photo && <p className="text-red-500 text-sm">Foto é obrigatória</p>}
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting
              ? mode === 'edit'
                ? 'Salvando...'
                : 'Cadastrando...'
              : mode === 'edit'
              ? 'Salvar Alterações'
              : 'Cadastrar Pessoa'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};