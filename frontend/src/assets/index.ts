// ==================== ASSETS DO PROJETO ====================
// Este arquivo centraliza todos os assets (imagens, ícones, etc.) do projeto

// ==================== IMAGENS ORGANIZADAS POR CATEGORIA ====================
import { 
  LOGO_IMAGES,
  BACKGROUND_IMAGES,
  BANNER_IMAGES,
  EVENT_IMAGES,
  LOCATION_IMAGES,
  PRODUCT_IMAGES,
  PEOPLE_IMAGES,
  getImagePath,
  preloadImages,
  getImageDimensions
} from './images';

export { 
  LOGO_IMAGES,
  BACKGROUND_IMAGES,
  BANNER_IMAGES,
  EVENT_IMAGES,
  LOCATION_IMAGES,
  PRODUCT_IMAGES,
  PEOPLE_IMAGES,
  getImagePath,
  preloadImages,
  getImageDimensions
};

// ==================== ÍCONES ORGANIZADOS POR CATEGORIA ====================
import { 
  NAVIGATION_ICONS, 
  FESTIVAL_ICONS, 
  FUNCTIONALITY_ICONS, 
  STATUS_ICONS, 
  ACTION_ICONS,
  getIconPath,
  preloadIcons
} from './icons';

export { 
  NAVIGATION_ICONS, 
  FESTIVAL_ICONS, 
  FUNCTIONALITY_ICONS, 
  STATUS_ICONS, 
  ACTION_ICONS,
  getIconPath,
  preloadIcons
};

// ==================== RECURSOS VISUAIS ====================
export const VISUAL_ASSETS = {
  // Cores do tema do festival
  colors: {
    primary: '#16a34a',      // Verde principal
    secondary: '#f59e0b',    // Laranja/amarelo
    accent: '#7c3aed',       // Roxo
    background: '#ffffff',   // Branco
    text: '#333333'          // Cinza escuro
  },
  
  // Gradientes
  gradients: {
    primary: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
    secondary: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    accent: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
  }
};

// ==================== FUNÇÕES UTILITÁRIAS ====================
export const getAssetPath = (path: string): string => {
  // Função para obter o caminho correto dos assets
  return process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}${path}` : path;
};

export const preloadAssets = (): void => {
  // Função para pré-carregar assets importantes
  console.log('🔄 Pré-carregando assets do festival...');
  
  // Pré-carrega imagens e ícones
  preloadImages();
  preloadIcons();
};

// ==================== EXPORTAÇÃO PADRÃO ====================
export default {
  // Imagens
  LOGO_IMAGES,
  BACKGROUND_IMAGES,
  BANNER_IMAGES,
  EVENT_IMAGES,
  LOCATION_IMAGES,
  PRODUCT_IMAGES,
  PEOPLE_IMAGES,
  
  // Ícones
  NAVIGATION_ICONS,
  FESTIVAL_ICONS,
  FUNCTIONALITY_ICONS,
  STATUS_ICONS,
  ACTION_ICONS,
  
  // Recursos visuais
  VISUAL_ASSETS,
  
  // Funções utilitárias
  getAssetPath,
  getImagePath,
  getIconPath,
  preloadAssets,
  preloadImages,
  preloadIcons,
  getImageDimensions
};
