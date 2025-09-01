# Implementação de Funcionalidade de Dependentes

## Visão Geral

Esta implementação adiciona a funcionalidade para exibir dependentes com fotos ao abrir os detalhes de cadastro de uma pessoa no sistema Cuidar+.

## Funcionalidades Implementadas

### 1. Interface de Dependente
- **Arquivo**: `frontend/src/types/index.ts`
- **Interface**: `Dependente`
- **Campos**:
  - `id`: Identificador único
  - `cpf_certidao_rg`: CPF, certidão ou RG do dependente
  - `nome`: Nome completo do dependente
  - `idade`: Data de nascimento ou idade
  - `relacao_responsavel`: Relação com o responsável (ex: "Pai", "Mãe")
  - `responsavel_cpf`: CPF do responsável
  - `foto`: URL da foto do dependente
  - `dateTime`: Data e hora do cadastro

### 2. Serviços Firebase
- **Arquivo**: `frontend/src/services/firebase.ts`
- **Funções**:
  - `buscarDependentesPorResponsavel(cpfResponsavel)`: Busca todos os dependentes de um responsável
  - `buscarCadastroComDependentes(cpf)`: Busca cadastro e dependentes em uma única operação

### 3. Modal de Detalhes Atualizado
- **Arquivo**: `frontend/src/components/PatientDetailModal.tsx`
- **Funcionalidades**:
  - Carregamento automático de dependentes ao abrir o modal
  - Exibição de dependentes em grid responsivo
  - Fotos dos dependentes com fallback para ícone
  - Informações detalhadas de cada dependente
  - Contador dinâmico de dependentes

## Como Funciona

### Fluxo de Dados
1. Usuário abre detalhes de um cadastro
2. Sistema verifica se o paciente tem CPF
3. Sistema busca dependentes na coleção 'dependentes' do Firebase
4. Dependentes são exibidos com fotos e informações
5. Contador é atualizado dinamicamente

### Estrutura do Firebase
- **Coleção**: `dependentes`
- **Campo de busca**: `responsavel_cpf`
- **Relacionamento**: Um responsável pode ter múltiplos dependentes

## Exemplo de Uso

```typescript
// Buscar dependentes de um responsável
const dependentes = await buscarDependentesPorResponsavel('123.456.789-00');

// Buscar cadastro com dependentes
const { cadastro, dependentes } = await buscarCadastroComDependentes('123.456.789-00');
```

## Interface Visual

### Seção de Dependentes
- **Layout**: Grid responsivo (1 coluna em mobile, 2 em tablet, 3 em desktop)
- **Cada dependente exibe**:
  - Foto circular (80x80px) com borda vermelha
  - Nome em destaque
  - CPF/RG, idade, relação e data de cadastro
  - Fallback para ícone quando não há foto

### Responsividade
- **Mobile**: 1 coluna
- **Tablet**: 2 colunas  
- **Desktop**: 3 colunas
- **Modal**: Largura máxima aumentada para 4xl

## Tratamento de Erros

- **Fotos**: Fallback para ícone padrão em caso de erro
- **Dados**: Valores padrão para campos vazios
- **Firebase**: Tratamento de erros com mensagens em português
- **Loading**: Estado de carregamento para feedback visual

## Dependências

- **React**: Hooks (useState, useEffect)
- **Lucide React**: Ícones (Users, User, etc.)
- **Firebase**: Firestore para busca de dados
- **Tailwind CSS**: Estilização responsiva

## Próximos Passos Sugeridos

1. **Cache**: Implementar cache local para dependentes
2. **Paginação**: Adicionar paginação para muitos dependentes
3. **Filtros**: Filtros por idade, relação, etc.
4. **Edição**: Permitir edição de dependentes
5. **Upload**: Upload de fotos para dependentes
6. **Validação**: Validação de CPF e dados obrigatórios

## Arquivos Modificados

1. `frontend/src/types/index.ts` - Novas interfaces
2. `frontend/src/services/firebase.ts` - Novas funções de busca
3. `frontend/src/components/PatientDetailModal.tsx` - Modal atualizado

## Testes

Para testar a funcionalidade:
1. Abra os detalhes de um cadastro que tenha dependentes
2. Verifique se os dependentes são carregados automaticamente
3. Confirme se as fotos são exibidas corretamente
4. Teste a responsividade em diferentes tamanhos de tela
