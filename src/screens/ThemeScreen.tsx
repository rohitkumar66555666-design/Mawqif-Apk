import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeScreenProps {
    navigation: any;
}

export const ThemeScreen: React.FC<ThemeScreenProps> = ({ navigation }) => {
    // Use the simplified ThemeContext API
    const { theme: currentThemeMode, colors, primaryColor, setPrimaryColor, setTheme } = useTheme();

    // Local static options (keeps the UI simple and avoids tight coupling to ThemeContext shapes)
    const availableThemes = [
        { key: 'light' as const, name: 'Light' },
        { key: 'dark' as const, name: 'Dark' },
    ];

    const availableColorSchemes = [
        { key: 'green', name: 'Green', color: '#2E7D32' },
        { key: 'blue', name: 'Blue', color: '#1976D2' },
        { key: 'purple', name: 'Purple', color: '#7C3AED' },
        { key: 'orange', name: 'Orange', color: '#F59E0B' },
        { key: 'pink', name: 'Pink', color: '#EC4899' },
        { key: 'teal', name: 'Teal', color: '#14B8A6' },
    ];

    const handleThemeSelect = (themeKey: 'light' | 'dark') => {
        setTheme(themeKey);
    };

    const handleColorSchemeSelect = (hex: string) => {
        setPrimaryColor(hex);
    };

const renderThemeOption = (themeOption: { key: 'light' | 'dark'; name: string }) => {
        const isSelected = currentThemeMode === themeOption.key;

        return (
            <TouchableOpacity
                key={themeOption.key}
                style={[
                    styles.themeOption,
                    {
                        backgroundColor: colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderWidth: isSelected ? 3 : 1,
                    }
                ]}
                onPress={() => handleThemeSelect(themeOption.key)}
                activeOpacity={0.8}
            >
                <View style={styles.themeInfo}>
                    <View style={styles.themeIconContainer}>
                        <Ionicons
                            name={themeOption.key === 'light' ? 'sunny' : 'moon'}
                            size={32}
                            color={colors.primary}
                        />
                    </View>
                    <View style={styles.themeDetails}>
                        <Text style={[styles.themeName, { color: colors.text }]}> 
                            {themeOption.name}
                        </Text>
                        <Text style={[styles.themeDescription, { color: colors.textSecondary }]}> 
                            {themeOption.key === 'light' && 'Clean and bright interface'}
                            {themeOption.key === 'dark' && 'Easy on the eyes in low light'}
                        </Text>
                    </View>
                </View>
                {isSelected && (
                    <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={colors.primary}
                    />
                )}
            </TouchableOpacity>
        );
    };

    return (
<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    <Text style={[styles.title, { color: colors.text }]}> 
                        Choose Your Theme
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}> 
                        Select between light and dark appearance
                    </Text>

                    <View style={styles.themesContainer}>
                        {availableThemes.map(renderThemeOption)}
                    </View>

                    {/* Color Scheme Section */}
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>App Colors</Text>
                    <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Choose the color scheme for buttons, headers, and accents</Text>

                    <View style={styles.backgroundColorsContainer}>
                        {availableColorSchemes.map((colorOption: { key: string; name: string; color: string }) => {
                            const isSelected = primaryColor.toLowerCase() === colorOption.color.toLowerCase();
                            return (
                                <TouchableOpacity
                                    key={colorOption.key}
                                    style={[
                                        styles.backgroundColorOption,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: isSelected ? colors.primary : colors.border,
                                            borderWidth: isSelected ? 3 : 1,
                                        }
                                    ]}
                                    onPress={() => handleColorSchemeSelect(colorOption.color)}
                                    activeOpacity={0.8}
                                >
                                    <View
                                        style={[
                                            styles.backgroundColorSwatch,
                                            { backgroundColor: colorOption.color }
                                        ]}
                                    />
                                    <Text style={[styles.backgroundColorName, { color: colors.text }]}>
                                        {colorOption.name}
                                    </Text>
                                    {isSelected && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={20}
                                            color={colors.primary}
                                        />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                        <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
                        <Text style={[styles.infoText, { color: colors.text }]}>Theme changes will be applied immediately across the entire app</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 32,
        lineHeight: 22,
    },
    themesContainer: {
        gap: 16,
        marginBottom: 32,
    },
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    themeInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    themeIconContainer: {
        marginRight: 16,
        width: 40,
        alignItems: 'center',
    },
    themeDetails: {
        flex: 1,
    },
    themeName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    themeDescription: {
        fontSize: 14,
        lineHeight: 18,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },
    sectionSubtitle: {
        fontSize: 14,
        marginBottom: 20,
        lineHeight: 20,
    },
    backgroundColorsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 32,
    },
    backgroundColorOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        minWidth: '45%',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    backgroundColorSwatch: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    backgroundColorName: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
});