import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Dependente } from '../types';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../firebase';

// Interface para os dados do cadastro
export interface Cadastro {
  id: string;
  cpf: string;
  nome: string;
  data_criacao: Date;
  dias: number;
  url: string;
  base64?: string;
  fotoFinal?: string;
  anexos?: string[]; // Array de URLs dos anexos
  dependentes?: number; // Quantidade de dependentes menores de idade
}

// Interface para criar novo cadastro
export interface NovoCadastro {
  cpf: string;
  nome: string;
  dias: number;
  url: string;
  anexos?: string[]; // Array de URLs dos anexos
  dependentes?: number; // Quantidade de dependentes menores de idade
}

/**
 * Helper para converter campo data_criacao em Date
 */
function parseDataCriacao(value: any): Date {
  if (!value) return new Date();

  if (typeof value.toDate === "function") {
    // Timestamp do Firestore
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

/**
 * Busca todos os cadastros da coleção
 */
export const buscarCadastros = async (): Promise<Cadastro[]> => {
  try {
    const cadastrosRef = collection(db, 'cadastros');
    const q = query(cadastrosRef, orderBy('data_criacao', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const cadastros: Cadastro[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      // Ajusta fotoFinal de acordo com base64 ou url
      let fotoFinal: string | undefined;
      if (data.base64) {
        const cleanBase64 = data.base64.replace(/\s/g, '');
        fotoFinal = cleanBase64.startsWith("data:image/")
          ? cleanBase64
          : `data:image/jpeg;base64,${cleanBase64}`;
      }

      cadastros.push({
        id: docSnap.id,
        cpf: data.cpf || '',
        nome: data.nome || '',
        data_criacao: parseDataCriacao(data.data_criacao),
        dias: data.dias || 0,
        url: data.url || '',
        base64: data.base64 || '',
        fotoFinal,
        anexos: data.anexos || [],
        dependentes: data.dependentes || 0
      });
    });
    
    return cadastros;
  } catch (error) {
    console.error('Erro ao buscar cadastros:', error);
    throw new Error('Falha ao buscar cadastros do Firebase');
  }
};

/**
 * Busca cadastro por CPF
 */
export const buscarCadastroPorCPF = async (cpf: string): Promise<Cadastro | null> => {
  try {
    const cadastrosRef = collection(db, 'cadastros');
    const q = query(cadastrosRef, where('cpf', '==', cpf), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();

    let fotoFinal: string | undefined;
    if (data.base64) {
      const cleanBase64 = data.base64.replace(/\s/g, '');
      fotoFinal = cleanBase64.startsWith("data:image/")
        ? cleanBase64
        : `data:image/jpeg;base64,${cleanBase64}`;
    }

    return {
      id: docSnap.id,
      cpf: data.cpf || '',
      nome: data.nome || '',
      data_criacao: parseDataCriacao(data.data_criacao),
      dias: data.dias || 0,
      url: data.url || '',
      base64: data.base64 || '',
      fotoFinal,
      anexos: data.anexos || [],
      dependentes: data.dependentes || 0
    };
  } catch (error) {
    console.error('Erro ao buscar cadastro por CPF:', error);
    throw new Error('Falha ao buscar cadastro por CPF');
  }
};

/**
 * Busca cadastro por ID
 */
export const buscarCadastroPorId = async (id: string): Promise<Cadastro | null> => {
  try {
    const docRef = doc(db, 'cadastros', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    
    return {
      id: docSnap.id,
      cpf: data.cpf || '',
      nome: data.nome || '',
      data_criacao: parseDataCriacao(data.data_criacao),
      dias: data.dias || 0,
      url: data.url || ''
    };
  } catch (error) {
    console.error('Erro ao buscar cadastro por ID:', error);
    throw new Error('Falha ao buscar cadastro por ID');
  }
};

/**
 * Cria um novo cadastro
 */
export const criarCadastro = async (cadastro: NovoCadastro): Promise<string> => {
  try {
    const cadastrosRef = collection(db, 'cadastros');
    const docRef = await addDoc(cadastrosRef, {
      ...cadastro,
      data_criacao: Timestamp.now(),
      anexos: cadastro.anexos || [],
      dependentes: cadastro.dependentes || 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar cadastro:', error);
    throw new Error('Falha ao criar cadastro');
  }
};

/**
 * Atualiza um cadastro existente
 */
export const atualizarCadastro = async (id: string, cadastro: Partial<NovoCadastro>): Promise<void> => {
  try {
    const cadastroRef = doc(db, 'cadastros', id);
    await updateDoc(cadastroRef, {
      ...cadastro,
      anexos: cadastro.anexos || [],
      dependentes: cadastro.dependentes || 0
    });
  } catch (error) {
    console.error('Erro ao atualizar cadastro:', error);
    throw new Error('Falha ao atualizar cadastro');
  }
};

/**
 * Remove cadastro
 */
export const removerCadastro = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'cadastros', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao remover cadastro:', error);
    throw new Error('Falha ao remover cadastro do Firebase');
  }
};

/**
 * Busca cadastros por nome (busca parcial)
 */
export const buscarCadastrosPorNome = async (nome: string): Promise<Cadastro[]> => {
  try {
    const cadastrosRef = collection(db, 'cadastros');
    const q = query(
      cadastrosRef, 
      where('nome', '>=', nome),
      where('nome', '<=', nome + '\uf8ff'),
      orderBy('nome')
    );
    const querySnapshot = await getDocs(q);
    
    const cadastros: Cadastro[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      let fotoFinal: string | undefined;
      if (data.base64) {
        const cleanBase64 = data.base64.replace(/\s/g, '');
        fotoFinal = cleanBase64.startsWith("data:image/")
          ? cleanBase64
          : `data:image/jpeg;base64,${cleanBase64}`;
      }
      cadastros.push({
        id: docSnap.id,
        cpf: data.cpf || '',
        nome: data.nome || '',
        data_criacao: parseDataCriacao(data.data_criacao),
        dias: data.dias || 0,
        url: data.url || '',
        base64: data.base64 || '',
        fotoFinal,
        anexos: data.anexos || [],
        dependentes: data.dependentes || 0
      });
    });
    
    return cadastros;
  } catch (error) {
    console.error('Erro ao buscar cadastros por nome:', error);
    throw new Error('Falha ao buscar cadastros por nome');
  }
};

/**
 * Busca cadastros por período (últimos X dias)
 */
export const buscarCadastrosPorPeriodo = async (dias: number): Promise<Cadastro[]> => {
  try {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);
    
    const cadastrosRef = collection(db, 'cadastros');
    const q = query(
      cadastrosRef, 
      where('data_criacao', '>=', Timestamp.fromDate(dataLimite)),
      orderBy('data_criacao', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const cadastros: Cadastro[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      cadastros.push({
        id: docSnap.id,
        cpf: data.cpf || '',
        nome: data.nome || '',
        data_criacao: parseDataCriacao(data.data_criacao),
        dias: data.dias || 0,
        url: data.url || '',
        base64: data.base64 || '',
        fotoFinal: data.fotoFinal || '',
        anexos: data.anexos || [],
        dependentes: data.dependentes || 0
      });
    });
    
    return cadastros;
  } catch (error) {
    console.error('Erro ao buscar cadastros por período:', error);
    throw new Error('Falha ao buscar cadastros por período');
  }
};

/**
 * Calcula estatísticas dos cadastros
 */
export const calcularEstatisticas = async (): Promise<{
  total: number;
  porPeriodo: { [key: string]: number };
  mediaDias: number;
}> => {
  try {
    const cadastros = await buscarCadastros();
    
    if (cadastros.length === 0) {
      return {
        total: 0,
        porPeriodo: {},
        mediaDias: 0
      };
    }

    // Agrupa por período (últimos 7, 30, 90 dias)
    const hoje = new Date();
    const porPeriodo: { [key: string]: number } = {
      '7d': 0,
      '30d': 0,
      '90d': 0
    };

    cadastros.forEach(cadastro => {
      const diasAtras = Math.floor((hoje.getTime() - cadastro.data_criacao.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diasAtras <= 7) porPeriodo['7d']++;
      if (diasAtras <= 30) porPeriodo['30d']++;
      if (diasAtras <= 90) porPeriodo['90d']++;
    });

    // Calcula média dos dias
    const totalDias = cadastros.reduce((sum, cadastro) => sum + cadastro.dias, 0);
    const mediaDias = Math.round(totalDias / cadastros.length);

    return {
      total: cadastros.length,
      porPeriodo,
      mediaDias
    };
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    throw new Error('Falha ao calcular estatísticas');
  }
};

/**
 * Calcula estatísticas detalhadas dos cadastros incluindo dias com mais e menos cadastros
 */
export const calcularEstatisticasDetalhadas = async (): Promise<{
  total: number;
  porPeriodo: { [key: string]: number };
  mediaDias: number;
  maxRegistrationsDate: string;
  maxRegistrationsCount: number;
  minRegistrationsDate: string;
  minRegistrationsCount: number;
  registrationsByDate: { [key: string]: number };
}> => {
  try {
    const cadastros = await buscarCadastros();
    
    if (cadastros.length === 0) {
      return {
        total: 0,
        porPeriodo: {},
        mediaDias: 0,
        maxRegistrationsDate: '',
        maxRegistrationsCount: 0,
        minRegistrationsDate: '',
        minRegistrationsCount: 0,
        registrationsByDate: {}
      };
    }

    // Agrupa por período (últimos 7, 30, 90 dias)
    const hoje = new Date();
    const porPeriodo: { [key: string]: number } = {
      '7d': 0,
      '30d': 0,
      '90d': 0
    };

    // Agrupa por data de criação
    const registrationsByDate: { [key: string]: number } = {};
    
    cadastros.forEach(cadastro => {
      const diasAtras = Math.floor((hoje.getTime() - cadastro.data_criacao.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diasAtras <= 7) porPeriodo['7d']++;
      if (diasAtras <= 30) porPeriodo['30d']++;
      if (diasAtras <= 90) porPeriodo['90d']++;
      
      // Formata a data para agrupamento (YYYY-MM-DD)
      const dataFormatada = cadastro.data_criacao.toISOString().split('T')[0];
      registrationsByDate[dataFormatada] = (registrationsByDate[dataFormatada] || 0) + 1;
    });

    // Calcula média dos dias
    const totalDias = cadastros.reduce((sum, cadastro) => sum + cadastro.dias, 0);
    const mediaDias = Math.round(totalDias / cadastros.length);

    // Encontra o dia com mais cadastros
    let maxRegistrationsDate = '';
    let maxRegistrationsCount = 0;
    let minRegistrationsDate = '';
    let minRegistrationsCount = Number.MAX_SAFE_INTEGER;

    Object.entries(registrationsByDate).forEach(([date, count]) => {
      if (count > maxRegistrationsCount) {
        maxRegistrationsCount = count;
        maxRegistrationsDate = date;
      }
      if (count < minRegistrationsCount) {
        minRegistrationsCount = count;
        minRegistrationsDate = date;
      }
    });

    // Formata as datas para exibição
    const formatarData = (dataString: string) => {
      if (!dataString) return '';
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    };

    return {
      total: cadastros.length,
      porPeriodo,
      mediaDias,
      maxRegistrationsDate: formatarData(maxRegistrationsDate),
      maxRegistrationsCount,
      minRegistrationsDate: formatarData(minRegistrationsDate),
      minRegistrationsCount,
      registrationsByDate
    };
  } catch (error) {
    console.error('Erro ao calcular estatísticas detalhadas:', error);
    throw new Error('Falha ao calcular estatísticas detalhadas');
  }
};

/**
 * Busca dependentes de um responsável por CPF
 */
export const buscarDependentesPorResponsavel = async (cpfResponsavel: string): Promise<Dependente[]> => {
  try {
    console.log(`Buscando dependentes para CPF: ${cpfResponsavel}`);
    const dependentesRef = collection(db, 'dependentes');
    const q = query(dependentesRef, where('responsavel_cpf', '==', cpfResponsavel));
    const querySnapshot = await getDocs(q);
    
    const dependentes: Dependente[] = [];
    
    // Processa cada dependente e resolve as URLs das imagens
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const fotoOriginal = data.foto || '';
      
      console.log(`Dependente encontrado: ${data.nome}, Foto original: ${fotoOriginal ? fotoOriginal.substring(0, 50) + '...' : 'Sem foto'}`);
      
      // Resolve a URL da imagem se existir
      let fotoResolvida = '';
      if (fotoOriginal && fotoOriginal.trim() !== '') {
        try {
          fotoResolvida = await resolverUrlImagem(fotoOriginal);
          console.log(`URL resolvida para ${data.nome}: ${fotoResolvida ? fotoResolvida.substring(0, 50) + '...' : 'Falha na resolução'}`);
        } catch (error) {
          console.error(`Erro ao resolver URL da imagem para ${data.nome}:`, error);
          fotoResolvida = fotoOriginal; // Mantém a original em caso de erro
        }
      }
      
      dependentes.push({
        id: docSnap.id,
        cpf_certidao_rg: data.cpf_certidao_rg || '',
        nome: data.nome || '',
        idade: data.idade || '',
        relacao_responsavel: data.relacao_responsavel || '',
        responsavel_cpf: data.responsavel_cpf || '',
        foto: fotoResolvida,
        dateTime: data.dateTime || ''
      });
    }
    
    console.log(`Total de dependentes encontrados: ${dependentes.length}`);
    return dependentes;
  } catch (error) {
    console.error('Erro ao buscar dependentes:', error);
    throw new Error('Falha ao buscar dependentes do Firebase');
  }
};

/**
 * Busca cadastro com dependentes por CPF
 */
export const buscarCadastroComDependentes = async (cpf: string): Promise<{
  cadastro: Cadastro | null;
  dependentes: Dependente[];
}> => {
  try {
    const cadastro = await buscarCadastroPorCPF(cpf);
    if (!cadastro) {
      return { cadastro: null, dependentes: [] };
    }

    const dependentes = await buscarDependentesPorResponsavel(cpf);
    
    return { cadastro, dependentes };
  } catch (error) {
    console.error('Erro ao buscar cadastro com dependentes:', error);
    throw new Error('Falha ao buscar cadastro com dependentes');
  }
};

/**
 * Resolve URL de imagem do Firebase Storage
 */
export const resolverUrlImagem = async (pathOuUrl: string): Promise<string> => {
  if (!pathOuUrl || pathOuUrl.trim() === '') {
    return '';
  }

  try {
    // Se já for uma URL completa do Firebase Storage
    if (pathOuUrl.includes('firebasestorage.googleapis.com')) {
      return pathOuUrl;
    }

    // Se for uma URL de download da API
    if (pathOuUrl.includes('/download/storage/v1')) {
      try {
        const pathMatch = decodeURIComponent(pathOuUrl).match(/\/o\/([^?]+)/);
        if (pathMatch?.[1]) {
          return await getDownloadURL(ref(storage, pathMatch[1]));
        }
      } catch (err) {
        console.error('Erro ao converter URL API em URL pública:', err);
      }
      return '';
    }

    // Se for apenas um path
    try {
      return await getDownloadURL(ref(storage, pathOuUrl));
    } catch (e) {
      console.error('Erro ao buscar imagem do Storage:', e);
      return '';
    }
  } catch (error) {
    console.error('Erro ao resolver URL da imagem:', error);
    return '';
  }
};
