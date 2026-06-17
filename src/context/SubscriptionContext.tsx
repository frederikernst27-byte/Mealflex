import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

export type SubscriptionStatus = 'free' | 'pro' | 'trialing';

interface SubscriptionContextType {
    isPro: boolean;
    status: SubscriptionStatus;
    isLoading: boolean;
    refreshSubscription: () => Promise<void>;
    startCheckout: (plan: 'monthly' | 'yearly') => Promise<void>;
    requirePro: (featureName: string, onBlocked?: () => void) => boolean;
    unlockEasterEgg: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<SubscriptionStatus>('free');
    const [isLoading, setIsLoading] = useState(true);

    const refreshSubscription = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                setStatus('free');
                return;
            }

            const { data } = await supabase
                .from('profiles')
                .select('is_pro, subscription_status')
                .eq('id', session.user.id)
                .maybeSingle();

            if (data?.is_pro || data?.subscription_status === 'pro' || data?.subscription_status === 'trialing') {
                setStatus(data.subscription_status === 'trialing' ? 'trialing' : 'pro');
            } else {
                setStatus('free');
            }
        } catch {
            setStatus('free');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { refreshSubscription(); }, [refreshSubscription]);

    const startCheckout = async (plan: 'monthly' | 'yearly') => {
        Alert.alert(
            'RevenueCat vorbereiten',
            `Der ${plan === 'monthly' ? 'Monats' : 'Jahres'}-Plan ist in der App vorbereitet. Für echte Käufe müssen RevenueCat API-Key, Offerings und App-Store-Produkte eingetragen werden.`
        );
    };

    const unlockEasterEgg = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await supabase
                    .from('profiles')
                    .update({ is_pro: true })
                    .eq('id', session.user.id);
            }
        } catch {}
        setStatus('pro');
    }, []);

    const requirePro = (featureName: string, onBlocked?: () => void) => {
        if (status === 'pro' || status === 'trialing') return true;
        Alert.alert(
            `${featureName} ist Pro`,
            'Dieses Feature gehört zu MealFlex Pro. Öffne den Pricing-Screen, um die Vorteile zu sehen.',
            [
                { text: 'Später', style: 'cancel' },
                { text: 'Pricing öffnen', onPress: onBlocked },
            ]
        );
        return false;
    };

    const value = useMemo(() => ({
        isPro: status === 'pro' || status === 'trialing',
        status,
        isLoading,
        refreshSubscription,
        startCheckout,
        requirePro,
        unlockEasterEgg,
    }), [status, isLoading, refreshSubscription, unlockEasterEgg]);

    return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
    const ctx = useContext(SubscriptionContext);
    if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
    return ctx;
}
