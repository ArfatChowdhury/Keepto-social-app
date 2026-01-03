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
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../constants/firbase';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const { user, userData } = useAuth();
    const { colors } = useTheme();
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const q = query(collection(db, 'community_chat'), orderBy('createdAt', 'desc'));

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
    }, []);

    const sendMessage = async () => {
        if (inputText.trim() === '' || !user || !userData) return;

        const messageText = inputText;
        setInputText('');

        try {
            await addDoc(collection(db, 'community_chat'), {
                text: messageText,
                createdAt: serverTimestamp(),
                user: {
                    _id: user.uid,
                    name: userData.displayName || 'Anonymous',
                    avatar: userData.photoURL || null,
                },
            });
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
});
```