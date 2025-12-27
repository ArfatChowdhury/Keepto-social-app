import { signInWithEmailAndPassword } from "firebase/auth";
import { createContext } from "react";


const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {

    const signIn = async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password)
    }


    const signUp = async (email, password, userData) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            gender: userData.gender,
            dob: userData.dob,
            createdAt: new Date().toISOString(),
        })
        return userCredential
    }



    return (
        <AuthContext.Provider value={{ signIn, signUp }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
}