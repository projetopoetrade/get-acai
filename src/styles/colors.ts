// src/styles/colors.ts
// =====================================================
// PALETA DE CORES - GET AÇAÍ
// Use estas constantes em todo o projeto
// =====================================================

export const COLORS = {
  // Roxos (Marca Principal)
  purple: {
    900: '#430238', // Mais escuro - backgrounds, textos fortes
    800: '#70035e', // Escuro - hover
    600: '#9d0094', // Principal - header, botões, preços
    200: '#c69abf', // Claro - textos secundários, backgrounds suaves
  },
  
  // Amarelos (Destaque/Promoções)
  yellow: {
    500: '#fcc90c', // Vibrante - badges de promoção, CTAs
    400: '#fdd43d', // Médio - hover em amarelos
    200: '#fddf6d', // Claro - backgrounds de destaque
  },
  
  // Verdes (Status/Sucesso)
  green: {
    600: '#139948', // Escuro - texto de status
    500: '#61c46e', // Médio - indicador "aberto"
    300: '#89d392', // Claro - backgrounds
  },
} as const;

// Atalhos para cores mais usadas
export const BRAND = {
  primary: COLORS.purple[600],      // #9d0094
  primaryDark: COLORS.purple[800],  // #70035e
  primaryDarkest: COLORS.purple[900], // #430238
  primaryLight: COLORS.purple[200], // #c69abf
  
  accent: COLORS.yellow[500],       // #fcc90c
  accentLight: COLORS.yellow[200],  // #fddf6d
  
  success: COLORS.green[500],       // #61c46e
  successDark: COLORS.green[600],   // #139948
} as const;

// Para usar em style={{}}
export const STYLES = {
  header: {
    backgroundColor: COLORS.purple[600],
    color: '#ffffff',
  },
  headerSubtext: {
    color: COLORS.purple[200],
  },
  statusOpen: {
    backgroundColor: COLORS.green[500],
  },
  badge: {
    promo: {
      backgroundColor: COLORS.yellow[500],
      color: COLORS.purple[900],
    },
  },
  price: {
    color: COLORS.purple[600],
  },
  button: {
    primary: {
      backgroundColor: COLORS.purple[600],
      color: '#ffffff',
    },
    primaryHover: {
      backgroundColor: COLORS.purple[800],
    },
  },
} as const;
