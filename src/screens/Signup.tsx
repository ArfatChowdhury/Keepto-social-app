import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, SafeAreaView, KeyboardAvoidingView } from 'react-native'
import React, { useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useAuth } from '../context/authContex'
const Signup = () => {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [number, setNumber] = useState('')
    const [loading, setLoading] = useState(false)
    const [gender, setGender] = useState<string | null>(null)
    const [dob, setDob] = useState(new Date())
    const [showPicker, setShowPicker] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [data, setData] = useState<any>(null)


    const { signUp } = useAuth()
    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        number: '',
        gender: '',
        dob: '',
        terms: ''
    })

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios')
        if (selectedDate) {
            setDob(selectedDate)
            setErrors(prev => ({ ...prev, dob: '' }))
        }
    }

    const RadioButton = ({ label, value }: { label: string, value: string }) => {
        return (
            <TouchableOpacity
                style={styles.radioContainer}
                onPress={() => {
                    setGender(value)
                    setErrors(prev => ({ ...prev, gender: '' }))
                }}
            >
                <View style={[styles.outerCircle, { borderColor: gender === value ? '#007AFF' : '#D1D5DB' }]}>
                    {gender === value && <View style={styles.innerCircle} />}
                </View>
                <Text style={styles.radioLabel}>{label}</Text>
            </TouchableOpacity>
        )
    }




    const calculateAge = (birthDate: Date) => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };


    const getStrength = (pw: string) => {
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

    const validateField = (field: string, value: any) => {
        let error = ''
        switch (field) {
            case 'firstName':
                if (!value.trim()) error = 'First Name is required *'
                break
            case 'lastName':
                if (!value.trim()) error = 'Last Name is required *'
                break
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
            case 'confirmPassword':
                if (!value.trim()) {
                    error = 'Please confirm your password *'
                } else if (value !== password) {
                    error = 'Passwords do not match'
                }
                break
            case 'number':
                if (!value.trim()) error = 'Phone Number is required *'
                break
            case 'gender':
                if (value === null) error = 'Please select gender'
                break
            case 'dob':
                const userAge = calculateAge(dob)
                if (userAge < 18) {
                    error = 'You must be at least 18 years old to register'
                }
                break
            case 'terms':
                if (!value) error = 'You must agree to the Terms of Service'
                break
        }
        setErrors(prev => ({ ...prev, [field]: error }))
        return error === ''
    }

    const handleSignup = async () => {
        const userAge = calculateAge(dob)

        const isValid =
            validateField('firstName', firstName) &&
            validateField('lastName', lastName) &&
            validateField('email', email) &&
            validateField('password', password) &&
            validateField('confirmPassword', confirmPassword) &&
            validateField('number', number) &&
            validateField('gender', gender) &&
            validateField('dob', userAge >= 18) &&
            validateField('terms', termsAccepted)

        if (isValid) {
            // Proceed with signup
            setLoading(true)

            try {
                const userData = { firstName, lastName, phoneNumber: number, gender, dateOfBirth: dob }
                await signUp(email, password, userData)
                alert('Signup successful')
            } catch (error) {
                alert(error)
            } finally {
                setLoading(false)
            }



            setFirstName('')
            setLastName('')
            setEmail('')
            setPassword('')
            setConfirmPassword('')
            setGender(null)
            setDob(new Date())
            setNumber('')


        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'undefined'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Keepto</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Main Card */}
                    <View style={styles.card}>
                        <Text style={styles.title}>Create an Account?</Text>

                        {/* First Name */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput
                                placeholder='Johan orindo'
                                placeholderTextColor='#9CA3AF'
                                value={firstName}
                                onChangeText={(text) => {
                                    setFirstName(text)
                                    if (errors.firstName) validateField('firstName', text)
                                }}
                                style={[styles.input, errors.firstName ? styles.inputError : null]}
                            />
                            {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
                        </View>

                        {/* Last Name */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput
                                placeholder='Last Name'
                                placeholderTextColor='#9CA3AF'
                                value={lastName}
                                onChangeText={(text) => {
                                    setLastName(text)
                                    if (errors.lastName) validateField('lastName', text)
                                }}
                                style={[styles.input, errors.lastName ? styles.inputError : null]}
                            />
                            {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
                        </View>

                        {/* Date of Birth */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <TouchableOpacity
                                style={[styles.input, styles.dateInput, errors.dob ? styles.inputError : null]}
                                onPress={() => setShowPicker(true)}
                            >
                                <Text style={styles.dateText}>{dob.toDateString()}</Text>
                            </TouchableOpacity>
                            {showPicker && (
                                <DateTimePicker
                                    value={dob}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    maximumDate={new Date()}
                                    onChange={onDateChange}
                                />
                            )}
                            {errors.dob ? <Text style={styles.errorText}>{errors.dob}</Text> : null}
                        </View>

                        {/* Gender */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Gender</Text>
                            <View style={styles.radioGroup}>
                                <RadioButton label='Male' value='Male' />
                                <RadioButton label='Female' value='Female' />
                            </View>
                            {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
                        </View>

                        {/* Phone Number */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                placeholder='Phone Number'
                                placeholderTextColor='#9CA3AF'
                                value={number}
                                keyboardType='phone-pad'
                                onChangeText={(text) => {
                                    setNumber(text)
                                    if (errors.number) validateField('number', text)
                                }}
                                style={[styles.input, errors.number ? styles.inputError : null]}
                            />
                            {errors.number ? <Text style={styles.errorText}>{errors.number}</Text> : null}
                        </View>

                        {/* Email */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                placeholder='joedoo75@gmail.com'
                                placeholderTextColor='#9CA3AF'
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text)
                                    if (errors.email) validateField('email', text)
                                }}
                                keyboardType='email-address'
                                autoCapitalize='none'
                                style={[styles.input, errors.email ? styles.inputError : null]}
                            />
                            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                        </View>

                        {/* Password */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    placeholder='Password'
                                    placeholderTextColor='#9CA3AF'
                                    value={password}
                                    secureTextEntry={!showPassword}
                                    onChangeText={(text) => {
                                        setPassword(text)
                                        if (errors.password) validateField('password', text)
                                    }}
                                    style={[styles.input, styles.passwordInput, errors.password ? styles.inputError : null]}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Text style={styles.eyeIconText}>{showPassword ? '👁' : '👁‍🗨'}</Text>
                                </TouchableOpacity>
                            </View>
                            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                            {password.length > 0 && !errors.password && (
                                <Text style={[styles.strengthText, { color: strength.color }]}>
                                    Password Strength: {strength.label}
                                </Text>
                            )}
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    placeholder='Confirm Password'
                                    placeholderTextColor='#9CA3AF'
                                    value={confirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text)
                                        if (errors.confirmPassword) validateField('confirmPassword', text)
                                    }}
                                    style={[styles.input, styles.passwordInput, errors.confirmPassword ? styles.inputError : null]}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Text style={styles.eyeIconText}>{showConfirmPassword ? '👁' : '👁‍🗨'}</Text>
                                </TouchableOpacity>
                            </View>
                            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
                        </View>

                        {/* Terms of Service */}
                        <View style={styles.fieldContainer}>
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => {
                                    setTermsAccepted(!termsAccepted)
                                    if (errors.terms) validateField('terms', !termsAccepted)
                                }}
                            >
                                <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                                    {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                                <Text style={styles.checkboxLabel}>
                                    I agree to the{' '}
                                    <Text style={styles.linkText}>Terms of Service</Text>
                                </Text>
                            </TouchableOpacity>
                            {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}
                        </View>

                        {/* Create Account Button */}
                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>Create account</Text>
                        </TouchableOpacity>

                        {/* Or Sign in with */}
                        <Text style={styles.orText}>Or Sign in with</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default Signup

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        paddingBottom: 16,
        backgroundColor: '#F3F4F6',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 20,
        color: '#000000',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#007AFF',
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 24,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
    },
    inputError: {
        borderColor: '#DC2626',
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 50,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 14,
        padding: 4,
    },
    eyeIconText: {
        fontSize: 20,
    },
    dateInput: {
        justifyContent: 'center',
    },
    dateText: {
        fontSize: 16,
        color: '#111827',
    },
    errorText: {
        fontSize: 12,
        color: '#DC2626',
        marginTop: 6,
    },
    strengthText: {
        fontSize: 12,
        marginTop: 6,
        fontWeight: '500',
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 20,
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    outerCircle: {
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    innerCircle: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: '#007AFF',
    },
    radioLabel: {
        fontSize: 16,
        color: '#374151',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: '#E5E7EB',
        borderColor: '#E5E7EB',
    },
    checkmark: {
        color: '#000000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },
    linkText: {
        color: '#007AFF',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    orText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#9CA3AF',
    },
})