import React, { useEffect } from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { CacheService } from './src/services/cache.service';

export default function App() {
  useEffect(() => {
    // Initialize cache system on app startup
    const initializeApp = async () => {
      try {
        await CacheService.initializeCache();
        console.log('✅ App initialized with offline caching support');
      } catch (error) {
        console.error('❌ Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </LanguageProvider>
  );
}
