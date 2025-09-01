// Exemplos de uso dos serviços do Firebase
// Este arquivo demonstra como usar as funções criadas

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

// ============================================================================
// EXEMPLO 1: Buscar todos os cadastros
// ============================================================================
export const exemploBuscarTodos = async () => {
  try {
    console.log('🔍 Buscando todos os cadastros...');
    const cadastros = await buscarCadastros();
    console.log(`✅ Encontrados ${cadastros.length} cadastros:`, cadastros);
    return cadastros;
  } catch (error) {
    console.error('❌ Erro ao buscar cadastros:', error);
    throw error;
  }
};

// ============================================================================
// EXEMPLO 2: Buscar cadastro por CPF
// ============================================================================
export const exemploBuscarPorCPF = async (cpf: string) => {
  try {
    console.log(`🔍 Buscando cadastro com CPF: ${cpf}`);
    const cadastro = await buscarCadastroPorCPF(cpf);
    
    if (cadastro) {
      console.log('✅ Cadastro encontrado:', cadastro);
      return cadastro;
    } else {
      console.log('⚠️ Nenhum cadastro encontrado com este CPF');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao buscar por CPF:', error);
    throw error;
  }
};

// ============================================================================
// EXEMPLO 3: Buscar cadastros por nome
// ============================================================================
export const exemploBuscarPorNome = async (nome: string) => {
  try {
    console.log(`🔍 Buscando cadastros com nome: ${nome}`);
    const cadastros = await buscarCadastrosPorNome(nome);
    console.log(`✅ Encontrados ${cadastros.length} cadastros com este nome:`, cadastros);
    return cadastros;
  } catch (error) {
    console.error('❌ Erro ao buscar por nome:', error);
    throw error;
  }
};

// ============================================================================
// EXEMPLO 4: Buscar cadastros por período
// ============================================================================
export const exemploBuscarPorPeriodo = async (dias: number) => {
  try {
    console.log(`🔍 Buscando cadastros dos últimos ${dias} dias...`);
    const cadastros = await buscarCadastrosPorPeriodo(dias);
    console.log(`✅ Encontrados ${cadastros.length} cadastros neste período:`, cadastros);
    return cadastros;
  } catch (error) {
    console.error('❌ Erro ao buscar por período:', error);
    throw error;
  }
};

// ============================================================================
// EXEMPLO 5: Criar novo cadastro
// ============================================================================
export const exemploCriarCadastro = async () => {
  try {
    const novoCadastro: NovoCadastro = {
      cpf: '123.456.789-00',
      nome: 'João Silva Santos',
      dias: 30,
      url: 'https://exemplo.com/foto.jpg'
    };

    console.log('➕ Criando novo cadastro:', novoCadastro);
    const id = await criarCadastro(novoCadastro);
    console.log(`✅ Cadastro criado com sucesso! ID: ${id}`);
    return id;
  } catch (error) {
    console.error('❌ Erro ao criar cadastro:', error);
    throw error;
  }
};

// ============================================================================
// EXEMPLO 6: Atualizar cadastro existente
// ============================================================================
export const exemploAtualizarCadastro = async (id: string) => {
  try {
    const dadosAtualizados: Partial<NovoCadastro> = {
      nome: 'João Silva Santos Atualizado',
      dias: 45
    };

    console.log(`✏️ Atualizando cadastro ID: ${id}`, dadosAtualizados);
    await atualizarCadastro(id, dadosAtualizados);
    console.log('✅ Cadastro atualizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao atualizar cadastro:', error);
    throw error;
  }
};

// ============================================================================
// EXEMPLO 7: Remover cadastro
// ============================================================================
export const exemploRemoverCadastro = async (id: string) => {
  try {
    console.log(`🗑️ Removendo cadastro ID: ${id}`);
    await removerCadastro(id);
    console.log('✅ Cadastro removido com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao remover cadastro:', error);
    throw error;
  }
};

// ============================================================================
// EXEMPLO 8: Fluxo completo de operações
// ============================================================================
export const exemploFluxoCompleto = async () => {
  try {
    console.log('🚀 Iniciando fluxo completo de operações...\n');

    // 1. Buscar todos os cadastros
    console.log('1️⃣ Buscando todos os cadastros...');
    const todosCadastros = await buscarCadastros();
    console.log(`   Encontrados: ${todosCadastros.length}\n`);

    // 2. Criar novo cadastro
    console.log('2️⃣ Criando novo cadastro...');
    const novoCadastro: NovoCadastro = {
      cpf: '987.654.321-00',
      nome: 'Maria Oliveira Costa',
      dias: 60,
      url: 'https://exemplo.com/maria.jpg'
    };
    const novoId = await criarCadastro(novoCadastro);
    console.log(`   Novo cadastro criado com ID: ${novoId}\n`);

    // 3. Buscar o cadastro criado
    console.log('3️⃣ Buscando cadastro criado...');
    const cadastroCriado = await buscarCadastroPorCPF(novoCadastro.cpf);
    console.log('   Cadastro encontrado:', cadastroCriado?.nome, '\n');

    // 4. Atualizar o cadastro
    console.log('4️⃣ Atualizando cadastro...');
    await atualizarCadastro(novoId, { dias: 90 });
    console.log('   Cadastro atualizado para 90 dias\n');

    // 5. Verificar atualização
    console.log('5️⃣ Verificando atualização...');
    const cadastroAtualizado = await buscarCadastroPorCPF(novoCadastro.cpf);
    console.log('   Dias atualizados:', cadastroAtualizado?.dias, '\n');

    // 6. Buscar por período
    console.log('6️⃣ Buscando cadastros dos últimos 30 dias...');
    const cadastrosRecentes = await buscarCadastrosPorPeriodo(30);
    console.log(`   Encontrados: ${cadastrosRecentes.length}\n`);

    // 7. Remover o cadastro de teste
    console.log('7️⃣ Removendo cadastro de teste...');
    await removerCadastro(novoId);
    console.log('   Cadastro removido\n');

    console.log('✅ Fluxo completo executado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro no fluxo completo:', error);
    throw error;
  }
};

// ============================================================================
// EXEMPLO 9: Função utilitária para testar conexão
// ============================================================================
export const testarConexaoFirebase = async () => {
  try {
    console.log('🔌 Testando conexão com Firebase...');
    
    // Tentar buscar cadastros (se houver erro, a conexão falhou)
    const cadastros = await buscarCadastros();
    console.log('✅ Conexão com Firebase funcionando!');
    console.log(`   Total de cadastros: ${cadastros.length}`);
    
    return {
      status: 'success',
      message: 'Conexão com Firebase funcionando',
      totalCadastros: cadastros.length
    };
  } catch (error) {
    console.error('❌ Falha na conexão com Firebase:', error);
    return {
      status: 'error',
      message: 'Falha na conexão com Firebase',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// ============================================================================
// EXEMPLO 10: Função para exportar dados
// ============================================================================
export const exportarDadosFirebase = async () => {
  try {
    console.log('📊 Exportando dados do Firebase...');
    
    const cadastros = await buscarCadastros();
    
    // Formatar dados para exportação
    const dadosExportados = cadastros.map(cadastro => ({
      id: cadastro.id,
      cpf: cadastro.cpf,
      nome: cadastro.nome,
      data_criacao: cadastro.data_criacao.toISOString(),
      dias: cadastro.dias,
      url: cadastro.url
    }));

    // Criar arquivo de download
    const blob = new Blob([JSON.stringify(dadosExportados, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cadastros-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ Dados exportados com sucesso!');
    return dadosExportados;
  } catch (error) {
    console.error('❌ Erro ao exportar dados:', error);
    throw error;
  }
};

// ============================================================================
// USO NO COMPONENTE REACT
// ============================================================================

/*
// No seu componente React, você pode usar assim:

import { useEffect, useState } from 'react';
import { 
  buscarCadastros, 
  buscarCadastroPorCPF,
  testarConexaoFirebase 
} from '../services/firebase';

const MeuComponente = () => {
  const [cadastros, setCadastros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Testar conexão primeiro
        const testeConexao = await testarConexaoFirebase();
        
        if (testeConexao.status === 'success') {
          // Carregar dados
          const dados = await buscarCadastros();
          setCadastros(dados);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Cadastros ({cadastros.length})</h2>
      {cadastros.map(cadastro => (
        <div key={cadastro.id}>
          <h3>{cadastro.nome}</h3>
          <p>CPF: {cadastro.cpf}</p>
          <p>Dias: {cadastro.dias}</p>
        </div>
      ))}
    </div>
  );
};

export default MeuComponente;
*/
