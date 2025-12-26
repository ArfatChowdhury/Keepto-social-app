import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'

const Signup = () => {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [number, setNumber] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [gender, setGender] = useState(null)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const RadioButton = ({ label, value }) => {
        (
            <TouchableOpacity
            style={styles.radioContainer}
            onPress={() => setGender(value)}
        >

            <View style={[styles.outerCircle, { borderColor: gender === value ? '#0D9488' : '#D1D5DB' }]}>
                {gender === value && <View style={styles.innerCircle} />}
            </View>
            <Text style={styles.radioLabel}>{label}</Text>

        </TouchableOpacity>
        )
    }

    const getStrength = (pw) => {
        if (pw.length === 0) return { label: '', color: 'transparent' };

        const hasLetters = /[a-zA-Z]/.test(pw);
        const hasNumbers = /[0-9]/.test(pw);
        const hasSymbols = /[^a-zA-Z0-9]/.test(pw);


        if (pw.length >= 10 && hasLetters && hasNumbers && hasSymbols) {
            return { label: 'Strong', color: '#059669' };
        }
        // Rule: Medium (8+ chars, letters and numbers)
        if (pw.length >= 8 && hasLetters && hasNumbers) {
            return { label: 'Medium', color: '#D97706' };
        }
        // Rule: Weak (6 to 7 characters)
        if (pw.length >= 6) {
            return { label: 'Weak', color: '#DC2626' };
        }

        return { label: 'Too Short', color: '#9CA3AF' };
    };

    const strength = getStrength(password);

    const handleSignup = () => {
        if (firstName.trim() === '') {
            setError('First Name is required *')
            return;
        }

        if (lastName.trim() === '') {
            setError('Last Name is required *')
            return;
        }


        if (number.trim() === '') {
            setError('Number is required *')
            return;
        }
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if(gender === null){
            setError('Please select gender')
            return;
        }

    }

    return (
        <View style={styles.container}>
            <Text>Keepto</Text>
            <View style={styles.inputContainer}>
                <Text>Create an account?</Text>

                <View style={styles.input}>
                    <Text>First Name</Text>
                    <TextInput
                        placeholder='Mr.John'
                        value={firstName}
                        onChangeText={setFirstName}
                        style={styles.inputText} />

                </View>

                <View style={styles.input}>
                    <Text>Last Name</Text>
                    <TextInput
                        placeholder='Deo'
                        value={lastName}
                        onChangeText={setLastName}
                        style={styles.inputText} />
                    {error ? <Text>{error}</Text> : null}
                </View>

                <View>

                    <Text>Gender</Text>
                    <RadioButton label='Male' value='Male' />

                </View>


                <View style={styles.input}>
                    <Text>Phone Number</Text>
                    <TextInput
                        value={number}
                        keyboardType='decimal-pad'
                        onChangeText={setNumber}
                        style={styles.inputText} />
                </View>

                <View style={styles.input}>
                    <Text>Email</Text>
                    <TextInput
                        placeholder='example@mail.com'
                        value={email}
                        onChangeText={setEmail}
                        style={styles.inputText} />
                </View>

                <View style={styles.input}>
                    <Text>Password</Text>
                    <TextInput
                        value={password}
                        secureTextEntry
                        onChangeText={setPassword}
                        style={styles.inputText} />

                    {password.length > 0 && (
                        <Text style={[styles.strengthText, { color: strength.color }]}>
                            Password Strength: {strength.label}
                        </Text>
                    )}
                </View>

                <View style={styles.input}>
                    <Text>Confirm Password</Text>
                    <TextInput
                        value={confirmPassword}
                        secureTextEntry
                        onChangeText={setConfirmPassword}
                        style={styles.inputText} />
                    {/* Match Validation Error */}
                    {confirmPassword.length > 0 && password !== confirmPassword && (
                        <Text style={styles.errorText}>Passwords do not match</Text>
                    )}
                </View>

                <TouchableOpacity onPress={handleSignup}><Text>Signup</Text></TouchableOpacity>
            </View>
        </View>
    )
}

export default Signup

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e9ecf4',
        alignItems: 'center',
        // justifyContent: 'center',
    },
    inputContainer: {
        backgroundColor: '#fff',
        justifyContent: 'center'

    },
    input: {

    },
    inputText: {
        color: "red",
        fontSize: 16,
        fontWeight: 'bold',
        backgroundColor: '#f4f6fa',
        borderRadius: 15
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 5,
    },
    outerCircle: {
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    innerCircle: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: '#0D9488',
    },
    radioLabel: {
        fontSize: 16,
        color: '#374151',
    },
})