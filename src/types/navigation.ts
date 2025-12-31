import { TabParamList } from "./TabParamList";

export type RootStackParamList = {
    SignInScreen: undefined;
    SignupScreen: undefined;
    ProfileScreen: undefined;
    SettingsScreen: undefined;
    EditProfileScreen: undefined;
    FeedScreenScreen: undefined;
    MainTabs: { screen?: keyof TabParamList };
    CreatePost: undefined;
};
