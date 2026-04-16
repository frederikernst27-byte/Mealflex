import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import CalorieTrackerScreen from '../screens/CalorieTrackerScreen';
import CommunityScreen from '../screens/CommunityScreen';
import AIMEChatScreen from '../screens/AIMEChatScreen';

const Tab = createBottomTabNavigator();

// Unified brand blue – replaces legacy orange #FA4A0C
const ACTIVE_BLUE = '#4A8CFF';

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Kalorien') {
                        iconName = focused ? 'flame' : 'flame-outline';
                    } else if (route.name === 'ShoppingList') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    } else if (route.name === 'Community') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'AIME') {
                        iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: ACTIVE_BLUE,
                tabBarInactiveTintColor: 'gray',
                // Remove any border/shadow that creates a visible bar above the tab bar
                tabBarStyle: {
                    borderTopWidth: 0,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Wochenplan' }}
            />
            <Tab.Screen
                name="Kalorien"
                component={CalorieTrackerScreen}
                options={{ title: 'Kalorien' }}
            />
            <Tab.Screen
                name="ShoppingList"
                component={ShoppingListScreen}
                options={{ title: 'Einkauf' }}
            />
            <Tab.Screen
                name="Community"
                component={CommunityScreen}
                options={{ title: 'Community' }}
            />
            <Tab.Screen
                name="AIME"
                component={AIMEChatScreen}
                options={{ title: 'AIME' }}
            />
        </Tab.Navigator>
    );
}
