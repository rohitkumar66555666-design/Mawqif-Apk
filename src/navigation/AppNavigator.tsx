import React from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from "../types";
import { HomeScreen } from "../screens/HomeScreen";
import { PlaceDetailScreen } from "../screens/PlaceDetailScreen";
import { AddPlaceScreen } from "../screens/AddPlaceScreen";
import MyPlacesScreen from "../screens/MyPlacesScreen";
import EditPlaceImagesScreen from "../screens/EditPlaceImagesScreen";
import { EditPlaceScreen } from "../screens/EditPlaceScreen";
import { PhotoManagementScreen } from "../screens/PhotoManagementScreen";
import { MapScreen } from "../screens/MapScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { MyReviewsScreen } from "../screens/MyReviewsScreen";
import { BookmarksScreen } from "../screens/BookmarksScreen";
import { CacheManagementScreen } from "../screens/CacheManagementScreen";
import { ThemeScreen } from "../screens/ThemeScreen";
import { LanguageScreen } from "../screens/LanguageScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { AuthModeScreen } from "../screens/AuthModeScreen";
import { CustomHeader } from "../components/CustomHeader";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";

import { getResponsiveDimensions, rs, rf } from "../utils/responsive";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Custom Bottom Tab Bar with proper spacing
const CustomBottomTabBar = (props: BottomTabBarProps) => {
  const { state, descriptors, navigation } = props;
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const getRouteIndex = (name: string) => state.routes.findIndex(r => r.name === name);
  const homeIndex = getRouteIndex('HomeTab');
  const mapIndex = getRouteIndex('MapTab');
  const addIndex = getRouteIndex('AddPlaceTab');

  const handlePress = (routeName: string, index: number) => {
    if (index === -1) return;
    
    const route = state.routes[index];
    const isFocused = state.index === index;

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName as never);
    }
  };

  return (
    <View style={[styles.tabBarContainer, { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom, rs(10)) }]}>
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {/* Home Tab - Left */}
        <TouchableOpacity
          onPress={() => handlePress('HomeTab', homeIndex)}
          style={[styles.tabItem, state.index === homeIndex && { backgroundColor: colors.primaryLight }]}
        >
          <MaterialIcons 
            name="home" 
            size={rf(24)} 
            color={state.index === homeIndex ? colors.primary : colors.textSecondary}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: colors.textSecondary },
              state.index === homeIndex && { color: colors.primary, fontWeight: "700" },
            ]}
          >
            {t('home')}
          </Text>
        </TouchableOpacity>

        {/* Center Add Place Button */}
        <TouchableOpacity
          onPress={() => handlePress('AddPlaceTab', addIndex)}
          style={[
            styles.centerTab,
            state.index === addIndex && styles.centerTabActive,
          ]}
        >
          <View style={[styles.centerButtonInner, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="add" size={rf(28)} color={colors.textInverse} />
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: colors.textSecondary },
              state.index === addIndex && { color: colors.primary, fontWeight: "700" },
            ]}
          >
            {t('add')}
          </Text>
        </TouchableOpacity>

        {/* Map Tab - Right */}
        <TouchableOpacity
          onPress={() => handlePress('MapTab', mapIndex)}
          style={[styles.tabItem, state.index === mapIndex && { backgroundColor: colors.primaryLight }]}
        >
          <MaterialIcons 
            name="map" 
            size={rf(24)} 
            color={state.index === mapIndex ? colors.primary : colors.textSecondary}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: colors.textSecondary },
              state.index === mapIndex && { color: colors.primary, fontWeight: "700" },
            ]}
          >
            {t('map')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Tab Navigator for main screens
const TabNavigator = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  
  // Helper function to get title based on route name
  const getRouteTitle = (routeName: string): string => {
    switch (routeName) {
      case 'HomeTab':
        return `${t('appName')} - Prayer Finder`;
      case 'MapTab':
        return `${t('map')} - Prayer Spaces`;
      case 'AddPlaceTab':
        return t('addPrayerSpace') || 'Add Prayer Space';
      default:
        return t('appName') || 'Mawqif';
    }
  };
  
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTabBar {...props} />}
      screenOptions={({ navigation, route }) => ({
        header: () => <CustomHeader navigation={navigation} title={getRouteTitle(route.name)} />,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.textInverse,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: `${t('appName')} - Prayer Finder`,
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{
          title: `${t('map')} - Prayer Spaces`,
        }}
      />
      <Tab.Screen
        name="AddPlaceTab"
        component={AddPlaceScreen}
        options={{
          title: t('addPrayerSpace') || 'Add Prayer Space',
        }}
      />
    </Tab.Navigator>
  );
};

