import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import CommunityScreen from '../screens/CommunityScreen';
import SavedRecipesScreen from '../screens/SavedRecipesScreen';
import RecipeUploadScreen from '../screens/RecipeUploadScreen';
import CalorieTrackerScreen from '../screens/CalorieTrackerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PricingScreen from '../screens/PricingScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const CommunityStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function CommunityStackNavigator() {
    return (
        <CommunityStack.Navigator screenOptions={{ headerShown: false }}>
            <CommunityStack.Screen name="CommunityFeed" component={CommunityScreen} />
            <CommunityStack.Screen
                name="RecipeUpload"
                component={RecipeUploadScreen}
                options={{ presentation: 'modal' }}
            />
        </CommunityStack.Navigator>
    );
}

function ProfileStackNavigator() {
    return (
        <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
            <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
            <ProfileStack.Screen name="Pricing" component={PricingScreen} options={{ presentation: 'modal' }} />
        </ProfileStack.Navigator>
    );
}

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'ShoppingList') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    } else if (route.name === 'Community') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'Saved') {
                        iconName = focused ? 'bookmark' : 'bookmark-outline';
                    } else if (route.name === 'Tracker') {
                        iconName = focused ? 'flame' : 'flame-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.muted,
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    backgroundColor: colors.surface,
                    paddingBottom: 4,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Wochenplan' }} />
            <Tab.Screen name="Tracker" component={CalorieTrackerScreen} options={{ title: 'Tracker' }} />
<Tab.Screen name="Community" component={CommunityStackNavigator} options={{ title: 'Community' }} />
            <Tab.Screen name="Saved" component={SavedRecipesScreen} options={{ title: 'Gespeichert' }} />
            <Tab.Screen name="ShoppingList" component={ShoppingListScreen} options={{ title: 'Einkauf' }} />
            <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profil' }} />
        </Tab.Navigator>
    );
}
