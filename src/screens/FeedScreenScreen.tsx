import { Text, View } from "react-native";
import { RootStackParamList } from "../types/navigation";
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/tabParamList';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'Feed'>,
    NativeStackScreenProps<RootStackParamList>
>;

export default function FeedScreenScreen({ navigation }: Props) {
    return (
        <View>
            <Text>FeedScreen</Text>
        </View>
    );
}