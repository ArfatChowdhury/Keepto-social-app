import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { RootStackParamList } from "../types/navigation";
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/TabParamList';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme } from "../context/themeContext";
import { useAuth } from "../context/authContext";
import { Ionicons } from "@expo/vector-icons";

type Props = CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'Feed'>,
    NativeStackScreenProps<RootStackParamList>
>;

export default function FeedScreenScreen({ navigation }: Props) {
    const { colors } = useTheme();
    const { userData } = useAuth();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.headerSection, { borderBottomColor: colors.border }]}>
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

            <View style={styles.content}>
                {/* Posts will go here */}
            </View>
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
        // borderBottomWidth: 0.5,
    },
    fakeInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fakeInput: {
        flex: 1,
        height: 40,
        borderRadius: 20,
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
});