//constants/color.ts
export type ColorTheme = {
  // Main colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // UI colors
  background: string;
  card: string;
  cardLight: string;
  text: string;
  textInverted: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  filter: string;
  chatBubbleSender: string;
  chatBubbleReceiver: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  
  // Special
  coin: string;
  
  // Gradients
  gradientStart: string;
  gradientEnd: string;

  // Nuevo campo:
  secondary: string;
};

export const darkColors: ColorTheme = {
  // Main colors
  primary: '#DDFF00', // Neon yellow/green
  primaryLight: '#E5FF4D',
  primaryDark: '#B8D600',
  
  // UI colors
  background: '#232324', // Antes en #000000
  card: '#1A1A1A',
  cardLight: '#2A2A2A',
  text: '#FFFFFF',
  textInverted: '#000000',
  textSecondary: '#AAAAAA',
  textTertiary: '#666666',
  border: '#333333',
  filter: '#2388fc',
  // Status colors
  success: '#00E676',
  error: '#FF3D71',
  warning: '#FFAA00',
  chatBubbleSender: '#1A1A1A',
  chatBubbleReceiver: '#424245',

  // Special
  coin: '#DDFF00',
  
  // Gradients
  gradientStart: '#000000',
  gradientEnd: '#1A1A1A',
  secondary: '#FFAA00', // o el color que prefieras
};

export const lightColors: ColorTheme = {
  // Main colors
  primary: '#2388FC', // Azul brillante como en la imagen
  primaryLight: '#50A1FC',
  primaryDark: '#0D6EE0',
  
  // UI colors
  background: '#F6F8FA', // Fondo ligeramente grisáceo como en la imagen
  card: '#FFFFFF', // Tarjetas blancas puras como en la imagen
  cardLight: '#F0F7FF', // Azul muy claro para cards secundarias
  text: '#1A1F36', // Casi negro para mejor legibilidad
  textInverted: '#FFFFFF',
  textSecondary: '#5A6376', // Gris azulado para texto secundario
  textTertiary: '#8C93A4', // Gris más claro para texto terciario
  border: '#E1E8F5', // Borde azulado claro
  filter: '#2388FC',
  chatBubbleSender: '#E9F4FF', // Azul muy claro para burbujas de chat
  chatBubbleReceiver: '#07a8e3', // Azul muy claro para burbujas de chat

  // Status colors
  success: '#17C964', // Verde brillante como en los badges "Win"
  error: '#F31260', // Rojo para errores y badges "Lose"
  warning: '#F5A524', // Naranja para advertencias
  
  // Special
  coin: '#F5A524', // Dorado/amarillo para monedas
  
  // Gradients
  gradientStart: '#2388FC', // Inicio de gradiente azul
  gradientEnd: '#50A1FC', // Fin de gradiente azul más claro
  secondary: '#F31260', // Rojo como color secundario (como LaLiga en la imagen)
};

// This will be replaced by the theme context
export const colors = darkColors;