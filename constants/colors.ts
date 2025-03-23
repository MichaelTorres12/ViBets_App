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
  textSecondary: string;
  textTertiary: string;
  border: string;
  filter: string;
  chatBubbleSender: string;
  
  // Status colors
  success: string;
  error: string;
  warning: string;
  
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
  background: '#000000',
  card: '#1A1A1A',
  cardLight: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textTertiary: '#666666',
  border: '#333333',
  filter: '#2388fc',
  // Status colors
  success: '#00E676',
  error: '#FF3D71',
  warning: '#FFAA00',
  chatBubbleSender: '#1A1A1A',
  
  // Special
  coin: '#DDFF00',
  
  // Gradients
  gradientStart: '#000000',
  gradientEnd: '#1A1A1A',
  secondary: '#FFAA00', // o el color que prefieras
};

export const lightColors: ColorTheme = {
  // Main colors
  primary: '#DDFF00', // Keeping the same accent color
  primaryLight: '#E5FF4D',
  primaryDark: '#B8D600',
  
  // UI colors
  background: '#FFFFFF',
  card: '#F5F5F5',
  cardLight: '#EEEEEE',
  text: '#000000',
  textSecondary: '#555555',
  textTertiary: '#999999',
  border: '#E0E0E0',
  filter: '#2388fc',
  chatBubbleSender: '#000000',

  // Status colors
  success: '#00C853',
  error: '#D50000',
  warning: '#FF9100',
  
  // Special
  coin: '#DDFF00',
  
  // Gradients
  gradientStart: '#F5F5F5',
  gradientEnd: '#FFFFFF',
  secondary: '#FFAA00', // o el color que prefieras
};

// This will be replaced by the theme context
export const colors = darkColors;