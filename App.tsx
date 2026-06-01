import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, View, Text, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { colors } from './src/theme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './lib/supabase';
import AuthScreen from './AuthScreen';
import OnboardingNavigator from './src/navigation/OnboardingNavigator';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import { MealplanProvider, useMealplan } from './src/context/MealplanContext';
import { CommunityProvider } from './src/context/CommunityContext';
import { CalorieProvider } from './src/context/CalorieContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';

const Stack = createNativeStackNavigator();

// Dunkles Navigations-Theme, damit Screen-Übergänge & Hintergründe nicht weiß aufblitzen
const navTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
    },
};

// Innere Komponente, die Zugriff auf MealplanContext hat
function AppNavigator({ session }: { session: any }) {
    const { loadPlanFromDb, isLoadingPlan } = useMealplan();
    const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

    useEffect(() => {
        if (!session?.user) return;
        checkOnboardingAndLoadPlan(session.user.id);
    }, [session]);

    const checkOnboardingAndLoadPlan = async (userId: string) => {
        try {
            // Profil in DB prüfen
            const { data: profile } = await supabase
                .from('profiles')
                .select('onboarding_completed')
                .eq('id', userId)
                .maybeSingle();

            const done = profile?.onboarding_completed === true;
            setOnboardingDone(done);

            // Falls Onboarding abgeschlossen: Plan aus DB laden
            if (done) {
                await loadPlanFromDb(userId);
            }
        } catch (e) {
            console.error('checkOnboarding error:', e);
            setOnboardingDone(false);
        }
    };

    // Ladeindikator während DB-Check
    if (onboardingDone === null || (onboardingDone && isLoadingPlan)) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Dein Plan wird geladen…</Text>
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {onboardingDone ? (
                // Onboarding bereits erledigt → direkt zum Plan
                <>
                    <Stack.Screen name="MainHome" component={MainTabNavigator} options={{ gestureEnabled: false }} />
                    <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ presentation: 'modal' }} />
                    <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
                </>
            ) : (
                // Onboarding noch nicht gemacht
                <>
                    <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
                    <Stack.Screen name="MainHome" component={MainTabNavigator} options={{ gestureEnabled: false }} />
                    <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ presentation: 'modal' }} />
                </>
            )}
        </Stack.Navigator>
    );
}

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
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
        <MealplanProvider>
            <CommunityProvider>
                <CalorieProvider>
                <SubscriptionProvider>
                <NavigationContainer theme={navTheme}>
                    <StatusBar barStyle="light-content" backgroundColor={colors.background} />
                    {!session ? (
                        <Stack.Navigator screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="Auth" component={AuthScreen} />
                        </Stack.Navigator>
                    ) : (
                        <AppNavigator session={session} />
                    )}
                </NavigationContainer>
                </SubscriptionProvider>
                </CalorieProvider>
            </CommunityProvider>
        </MealplanProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: 16,
    },
    loadingText: {
        fontSize: 15, color: colors.muted,
    },
});
