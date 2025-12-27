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

    }



    return (
        <AuthContext.Provider value={{ signIn }}>
            {children}
        </AuthContext.Provider>
    )
}
