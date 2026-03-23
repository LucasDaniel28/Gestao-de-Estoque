# Deploy no Vercel

## Configuração do Projeto

Este projeto está configurado para deploy no Vercel com as seguintes características:

### Estrutura
- Frontend React em `/frontend`
- Backend Node.js em `/backend` (não será deployado no Vercel)

### Arquivos de Configuração

#### `vercel.json`
Configura o build e routing para o Vercel:
- Build do frontend usando `@vercel/static-build`
- Diretório de saída: `frontend/build`
- Todas as rotas direcionadas para o frontend

#### `.vercelignore`
Arquivos e diretórios ignorados durante o deploy:
- `node_modules/`
- `backend/`
- Arquivos de log
- Build artifacts

### Como Fazer Deploy

1. **Conectar Repositório no Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Importe seu repositório Git
   - O Vercel detectará automaticamente o projeto React

2. **Configurações de Build**
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `cd frontend && npm install`

3. **Variáveis de Ambiente**
   - Configure as variáveis de ambiente necessárias no painel do Vercel
   - Ex: `REACT_APP_API_URL` para a URL da API

### Solução de Problemas

#### Erro 404 NOT_FOUND
Se encontrar erro 404, verifique:
1. O `vercel.json` está na raiz do projeto
2. O `package.json` do frontend contém o script `build`
3. O diretório `frontend/build` é gerado corretamente

#### Build Falhando
1. Verifique se todas as dependências estão em `package.json`
2. Teste localmente: `cd frontend && npm run build`
3. Verifique os logs de build no painel do Vercel

### Backend

O backend não é deployado no Vercel. Para produção:
- Use serviços como Railway, Render, ou Heroku
- Ou configure um servidor próprio
- Atualize a URL da API nas variáveis de ambiente do frontend

### Limitações

- Apenas frontend estático é deployado
- API endpoints não funcionarão sem backend separado
- Dados em localStorage serão resetados a cada deploy
