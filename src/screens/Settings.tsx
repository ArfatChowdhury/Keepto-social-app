import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useTheme } from '../context/themeContext';
import { useAuth } from '../context/authContext';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function Settings({ navigation }: Props) {
    const { isDarkMode, colors, toggleTheme } = useTheme();
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
            // Auth listener will handle redirection
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.row}>
                    <View>
                        <Text style={[styles.rowText, { color: colors.text }]}>Dark Mode</Text>
                        <Text style={[styles.rowSubText, { color: colors.subText }]}>
                            {isDarkMode ? 'Enabled' : 'Disabled'}
                        </Text>
                    </View>
                    <Switch
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#767577', true: colors.primary }}
                        thumbColor={Platform.OS === 'ios' ? '#fff' : isDarkMode ? '#f4f3f4' : '#f4f3f4'}
                    />
                </View>
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Text style={[styles.rowText, { color: colors.text }]}>Edit Profile</Text>
                    <Text style={{ color: colors.subText }}>›</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleSignOut}
            >
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={[styles.versionText, { color: colors.subText }]}>Version 1.0.0</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        paddingTop: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    section: {
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    rowText: {
        fontSize: 16,
        fontWeight: '600',
    },
    rowSubText: {
        fontSize: 12,
        marginTop: 2,
    },
    logoutButton: {
        marginHorizontal: 16,
        marginTop: 20,
        backgroundColor: '#FEE2E2',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    logoutText: {
        color: '#DC2626',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        marginTop: 'auto',
        alignItems: 'center',
        paddingBottom: 40,
    },
    versionText: {
        fontSize: 12,
    },
});
