import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator
} from 'react-native';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../constants/firbase';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { doc, setDoc, getDoc } from 'firebase/firestore';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatScreen'>;

export default function ChatScreen({ route, navigation }: Props) {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const { user, userData } = useAuth();
    const { colors } = useTheme();
    const flatListRef = useRef<FlatList>(null);

    const { userId } = route.params || {};
    const isPrivate = !!userId;
    const chatId = user && userId ? [user.uid, userId].sort().join('_') : null;

    useEffect(() => {
        const collectionName = isPrivate ? 'private_messages' : 'community_chat';
        let q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));

        if (isPrivate && chatId) {
            q = query(
                collection(db, 'private_messages'),
                where('chatId', '==', chatId),
                orderBy('createdAt', 'desc')
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
            }));
            setMessages(messagesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching messages: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isPrivate, chatId]);

    const sendMessage = async () => {
        if (inputText.trim() === '' || !user || !userData) return;

        const messageText = inputText;
        setInputText('');

        try {
            const collectionName = isPrivate ? 'private_messages' : 'community_chat';
            const timestamp = serverTimestamp();
            const messageData: any = {
                text: messageText,
                createdAt: timestamp,
                user: {
                    _id: user.uid,
                    name: userData.displayName || 'Anonymous',
                    avatar: userData.photoURL || null,
                },
            };

            if (isPrivate && chatId) {
                messageData.chatId = chatId;
                messageData.participants = [user.uid, userId];

                // Update/Create chat document for the list view
                const chatRef = doc(db, 'chats', chatId);
                const chatDoc = await getDoc(chatRef);

                let participantData = chatDoc.exists() ? chatDoc.data().participantData || {} : {};

                // Ensure we have current participant data
                if (!participantData[user.uid]) {
                    participantData[user.uid] = {
                        displayName: userData.displayName,
                        photoURL: userData.photoURL
                    };
                }

                // Attempt to fetch target user data if not present
                if (!participantData[userId]) {
                    const targetUserDoc = await getDoc(doc(db, 'users', userId));
                    if (targetUserDoc.exists()) {
                        const targetData = targetUserDoc.data();
                        participantData[userId] = {
                            displayName: targetData.displayName,
                            photoURL: targetData.photoURL
                        };
                    }
                }

                await setDoc(chatRef, {
                    lastMessage: messageText,
                    lastMessageAt: timestamp,
                    participants: [user.uid, userId],
                    participantData: participantData
                }, { merge: true });
            }

            await addDoc(collection(db, collectionName), messageData);
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMyMessage = item.user?._id === user?.uid;

        return (
            <View style={[
                styles.messageContainer,
                isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
            ]}>
                {!isMyMessage && (
                    <View style={styles.avatarContainer}>
                        {item.user?.avatar ? (
                            <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
                                <Ionicons name="person" size={14} color={colors.subText} />
                            </View>
                        )}
                    </View>
                )}
                <View style={[
                    styles.bubble,
                    {
                        backgroundColor: isMyMessage ? colors.primary : colors.card,
                        borderColor: colors.border,
                        borderWidth: isMyMessage ? 0 : 0.5,
                    },
                    isMyMessage ? styles.myBubble : styles.otherBubble
                ]}>
                    <View style={styles.messageHeader}>
                        <Text style={[
                            styles.userName,
                            { color: isMyMessage ? 'rgba(255,255,255,0.7)' : colors.subText }
                        ]}>
                            {item.user?.name}
                        </Text>
                    </View>
                    <Text style={[
                        styles.messageText,
                        { color: isMyMessage ? '#fff' : colors.text }
                    ]}>
                        {item.text}
                    </Text>
                    <Text style={[
                        styles.timeText,
                        { color: isMyMessage ? 'rgba(255,255,255,0.5)' : colors.subText, alignSelf: 'flex-end' }
                    ]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                {isPrivate && (
                    <TouchableOpacity onPress={() => navigation.setParams({ userId: undefined })} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                )}
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    {isPrivate ? 'Private Chat' : 'Community Chat'}
                </Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                inverted
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                    placeholder="Type a message..."
                    placeholderTextColor={colors.subText}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, { backgroundColor: colors.primary }]}
                    onPress={sendMessage}
                    disabled={inputText.trim() === ''}
                >
                    <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 20,
        paddingTop: 10,
    },
    messageContainer: {
        flexDirection: 'row',
        marginVertical: 4,
        maxWidth: '80%',
    },
    myMessageContainer: {
        alignSelf: 'flex-end',
    },
    otherMessageContainer: {
        alignSelf: 'flex-start',
    },
    avatarContainer: {
        marginRight: 8,
        justifyContent: 'flex-end',
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    avatarPlaceholder: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bubble: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 18,
    },
    myBubble: {
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        borderBottomLeftRadius: 4,
    },
    messageHeader: {
        marginBottom: 2,
    },
    userName: {
        fontSize: 11,
        fontWeight: '600',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    timeText: {
        fontSize: 10,
        marginTop: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: 0.5,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 10,
        marginRight: 10,
        borderWidth: 0.5,
        fontSize: 15,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 0.5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    backButton: {
        padding: 5,
    },
});
