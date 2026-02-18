import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { rf, rs } from '../utils/responsive';
import { CacheService } from '../services/cache.service';

interface OfflineStatusProps {
  isVisible?: boolean;
  onCacheManage?: () => void;
}

export const OfflineStatus: React.FC<OfflineStatusProps> = ({
  isVisible = true,
  onCacheManage,
}) => {
  const { colors } = useTheme();
  const [isOffline, setIsOffline] = useState(false);
  const [cacheStats, setCacheStats] = useState({
    placesCount: 0,
    lastUpdate: 'Never',
    cacheSize: '0 KB',
  });

  useEffect(() => {
    checkOfflineStatus();
    loadCacheStats();
    
    // Check offline status every 60 seconds (less frequent to avoid interruptions)
    const interval = setInterval(checkOfflineStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const checkOfflineStatus = async () => {
    try {
      const offline = await CacheService.isOfflineMode();
      setIsOffline(offline);
    } catch (error) {
      console.error('Error checking offline status:', error);
      setIsOffline(true);
    }
  };

  const loadCacheStats = async () => {
    try {
      const stats = await CacheService.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Error loading cache stats:', error);
    }
  };

  if (!isVisible || !isOffline) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#FF6B35',
      paddingVertical: rs(8),
      paddingHorizontal: rs(16),
    },
    statusBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusText: {
      color: colors.surface,
      fontSize: rf(14),
      fontWeight: '600',
      marginLeft: rs(8),
      flex: 1,
      textAlign: 'center',
    },
    infoButton: {
      padding: rs(4),
    },
    cacheInfo: {
      marginTop: rs(4),
      alignItems: 'center',
    },
    cacheText: {
      color: colors.surface,
      fontSize: rf(12),
      opacity: 0.9,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <MaterialIcons name="wifi-off" size={rf(20)} color={colors.surface} />
        <Text style={styles.statusText}>
          Offline Mode - Using Cached Data
        </Text>
        <TouchableOpacity onPress={onCacheManage} style={styles.infoButton}>
          <MaterialIcons name="info" size={rf(18)} color={colors.surface} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cacheInfo}>
        <Text style={styles.cacheText}>
          📱 {cacheStats.placesCount} places cached • Last update: {cacheStats.lastUpdate}
        </Text>
      </View>
    </View>
  );
};