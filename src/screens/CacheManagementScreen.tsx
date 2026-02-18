  import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { rf, rs } from '../utils/responsive';
import { CacheService } from '../services/cache.service';

interface CacheManagementScreenProps {
  navigation: any;
}

export const CacheManagementScreen: React.FC<CacheManagementScreenProps> = () => {
  const { colors } = useTheme();
  const [cacheStats, setCacheStats] = useState({
    placesCount: 0,
    lastUpdate: 'Never',
    cacheSize: '0 KB',
  });
  const [isOffline, setIsOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCacheData();
  }, []);

  const loadCacheData = async () => {
    try {
      const stats = await CacheService.getCacheStats();
      setCacheStats(stats);
      
      const offline = await CacheService.isOfflineMode();
      setIsOffline(offline);
    } catch (error) {
      console.error('Error loading cache data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCacheData();
    setRefreshing(false);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear All Cache',
      'This will remove all offline data. You will need internet connection to reload places. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            try {
              await CacheService.clearAllCache();
              await loadCacheData();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleClearPlacesOnly = () => {
    Alert.alert(
      'Clear Places Cache',
      'This will remove cached places data only. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await CacheService.clearPlacesCache();
              await loadCacheData();
              Alert.alert('Success', 'Places cache cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear places cache');
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
      padding: rs(16),
    },
    statusCard: {
      padding: rs(16),
      borderRadius: rs(12),
      marginBottom: rs(16),
      borderWidth: 1,
    },
    onlineCard: {
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      borderColor: '#4CAF50',
    },
    offlineCard: {
      backgroundColor: 'rgba(255, 107, 53, 0.1)',
      borderColor: '#FF6B35',
    },
    statusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: rs(8),
    },
    statusTitle: {
      fontSize: rf(18),
      fontWeight: '700',
      color: colors.text,
      marginLeft: rs(12),
    },
    statusDescription: {
      fontSize: rf(14),
      color: colors.textSecondary,
      lineHeight: rf(20),
    },
    card: {
      backgroundColor: colors.surface,
      padding: rs(16),
      borderRadius: rs(12),
      marginBottom: rs(16),
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: rf(16),
      fontWeight: '700',
      color: colors.text,
      marginBottom: rs(16),
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: rs(12),
    },
    statLabel: {
      fontSize: rf(14),
      color: colors.text,
      marginLeft: rs(12),
      flex: 1,
    },
    statValue: {
      fontSize: rf(14),
      fontWeight: '600',
      color: colors.primary,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: rs(8),
    },
    featureText: {
      fontSize: rf(14),
      color: colors.text,
      marginLeft: rs(12),
      flex: 1,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: rs(12),
      borderRadius: rs(8),
      backgroundColor: colors.background,
      marginBottom: rs(8),
      borderWidth: 1,
      borderColor: colors.border,
    },
    dangerButton: {
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      borderColor: '#F44336',
    },
    actionButtonText: {
      fontSize: rf(14),
      fontWeight: '600',
      color: colors.text,
      marginLeft: rs(12),
    },
    dangerButtonText: {
      color: '#F44336',
    },
    infoCard: {
      flexDirection: 'row',
      padding: rs(16),
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      borderRadius: rs(12),
      borderWidth: 1,
      borderColor: '#2196F3',
      marginBottom: rs(16),
    },
    infoText: {
      fontSize: rf(13),
      color: colors.textSecondary,
      marginLeft: rs(12),
      flex: 1,
      lineHeight: rf(18),
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[colors.refreshIndicator]}
            tintColor={colors.refreshIndicator}
          />
        }
      >
        {/* Connection Status */}
        <View style={[styles.statusCard, isOffline ? styles.offlineCard : styles.onlineCard]}>
          <View style={styles.statusHeader}>
            <MaterialIcons 
              name={isOffline ? "wifi-off" : "wifi"} 
              size={rf(24)} 
              color={isOffline ? "#FF6B35" : "#4CAF50"} 
            />
            <Text style={styles.statusTitle}>
              {isOffline ? 'Offline Mode' : 'Online Mode'}
            </Text>
          </View>
          <Text style={styles.statusDescription}>
            {isOffline 
              ? 'Using cached data. Connect to internet for latest updates.'
              : 'Connected to internet. Data is up to date.'
            }
          </Text>
        </View>

        {/* Cache Statistics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cache Statistics</Text>
          
          <View style={styles.statRow}>
            <MaterialIcons name="place" size={rf(20)} color={colors.primary} />
            <Text style={styles.statLabel}>Cached Places</Text>
            <Text style={styles.statValue}>{cacheStats.placesCount}</Text>
          </View>

          <View style={styles.statRow}>
            <MaterialIcons name="update" size={rf(20)} color={colors.primary} />
            <Text style={styles.statLabel}>Last Update</Text>
            <Text style={styles.statValue}>{cacheStats.lastUpdate}</Text>
          </View>

          <View style={styles.statRow}>
            <MaterialIcons name="storage" size={rf(20)} color={colors.primary} />
            <Text style={styles.statLabel}>Cache Size</Text>
            <Text style={styles.statValue}>{cacheStats.cacheSize}</Text>
          </View>
        </View>

        {/* Offline Features */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Offline Features</Text>
          
          <View style={styles.featureRow}>
            <MaterialIcons name="check-circle" size={rf(20)} color="#4CAF50" />
            <Text style={styles.featureText}>View cached places and details</Text>
          </View>

          <View style={styles.featureRow}>
            <MaterialIcons name="check-circle" size={rf(20)} color="#4CAF50" />
            <Text style={styles.featureText}>Get place addresses and coordinates</Text>
          </View>

          <View style={styles.featureRow}>
            <MaterialIcons name="check-circle" size={rf(20)} color="#4CAF50" />
            <Text style={styles.featureText}>Basic navigation directions</Text>
          </View>

          <View style={styles.featureRow}>
            <MaterialIcons name="check-circle" size={rf(20)} color="#4CAF50" />
            <Text style={styles.featureText}>Contact information access</Text>
          </View>
        </View>

        {/* Cache Management Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cache Management</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleClearPlacesOnly}>
            <MaterialIcons name="delete-outline" size={rf(20)} color="#FF9800" />
            <Text style={styles.actionButtonText}>Clear Places Cache</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleClearCache}>
            <MaterialIcons name="delete-forever" size={rf(20)} color="#F44336" />
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Clear All Cache</Text>
          </TouchableOpacity>
        </View>

        {/* Information */}
        <View style={styles.infoCard}>
          <MaterialIcons name="info" size={rf(20)} color={colors.primary} />
          <Text style={styles.infoText}>
            Cache is automatically updated when you have internet connection. 
            Cached data helps you access places even when offline.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};