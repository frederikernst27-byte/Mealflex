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
import { colors } from './src/theme';

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    const authenticate = async () => {
        Keyboard.dismiss();

        if (!email.includes('@')) {
            Alert.alert('E-Mail fehlt', 'Bitte melde dich mit einer echten E-Mail-Adresse an.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Passwort zu kurz', 'Das Passwort muss mindestens 6 Zeichen lang sein.');
            return;
        }

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
                    <View style={styles.phoneFrame}>
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
                                placeholderTextColor={colors.muted}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Passwort"
                                placeholderTextColor={colors.muted}
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
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    phoneFrame: {
        width: '100%',
        maxWidth: 430,
    },
    headerContainer: {
        marginBottom: 40,
    },
    title: {
        fontSize: 42,
        fontWeight: '800',
        color: colors.primary, // Food-app specific orange/red
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: colors.muted,
        fontWeight: '500',
    },
    formContainer: {
        width: '100%',
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: 14,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        borderRadius: 14,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: colors.primary,
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
        color: colors.primary,
        fontSize: 15,
        fontWeight: '600',
    }
});
