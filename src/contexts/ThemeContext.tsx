import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

interface ThemeColors {
  // Primary colors - Enhanced with more variations
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryMuted: string;
  
  // Secondary colors - New addition for better UI variety
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Background colors - More sophisticated layering
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  overlay: string;
  sectionBackground: string; // New: For section containers
  
  // Text colors - Better hierarchy
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textMuted: string;
  
  // UI colors - Enhanced feedback colors
  border: string;
  borderLight: string;
  shadow: string;
  error: string;
  errorLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;
  
  // Interactive states - New addition for better UX
  pressed: string;
  disabled: string;
  focus: string;
  
  // Status bar
  statusBar: string;
  statusBarStyle: 'light-content' | 'dark-content';
  
  // Refresh indicator
  refreshIndicator: string;
  
  // Gradient colors - New addition for modern UI
  gradientStart: string;
  gradientEnd: string;
}

const lightTheme: ThemeColors = {
  // Primary colors - Modern green palette
  primary: '#2E7D32',
  primaryLight: 'rgba(46, 125, 50, 0.08)',
  primaryDark: '#1B5E20',
  primaryMuted: 'rgba(46, 125, 50, 0.6)',
  
  // Secondary colors - Complementary blue-gray
  secondary: '#455A64',
  secondaryLight: 'rgba(69, 90, 100, 0.08)',
  secondaryDark: '#263238',
  
  // Background colors - Sophisticated layering
  background: '#FAFAFA',
  backgroundSecondary: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  sectionBackground: '#F8F9FA', // Off-white for sections
  
  // Text colors - Better contrast and hierarchy
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  textMuted: '#BDBDBD',
  
  // UI colors - Modern and accessible
  border: '#E8E8E8',
  borderLight: '#F0F0F0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  error: '#E57373', // Softer red instead of harsh #D32F2F
  errorLight: 'rgba(229, 115, 115, 0.08)',
  success: '#2E7D32',
  successLight: 'rgba(46, 125, 50, 0.08)',
  warning: '#F57C00',
  warningLight: 'rgba(245, 124, 0, 0.08)',
  info: '#1976D2',
  infoLight: 'rgba(25, 118, 210, 0.08)',
  
  // Interactive states
  pressed: 'rgba(0, 0, 0, 0.08)',
  disabled: 'rgba(0, 0, 0, 0.26)',
  focus: 'rgba(46, 125, 50, 0.12)',
  
  // Status bar
  statusBar: '#2E7D32',
  statusBarStyle: 'light-content',
  
  // Refresh indicator
  refreshIndicator: '#1976D2',
  
  // Gradient colors
  gradientStart: '#2E7D32',
  gradientEnd: '#4CAF50',
};

