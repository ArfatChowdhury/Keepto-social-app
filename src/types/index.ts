export interface UserData {
    uid: string;
    firstName: string;
    lastName: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    gender: 'Male' | 'Female' | null;
    dob: string;
    bio?: string;
    photoURL?: string | null;
    createdAt: string;
}

export interface AuthContextType {
    user: any; // Firebase User type
    userData: UserData | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<any>;
    signUp: (email: string, password: string, info: any) => Promise<any>;
    signOut: () => Promise<void>;
    updateProfileInfo: (updates: Partial<UserData>) => Promise<void>;
}

export interface ThemeColors {
    background: string;
    card: string;
    text: string;
    subText: string;
    primary: string;
    border: string;
    input: string;
}

export interface ThemeContextType {
    isDarkMode: boolean;
    colors: ThemeColors;
    toggleTheme: () => void;
}
