import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    updateProfile,
    signOut as firebaseSignOut,
    User
} from "firebase/auth";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, db } from "../constants/firbase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { UserData, AuthContextType } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Subscribe to user document in Firestore
                const userDocRef = doc(db, 'users', currentUser.uid);
                const unsubscribeDoc = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        setUserData(doc.data() as UserData);
                    }
                });
                return () => unsubscribeDoc();
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribeAuth();
    }, []);

    const signIn = async (email: string, password: string) => {
        return await signInWithEmailAndPassword(auth, email, password);
    }

    const signOut = async () => {
        return await firebaseSignOut(auth);
    }

    const signUp = async (email: string, password: string, info: any) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // Set display name in Firebase Auth
        await updateProfile(fbUser, {
            displayName: `${info.firstName} ${info.lastName}`
        });

        const newUserData: UserData = {
            uid: fbUser.uid,
            firstName: info.firstName,
            lastName: info.lastName,
            displayName: `${info.firstName} ${info.lastName}`,
            email: email,
            phoneNumber: info.phoneNumber,
            gender: info.gender,
            dob: info.dateOfBirth.toISOString(),
            bio: '',
            photoURL: null,
            createdAt: new Date().toISOString(),
        };

        // Store extra info in Firestore
        await setDoc(doc(db, 'users', fbUser.uid), newUserData);

        return userCredential;
    }

    const updateProfileInfo = async (updates: Partial<UserData>) => {
        if (!user) return;

        // Update Firebase Auth if displayName or photoURL is provided
        const authUpdates: { displayName?: string; photoURL?: string | null } = {};
        if (updates.displayName !== undefined) authUpdates.displayName = updates.displayName;
        if (updates.photoURL !== undefined) authUpdates.photoURL = updates.photoURL;

        if (Object.keys(authUpdates).length > 0) {
            await updateProfile(user, authUpdates);
        }

        // Update Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, updates, { merge: true });
    }

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            loading,
            signIn,
            signUp,
            signOut,
            updateProfileInfo
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthContextProvider');
    }
    return context;
};
