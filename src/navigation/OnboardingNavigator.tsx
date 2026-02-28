import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingGoalScreen from '../screens/onboarding/OnboardingGoalScreen';
import OnboardingStyleScreen from '../screens/onboarding/OnboardingStyleScreen';
import OnboardingAllergiesScreen from '../screens/onboarding/OnboardingAllergiesScreen';
import OnboardingTimeScreen from '../screens/onboarding/OnboardingTimeScreen';
import OnboardingLanguageScreen from '../screens/onboarding/OnboardingLanguageScreen';
import OnboardingFinishScreen from '../screens/onboarding/OnboardingFinishScreen';
import { OnboardingProvider } from '../context/OnboardingContext';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
    return (
        <OnboardingProvider>
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen} />
                <Stack.Screen name="OnboardingStyle" component={OnboardingStyleScreen} />
                <Stack.Screen name="OnboardingAllergies" component={OnboardingAllergiesScreen} />
                <Stack.Screen name="OnboardingTime" component={OnboardingTimeScreen} />
                <Stack.Screen name="OnboardingLanguage" component={OnboardingLanguageScreen} />
                <Stack.Screen name="OnboardingFinish" component={OnboardingFinishScreen} />
            </Stack.Navigator>
        </OnboardingProvider>
    );
}
