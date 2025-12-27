import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    updateProfile,
    signOut as firebaseSignOut
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../constants/firbase";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Subscribe to user document in Firestore
                const userDocRef = doc(db, 'users', currentUser.uid);
                const unsubscribeDoc = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        setUserData(doc.data());
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

    const signIn = async (email, password) => {
        return await signInWithEmailAndPassword(auth, email, password);
    }

    const signOut = async () => {
        return await firebaseSignOut(auth);
    }

    const signUp = async (email, password, info) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // Set display name in Firebase Auth
        await updateProfile(fbUser, {
            displayName: `${info.firstName} ${info.lastName}`
        });

        // Store extra info in Firestore
        await setDoc(doc(db, 'users', fbUser.uid), {
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
        });

        return userCredential;
    }

    const updateProfileInfo = async (updates) => {
        if (!user) return;

        // Update Firebase Auth if displayName or photoURL is provided
        const authUpdates = {};
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

export const useAuth = () => useContext(AuthContext);
