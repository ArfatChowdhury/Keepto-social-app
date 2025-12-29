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
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import { uploadToCloudinary } from '../utils/cloudinary';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfileScreen'>;

export default function EditProfileScreen({ navigation }: Props) {
    const { user, userData, updateProfileInfo } = useAuth();
    const { colors } = useTheme();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);
    const [photoLoading, setPhotoLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            setFirstName(userData.firstName || '');
            setLastName(userData.lastName || '');
            setPhoneNumber(userData.phoneNumber || '');
            setBio(userData.bio || '');
        }
    }, [userData]);

    const handleSave = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert('Error', 'First and Last name are required');
            return;
        }

        setLoading(true);
        try {
            await updateProfileInfo({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                displayName: `${firstName.trim()} ${lastName.trim()}`,
                phoneNumber: phoneNumber.trim(),
                bio: bio.trim()
            });
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={[styles.appBar, { borderColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
                    </TouchableOpacity>
                    <Text style={[styles.appBarTitle, { color: colors.text }]}>Edit Profile</Text>
                    <TouchableOpacity onPress={handleSave} disabled={loading}>
                        {loading ? <ActivityIndicator size="small" color={colors.primary} /> :
                            <Text style={[styles.saveAction, { color: colors.primary }]}>Save</Text>}
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.photoSection}>
                        <View style={styles.photoContainer}>
                            {photoLoading ? (
                                <View style={[styles.photoPlaceholder, { backgroundColor: colors.border }]}>
                                    <ActivityIndicator color={colors.primary} />
                                </View>
                            ) : (
                                <Image
                                    source={userData?.photoURL ? { uri: userData.photoURL } : require('../../assets/adaptive-icon.png')}
                                    style={styles.profilePhoto}
                                />
                            )}
                        </View>
                        <View style={styles.photoActions}>
                            <TouchableOpacity style={[styles.photoButton, { borderColor: colors.primary }]} onPress={handleTakePhoto} disabled={photoLoading}>
                                <Text style={[styles.photoButtonText, { color: colors.primary }]}>📸 Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.photoButton, { borderColor: colors.primary }]} onPress={handlePickImage} disabled={photoLoading}>
                                <Text style={[styles.photoButtonText, { color: colors.primary }]}>🖼 Gallery</Text>
                            </TouchableOpacity>
                        </View>
                        {userData?.photoURL && (
                            <TouchableOpacity onPress={handleRemovePhoto} disabled={photoLoading}>
                                <Text style={styles.removeText}>Remove Photo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.form}>
                        <View style={styles.fieldContainer}>
                            <Text style={[styles.label, { color: colors.subText }]}>First Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="Enter first name"
                                placeholderTextColor={colors.subText}
                            />
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={[styles.label, { color: colors.subText }]}>Last Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Enter last name"
                                placeholderTextColor={colors.subText}
                            />
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={[styles.label, { color: colors.subText }]}>Phone Number</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                placeholder="Enter phone number"
                                placeholderTextColor={colors.subText}
                            />
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={[styles.label, { color: colors.subText }]}>Bio</Text>
                            <TextInput
                                style={[styles.input, styles.bioInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                value={bio}
                                onChangeText={(text) => {
                                    if (text.length <= 160) setBio(text);
                                }}
                                placeholder="Tell us about yourself"
                                placeholderTextColor={colors.subText}
                                multiline
                                maxLength={160}
                            />
                            <Text style={[styles.counter, { color: colors.subText }, bio.length === 160 && styles.counterMax]}>
                                {bio.length} / 160
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    appBarTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        padding: 4,
    },
    backIcon: {
        fontSize: 24,
    },
    saveAction: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    photoContainer: {
        marginBottom: 15,
    },
    profilePhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E5E7EB',
    },
    photoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoActions: {
        flexDirection: 'row',
        gap: 10,
    },
    photoButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    photoButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    removeText: {
        marginTop: 10,
        color: '#DC2626',
        fontSize: 12,
        fontWeight: '600',
    },
    form: {
        marginTop: 10,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
    },
    bioInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    counter: {
        fontSize: 12,
        textAlign: 'right',
        marginTop: 4,
    },
    counterMax: {
        color: '#DC2626',
    },
});
