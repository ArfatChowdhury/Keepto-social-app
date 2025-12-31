import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/themeContext";
import { useAuth } from "../context/authContext";
import * as ImagePicker from 'expo-image-picker';
import { uploadToCloudinary } from "../utils/cloudinary";
import { db } from "../constants/firbase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function CreatePost() {
    const { colors } = useTheme();
    const { userData } = useAuth();
    const navigation = useNavigation();

    const [post, setPost] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permissions to upload images.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handlePost = async () => {
        if (!post.trim() && !image) {
            Alert.alert('Empty Post', 'Please add some text or an image.');
            return;
        }

        setLoading(true);
        try {
            let imageUrl = null;
            if (image) {
                imageUrl = await uploadToCloudinary(image);
            }

            await addDoc(collection(db, 'posts'), {
                userId: userData?.uid,
                authorName: userData?.displayName || 'Anonymous',
                authorPhoto: userData?.photoURL || null,
                content: post.trim(),
                image: imageUrl,
                likesCount: 0,
                commentsCount: 0,
                createdAt: serverTimestamp(),
            });

            Alert.alert('Success', 'Post created successfully!');
            setPost('');
            setImage(null);
            navigation.goBack();
        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert('Error', 'Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="close" size={28} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Post</Text>
                        <TouchableOpacity
                            style={[
                                styles.postButton,
                                { backgroundColor: colors.primary },
                                (!post.trim() && !image) && { opacity: 0.5 }
                            ]}
                            onPress={handlePost}
                            disabled={loading || (!post.trim() && !image)}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.postButtonText}>Post</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        {userData?.photoURL ? (
                            <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
                                <Ionicons name="person" size={24} color={colors.subText} />
                            </View>
                        )}
                        <TextInput
                            placeholder="What's on your mind?"
                            placeholderTextColor={colors.subText}
                            style={[styles.input, { color: colors.text }]}
                            multiline
                            value={post}
                            onChangeText={setPost}
                        />
                    </View>

                    {image && (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: image }} style={styles.imagePreview} />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => setImage(null)}
                            >
                                <Ionicons name="close-circle" size={24} color="rgba(0,0,0,0.6)" />
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                            <Ionicons name="image" size={24} color={colors.primary} />
                            <Text style={[styles.actionText, { color: colors.text }]}>Photo</Text>
                        </TouchableOpacity>
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
    scrollContent: {
        // flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 0.5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    postButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        minWidth: 70,
        alignItems: 'center',
    },
    postButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 25,
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: 15
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontSize: 18,
        paddingTop: 8,
        textAlignVertical: 'top',
        // backgroundColor: '#fff',
    },
    imagePreviewContainer: {
        marginHorizontal: 15,
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
    },
    imagePreview: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 12,
    },
    footer: {
        marginTop: 'auto',
        padding: 15,
        borderTopWidth: 0.5,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        marginLeft: 10,
        fontSize: 16,
    },
});

