import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../constants/firbase';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/TabParamList';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'Chat'>,
    NativeStackScreenProps<RootStackParamList>
>;

export default function ChatListScreen({ navigation }: Props) {
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { colors } = useTheme();

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', user.uid),
            orderBy('lastMessageAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chatsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setChats(chatsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching chats: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const renderChatItem = ({ item }: { item: any }) => {
        // Find the other participant's data
        const otherParticipantId = item.participants.find((id: string) => id !== user?.uid);
        const otherParticipant = item.participantData?.[otherParticipantId] || {};

        return (
            <TouchableOpacity
                style={[styles.chatItem, { borderBottomColor: colors.border }]}
                onPress={() => navigation.navigate('ChatScreen', { userId: otherParticipantId })}
            >
                <Image
                    source={otherParticipant.photoURL ? { uri: otherParticipant.photoURL } : require('../../assets/adaptive-icon.png')}
                    style={styles.avatar}
                />
                <View style={styles.chatInfo}>
                    <Text style={[styles.chatName, { color: colors.text }]}>
                        {otherParticipant.displayName || 'User'}
                    </Text>
                    <Text style={[styles.lastMessage, { color: colors.subText }]} numberOfLines={1}>
                        {item.lastMessage || 'No messages yet'}
                    </Text>
                </View>
                <View style={styles.chatMeta}>
                    <Text style={[styles.timeText, { color: colors.subText }]}>
                        {item.lastMessageAt?.toDate() ? item.lastMessageAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
            </View>

            <FlatList
                data={chats}
                keyExtractor={item => item.id}
                renderItem={renderChatItem}
                ListHeaderComponent={
                    <TouchableOpacity
                        style={[styles.communityItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => navigation.navigate('ChatScreen', { userId: undefined })}
                    >
                        <View style={[styles.communityIcon, { backgroundColor: colors.primary }]}>
                            <Ionicons name="people" size={24} color="#fff" />
                        </View>
                        <View style={styles.chatInfo}>
                            <Text style={[styles.chatName, { color: colors.text }]}>Community Chat</Text>
                            <Text style={[styles.lastMessage, { color: colors.subText }]}>Join the global conversation</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.subText} />
                    </TouchableOpacity>
                }
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator style={styles.loader} color={colors.primary} />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubble-ellipses-outline" size={64} color={colors.subText} />
                            <Text style={{ color: colors.subText, marginTop: 10 }}>No private messages yet.</Text>
                        </View>
                    )
                }
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 0.5,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    communityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 15,
        marginHorizontal: 15,
        marginVertical: 10,
        borderWidth: 0.5,
        elevation: 2,
    },
    communityIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    listContent: {
        paddingBottom: 20,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 0.5,
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        marginRight: 15,
    },
    chatInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    chatName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    lastMessage: {
        fontSize: 14,
    },
    chatMeta: {
        alignItems: 'flex-end',
    },
    timeText: {
        fontSize: 12,
    },
    loader: {
        marginTop: 50,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
});