// Wrapper component to use theme context inside NavigationContainer
const ThemedAppNavigator: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.textInverse,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PlaceDetail"
          component={PlaceDetailScreen}
          options={{
            title: t('placeDetails') || 'Place Details',
            headerBackTitle: t('back') || 'Back',
          }}
        />
        <Stack.Screen
          name="CacheManagement"
          component={CacheManagementScreen}
          options={{
            title: t('offlineCache') || 'Offline Cache',
            headerBackTitle: t('back') || 'Back',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Theme"
          component={ThemeScreen}
          options={{
            title: t('theme') || 'Theme',
            headerBackTitle: t('back') || 'Back',
          }}
        />
        <Stack.Screen
          name="Language"
          component={LanguageScreen}
          options={{
            title: t('language') || 'Language',
            headerBackTitle: t('back') || 'Back',
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: t('login') || 'Login',
            headerBackTitle: t('back') || 'Back',
          }}
        />
        <Stack.Screen
          name="AuthMode"
          component={AuthModeScreen}
          options={{
            title: t('authenticationMode') || 'Authentication Mode',
            headerBackTitle: t('back') || 'Back',
          }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: t('dashboard') || 'Dashboard',
            headerBackTitle: t('back') || 'Back',
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: t('profile') || 'Profile',
            headerBackTitle: t('back') || 'Back',
          }}
        />
        <Stack.Screen
          name="MyReviews"
          component={MyReviewsScreen}
          options={{
            title: t('myReviews') || 'My Reviews',
            headerBackTitle: t('back') || 'Back',
          }}
        />
        <Stack.Screen
          name="Bookmarks"
          component={BookmarksScreen}
          options={{
            title: t('myBookmarks') || 'My Bookmarks',
            headerBackTitle: t('back') || 'Back',
          }}
        />
        <Stack.Screen
          name="AddPlace"
          component={AddPlaceScreen}
          options={{
            title: t('addPrayerSpace') || 'Add Prayer Space',
            headerBackTitle: t('back') || 'Back',
          }}
        />
        <Stack.Screen
          name="MyPlaces"
          component={MyPlacesScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EditPlaceImages"
          component={EditPlaceImagesScreen}
          options={{
            title: t('editImages') || 'Edit Images',
            headerBackTitle: t('back') || 'Back',
          }}
        />
        <Stack.Screen
          name="EditPlace"
          component={EditPlaceScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PhotoManagement"
          component={PhotoManagementScreen}
          options={{
            headerShown: false,
          }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main Stack Navigator
export const AppNavigator: React.FC = () => {
  return <ThemedAppNavigator />;
};

// Styles for custom bottom tab bar
const responsiveDimensions = getResponsiveDimensions();

const styles = StyleSheet.create({
  tabBarContainer: {
    // paddingBottom is handled dynamically
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingHorizontal: rs(8),
    paddingTop: rs(8),
    paddingBottom: rs(8),
    height: rs(70),
    justifyContent: "space-between",
    alignItems: "flex-end",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: rs(-2) },
    shadowOpacity: 0.15,
    shadowRadius: rs(4),
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rs(8),
    paddingHorizontal: rs(8),
    borderRadius: rs(12),
  },
  tabItemActive: {
  },
  tabIcon: {
    marginBottom: rs(4),
  },
  tabLabel: {
    fontSize: rf(11),
    fontWeight: "500",
  },
  tabLabelActive: {
  },
  centerTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingVertical: rs(8),
  },
  centerTabActive: {
    backgroundColor: "transparent",
  },
  centerButtonInner: {
    width: rs(56), // Restored from 48 to original bigger size
    height: rs(56), // Restored from 48 to original bigger size
    borderRadius: rs(28), // Restored from 24 to original bigger size
    justifyContent: "center",
    alignItems: "center",
    marginBottom: rs(2),
    elevation: 6, // Restored from 4 to original bigger elevation
    shadowOffset: { width: 0, height: rs(3) }, // Restored from 2 to original bigger shadow
    shadowOpacity: 0.35, // Restored from 0.25 to original stronger shadow
    shadowRadius: rs(6), // Restored from 4 to original bigger shadow radius
  },

});
