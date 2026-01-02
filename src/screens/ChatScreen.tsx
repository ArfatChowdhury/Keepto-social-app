
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/themeContext';

export default function ChatScreen() {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={{ color: colors.text }}>Chat functionality has been removed.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});