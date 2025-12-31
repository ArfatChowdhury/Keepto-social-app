import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import { db } from '../constants/firbase';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    doc,
    increment,
    runTransaction,
    getDoc
} from 'firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CommentsScreen'>;

export default function CommentsScreen({ route, navigation }: Props) {
    const { postId } = route.params;
    const { user, userData } = useAuth();
    const { colors } = useTheme();

    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [authors, setAuthors] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        // Fetch post details
        const postRef = doc(db, 'posts', postId);
        const unsubscribePost = onSnapshot(postRef, (snapshot) => {
            if (snapshot.exists()) {
                setPost({ id: snapshot.id, ...snapshot.data() });
            }
        });

        // Fetch comments
        const commentsRef = collection(db, 'posts', postId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'desc'));

        const unsubscribeComments = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComments(commentsData);
            setLoading(false);
        });

        return () => {
            unsubscribePost();
            unsubscribeComments();
        };
    }, [postId]);

    // Fetch author data for comments
    useEffect(() => {
        if (comments.length === 0) return;

        const uniqueUserIds = Array.from(new Set(comments.map(c => c.userId))).filter(id => !!id);

        const unsubscribers = uniqueUserIds.map(userId => {
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
    }, [JSON.stringify(Array.from(new Set(comments.map(c => c.userId))).sort())]);

    const handleSendComment = async () => {
        if (!newComment.trim() || !user) return;

        setSending(true);
        try {
            const commentsRef = collection(db, 'posts', postId, 'comments');
            const postRef = doc(db, 'posts', postId);

            await runTransaction(db, async (transaction) => {
                // Add the comment
                const commentDocRef = doc(commentsRef);
                transaction.set(commentDocRef, {
                    userId: user.uid,
                    authorName: userData?.displayName || 'Unknown',
                    authorPhoto: userData?.photoURL || null,
                    text: newComment.trim(),
                    createdAt: serverTimestamp()
                });

                // Increment comment count on the post
                transaction.update(postRef, {
                    commentsCount: increment(1)
                });
            });

            setNewComment('');
        } catch (error) {
            console.error('Error sending comment:', error);
            Alert.alert('Error', 'Failed to send comment. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const renderHeader = () => {
        if (!post) return null;
        return (
            <View style={[styles.postHeader, { borderBottomColor: colors.border }]}>
                <View style={styles.authorRow}>
                    {post.authorPhoto ? (
                        <Image source={{ uri: post.authorPhoto }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
                            <Ionicons name="person" size={20} color={colors.subText} />
                        </View>
                    )}
                    <View style={styles.authorInfo}>
                        <Text style={[styles.authorName, { color: colors.text }]}>{post.authorName}</Text>
                        <Text style={styles.postTime}>
                            {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : 'Just now'}
                        </Text>
                    </View>
                </View>
                <Text style={[styles.postContent, { color: colors.text }]}>{post.content}</Text>
                {post.image && (
                    <Image source={{ uri: post.image }} style={styles.postImage} />
                )}
            </View>
        );
    };

    const renderCommentItem = ({ item }: { item: any }) => {
        const author = authors[item.userId];
        const authorName = author?.displayName || item.authorName || 'User';
        const authorPhoto = author?.photoURL || item.authorPhoto;

        return (
            <View style={styles.commentItem}>
                {authorPhoto ? (
                    <Image source={{ uri: authorPhoto }} style={styles.commentAvatar} />
                ) : (
                    <View style={[styles.commentAvatarPlaceholder, { backgroundColor: colors.border }]}>
                        <Ionicons name="person" size={14} color={colors.subText} />
                    </View>
                )}
                <View style={[styles.commentBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.commentAuthor, { color: colors.text }]}>{authorName}</Text>
                    <Text style={[styles.commentText, { color: colors.text }]}>{item.text}</Text>
                    <Text style={styles.commentTime}>
                        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.appBar, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.appBarTitle, { color: colors.text }]}>Comments</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
            ) : (
                <FlatList
                    ListHeaderComponent={renderHeader}
                    data={comments}
                    renderItem={renderCommentItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
                    {userData?.photoURL ? (
                        <Image source={{ uri: userData.photoURL }} style={styles.inputAvatar} />
                    ) : (
                        <View style={[styles.inputAvatarPlaceholder, { backgroundColor: colors.border }]}>
                            <Ionicons name="person" size={16} color={colors.subText} />
                        </View>
                    )}
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                        placeholder="Add a comment..."
                        placeholderTextColor={colors.subText}
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSendComment}
                        disabled={sending || !newComment.trim()}
                        style={styles.sendButton}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Ionicons
                                name="send"
                                size={24}
                                color={newComment.trim() ? colors.primary : colors.subText}
                            />
                        )}
                    </TouchableOpacity>
                </View>
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
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
    },
    appBarTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        padding: 5,
    },
    listContent: {
        paddingBottom: 20,
    },
    postHeader: {
        padding: 15,
        borderBottomWidth: 0.5,
        marginBottom: 10,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
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
        lineHeight: 22,
        marginBottom: 10,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginTop: 10,
        resizeMode: 'cover',
    },
    commentItem: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginTop: 2,
    },
    commentAvatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    commentBubble: {
        flex: 1,
        marginLeft: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 15,
        borderWidth: 0.5,
    },
    commentAuthor: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    commentText: {
        fontSize: 14,
        lineHeight: 18,
    },
    commentTime: {
        fontSize: 10,
        color: 'gray',
        marginTop: 4,
        textAlign: 'right',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderTopWidth: 0.5,
    },
    inputAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    inputAvatarPlaceholder: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        minHeight: 36,
        maxHeight: 100,
        borderRadius: 18,
        borderWidth: 1,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 10,
        fontSize: 14,
    },
    sendButton: {
        padding: 5,
    },
});
