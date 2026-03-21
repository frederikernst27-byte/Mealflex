import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList, TextInput,
    TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence } from 'react-native-reanimated';
import { supabase } from '../../lib/supabase';
import { useCalorie } from '../context/CalorieContext';
import { getCoachResponse, analyzeDeficiencies, generateWeeklySummary, DeficiencyResult } from '../services/aiService';

const ORANGE = '#FA4A0C';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// ── Message Bubble ─────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
    const isUser = msg.role === 'user';
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(isUser ? 10 : -10);
    const animStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 250 });
        translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
    }, []);

    return (
        <Animated.View style={[styles.bubbleRow, isUser && styles.bubbleRowUser, animStyle]}>
            {!isUser && (
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>🤖</Text>
                </View>
            )}
            <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
                <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
                    {msg.content}
                </Text>
                <Text style={[styles.bubbleTime, isUser && { color: 'rgba(255,255,255,0.6)' }]}>
                    {msg.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        </Animated.View>
    );
}

// ── Deficiency Alert Card ──────────────────────────────────────────────────────
function DeficiencyCard({ d }: { d: DeficiencyResult }) {
    const bg = d.type === 'iron' ? '#FFF8E7' : d.type === 'protein' ? '#EEF9F0' : '#FFF3EE';
    const color = d.type === 'iron' ? '#FF9500' : d.type === 'protein' ? '#34C759' : ORANGE;
    const icon = d.type === 'iron' ? 'shield-checkmark' : d.type === 'protein' ? 'barbell-outline' : 'flame';

    return (
        <View style={[styles.defCard, { backgroundColor: bg, borderLeftColor: color }]}>
            <Ionicons name={icon as any} size={16} color={color} />
            <View style={{ flex: 1 }}>
                <Text style={[styles.defTitle, { color }]}>{d.label}</Text>
                <Text style={styles.defSuggestion}>{d.suggestion}</Text>
            </View>
        </View>
    );
}

