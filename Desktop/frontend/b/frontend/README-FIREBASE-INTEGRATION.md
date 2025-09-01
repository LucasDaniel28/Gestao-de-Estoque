# 🔥 Integração Firebase + Dispositivo Hikvision

## 📋 Visão Geral

Este sistema integra dados do **Firebase Firestore** com o **dispositivo Hikvision**, permitindo:

- ✅ **Visualizar** cadastros do Firebase em tempo real
- ✅ **Enviar** cadastros individuais para o dispositivo Hikvision
- ✅ **Sincronizar** múltiplos cadastros em lote
- ✅ **Monitorar** status de sincronização
- ✅ **Gerenciar** histórico de operações

## 🚀 Funcionalidades Implementadas

### 1. **Visualização de Dados Firebase**
- Lista todos os cadastros da coleção "cadastros"
- Exibe fotos das pessoas registradas
- Sistema de busca avançado (CPF, nome, período)
- Estatísticas em tempo real

### 2. **Envio para Dispositivo Hikvision**
- Botão "📤 Enviar para Dispositivo" para cada cadastro
- Verificação automática de conectividade
- Download automático de imagens do Firebase Storage
- Conversão para formato compatível com Hikvision

### 3. **Sincronização em Lote**
- Botão "🔄 Sincronizar Todos" para múltiplos cadastros
- Processamento sequencial para evitar sobrecarga
- Relatório detalhado de sucessos e falhas
- Pausa automática entre sincronizações

### 4. **Monitoramento de Status**
- Indicador visual de conectividade do dispositivo
- Status de sincronização em tempo real
- Histórico das últimas operações
- Alertas para problemas de conexão

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Firebase      │    │   Frontend       │    │   Backend       │
│   Firestore     │◄──►│   React +        │◄──►│   Node.js +     │
│   Storage       │    │   TypeScript     │    │   Express       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Hook           │    │   Hikvision     │
                       │   useDeviceSync  │    │   ISAPI         │
                       └──────────────────┘    └─────────────────┘
```

## 📁 Estrutura de Arquivos

```
frontend/src/
├── components/
│   ├── FirebaseData.tsx          # Componente principal
│   ├── DeviceSyncStatus.tsx      # Status de sincronização
│   └── ...
├── hooks/
│   └── useDeviceSync.ts          # Hook de sincronização
├── services/
│   ├── firebase.ts               # Serviços Firebase
│   └── api.ts                    # API do backend
└── firebase.ts                   # Configuração Firebase
```

## 🔧 Como Usar

### **1. Acessar Dados Firebase**
1. Navegue para a aba "Dados Firebase"
2. Os dados são carregados automaticamente
3. Use os filtros de busca conforme necessário

### **2. Enviar Cadastro Individual**
1. Localize o cadastro desejado na lista
2. Verifique se há foto disponível
3. Clique em "📤 Enviar para Dispositivo"
4. Aguarde a confirmação de sucesso

### **3. Sincronização em Lote**
1. Clique em "🔄 Sincronizar Todos"
2. Confirme a operação
3. Monitore o progresso
4. Verifique o relatório final

### **4. Monitorar Status**
- **Verde**: Dispositivo online
- **Vermelho**: Dispositivo offline
- **Amarelo**: Verificando conexão

## 📊 Estrutura dos Dados

### **Cadastro Firebase**
```typescript
interface Cadastro {
  id: string;           // ID do documento
  cpf: string;          // CPF da pessoa
  nome: string;         // Nome completo
  data_criacao: Date;   // Data de criação
  dias: number;         // Número de dias
  url: string;          // URL da foto no Storage
}
```

### **Status de Sincronização**
```typescript
interface SyncState {
  deviceOnline: boolean;    // Dispositivo conectado
  lastSync: Date | null;    // Última sincronização
  pendingSyncs: number;     // Sincronizações pendentes
  totalSynced: number;      // Total sincronizado
  isChecking: boolean;      // Verificando status
}
```

## 🔌 Configuração

### **Firebase**
```typescript
// src/firebase.ts
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  // ... outras configurações
};
```

### **Backend Hikvision**
```typescript
// Configurações no backend
const hikvisionConfig = {
  ip: "192.168.1.100",
  port: 80,
  username: "admin",
  password: "senha123"
};
```

## 🚨 Tratamento de Erros

### **Erros Comuns**
1. **Dispositivo Offline**
   - Verificar conectividade de rede
   - Confirmar IP e credenciais
   - Verificar firewall

2. **Falha no Download de Imagem**
   - Verificar URL do Firebase Storage
   - Confirmar permissões de acesso
   - Verificar formato da imagem

3. **Erro de Autenticação**
   - Verificar credenciais Hikvision
   - Confirmar permissões de usuário
   - Verificar versão do firmware

### **Logs e Debug**
- Todos os erros são logados no console
- Histórico de sincronização é mantido
- Toast notifications para feedback do usuário

## 📈 Métricas e Estatísticas

### **Dashboard**
- Total de cadastros
- Cadastros com foto
- Último cadastro criado
- Média de dias

### **Sincronização**
- Total sincronizado
- Taxa de sucesso
- Tempo médio de sincronização
- Histórico de operações

## 🔒 Segurança

### **Firebase**
- Autenticação via API Key
- Regras de segurança configuráveis
- Acesso restrito por projeto

### **Hikvision**
- Autenticação HTTP Digest
- Comunicação via HTTPS (se configurado)
- Controle de acesso por usuário

## 🚀 Melhorias Futuras

### **Funcionalidades Planejadas**
- [ ] Sincronização automática programada
- [ ] Backup automático de dados
- [ ] Relatórios detalhados de sincronização
- [ ] Notificações push para falhas
- [ ] Interface de configuração avançada

### **Otimizações Técnicas**
- [ ] Cache de imagens para melhor performance
- [ ] Sincronização paralela (com limite)
- [ ] Retry automático para falhas
- [ ] Compressão de imagens
- [ ] Logs estruturados

## 📞 Suporte

### **Problemas Comuns**
1. **Verificar conectividade de rede**
2. **Confirmar configurações do Firebase**
3. **Verificar status do dispositivo Hikvision**
4. **Consultar logs do console**

### **Debug**
- Use o console do navegador para logs detalhados
- Verifique a aba Network para requisições
- Monitore o status de sincronização em tempo real

---

## 🎯 Resumo

Este sistema oferece uma **integração completa e robusta** entre Firebase e dispositivos Hikvision, permitindo:

- **Gestão centralizada** de cadastros
- **Sincronização automática** com dispositivos
- **Monitoramento em tempo real** do status
- **Interface intuitiva** para operações
- **Tratamento robusto** de erros

A implementação segue as **melhores práticas** de desenvolvimento React/TypeScript e oferece uma **experiência de usuário excepcional** para gestão de cadastros e sincronização com dispositivos de controle de acesso.
