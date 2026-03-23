// ==================== CONFIGURAÇÃO DOS ASSETS ====================
// Configurações específicas para o 43° Festival do Abacaxi

export const ASSET_CONFIG = {
  // Configurações de imagens
  images: {
    // Formatos suportados
    supportedFormats: ['png'],
    
    // Tamanhos recomendados
    sizes: {
      logo: { width: 200, height: 200 },
      banner: { width: 1200, height: 400 },
      icon: { width: 64, height: 64 },
      thumbnail: { width: 150, height: 150 }
    },
    
    // Qualidade de compressão
    quality: 0.9,
    
    // Lazy loading
    lazyLoading: true
  },
  
  // Configurações de ícones
  icons: {
    // Biblioteca de ícones
    library: 'PNG',
    
    // Tamanhos padrão
    defaultSize: 24,
    
    // Cores padrão
    defaultColor: '#333333'
  },
  
  // Configurações de cores do festival
  festivalColors: {
    // Cores principais
    primary: {
      green: '#16a34a',      // Verde do abacaxi
      orange: '#f59e0b',     // Laranja do abacaxi
      yellow: '#fbbf24'      // Amarelo do abacaxi
    },
    
    // Cores secundárias
    secondary: {
      purple: '#7c3aed',     // Roxo do festival
      blue: '#3b82f6',       // Azul do sistema
      red: '#ef4444'         // Vermelho de alerta
    },
    
    // Cores neutras
    neutral: {
      white: '#ffffff',
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827'
      }
    }
  },
  
  // Configurações de tipografia
  typography: {
    // Fontes principais
    fonts: {
      primary: 'Arial, sans-serif',
      secondary: 'Georgia, serif',
      accent: 'Verdana, sans-serif'
    },
    
    // Tamanhos de fonte
    sizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px'
    },
    
    // Pesos de fonte
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    }
  },
  
  // Configurações de animações
  animations: {
    // Durações padrão
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    
    // Curvas de easing
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  }
};

// ==================== FUNÇÕES UTILITÁRIAS ====================
export const getFestivalColor = (colorName: string): string => {
  const colors = ASSET_CONFIG.festivalColors;
  
  // Busca recursiva nas cores
  const findColor = (obj: any, name: string): string | null => {
    for (const key in obj) {
      if (key === name) return obj[key];
      if (typeof obj[key] === 'object') {
        const result = findColor(obj[key], name);
        if (result) return result;
      }
    }
    return null;
  };
  
  return findColor(colors, colorName) || colors.neutral.gray[500];
};

export const getTypographyStyle = (size: string, weight: string = 'normal') => {
  const config = ASSET_CONFIG.typography;
  
  return {
    fontSize: config.sizes[size as keyof typeof config.sizes] || config.sizes.base,
    fontWeight: config.weights[weight as keyof typeof config.weights] || config.weights.normal,
    fontFamily: config.fonts.primary
  };
};

// ==================== EXPORTAÇÃO ====================
export default ASSET_CONFIG;
