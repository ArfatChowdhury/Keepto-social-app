import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import { RootStackParamList } from "../types/navigation";
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/tabParamList';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'Profile'>,
    NativeStackScreenProps<RootStackParamList>
>;

export default function ProfileScreen({ navigation }: Props) {
    const { user, userData } = useAuth();
    const { colors } = useTheme();

    if (!user || !userData) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>Please sign in to view your profile.</Text>
            </View>
        );
    }

    const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
        <View style={[styles.infoRow, { borderColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>{label}</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{value || 'Not set'}</Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.header, { backgroundColor: colors.card }]}>
                    <TouchableOpacity
                        style={styles.settingsIcon}
                        onPress={() => navigation.getParent()?.navigate('SettingsScreen')}
                    >
                        <Text style={styles.settingsIconText}>⚙️</Text>
                    </TouchableOpacity>

                    <View style={styles.photoContainer}>
                        <Image
                            source={userData?.photoURL ? { uri: userData.photoURL } : require('../../assets/adaptive-icon.png')}
                            style={styles.profilePhoto}
                        />
                    </View>

                    <Text style={[styles.displayNameText, { color: colors.text }]}>
                        {userData?.displayName || 'User'}
                    </Text>
                    <Text style={[styles.emailText, { color: colors.subText }]}>{user?.email}</Text>

                    <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('EditProfileScreen')}
                    >
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.detailsSection, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>

                    <InfoRow label="First Name" value={userData.firstName} />
                    <InfoRow label="Last Name" value={userData.lastName} />
                    <InfoRow label="Phone" value={userData.phoneNumber} />
                    <InfoRow label="Gender" value={userData.gender} />
                    <InfoRow label="Date of Birth" value={userData.dob ? new Date(userData.dob).toDateString() : null} />

                    <View style={styles.bioContainer}>
                        <Text style={[styles.infoLabel, { color: colors.subText }]}>Bio</Text>
                        <Text style={[styles.bioText, { color: colors.text }]}>
                            {userData.bio || 'No bio yet.'}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// Add Navbar to imports
import Navbar from '../components/Navbar';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
    container: {
        // marginTop: '10%',
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    profilePhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#E5E7EB',
    },
    settingsIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
    },
    settingsIconText: {
        fontSize: 24,
    },
    displayNameText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
    },
    emailText: {
        fontSize: 14,
        marginTop: 4,
        marginBottom: 15,
    },
    editButton: {
        paddingHorizontal: 25,
        paddingVertical: 10,
        borderRadius: 20,
    },
    editButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    detailsSection: {
        padding: 20,
        borderRadius: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    bioContainer: {
        marginTop: 15,
    },
    bioText: {
        fontSize: 14,
        lineHeight: 20,
        marginTop: 5,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});