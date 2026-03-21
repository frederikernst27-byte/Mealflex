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
import CoachChatScreen from '../screens/CoachChatScreen';

const Tab = createBottomTabNavigator();
const CommunityStack = createNativeStackNavigator();

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
                    } else if (route.name === 'Coach') {
                        iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#FA4A0C',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#F0F0F0',
                    backgroundColor: '#FFF',
                    paddingBottom: 4,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Wochenplan' }} />
            <Tab.Screen name="Tracker" component={CalorieTrackerScreen} options={{ title: 'Tracker' }} />
            <Tab.Screen name="Coach" component={CoachChatScreen} options={{ title: 'Coach' }} />
            <Tab.Screen name="Community" component={CommunityStackNavigator} options={{ title: 'Community' }} />
            <Tab.Screen name="Saved" component={SavedRecipesScreen} options={{ title: 'Gespeichert' }} />
            <Tab.Screen name="ShoppingList" component={ShoppingListScreen} options={{ title: 'Einkauf' }} />
        </Tab.Navigator>
    );
}
