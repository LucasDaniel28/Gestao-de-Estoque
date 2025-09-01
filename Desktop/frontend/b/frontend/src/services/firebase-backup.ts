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

// Interface para os dados do cadastro
export interface Cadastro {
  id: string;
  cpf: string;
  nome: string;
  data_criacao: Date;
  dias: number;
  url: string;
}

// Interface para criar novo cadastro
export interface NovoCadastro {
  cpf: string;
  nome: string;
  dias: number;
  url: string;
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
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      cadastros.push({
        id: doc.id,
        cpf: data.cpf || '',
        nome: data.nome || '',
        data_criacao: data.data_criacao?.toDate() || new Date(),
        dias: data.dias || 0,
        url: data.url || ''
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
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      cpf: data.cpf || '',
      nome: data.nome || '',
      data_criacao: data.data_criacao?.toDate() || new Date(),
      dias: data.dias || 0,
      url: data.url || ''
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
      data_criacao: data.data_criacao?.toDate() || new Date(),
      dias: data.dias || 0,
      url: data.url || ''
    };
  } catch (error) {
    console.error('Erro ao buscar cadastro por ID:', error);
    throw new Error('Falha ao buscar cadastro por ID');
  }
};

/**
 * Cria novo cadastro
 */
export const criarCadastro = async (cadastro: NovoCadastro): Promise<string> => {
  try {
    const cadastrosRef = collection(db, 'cadastros');
    const docRef = await addDoc(cadastrosRef, {
      ...cadastro,
      data_criacao: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar cadastro:', error);
    throw new Error('Falha ao criar cadastro no Firebase');
  }
};

/**
 * Atualiza cadastro existente
 */
export const atualizarCadastro = async (id: string, dados: Partial<NovoCadastro>): Promise<void> => {
  try {
    const docRef = doc(db, 'cadastros', id);
    await updateDoc(docRef, dados);
  } catch (error) {
    console.error('Erro ao atualizar cadastro:', error);
    throw new Error('Falha ao atualizar cadastro no Firebase');
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
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      cadastros.push({
        id: doc.id,
        cpf: data.cpf || '',
        nome: data.nome || '',
        data_criacao: data.data_criacao?.toDate() || new Date(),
        dias: data.dias || 0,
        url: data.url || ''
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
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      cadastros.push({
        id: doc.id,
        cpf: data.cpf || '',
        nome: data.nome || '',
        data_criacao: data.data_criacao?.toDate() || new Date(),
        dias: data.dias || 0,
        url: data.url || ''
      });
    });
    
      return cadastros;
  } catch (error) {
    console.error('Erro ao buscar cadastros por período:', error);
    throw new Error('Falha ao buscar cadastros por período');
  }
};

/**
 * Calcula estatísticas dos cadastros baseado nos dados do Firebase
 * Analisa especificamente o campo "dias" para identificar eventos
 */
export const calcularEstatisticas = async (): Promise<{
  total: number;
  maxRegistrationsDate: string;
  maxRegistrationsCount: number;
  minRegistrationsDate: string;
  minRegistrationsCount: number;
  registrationsByDate: { [key: string]: number };
}> => {
  try {
    const cadastros = await buscarCadastros();
    
    // Calcula estatísticas
    const total = cadastros.length;
    
    // Agrupa por dia do evento (campo "dias")
    const registrationsByDate: { [key: string]: number } = {};
    cadastros.forEach(cadastro => {
      // Usa o campo "dias" como identificador do evento
      const diaEvento = String(cadastro.dias);
      registrationsByDate[diaEvento] = (registrationsByDate[diaEvento] || 0) + 1;
    });

    // Encontra o dia do evento com mais cadastros
    let maxDate = '';
    let maxCount = 0;
    Object.entries(registrationsByDate).forEach(([dia, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxDate = dia;
      }
    });

    // Encontra o dia do evento com menos cadastros
    let minDate = '';
    let minCount = total;
    Object.entries(registrationsByDate).forEach(([dia, count]) => {
      if (count < minCount) {
        minCount = count;
        minDate = dia;
      }
    });

    return {
      total,
      maxRegistrationsDate: maxDate,
      maxRegistrationsCount: maxCount,
      minRegistrationsDate: minDate,
      minRegistrationsCount: minCount,
      registrationsByDate
    };

  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    throw new Error('Falha ao calcular estatísticas do Firebase');
  }
};