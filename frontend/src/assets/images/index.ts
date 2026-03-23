// ==================== IMAGENS DO PROJETO ====================
// Este arquivo centraliza todas as imagens do 43° Festival do Abacaxi

// ==================== LOGOS E IDENTIDADE VISUAL ====================
export const LOGO_IMAGES = {
  // Logo principal do festival
  mainLogo: '/assets/images/main-logo.png',
  
  // Logo alternativo (versão horizontal)
  horizontalLogo: '/assets/images/horizontal-logo.png',
  
  // Logo simplificado (para favicon)
  favicon: '/assets/images/favicon.png',
  
  // Logo do abacaxi
  pineappleLogo: '/assets/images/pineapple-logo.png'
};

// ==================== IMAGENS DE FUNDO ====================
export const BACKGROUND_IMAGES = {
  // Fundo principal do festival
  mainBackground: '/assets/images/main-background.png',
  
  // Fundo do cabeçalho
  headerBackground: '/assets/images/header-background.png',
  
  // Fundo das seções
  sectionBackground: '/assets/images/section-background.png',
  
  // Padrões de fundo
  pattern1: '/assets/images/pattern-1.png',
  pattern2: '/assets/images/pattern-2.png'
};

// ==================== BANNERS E PROMOÇÕES ====================
export const BANNER_IMAGES = {
  // Banner principal do festival
  mainBanner: '/assets/images/main-banner.png',
  
  // Banner de inscrição
  registrationBanner: '/assets/images/registration-banner.png',
  
  // Banner de eventos
  eventsBanner: '/assets/images/events-banner.png',
  
  // Banner de informações
  infoBanner: '/assets/images/info-banner.png'
};

// ==================== IMAGENS DE EVENTOS ====================
export const EVENT_IMAGES = {
  // Imagens dos dias do festival
  day1: '/assets/images/day-1.png',
  day2: '/assets/images/day-2.png',
  day3: '/assets/images/day-3.png',
  day4: '/assets/images/day-4.png',
  
  // Imagens de atividades
  stage: '/assets/images/stage.png',
  food: '/assets/images/food.png',
  music: '/assets/images/music.png',
  culture: '/assets/images/culture.png'
};

// ==================== IMAGENS DE LOCALIZAÇÃO ====================
export const LOCATION_IMAGES = {
  // Local do festival
  venue: '/assets/images/venue.png',
  
  // Mapa do local
  map: '/assets/images/map.png',
  
  // Pontos de referência
  landmark1: '/assets/images/landmark-1.png',
  landmark2: '/assets/images/landmark-2.png'
};

// ==================== IMAGENS DE PRODUTOS ====================
export const PRODUCT_IMAGES = {
  // Produtos do abacaxi
  pineapple1: '/assets/images/pineapple-1.png',
  pineapple2: '/assets/images/pineapple-2.png',
  
  // Produtos derivados
  juice: '/assets/images/juice.png',
  preserves: '/assets/images/preserves.png',
  sweets: '/assets/images/sweets.png'
};

// ==================== IMAGENS DE PESSOAS ====================
export const PEOPLE_IMAGES = {
  // Organizadores
  organizer1: '/assets/images/organizer-1.png',
  organizer2: '/assets/images/organizer-2.png',
  
  // Participantes (exemplos)
  participant1: '/assets/images/participant-1.png',
  participant2: '/assets/images/participant-2.png',
  
  // Artistas
  artist1: '/assets/images/artist-1.png',
  artist2: '/assets/images/artist-2.png'
};

// ==================== FUNÇÕES UTILITÁRIAS ====================
export const getImagePath = (imageName: string, category: string = 'logo'): string => {
  // Função para obter o caminho de uma imagem específica
  const categories = {
    logo: LOGO_IMAGES,
    background: BACKGROUND_IMAGES,
    banner: BANNER_IMAGES,
    event: EVENT_IMAGES,
    location: LOCATION_IMAGES,
    product: PRODUCT_IMAGES,
    people: PEOPLE_IMAGES
  };
  
  const categoryImages = categories[category as keyof typeof categories];
  return categoryImages[imageName as keyof typeof categoryImages] || '/assets/images/default.png';
};

export const preloadImages = (): void => {
  // Função para pré-carregar imagens importantes
  console.log('🔄 Pré-carregando imagens do festival...');
  
  // Aqui você pode adicionar lógica para pré-carregar imagens críticas
  // const imagePreload = new Image();
  // imagePreload.src = LOGO_IMAGES.mainLogo;
};

export const getImageDimensions = (imagePath: string): Promise<{ width: number; height: number }> => {
  // Função para obter as dimensões de uma imagem
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = imagePath;
  });
};

// ==================== EXPORTAÇÃO PADRÃO ====================
export default {
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
