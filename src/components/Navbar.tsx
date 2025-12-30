// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
// import { useNavigation, NavigationProp } from '@react-navigation/native';
// import { useTheme } from '../context/themeContext';
// import { RootStackParamList } from '../types/navigation';
// import { TabParamList } from '../types/tabParamList';



// const Navbar = () => {
//     const navigation = useNavigation<any>();
//     const { colors } = useTheme();

//     const handleSettingsPress = () => {
//         navigation.navigate('Settings');
//     };

//     return (
//         <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
//             <View style={styles.content}>
//                 {/* {Logo} */}
//                 <View style={styles.logoContainer}>
//                     <Text style={styles.logoText}>🔥</Text>
//                 </View>

//                 {/* {Hamburger Menu} */}
//                 <TouchableOpacity
//                     style={styles.hamburgerContainer}
//                     onPress={handleSettingsPress}
//                     activeOpacity={0.7}
//                 >
//                     <Text style={[styles.hamburgerText, { color: colors.text }]}>☰</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         width: '100%',
//         height: 60,
//         borderBottomWidth: 1,
//         justifyContent: 'center',
//         ...Platform.select({
//             ios: {
//                 shadowColor: '#000',
//                 shadowOffset: { width: 0, height: 1 },
//                 shadowOpacity: 0.1,
//                 shadowRadius: 2,
//             },
//             android: {
//                 elevation: 3,
//             },
//         }),
//     },
//     content: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: 15,
//         height: '100%',
//     },
//     logoContainer: {
//         width: 40,
//         height: 40,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     logoText: {
//         fontSize: 28,
//     },
//     hamburgerContainer: {
//         width: 44,
//         height: 44,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     hamburgerText: {
//         fontSize: 30,
//     },
// });

// export default Navbar;
