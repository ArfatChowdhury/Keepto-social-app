import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Platform, StatusBar } from 'react-native';
import { useTheme } from '../context/themeContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MainHeader = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.card }]}>
            <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <View style={styles.content}>
                    {/* Left: Logo */}
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>🔥</Text>
                    </View>

                    {/* Middle: Search Bar */}
                    <View style={[styles.searchContainer, { backgroundColor: colors.input }]}>
                        <Text style={[styles.searchIcon, { color: colors.subText }]}>🔍</Text>
                        <TextInput
                            placeholder="Search..."
                            placeholderTextColor={colors.subText}
                            style={[styles.searchInput, { color: colors.text }]}
                        />
                    </View>

                    {/* Right: Hamburger Menu */}
                    <TouchableOpacity
                        style={styles.hamburgerContainer}
                        onPress={() => navigation.navigate('SettingsScreen')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.hamburgerText, { color: colors.text }]}>☰</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        width: '100%',
    },
    container: {
        width: '100%',
        height: 60,
        borderBottomWidth: 1,
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: '100%',
    },
    logoContainer: {
        marginRight: 15,
    },
    logoText: {
        fontSize: 24,
    },
    searchContainer: {
        flex: 1,
        height: 40,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginRight: 15,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 0,
    },
    hamburgerContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hamburgerText: {
        fontSize: 28,
    },
});

export default MainHeader;
