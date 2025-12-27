import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/authContex';
import { uploadToCloudinary } from '../utils/cloudinary';

export default function Profile({ navigation }: { navigation: any }) {
    const { user, userData, updateProfileInfo } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);
    const [photoLoading, setPhotoLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            setDisplayName(userData.displayName || '');
            setBio(userData.bio || '');
        }
    }, [userData]);

    const handleSaveProfile = async () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Display Name cannot be empty');
            return;
        }

        setLoading(true);
        try {
            await updateProfileInfo({
                displayName: displayName.trim(),
                bio: bio.trim()
            });
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need access to your gallery to pick a photo.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            uploadPhoto(result.assets[0].uri);
        }
    };

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need access to your camera to take a photo.');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            uploadPhoto(result.assets[0].uri);
        }
    };

    const uploadPhoto = async (uri: string) => {
        setPhotoLoading(true);
        try {
            const photoURL = await uploadToCloudinary(uri);
            await updateProfileInfo({ photoURL });
            Alert.alert('Success', 'Profile photo updated!');
        } catch (error: any) {
            Alert.alert('Error', 'Failed to upload photo. Please check your Cloudinary configuration.');
        } finally {
            setPhotoLoading(false);
        }
    };

    const handleRemovePhoto = () => {
        Alert.alert(
            'Remove Photo',
            'Are you sure you want to remove your profile photo?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await updateProfileInfo({ photoURL: null });
                            Alert.alert('Success', 'Profile photo removed.');
                        } catch (error: any) {
                            Alert.alert('Error', 'Failed to remove photo.');
                        }
                    }
                }
            ]
        );
    };

    if (!user) {
        return (
            <View style={styles.center}>
                <Text>Please sign in to view your profile.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.settingsIcon}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <Text style={styles.settingsIconText}>⚙️</Text>
                    </TouchableOpacity>
                    <View style={styles.photoContainer}>
                        {photoLoading ? (
                            <View style={styles.photoPlaceholder}>
                                <ActivityIndicator color="#007AFF" />
                            </View>
                        ) : (
                            <Image
                                source={userData?.photoURL ? { uri: userData.photoURL } : require('../../assets/adaptive-icon.png')}
                                style={styles.profilePhoto}
                            />
                        )}
                        <View style={styles.photoActions}>
                            <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto} disabled={photoLoading}>
                                <Text style={styles.photoButtonText}>📸 Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.photoButton} onPress={handlePickImage} disabled={photoLoading}>
                                <Text style={styles.photoButtonText}>🖼 Gallery</Text>
                            </TouchableOpacity>
                        </View>
                        {userData?.photoURL && (
                            <TouchableOpacity onPress={handleRemovePhoto} disabled={photoLoading}>
                                <Text style={styles.removeText}>Remove Photo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={styles.displayNameText}>{userData?.displayName || 'User'}</Text>
                    <Text style={styles.emailText}>{user?.email}</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Display Name</Text>
                        <TextInput
                            style={styles.input}
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder="Set display name"
                        />
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, styles.bioInput]}
                            value={bio}
                            onChangeText={(text) => {
                                if (text.length <= 160) setBio(text);
                            }}
                            placeholder="Tell us about yourself"
                            multiline
                            maxLength={160}
                        />
                        <Text style={[styles.counter, bio.length === 160 && styles.counterMax]}>
                            {bio.length} / 160
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.disabledButton]}
                        onPress={handleSaveProfile}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Profile</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: '#fff',
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
    photoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoActions: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 10,
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
    photoButton: {
        backgroundColor: '#E5FFEB',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#059669',
    },
    photoButtonText: {
        fontSize: 12,
        color: '#059669',
        fontWeight: 'bold',
    },
    removeText: {
        marginTop: 10,
        color: '#DC2626',
        fontSize: 12,
        fontWeight: '600',
    },
    displayNameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 10,
    },
    emailText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    form: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#111827',
    },
    bioInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    counter: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'right',
        marginTop: 4,
    },
    counterMax: {
        color: '#DC2626',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});