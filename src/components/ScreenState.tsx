import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

export function EmptyState({
    icon = 'information-circle-outline',
    title,
    message,
    actionLabel,
    onAction,
}: {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}) {
    return (
        <View style={styles.state}>
            <View style={styles.iconWrap}>
                <Ionicons name={icon} size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {actionLabel && onAction && (
                <TouchableOpacity style={styles.action} onPress={onAction}>
                    <Text style={styles.actionText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

export function ProBadge() {
    return (
        <View style={styles.badge}>
            <Ionicons name="sparkles" size={13} color={colors.primary} />
            <Text style={styles.badgeText}>Pro</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    state: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxl,
        gap: spacing.md,
    },
    iconWrap: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: { ...typography.sectionTitle, textAlign: 'center' },
    message: { ...typography.body, color: colors.muted, textAlign: 'center' },
    action: {
        marginTop: spacing.sm,
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    actionText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.primarySoft,
        borderColor: colors.primary,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 4,
    },
    badgeText: { color: colors.primary, fontWeight: '800', fontSize: 12 },
});
