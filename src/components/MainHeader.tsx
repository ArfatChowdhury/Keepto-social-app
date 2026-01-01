import { View, Text, TouchableOpacity, StyleSheet, TextInput, Platform, Image } from 'react-native';
import { useTheme } from '../context/themeContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const MainHeader = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.card }]}>
            <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <View style={styles.content}>
                    {/* Left: Logo */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/icon.png')}
                            style={styles.logoImage}
                        />
                    </View>

                    {/* Middle: Search Bar */}
                    <View style={[styles.searchContainer, { backgroundColor: colors.input }]}>
                        <Ionicons name="search-outline" size={18} color={colors.subText} style={styles.searchIcon} />
                        <TextInput
                            placeholder="Search..."
                            placeholderTextColor={colors.subText}
                            style={[styles.searchInput, { color: colors.text }]}
                        />
                    </View>

                    {/* Right: Hamburger Menu */}
                    <TouchableOpacity
                        style={styles.hamburgerContainer}
                        onPress={() => navigation.navigate('SettingsScreen')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="menu-outline" size={28} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        width: '100%',
    },
    container: {
        width: '100%',
        height: 60,
        borderBottomWidth: 1,
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: '100%',
    },
    logoContainer: {
        marginRight: 10,
    },
    logoImage: {
        width: 32,
        height: 32,
        borderRadius: 8,
    },
    searchContainer: {
        flex: 1,
        height: 40,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginRight: 15,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 0,
    },
    hamburgerContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hamburgerText: {
        fontSize: 28,
    },
});

export default MainHeader;
