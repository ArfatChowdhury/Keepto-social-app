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

    const handleSignup = () => {
        if(firstName.trim() === ''){
            setError('First Name is required *')
            return;
        }

        if(lastName.trim() === ''){
            setError('Last Name is required *')
            return;
        }


        if(number.trim() === ''){
            setError('Number is required *')
            return;
        }
        console.log('Signup')
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
                        {error ? <Text>{error}</Text> : null}
                </View>

                <View style={styles.input}>
                    <Text>Last Name</Text>
                    <TextInput
                    placeholder='Deo'
                    value={lastName}
                    onChangeText={setLastName}
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
                    <Text>Phone Number</Text>
                    <TextInput
                    value={number}
                    onChangeText={setNumber}
                    style={styles.inputText} />
                </View>
                
                <View style={styles.input}>
                    <Text>Password</Text>
                    <TextInput
                    value={password}
                    onChangeText={setPassword}
                    style={styles.inputText} />
                </View>

                <View style={styles.input}>
                    <Text>Confirm Password</Text>
                    <TextInput
                     value={confirmPassword}
                     onChangeText={setConfirmPassword}
                     style={styles.inputText} />
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
       color:"red",
        fontSize: 16,
        fontWeight: 'bold',
        backgroundColor: '#f4f6fa',
        borderRadius: 15
    },
})