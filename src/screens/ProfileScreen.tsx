import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import { RootStackParamList } from "../types/navigation";
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/TabParamList';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../constants/firbase';
import { Ionicons } from '@expo/vector-icons';

type Props = CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'Profile'>,
    NativeStackScreenProps<RootStackParamList>
>;

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation, route }: Props) {
    const { user, userData: currentUserData } = useAuth();
    const { colors } = useTheme();
    const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
    const [profileData, setProfileData] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const targetUserId = route.params?.userId || user?.uid;
    const isOwner = targetUserId === user?.uid;

    useEffect(() => {
        if (!targetUserId) return;

        setLoading(true);
        // Fetch profile data
        const fetchProfile = async () => {
            if (isOwner) {
                setProfileData(currentUserData);
                setLoading(false);
            } else {
                try {
                    const docRef = doc(db, 'users', targetUserId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setProfileData(docSnap.data());
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        // Fetch user's posts
        const postsQuery = query(
            collection(db, 'posts'),
            where('userId', '==', targetUserId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
            const posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUserPosts(posts);
        });

        return () => unsubscribe();
    }, [targetUserId, currentUserData]);

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!profileData) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>User not found.</Text>
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
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    {isOwner && (
                        <TouchableOpacity
                            style={styles.settingsIcon}
                            onPress={() => navigation.getParent()?.navigate('SettingsScreen')}
                        >
                            <Ionicons name="settings-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                    )}

                    <View style={styles.photoContainer}>
                        <Image
                            source={profileData?.photoURL ? { uri: profileData.photoURL } : require('../../assets/adaptive-icon.png')}
                            style={styles.profilePhoto}
                        />
                    </View>

                    <Text style={[styles.displayNameText, { color: colors.text }]}>
                        {profileData?.displayName || 'User'}
                    </Text>
                    <Text style={[styles.emailText, { color: colors.subText }]}>{profileData?.email || user?.email}</Text>

                    <View style={styles.buttonContainer}>
                        {isOwner ? (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                                onPress={() => navigation.navigate('EditProfileScreen')}
                            >
                                <Ionicons name="create-outline" size={18} color="#fff" />
                                <Text style={styles.actionButtonText}>Edit Profile</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                                onPress={() => { /* TODO: Implement messaging */ }}
                            >
                                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
                                <Text style={styles.actionButtonText}>Message</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Tabs */}
                <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'posts' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                        onPress={() => setActiveTab('posts')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'posts' ? colors.primary : colors.subText }]}>Posts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'about' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                        onPress={() => setActiveTab('about')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'about' ? colors.primary : colors.subText }]}>About</Text>
                    </TouchableOpacity>
                </View>

                {/* Section Content */}
                <View style={styles.sectionContent}>
                    {activeTab === 'posts' ? (
                        <View style={styles.postsList}>
                            {userPosts.length > 0 ? (
                                userPosts.map((post) => (
                                    <View key={post.id} style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <View style={styles.postHeader}>
                                            <View style={styles.postHeaderLeft}>
                                                <Image
                                                    source={profileData?.photoURL ? { uri: profileData.photoURL } : require('../../assets/adaptive-icon.png')}
                                                    style={styles.postAvatar}
                                                />
                                                <View style={styles.authorInfo}>
                                                    <Text style={[styles.authorName, { color: colors.text }]}>{profileData?.displayName || 'User'}</Text>
                                                    <Text style={styles.postTime}>
                                                        {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : 'Just now'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        {post.content ? (
                                            <Text style={[styles.postContent, { color: colors.text }]}>{post.content}</Text>
                                        ) : null}

                                        {post.image ? (
                                            <Image source={{ uri: post.image }} style={styles.imagePreview} />
                                        ) : null}

                                        <View style={[styles.postActions, { borderTopColor: colors.border }]}>
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => { /* Navigation to comments or like logic if needed */ }}
                                            >
                                                <Ionicons name="heart-outline" size={20} color={colors.text} />
                                                <Text style={[styles.actionText, { color: colors.text }]}>
                                                    {post.likesCount || 0}
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => navigation.navigate('CommentsScreen', { postId: post.id })}
                                            >
                                                <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
                                                <Text style={[styles.actionText, { color: colors.text }]}>
                                                    {post.commentsCount || 0}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <Ionicons name="images-outline" size={48} color={colors.subText} />
                                    <Text style={[styles.emptyStateText, { color: colors.subText }]}>No posts yet.</Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={[styles.detailsSection, { backgroundColor: colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>

                            <InfoRow label="First Name" value={profileData.firstName} />
                            <InfoRow label="Last Name" value={profileData.lastName} />
                            <InfoRow label="Phone" value={profileData.phoneNumber} />
                            <InfoRow label="Gender" value={profileData.gender} />
                            <InfoRow label="Date of Birth" value={profileData.dob ? new Date(profileData.dob).toDateString() : null} />

                            <View style={styles.bioContainer}>
                                <Text style={[styles.infoLabel, { color: colors.subText }]}>Bio</Text>
                                <Text style={[styles.bioText, { color: colors.text }]}>
                                    {profileData.bio || 'No bio yet.'}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'transparent',
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    profilePhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E5E7EB',
        borderWidth: 3,
        borderColor: '#fff',
    },
    settingsIcon: {
        position: 'absolute',
        top: 10,
        right: 20,
        padding: 8,
    },
    displayNameText: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 5,
    },
    emailText: {
        fontSize: 14,
        marginTop: 2,
        marginBottom: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        marginTop: 10,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 15,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
    },
    sectionContent: {
        padding: 15,
    },
    postsList: {
        gap: 15,
    },
    postCard: {
        borderRadius: 15,
        padding: 15,
        borderWidth: 0.5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    postHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    postAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    authorInfo: {
        marginLeft: 10,
        justifyContent: 'center',
    },
    authorName: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    postTime: {
        fontSize: 12,
        color: 'gray',
        marginTop: 1,
    },
    postContent: {
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 12,
    },
    imagePreview: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        marginBottom: 12,
        resizeMode: 'cover',
    },
    postActions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 0.5,
    },
    emptyState: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 50,
        gap: 10,
    },
    emptyStateText: {
        fontSize: 16,
    },
    detailsSection: {
        padding: 20,
        borderRadius: 15,
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
        borderBottomWidth: 0.5,
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