import { TabParamList } from "./TabParamList";

export type RootStackParamList = {
    SignInScreen: undefined;
    SignupScreen: undefined;
    ProfileScreen: { userId?: string };
    SettingsScreen: undefined;
    EditProfileScreen: undefined;
    FeedScreenScreen: undefined;
    MainTabs: { screen?: keyof TabParamList } | undefined;
    CreatePost: undefined;
    ChatScreen: { userId?: string };
    CommentsScreen: { postId: string };

};
