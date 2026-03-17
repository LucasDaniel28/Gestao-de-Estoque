// ==================== ÍCONES DO PROJETO ====================
// Este arquivo centraliza todos os ícones do 43° Festival do Abacaxi

// ==================== ÍCONES DE NAVEGAÇÃO ====================
export const NAVIGATION_ICONS = {
  // Ícones principais de navegação
  home: '/assets/icons/home.png',
  registration: '/assets/icons/registration.png',
  info: '/assets/icons/info.png',
  login: '/assets/icons/login.png',
  
  // Ícones secundários
  dashboard: '/assets/icons/dashboard.png',
  users: '/assets/icons/users.png',
  settings: '/assets/icons/settings.png'
};

// ==================== ÍCONES DO FESTIVAL ====================
export const FESTIVAL_ICONS = {
  // Ícones específicos do festival
  pineapple: '/assets/icons/pineapple.png',
  festival: '/assets/icons/festival.png',
  calendar: '/assets/icons/calendar.png',
  location: '/assets/icons/location.png',
  time: '/assets/icons/time.png',
  
  // Ícones de eventos
  event: '/assets/icons/event.png',
  stage: '/assets/icons/stage.png',
  music: '/assets/icons/music.png',
  food: '/assets/icons/food.png'
};

// ==================== ÍCONES DE FUNCIONALIDADE ====================
export const FUNCTIONALITY_ICONS = {
  // Sistema de gestão
  user: '/assets/icons/user.png',
  database: '/assets/icons/database.png',
  cloud: '/assets/icons/cloud.png',
  sync: '/assets/icons/sync.png',
  
  // Controle de acesso
  access: '/assets/icons/access.png',
  qrcode: '/assets/icons/qrcode.png',
  camera: '/assets/icons/camera.png',
  security: '/assets/icons/security.png'
};

// ==================== ÍCONES DE STATUS ====================
export const STATUS_ICONS = {
  // Status do sistema
  online: '/assets/icons/online.png',
  offline: '/assets/icons/offline.png',
  warning: '/assets/icons/warning.png',
  error: '/assets/icons/error.png',
  success: '/assets/icons/success.png',
  
  // Indicadores
  check: '/assets/icons/check.png',
  close: '/assets/icons/close.png',
  info: '/assets/icons/info.png',
  help: '/assets/icons/help.png'
};

// ==================== ÍCONES DE AÇÃO ====================
export const ACTION_ICONS = {
  // Ações básicas
  add: '/assets/icons/add.png',
  edit: '/assets/icons/edit.png',
  delete: '/assets/icons/delete.png',
  save: '/assets/icons/save.png',
  
  // Navegação
  arrowLeft: '/assets/icons/arrow-left.png',
  arrowRight: '/assets/icons/arrow-right.png',
  arrowUp: '/assets/icons/arrow-up.png',
  arrowDown: '/assets/icons/arrow-down.png',
  
  // Interação
  search: '/assets/icons/search.png',
  filter: '/assets/icons/filter.png',
  sort: '/assets/icons/sort.png',
  download: '/assets/icons/download.png'
};

// ==================== FUNÇÕES UTILITÁRIAS ====================
export const getIconPath = (iconName: string, category: string = 'navigation'): string => {
  // Função para obter o caminho de um ícone específico
  const categories = {
    navigation: NAVIGATION_ICONS,
    festival: FESTIVAL_ICONS,
    functionality: FUNCTIONALITY_ICONS,
    status: STATUS_ICONS,
    action: ACTION_ICONS
  };
  
  const categoryIcons = categories[category as keyof typeof categories];
  return categoryIcons[iconName as keyof typeof categoryIcons] || '/assets/icons/default.png';
};

export const preloadIcons = (): void => {
  // Função para pré-carregar ícones importantes
  console.log('🔄 Pré-carregando ícones do festival...');
  
  // Aqui você pode adicionar lógica para pré-carregar ícones críticos
  // const iconPreload = new Image();
  // iconPreload.src = NAVIGATION_ICONS.home;
};

// ==================== EXPORTAÇÃO PADRÃO ====================
export default {
  NAVIGATION_ICONS,
  FESTIVAL_ICONS,
  FUNCTIONALITY_ICONS,
  STATUS_ICONS,
  ACTION_ICONS,
  getIconPath,
  preloadIcons
};
