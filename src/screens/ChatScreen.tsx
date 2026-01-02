import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { GiftedChat, IMessage, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../constants/firbase';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const { user, userData } = useAuth();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'community_chat'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    _id: doc.id,
                    text: data.text,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                    user: data.user,
                } as IMessage;
            });
            setMessages(messagesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const onSend = useCallback((newMessages: IMessage[] = []) => {
        if (!user || !userData) return;

        const { text } = newMessages[0];

        addDoc(collection(db, 'community_chat'), {
            text,
            createdAt: serverTimestamp(),
            user: {
                _id: user.uid,
                name: userData.displayName || 'Anonymous',
                avatar: userData.photoURL || null,
            },
        });
    }, [user, userData]);

    const renderBubble = (props: any) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: colors.primary,
                    },
                    left: {
                        backgroundColor: colors.card,
                    },
                }}
                textStyle={{
                    right: {
                        color: '#fff',
                    },
                    left: {
                        color: colors.text,
                    },
                }}
            />
        );
    };

    const renderInputToolbar = (props: any) => {
        return (
            <InputToolbar
                {...props}
                containerStyle={{
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    paddingHorizontal: 8,
                    paddingBottom: 2,
                }}
                textInputStyle={{
                    color: colors.text,
                }}
            />
        );
    };

    const renderSend = (props: any) => {
        return (
            <Send {...props} containerStyle={{ justifyContent: 'center' }}>
                <View style={{ marginRight: 10 }}>
                    <Ionicons name="send" size={24} color={colors.primary} />
                </View>
            </Send>
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <GiftedChat
                messages={messages}
                onSend={messages => onSend(messages)}
                user={{
                    _id: user?.uid || '',
                    name: userData?.displayName || '',
                    avatar: userData?.photoURL || undefined,
                }}
                renderBubble={renderBubble}
                renderInputToolbar={renderInputToolbar}
                renderSend={renderSend}
                textInputProps={{ placeholder: "Type a message..." }}
            />
        </View>
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
});