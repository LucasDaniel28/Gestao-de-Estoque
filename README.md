# Sistema Depósito

Sistema completo de gestão de produtos e vendas, com carrinho de compras e emissão de nota fiscal em PDF.

##  Tecnologias Utilizadas

### Backend
- Node.js + Express
- TypeScript
- PDFKit (geração de PDF)
- Armazenamento em memória (sem banco de dados externo)

### Frontend
- React + TypeScript
- Tailwind CSS
- Zustand (gerenciamento de estado)
- jsPDF (geração de PDF no cliente)
- Lucide React (ícones)
- LocalStorage (persistência de dados)

##  Instalação

### Backend

```bash
cd backend
npm install
npm run build
npm start
```

O servidor rodará em: `http://localhost:3001`

Para desenvolvimento com hot reload:
```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

O frontend rodará em: `http://localhost:3000`

##  Funcionalidades

### Gestão de Produtos
- ✅ Cadastrar novos produtos (nome, descrição, preço, quantidade, categoria)
- ✅ Editar produtos existentes
- ✅ Excluir produtos
- ✅ Listar todos os produtos
- ✅ Buscar produtos por nome/descrição
- ✅ Filtrar produtos por categoria
- ✅ Controle de estoque automático

### Carrinho de Compras
- ✅ Adicionar produtos ao carrinho
- ✅ Aumentar/diminuir quantidade de itens
- ✅ Remover itens do carrinho
- ✅ Visualizar subtotal por item
- ✅ Visualizar total geral
- ✅ Limpar carrinho

### Finalização de Venda
- ✅ Escolher forma de pagamento (Dinheiro, Cartão de Crédito, Cartão de Débito, PIX)
- ✅ Adicionar informações do cliente (opcional): nome, CPF, telefone
- ✅ Atualização automática de estoque após venda
- ✅ Validação de estoque disponível

### Nota Fiscal (PDF)
- ✅ Geração automática de nota fiscal em PDF após venda
- ✅ Informações da empresa
- ✅ Detalhes da venda (data, forma de pagamento, número da nota)
- ✅ Informações do cliente (se fornecidas)
- ✅ Lista de itens comprados
- ✅ Total da venda
- ✅ Download automático do PDF

### Histórico de Vendas
- ✅ Visualizar todas as vendas realizadas
- ✅ Buscar vendas por ID, cliente ou forma de pagamento
- ✅ Baixar nota fiscal de vendas anteriores
- ✅ Visualizar total de vendas

##  Dados de Exemplo

O sistema já vem com 6 produtos de exemplo para facilitar os testes.

##  Interface

- Design moderno e responsivo
- Tema roxo/azul
- Ícones intuitivos
- Notificações toast para feedback
- Interface mobile-friendly

##  Armazenamento

### Frontend
Os dados são armazenados no **localStorage** do navegador, permitindo persistência local sem necessidade de banco de dados.

### Backend
Os dados são armazenados em **memória**, reiniciando quando o servidor é reiniciado. Ideal para testes e desenvolvimento.

##  Configuração

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend
Não requer configuração adicional. O sistema funciona standalone.

##  Testes

Para testar o sistema:

1. Inicie o backend e o frontend
2. Acesse `http://localhost:3000`
3. Navegue entre "Produtos" e "Vendas"
4. Cadastre novos produtos ou use os de exemplo
5. Adicione produtos ao carrinho
6. Finalize uma venda
7. Baixe a nota fiscal em PDF
8. Visualize o histórico de vendas

##  Observações

- Sistema totalmente funcional sem necessidade de banco de dados externo
- Sem sistema de login/autenticação
- Perfeito para testes locais e demonstrações
- Código limpo e bem estruturado
- Fácil de expandir e personalizar

##  Limpeza de Dados

Para limpar os dados:
- **Frontend**: Limpe o localStorage do navegador ou use as DevTools
- **Backend**: Reinicie o servidor (os dados em memória serão zerados)

