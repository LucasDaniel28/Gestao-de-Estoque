# 📁 Assets do Projeto - 43° Festival do Abacaxi

Esta pasta contém todos os recursos visuais e assets do projeto do Festival do Abacaxi.

## 🗂️ Estrutura da Pasta

```
src/assets/
├── index.ts          # Exportações principais dos assets
├── config.ts         # Configurações e constantes
├── README.md         # Este arquivo de documentação
├── images/           # Pasta para imagens (criar quando necessário)
├── icons/            # Pasta para ícones (criar quando necessário)
└── styles/           # Pasta para estilos (criar quando necessário)
```

## 🎨 Como Usar os Assets

### 1. Importar Assets

```typescript
import { FESTIVAL_IMAGES, ICONS, VISUAL_ASSETS } from '../assets';
import { getFestivalColor, getTypographyStyle } from '../assets/config';
```

### 2. Usar Imagens

```typescript
// No seu componente
<img src={FESTIVAL_IMAGES.logo} alt="Logo do Festival" />
```

### 3. Usar Cores do Festival

```typescript
// Usando as cores predefinidas
const headerStyle = {
  backgroundColor: getFestivalColor('green'),
  color: getFestivalColor('white')
};
```

### 4. Usar Tipografia

```typescript
// Aplicando estilos de tipografia
const titleStyle = getTypographyStyle('3xl', 'bold');
```

## 🌈 Paleta de Cores do Festival

### Cores Principais
- **Verde**: `#16a34a` - Cor principal do abacaxi
- **Laranja**: `#f59e0b` - Cor secundária do abacaxi
- **Amarelo**: `#fbbf24` - Cor de destaque

### Cores Secundárias
- **Roxo**: `#7c3aed` - Cor do festival
- **Azul**: `#3b82f6` - Cor do sistema
- **Vermelho**: `#ef4444` - Cor de alerta

## 📱 Tamanhos de Imagem Recomendados

- **Logo**: 200x200px
- **Banner**: 1200x400px
- **Ícone**: 64x64px
- **Thumbnail**: 150x150px

## 🔧 Configurações

### Formatos Suportados
- PNG, JPG, JPEG, SVG, WebP

### Qualidade
- Compressão: 80%
- Lazy Loading: Ativado

## 📝 Adicionando Novos Assets

### 1. Adicionar Imagem
```typescript
// Em src/assets/index.ts
export const FESTIVAL_IMAGES = {
  // ... outras imagens
  novaImagem: '/assets/images/nova-imagem.jpg'
};
```

### 2. Adicionar Ícone
```typescript
// Em src/assets/index.ts
export const ICONS = {
  // ... outros ícones
  novoIcone: '/assets/icons/novo-icone.svg'
};
```

### 3. Adicionar Cor
```typescript
// Em src/assets/config.ts
export const ASSET_CONFIG = {
  festivalColors: {
    primary: {
      // ... outras cores
      novaCor: '#123456'
    }
  }
};
```

## 🚀 Otimizações

### Pré-carregamento
```typescript
import { preloadAssets } from '../assets';

// No useEffect do seu componente
useEffect(() => {
  preloadAssets();
}, []);
```

### Lazy Loading
```typescript
// Para imagens que não são críticas
<img 
  src={FESTIVAL_IMAGES.banner} 
  loading="lazy" 
  alt="Banner do Festival" 
/>
```

## 📋 Checklist de Assets

- [ ] Logo principal do festival
- [ ] Imagem de fundo
- [ ] Ícone do abacaxi
- [ ] Banner promocional
- [ ] Ícones de navegação
- [ ] Ícones de funcionalidade

## 🎯 Próximos Passos

1. **Criar as pastas** `images/`, `icons/`, `styles/`
2. **Adicionar as imagens reais** do festival
3. **Implementar lazy loading** para otimização
4. **Criar componentes** para reutilização dos assets

---

**Desenvolvido por:** Orbita Tecnologia  
**Projeto:** 43° Festival do Abacaxi - Sistema de Gestão

