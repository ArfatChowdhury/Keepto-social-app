import { Text, View, StyleSheet } from "react-native";
import { RootStackParamList } from "../types/navigation";
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/tabParamList';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/themeContext";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'Feed'>,
    NativeStackScreenProps<RootStackParamList>
>;

export default function FeedScreenScreen({ navigation }: Props) {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Navbar />
            <View style={styles.content}>
                <Text style={{ color: colors.text }}>FeedScreen</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: '10%',
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});