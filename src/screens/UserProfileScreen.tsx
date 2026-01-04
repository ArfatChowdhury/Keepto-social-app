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
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../constants/firbase';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfileScreen'>;

const { width } = Dimensions.get('window');

export default function UserProfileScreen({ navigation, route }: Props) {
    const { user, userData: currentUserData } = useAuth();
    const { colors } = useTheme();
    const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
    const [profileData, setProfileData] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { userId: targetUserId } = route.params;
    const isOwner = targetUserId === user?.uid;

    useEffect(() => {
        if (!targetUserId) return;

        setLoading(true);
        // Fetch profile data
        const fetchProfile = async () => {
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
        };

        fetchProfile();

        // Fetch user posts
        const postsQuery = query(
            collection(db, 'posts'),
            where('userId', '==', targetUserId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
            const postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUserPosts(postsData);
        }, (error) => {
            console.error("Error fetching user posts:", error);
        });

        return () => {
            unsubscribePosts();
        };
    }, [targetUserId]);

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.profileHeader}>
                    <View style={styles.coverPhoto} />
                    <View style={styles.profileInfoContainer}>
                        <Image
                            source={profileData?.photoURL ? { uri: profileData.photoURL } : require('../../assets/adaptive-icon.png')}
                            style={[styles.profilePhoto, { borderColor: colors.background }]}
                        />
                        <View style={styles.nameContainer}>
                            <Text style={[styles.displayName, { color: colors.text }]}>
                                {profileData?.displayName || 'Social User'}
                            </Text>
                            <Text style={[styles.email, { color: colors.subText }]}>
                                @{profileData?.email?.split('@')[0] || 'user'}
                            </Text>
                        </View>

                        {profileData?.bio ? (
                            <Text style={[styles.bio, { color: colors.text }]}>{profileData.bio}</Text>
                        ) : null}

                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statNumber, { color: colors.text }]}>{userPosts.length}</Text>
                                <Text style={[styles.statLabel, { color: colors.subText }]}>Posts</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
                                <Text style={[styles.statLabel, { color: colors.subText }]}>Followers</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
                                <Text style={[styles.statLabel, { color: colors.subText }]}>Following</Text>
                            </View>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                                onPress={() => navigation.navigate('ChatScreen', { userId: targetUserId })}
                            >
                                <Ionicons name="chatbubble" size={18} color="#fff" />
                                <Text style={styles.actionButtonText}>Message</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Tabs */}
                <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'posts' && { borderBottomColor: colors.primary }]}
                        onPress={() => setActiveTab('posts')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'posts' ? colors.primary : colors.subText }]}>Posts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'about' && { borderBottomColor: colors.primary }]}
                        onPress={() => setActiveTab('about')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'about' ? colors.primary : colors.subText }]}>About</Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.tabContent}>
                    {activeTab === 'posts' ? (
                        <View style={styles.postsGrid}>
                            {userPosts.map((post) => (
                                <View key={post.id} style={[styles.postItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    {post.image ? (
                                        <Image source={{ uri: post.image }} style={styles.postImage} />
                                    ) : (
                                        <View style={styles.textPostPlaceholder}>
                                            <Text style={[styles.postPreviewText, { color: colors.text }]} numberOfLines={3}>
                                                {post.content}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                            {userPosts.length === 0 && (
                                <View style={styles.emptyState}>
                                    <Ionicons name="images-outline" size={48} color={colors.subText} />
                                    <Text style={{ color: colors.subText, marginTop: 10 }}>No posts yet</Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={styles.aboutContent}>
                            <View style={styles.aboutItem}>
                                <Ionicons name="calendar-outline" size={20} color={colors.subText} />
                                <Text style={[styles.aboutText, { color: colors.text }]}>Joined recently</Text>
                            </View>
                            {profileData?.email && (
                                <View style={styles.aboutItem}>
                                    <Ionicons name="mail-outline" size={20} color={colors.subText} />
                                    <Text style={[styles.aboutText, { color: colors.text }]}>{profileData.email}</Text>
                                </View>
                            )}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 0.5,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    profileHeader: {
        marginBottom: 10,
    },
    coverPhoto: {
        height: 120,
        backgroundColor: '#71E300',
    },
    profileInfoContainer: {
        marginTop: -50,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    profilePhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
    },
    nameContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    displayName: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 14,
        marginTop: 2,
    },
    bio: {
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
        paddingVertical: 15,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: '60%',
        alignSelf: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 15,
        width: '100%',
        paddingHorizontal: 20,
        gap: 10,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        borderRadius: 20,
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    tabContent: {
        padding: 10,
    },
    postsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    postItem: {
        width: (width - 30) / 2,
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 0.5,
    },
    postImage: {
        width: '100%',
        height: '100%',
    },
    textPostPlaceholder: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
    },
    postPreviewText: {
        fontSize: 12,
        textAlign: 'center',
    },
    emptyState: {
        width: '100%',
        paddingVertical: 40,
        alignItems: 'center',
    },
    aboutContent: {
        padding: 10,
    },
    aboutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 12,
    },
    aboutText: {
        fontSize: 15,
    },
});
