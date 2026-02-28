import React from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Dein Mealplan</Text>
                <Text style={styles.subtitle}>Hier entsteht bald dein automatisch generierter Mealplan!</Text>

                <View style={{ height: 40 }} />

                <Button title="Logout (For Testing)" onPress={() => supabase.auth.signOut()} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFF' },
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold' },
    subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10 }
});
