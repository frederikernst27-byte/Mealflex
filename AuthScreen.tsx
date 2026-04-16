import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    TextInput,
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ActivityIndicator,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { supabase } from './lib/supabase';

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    const authenticate = async () => {
        Keyboard.dismiss();
        setLoading(true);

        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) Alert.alert('Login Fehler', error.message);
        } else {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) Alert.alert('Signup Fehler', error.message);
            else Alert.alert('Check deine E-Mails', 'Bestätige deine E-Mail.');
        }

        setLoading(false);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>MealFlex</Text>
                        <Text style={styles.subtitle}>
                            {isLogin ? 'Willkommen zurück!' : 'Erstelle deinen Account'}
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="E-Mail Adresse"
                            placeholderTextColor="#999"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Passwort"
                            placeholderTextColor="#999"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={authenticate}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryButtonText}>
                                    {isLogin ? 'Anmelden' : 'Registrieren'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => setIsLogin(!isLogin)}
                        >
                            <Text style={styles.toggleButtonText}>
                                {isLogin
                                    ? 'Noch keinen Account? Registrieren'
                                    : 'Bereits einen Account? Anmelden'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    headerContainer: {
        marginBottom: 40,
    },
    title: {
        fontSize: 42,
        fontWeight: '800',
        color: '#4A8CFF', // Food-app specific orange/red
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        fontWeight: '500',
    },
    formContainer: {
        width: '100%',
    },
    input: {
        backgroundColor: '#F6F6F9',
        borderRadius: 14,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    primaryButton: {
        backgroundColor: '#4A8CFF',
        borderRadius: 14,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#4A8CFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    toggleButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    toggleButtonText: {
        color: '#4A8CFF',
        fontSize: 15,
        fontWeight: '600',
    }
});
