import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'

const Signup = () => {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [number, setNumber] = useState('')
    const handleSignup = () => {
        console.log('Signup')
    }

    return (
        <View style={styles.container}>
            <Text>Keepto</Text>
            <View style={styles.inputContainer}>
                <Text>Create an account?</Text>
                <View style={styles.input}>
                    <Text>First Name</Text>
                    <TextInput style={styles.inputText}/>
                </View>
                <View style={styles.input}>
                    <Text>Last Name</Text>
                    <TextInput style={styles.inputText}/>
                </View>
                <View style={styles.input}>
                    <Text>Email</Text>
                    <TextInput style={styles.inputText}/>
                </View>
                <View style={styles.input}>
                    <Text>Password</Text>
                    <TextInput style={styles.inputText}/>
                </View>
                <View style={styles.input}>
                    <Text>Confirm Password</Text>
                    <TextInput style={styles.inputText}/>
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
        justifyContent: 'center',
    },
    inputContainer: {
        backgroundColor: '#fff',
    },
    input: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
})