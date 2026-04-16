import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './lib/supabase';
import AuthScreen from './AuthScreen';
import OnboardingNavigator from './src/navigation/OnboardingNavigator';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import { MealplanProvider } from './src/context/MealplanContext';

const Stack = createNativeStackNavigator();

export default function App() {
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setIsLoading(false);
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A8CFF" />
            </View>
        );
    }

    return (
        <MealplanProvider>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {!session ? (
                        <Stack.Screen name="Auth" component={AuthScreen} />
                    ) : (
                        <>
                            <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
                            <Stack.Screen name="MainHome" component={MainTabNavigator} options={{ gestureEnabled: false }} />
                            <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ presentation: 'modal' }} />
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </MealplanProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF'
    },
});