const darkTheme: ThemeColors = {
  // Primary colors - Adjusted for dark theme
  primary: '#4CAF50',
  primaryLight: 'rgba(76, 175, 80, 0.12)',
  primaryDark: '#2E7D32',
  primaryMuted: 'rgba(76, 175, 80, 0.6)',
  
  // Secondary colors
  secondary: '#78909C',
  secondaryLight: 'rgba(120, 144, 156, 0.12)',
  secondaryDark: '#455A64',
  
  // Background colors - Enhanced dark theme with 2 tones
  background: '#121212', // Slightly lighter than pure black
  backgroundSecondary: '#1E1E1E', // Secondary dark tone
  surface: '#242424', // Elevated surface
  surfaceElevated: '#2E2E2E', // Higher elevation
  card: '#2A2A2A', // Card background
  overlay: 'rgba(0, 0, 0, 0.7)',
  sectionBackground: '#1A1A1A', // Dark grey for sections
  
  // Text colors - Dark theme optimized
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textTertiary: '#999999',
  textInverse: '#000000',
  textMuted: '#666666',
  
  // UI colors - Dark theme variants
  border: '#333333',
  borderLight: '#2A2A2A',
  shadow: 'rgba(0, 0, 0, 0.3)',
  error: '#EF5350', // Softer red for dark theme
  errorLight: 'rgba(239, 83, 80, 0.12)',
  success: '#4CAF50',
  successLight: 'rgba(76, 175, 80, 0.12)',
  warning: '#FF9800',
  warningLight: 'rgba(255, 152, 0, 0.12)',
  info: '#2196F3',
  infoLight: 'rgba(33, 150, 243, 0.12)',
  
  // Interactive states
  pressed: 'rgba(255, 255, 255, 0.08)',
  disabled: 'rgba(255, 255, 255, 0.26)',
  focus: 'rgba(76, 175, 80, 0.12)',
  
  // Status bar
  statusBar: '#1E1E1E',
  statusBarStyle: 'light-content',
  
  // Refresh indicator
  refreshIndicator: '#4CAF50',
  
  // Gradient colors
  gradientStart: '#4CAF50',
  gradientEnd: '#66BB6A',
};

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  primaryColor: string;
  setPrimaryColor: (hex: string) => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [primaryColor, setPrimaryColorState] = useState<string>(lightTheme.primary);

  // Load saved theme and primary color on app start
  useEffect(() => {
    loadSavedTheme();
    loadSavedPrimaryColor();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.log('Error loading saved theme:', error);
    }
  };

  const loadSavedPrimaryColor = async () => {
    try {
      const savedColor = await AsyncStorage.getItem('app_primary_color');
      if (savedColor) {
        setPrimaryColorState(savedColor);
      }
    } catch (error) {
      console.log('Error loading saved primary color:', error);
    }
  };

  const saveTheme = async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem('app_theme', newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const savePrimaryColor = async (hex: string) => {
    try {
      await AsyncStorage.setItem('app_primary_color', hex);
    } catch (error) {
      console.log('Error saving primary color:', error);
    }
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Helper to convert hex to rgba
  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  };

  // Helper: darken a hex color by an amount between 0 and 1 and return hex
  const hexDarken = (hex: string, amount: number) => {
    const { r: rr, g: gg, b: bb } = hexToRgb(hex);
    const r = Math.max(0, Math.min(255, Math.floor(rr * (1 - amount))));
    const g = Math.max(0, Math.min(255, Math.floor(gg * (1 - amount))));
    const b = Math.max(0, Math.min(255, Math.floor(bb * (1 - amount))));
    const toHex = (v: number) => v.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Helper: determine if a color is light (for choosing status bar content color)
  const getLuminance = (hex: string) => {
    // Accept both hex and rgb(...) formats
    let rVal = 0, gVal = 0, bVal = 0;
    if (hex.startsWith('#')) {
      const { r: rr, g: gg, b: bb } = hexToRgb(hex);
      rVal = rr; gVal = gg; bVal = bb;
    } else if (hex.startsWith('rgb')) {
      const nums = hex.replace(/[^0-9,]/g, '').split(',').map(Number);
      [rVal, gVal, bVal] = nums;
    }

    const [r, g, b] = [rVal, gVal, bVal].map((c) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const isLightColor = (hex: string) => getLuminance(hex) > 0.6;

  // Compute colors object, overriding primary palette with selected primaryColor
  const baseColors = theme === 'light' ? lightTheme : darkTheme;
  const { r, g, b } = hexToRgb(primaryColor);

  // Derive a status bar color from the primary color (darker) so it blends nicely
  const statusBarColor = theme === 'light' ? hexDarken(primaryColor, 0.18) : hexDarken(primaryColor, 0.28);
  const statusBarStyle = isLightColor(statusBarColor) ? 'dark-content' : 'light-content';

  const colors = {
    ...baseColors,
    primary: primaryColor,
    primaryLight: `rgba(${r}, ${g}, ${b}, 0.08)`,
    primaryDark: primaryColor,
    primaryMuted: `rgba(${r}, ${g}, ${b}, 0.65)`,
    statusBar: statusBarColor,
    statusBarStyle,
  } as ThemeColors;

  const setPrimaryColor = (hex: string) => {
    setPrimaryColorState(hex);
    savePrimaryColor(hex);
  };

  const value: ThemeContextType = {
    theme,
    colors,
    primaryColor,
    setPrimaryColor,
    toggleTheme,
    setTheme,
  };

  // Update Android navigation bar color & button style at runtime if supported
  useEffect(() => {
    // Only on Android and when the NavigationBar module is available
    if (Platform.OS !== 'android') return;

    let mounted = true;
    (async () => {
      try {
        const NavigationBar = await import('expo-navigation-bar');
        // Set background color and button style
        await NavigationBar.setBackgroundColorAsync(colors.statusBar);
        const buttonStyle = isLightColor(colors.statusBar) ? 'dark' : 'light';
        await NavigationBar.setButtonStyleAsync(buttonStyle);
      } catch (err) {
        // Module not installed or not supported — ignore silently
        // console.log('NavigationBar not available or failed to set', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [colors.statusBar, primaryColor, theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};