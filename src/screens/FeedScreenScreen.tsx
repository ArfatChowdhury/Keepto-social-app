import { Text, View, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from "react-native";
import { RootStackParamList } from "../types/navigation";
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/TabParamList';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme } from "../context/themeContext";
import { useAuth } from "../context/authContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    query,
    orderBy,
    doc,
    updateDoc,
    increment,
    setDoc,
    deleteDoc,
    getDoc,
    runTransaction
} from "firebase/firestore";
import { db } from "../constants/firbase";

type Props = CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'Feed'>,
    NativeStackScreenProps<RootStackParamList>
>;

export default function FeedScreenScreen({ navigation }: Props) {
    const { colors } = useTheme();
    const { userData, user } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLikes, setUserLikes] = useState<{ [key: string]: boolean }>({});
    const [authors, setAuthors] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(postsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching posts: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (posts.length === 0) return;

        const uniqueAuthorIds = Array.from(new Set(posts.map(p => p.userId))).filter(id => !!id);

        const unsubscribers = uniqueAuthorIds.map(userId => {
            return onSnapshot(doc(db, 'users', userId), (snapshot) => {
                if (snapshot.exists()) {
                    setAuthors(prev => ({
                        ...prev,
                        [userId]: snapshot.data()
                    }));
                }
            });
        });

        return () => unsubscribers.forEach(unsub => unsub());
    }, [JSON.stringify(Array.from(new Set(posts.map(p => p.userId))).sort())]);


    useEffect(() => {
        if (!user || posts.length === 0) return;

        const checkLikes = async () => {
            const likesMap: { [key: string]: boolean } = {};

            await Promise.all(posts.map(async (post) => {
                const likeRef = doc(db, 'posts', post.id, 'likes', user.uid);
                const likeDoc = await getDoc(likeRef);
                if (likeDoc.exists()) {
                    likesMap[post.id] = true;
                }
            }));
            setUserLikes(prev => ({ ...prev, ...likesMap }));
        };

        checkLikes();
    }, [posts.length, user]);

    const handleLike = async (postId: string) => {
        if (!user) return;

        const postRef = doc(db, 'posts', postId);
        const likeRef = doc(db, 'posts', postId, 'likes', user.uid);

        try {
            await runTransaction(db, async (transaction) => {
                const likeDoc = await transaction.get(likeRef);

                if (likeDoc.exists()) {
                    // Unlike
                    transaction.delete(likeRef);
                    transaction.update(postRef, {
                        likesCount: increment(-1)
                    });
                    setUserLikes(prev => ({ ...prev, [postId]: false }));
                } else {
                    // Like
                    transaction.set(likeRef, {
                        userId: user.uid,
                        createdAt: new Date().toISOString()
                    });
                    transaction.update(postRef, {
                        likesCount: increment(1)
                    });
                    setUserLikes(prev => ({ ...prev, [postId]: true }));
                }
            });
        } catch (error) {
            console.error("Error toggling like: ", error);
        }
    };

    const handleComment = (postId: string) => {
        navigation.navigate('CommentsScreen', { postId });
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.headerSection}>
                <TouchableOpacity
                    style={styles.fakeInputContainer}
                    onPress={() => navigation.navigate('CreatePost')}
                >
                    {userData?.photoURL ? (
                        <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
                            <Ionicons name="person" size={20} color={colors.subText} />
                        </View>
                    )}
                    <View style={[styles.fakeInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.placeholderText, { color: colors.subText }]}>
                            What's on your mind?
                        </Text>
                    </View>
                    <Ionicons name="image" size={24} color={colors.primary} style={styles.imageIcon} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {posts.map((post: any) => {
                    const author = authors[post.userId];
                    const authorName = author?.displayName || post.authorName || 'User';
                    const authorPhoto = author?.photoURL || post.authorPhoto;

                    return (
                        <View key={post.id} style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={styles.postHeader}>
                                <TouchableOpacity
                                    style={styles.postHeaderLeft}
                                    onPress={() => navigation.navigate('Profile', { userId: post.userId })}
                                >
                                    {authorPhoto ? (
                                        <Image source={{ uri: authorPhoto }} style={styles.avatar} />
                                    ) : (
                                        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
                                            <Ionicons name="person" size={20} color={colors.subText} />
                                        </View>
                                    )}
                                    <View style={styles.authorInfo}>
                                        <Text style={[styles.authorName, { color: colors.text }]}>{authorName}</Text>
                                        <Text style={styles.postTime}>
                                            {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : 'Just now'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
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
                                    onPress={() => handleLike(post.id)}
                                >
                                    <Ionicons
                                        name={userLikes[post.id] ? "heart" : "heart-outline"}
                                        size={22}
                                        color={userLikes[post.id] ? "#E0245E" : colors.text}
                                    />
                                    <Text style={[styles.actionText, { color: colors.text }]}>
                                        {post.likesCount || 0}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleComment(post.id)}
                                >
                                    <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
                                    <Text style={[styles.actionText, { color: colors.text }]}>
                                        {post.commentsCount || 0}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionButton}>
                                    <Ionicons name="share-social-outline" size={20} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerSection: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: 'transparent',
    },
    fakeInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    avatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fakeInput: {
        flex: 1,
        height: 38,
        borderRadius: 19,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 15,
        marginHorizontal: 10,
    },
    placeholderText: {
        fontSize: 14,
    },
    imageIcon: {
        marginLeft: 2,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    postCard: {
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
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
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 25,
    },
    actionText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
    },
});