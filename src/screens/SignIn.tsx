import React, { useState } from "react";
import { Text, TouchableOpacity, View, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useAuth } from "../context/authContex";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignIn = ({ navigation }: { navigation: any }) => {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { signIn } = useAuth()
    const [errors, setErrors] = useState({
        email: '',
        password: '',
    })

    const validateField = (field: string, value: string) => {
        let error = ''
        switch (field) {
            case 'email':
                if (!value.trim()) {
                    error = 'Email is required *'
                } else if (!emailRegex.test(value)) {
                    error = 'Please enter a valid email address'
                }
                break
            case 'password':
                if (!value.trim()) {
                    error = 'Password is required *'
                } else if (value.length < 6) {
                    error = 'Password must be at least 6 characters'
                }
                break
        }
        setErrors(prev => ({ ...prev, [field]: error }))
        return error === ''
    }

    const handleSignIn = async () => {
        try {
            setLoading(true)
            const isEmailValid = validateField('email', email)
            const isPasswordValid = validateField('password', password)

            if (isEmailValid && isPasswordValid) {
                await signIn(email, password)
            }
        } catch (error: any) {
            alert(error.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Sign In</Text>

                    <TextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errors.email) validateField('email', text);
                        }}
                        style={[styles.input, errors.email ? styles.inputError : null]}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

                    <TextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password) validateField('password', text);
                        }}
                        style={[styles.input, errors.password ? styles.inputError : null]}
                        secureTextEntry
                    />
                    {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

                    <TouchableOpacity
                        onPress={handleSignIn}
                        disabled={loading}
                        style={[styles.button, loading && styles.buttonDisabled]}
                    >
                        <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Signup')}
                        style={styles.linkButton}
                    >
                        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    formContainer: {
        width: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        marginBottom: 5,
        paddingHorizontal: 15,
        borderRadius: 8,
        fontSize: 16,
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 10,
        marginLeft: 5,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: 20,
    },
    linkText: {
        color: '#007AFF',
        textAlign: 'center',
        fontSize: 14,
    },
})

export default SignIn;