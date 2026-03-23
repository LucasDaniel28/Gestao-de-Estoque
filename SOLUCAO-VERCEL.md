# Solução para Erro 404 no Deploy Vercel

## Problema Identificado
O erro `404: NOT_FOUND` no Vercel ocorre porque:
1. O projeto tem estrutura monorepo (frontend + backend)
2. O Vercel não encontrava o ponto de entrada correto
3. Faltava configuração de routing estático

## Arquivos Criados/Modificados

### 1. `vercel.json` (Principal)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/frontend/static/$1"
    },
    {
      "src": "/(.*\\.(js|css|png|jpg|jpeg|gif|ico|svg))",
      "dest": "/frontend/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/index.html"
    }
  ]
}
```

### 2. `.vercelignore`
```
node_modules
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
*.log
build
dist
.git
.gitignore
README.md
backend/src
```

### 3. `frontend/package.json` (Modificado)
Adicionado:
- `"homepage": "."`
- `"vercel-build": "craco build"`

## Como Usar

### Opção 1: Configuração Principal (Recomendado)
1. Use o arquivo `vercel.json` principal
2. Faça deploy no Vercel conectando seu repositório
3. O Vercel detectará automaticamente a configuração

### Opção 2: Configuração Simples
1. Renomeie `vercel-simple.json` para `vercel.json`
2. Use esta configuração mais direta se a primeira não funcionar

## Configurações no Painel Vercel

### Build Settings
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/build`
- **Install Command**: `cd frontend && npm install`

### Variáveis de Ambiente
Configure no painel do Vercel:
- `REACT_APP_API_URL`: URL da sua API backend
- `GENERATE_SOURCEMAP`: `false` (opcional, para reduzir tamanho)

## Backend (API)

O backend não será deployado no Vercel. Opções:
1. **Railway**: `railway up`
2. **Render**: Conectar repositório
3. **Heroku**: Criar app e fazer deploy
4. **VPS/Cloud**: Deploy manual

## Teste Local

Antes do deploy:
```bash
cd frontend
npm run build
# Verifique se a pasta build é criada corretamente
```

## Solução de Problemas

### Se ainda der 404:
1. Verifique se `vercel.json` está na raiz
2. Teste build local: `cd frontend && npm run build`
3. Verifique logs no dashboard Vercel
4. Limpe cache: `vercel --prod`

### Se build falhar:
1. Verifique dependências em `package.json`
2. Teste localmente primeiro
3. Verifique compatibilidade Node.js (use v18+)

## Estrutura Final
```
/
├── vercel.json
├── .vercelignore
├── frontend/
│   ├── package.json
│   ├── build/
│   └── src/
└── backend/
```

## Próximos Passos

1. **Fazer deploy do backend** em serviço separado
2. **Configurar CORS** no backend para o domínio Vercel
3. **Atualizar variáveis de ambiente** no Vercel
4. **Testar aplicação completa** em produção

## Links Úteis
- [Vercel Documentation](https://vercel.com/docs)
- [React App Deployment](https://create-react-app.dev/docs/deployment/)
- [Vercel Configuration](https://vercel.com/docs/projects/project-configuration)
