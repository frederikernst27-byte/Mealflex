import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
    const progressRatio = currentStep / totalSteps;

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Schritt {currentStep} von {totalSteps}</Text>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${progressRatio * 100}%` }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    track: {
        height: 6,
        backgroundColor: '#EFEFEF',
        borderRadius: 3,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        backgroundColor: '#4A8CFF',
        borderRadius: 3,
    },
    text: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        fontWeight: '600',
    },
});