// ── Quick Prompts ──────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
    'Wie läuft meine Ernährung heute?',
    'Was fehlt mir an Eisen?',
    'Tipps für mehr Protein?',
    'Wochenzusammenfassung erstellen',
];

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function CoachChatScreen() {
    const { goals, getDayTotals, getWeekData, logs } = useCalorie();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [deficiencies, setDeficiencies] = useState<DeficiencyResult[]>([]);
    const [showDefCards, setShowDefCards] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const flatRef = useRef<FlatList>(null);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayTotals = getDayTotals(todayStr);
    const weekData = getWeekData();

    // Load user + history from DB
    useEffect(() => {
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;
            setUserId(session.user.id);

            // Lade letzte 20 Nachrichten
            const { data } = await supabase
                .from('coach_interactions')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (data && data.length > 0) {
                const loaded: Message[] = data.reverse().map(row => ({
                    id: row.id,
                    role: row.role as 'user' | 'assistant',
                    content: row.content,
                    timestamp: new Date(row.created_at),
                }));
                setMessages(loaded);
            } else {
                // Willkommensnachricht
                const welcome: Message = {
                    id: 'welcome',
                    role: 'assistant',
                    content: `Hallo! Ich bin Amy, dein persönlicher Ernährungscoach in MealFlex. 🌟\n\nIch kenne deine Ernährungsziele und kann dir bei Fragen zu Kalorien, Makros und Eisenwerten helfen. Was möchtest du wissen?`,
                    timestamp: new Date(),
                };
                setMessages([welcome]);
            }

            // Mangelanalyse
            const weekWithDetails = weekData.map(d => {
                const t = getDayTotals(d.date);
                return { date: d.date, kcal: t.kcal, iron: t.iron, protein: t.protein };
            });
            const defs = analyzeDeficiencies(weekWithDetails, {
                ironGoal: goals.iron_goal_mg,
                proteinGoal: goals.protein_goal_g,
                kcalGoal: goals.daily_kcal_goal,
            });
            setDeficiencies(defs);
        })();
    }, []);

    const saveMessage = async (role: 'user' | 'assistant', content: string) => {
        if (!userId) return;
        await supabase.from('coach_interactions').insert({ user_id: userId, role, content });
    };

    const buildContext = useCallback(() => {
        const weekWithDetails = weekData.map(d => {
            const t = getDayTotals(d.date);
            return { date: d.date, kcal: t.kcal, iron: t.iron, protein: t.protein };
        });
        const avgKcal = Math.round(weekWithDetails.reduce((s, d) => s + d.kcal, 0) / Math.max(weekWithDetails.length, 1));

        return {
            goal: goals.goal_type,
            todayKcal: todayTotals.kcal,
            kcalGoal: goals.daily_kcal_goal,
            todayProtein: todayTotals.protein,
            proteinGoal: goals.protein_goal_g,
            todayIron: todayTotals.iron,
            ironGoal: goals.iron_goal_mg,
            weekAvgKcal: avgKcal,
            deficiencies: deficiencies.map(d => d.label),
        };
    }, [goals, todayTotals, weekData, deficiencies]);

    const sendMessage = async (text?: string) => {
        const msgText = (text ?? input).trim();
        if (!msgText) return;
        setInput('');

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: msgText,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        await saveMessage('user', msgText);

        setIsTyping(true);
        try {
            let responseText: string;

            if (msgText.toLowerCase().includes('wochenzusammenfassung')) {
                const weekWithDetails = weekData.map(d => {
                    const t = getDayTotals(d.date);
                    return { date: d.date, kcal: t.kcal, iron: t.iron };
                });
                responseText = await generateWeeklySummary({
                    ...buildContext(),
                    weekDays: weekWithDetails,
                });
            } else {
                responseText = await getCoachResponse(msgText, buildContext());
            }

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseText,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMsg]);
            await saveMessage('assistant', responseText);
        } catch (e: any) {
            const errMsg: Message = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: e?.message?.includes('API Key') || e?.message?.includes('fehlt')
                    ? '⚙️ Der Gemini API-Key ist noch nicht konfiguriert. Bitte trage deinen Key in .env ein (EXPO_PUBLIC_GEMINI_API_KEY).'
                    : `Entschuldigung, ich konnte keine Antwort laden. Bitte versuche es erneut. (${e?.message ?? 'Fehler'})`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsTyping(false);
            setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerAvatar}>
                    <Text style={{ fontSize: 22 }}>🤖</Text>
                </View>
                <View>
                    <Text style={styles.headerTitle}>Amy – KI-Coach</Text>
                    <Text style={styles.headerSubtitle}>Gemini 2.5 Flash · Powered by Google</Text>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <FlatList
                    ref={flatRef}
                    data={messages}
                    keyExtractor={m => m.id}
                    renderItem={({ item }) => <MessageBubble msg={item} />}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
                    ListHeaderComponent={
                        <>
                            {/* Heutiger Status */}
                            <View style={styles.statusCard}>
                                <Text style={styles.statusTitle}>Heute im Überblick</Text>
                                <View style={styles.statusRow}>
                                    <View style={styles.statusItem}>
                                        <Text style={[styles.statusValue, { color: ORANGE }]}>{Math.round(todayTotals.kcal)}</Text>
                                        <Text style={styles.statusLabel}>kcal</Text>
                                    </View>
                                    <View style={styles.statusItem}>
                                        <Text style={[styles.statusValue, { color: '#34C759' }]}>{Math.round(todayTotals.protein)}g</Text>
                                        <Text style={styles.statusLabel}>Protein</Text>
                                    </View>
                                    <View style={styles.statusItem}>
                                        <Text style={[styles.statusValue, { color: '#FF9500' }]}>{todayTotals.iron.toFixed(1)}mg</Text>
                                        <Text style={styles.statusLabel}>Eisen</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Mangelanzeigen */}
                            {showDefCards && deficiencies.length > 0 && (
                                <View style={styles.defSection}>
                                    <View style={styles.defHeader}>
                                        <Text style={styles.defSectionTitle}>⚠️ Mängel erkannt</Text>
                                        <TouchableOpacity onPress={() => setShowDefCards(false)}>
                                            <Ionicons name="close-circle-outline" size={18} color="#CCC" />
                                        </TouchableOpacity>
                                    </View>
                                    {deficiencies.map((d, i) => <DeficiencyCard key={i} d={d} />)}
                                </View>
                            )}
                        </>
                    }
                    ListFooterComponent={
                        isTyping ? (
                            <View style={styles.typingIndicator}>
                                <ActivityIndicator size="small" color={ORANGE} />
                                <Text style={styles.typingText}>Amy tippt…</Text>
                            </View>
                        ) : null
                    }
                />

                {/* Quick Prompts */}
                {messages.length <= 1 && (
                    <View style={styles.quickPrompts}>
                        {QUICK_PROMPTS.map(p => (
                            <TouchableOpacity key={p} style={styles.quickChip} onPress={() => sendMessage(p)}>
                                <Text style={styles.quickChipText}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Input */}
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.textInput}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Frag Amy etwas…"
                        placeholderTextColor="#C0C0C0"
                        multiline
                        maxLength={500}
                        returnKeyType="send"
                        onSubmitEditing={() => sendMessage()}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, (!input.trim() || isTyping) && { opacity: 0.4 }]}
                        onPress={() => sendMessage()}
                        disabled={!input.trim() || isTyping}
                    >
                        <Ionicons name="send" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.disclaimer}>
                    Amy ist kein Arzt. Bei gesundheitlichen Problemen bitte einen Arzt aufsuchen.
                </Text>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },

    header: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
        backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    headerAvatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#FFF3EE', alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: ORANGE,
    },
    headerTitle: { fontSize: 17, fontWeight: '800', color: '#111' },
    headerSubtitle: { fontSize: 11, color: '#999', marginTop: 1 },

    messageList: { paddingHorizontal: 16, paddingBottom: 8 },

    // Status
    statusCard: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginVertical: 12,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    },
    statusTitle: { fontSize: 12, fontWeight: '700', color: '#999', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
    statusRow: { flexDirection: 'row', justifyContent: 'space-around' },
    statusItem: { alignItems: 'center', gap: 2 },
    statusValue: { fontSize: 22, fontWeight: '800' },
    statusLabel: { fontSize: 11, color: '#AAA' },

    // Deficiencies
    defSection: { marginBottom: 12 },
    defHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    defSectionTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
    defCard: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 10,
        backgroundColor: '#FFF8E7', borderRadius: 12, padding: 12, marginBottom: 8,
        borderLeftWidth: 3,
    },
    defTitle: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
    defSuggestion: { fontSize: 12, color: '#666', lineHeight: 18 },

    // Bubbles
    bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 4 },
    bubbleRowUser: { flexDirection: 'row-reverse' },
    avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF3EE', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 18 },
    bubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
    bubbleUser: { backgroundColor: ORANGE, borderBottomRightRadius: 4 },
    bubbleAssistant: { backgroundColor: '#FFF', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
    bubbleText: { fontSize: 15, color: '#222', lineHeight: 22 },
    bubbleTextUser: { color: '#FFF' },
    bubbleTime: { fontSize: 10, color: '#AAA', marginTop: 4 },

    // Typing
    typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
    typingText: { fontSize: 13, color: '#AAA', fontStyle: 'italic' },

    // Quick prompts
    quickPrompts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
    quickChip: { backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#F0F0F0' },
    quickChipText: { fontSize: 13, color: '#555', fontWeight: '600' },

    // Input
    inputRow: {
        flexDirection: 'row', alignItems: 'flex-end', gap: 10,
        paddingHorizontal: 16, paddingVertical: 10,
        backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0',
    },
    textInput: {
        flex: 1, backgroundColor: '#F5F5F5', borderRadius: 22,
        paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10,
        fontSize: 15, color: '#111', maxHeight: 100,
    },
    sendBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center',
        shadowColor: ORANGE, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    },
    disclaimer: { textAlign: 'center', fontSize: 10, color: '#CCC', paddingBottom: 6, paddingTop: 2 },
});
