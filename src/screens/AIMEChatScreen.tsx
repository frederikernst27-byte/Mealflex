import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ── Unified brand colours (same as Daily Challenge widget) ──────────────────
const BLUE   = '#4A8CFF';
const YELLOW = '#FFD166';
const GREEN  = '#43B97F';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
}

// Quick-action chips – three boxes in yellow / green / blue
const SUGGESTIONS = [
    { text: 'Was soll ich heute essen?',   color: YELLOW, textColor: '#1A1A1A' },
    { text: 'Rezeptideen für die Woche',   color: GREEN,  textColor: '#FFFFFF' },
    { text: 'Kaloriengehalt berechnen',    color: BLUE,   textColor: '#FFFFFF' },
];

function getAIResponse(input: string): string {
    const lower = input.toLowerCase();
    if (lower.includes('heute essen') || lower.includes('was soll')) {
        return 'Basierend auf deinem Profil empfehle ich dir heute:\n\n🥣 Haferflocken mit Beeren zum Frühstück\n🥗 Hähnchensalat zum Mittagessen\n🐟 Lachs mit Gemüse zum Abendessen\n\nKlingt das gut? 😊';
    }
    if (lower.includes('rezept') || lower.includes('woche')) {
        return 'Hier sind meine Top-Ideen für diese Woche:\n\n1. 🍝 Pasta Primavera\n2. 🥘 Linsensuppe\n3. 🐟 Lachs mit Quinoa\n4. 🥗 Buddha Bowl\n5. 🍲 Gemüsecurry';
    }
    if (lower.includes('kalori')) {
        return 'Gib mir die Zutaten oder den Lebensmittelnamen, und ich berechne den Kaloriengehalt für dich! 🔢';
    }
    if (lower.includes('protein') || lower.includes('eiweiß')) {
        return 'Für Muskelaufbau empfehle ich 1,6–2,2 g Protein pro kg Körpergewicht täglich.\n\nGute Quellen: Hühnchen 🍗, Quark, Hülsenfrüchte, Tofu! 💪';
    }
    if (lower.includes('abnehm') || lower.includes('diät') || lower.includes('gewicht')) {
        return 'Für nachhaltiges Abnehmen empfehle ich ein moderates Kaloriendefizit von 300–500 kcal täglich. Kombiniere das mit Bewegung für beste Ergebnisse! 🎯';
    }
    if (lower.includes('wasser') || lower.includes('trinken')) {
        return 'Täglich 1,5–2 Liter Wasser sind ideal! 💧 Tipp: Ein Glas Wasser vor jeder Mahlzeit hilft auch beim Sättigungsgefühl.';
    }
    return 'Ich bin AIME, dein persönlicher Ernährungsassistent! Ich helfe dir mit Rezepten, Kalorien und Ernährungstipps. Was möchtest du wissen? 🥦';
}

export default function AIMEChatScreen() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef<ScrollView>(null);

    const sendMessage = useCallback((text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = { id: `u${Date.now()}`, text: text.trim(), isUser: true };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');

        // Slight delay to simulate AI thinking
        setTimeout(() => {
            const aiMsg: Message = {
                id: `a${Date.now()}`,
                text: getAIResponse(text),
                isUser: false,
            };
            setMessages(prev => [...prev, aiMsg]);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
        }, 550);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {/* ── Header ─────────────────────────────────────────────── */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
                        <Ionicons name="menu-outline" size={24} color="#555" />
                    </TouchableOpacity>
                    <View style={styles.headerAvatar}>
                        <Text style={styles.headerAvatarText}>A</Text>
                    </View>
                </View>

                {/* ── Content: welcome OR message list ───────────────────── */}
                {messages.length === 0 ? (
                    /* Welcome state */
                    <View style={styles.welcomeOuter}>
                        <View style={styles.welcomeCenter}>
                            <Text style={styles.welcomeTitle}>
                                Womit kann{'\n'}ich helfen?
                            </Text>
                        </View>
                        {/* Three coloured suggestion chips */}
                        <View style={styles.chipsRow}>
                            {SUGGESTIONS.map((s, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.chip, { backgroundColor: s.color }]}
                                    onPress={() => sendMessage(s.text)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.chipText, { color: s.textColor }]}>
                                        {s.text}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
                    /* Conversation */
                    <ScrollView
                        ref={scrollRef}
                        style={styles.messagesList}
                        contentContainerStyle={styles.messagesContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {messages.map(msg => (
                            <View
                                key={msg.id}
                                style={[styles.msgRow, msg.isUser && styles.msgRowUser]}
                            >
                                {!msg.isUser && (
                                    <View style={styles.aiAvatar}>
                                        <Text style={styles.aiAvatarText}>A</Text>
                                    </View>
                                )}
                                <View
                                    style={[
                                        styles.bubble,
                                        msg.isUser ? styles.bubbleUser : styles.bubbleAI,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.bubbleText,
                                            msg.isUser && styles.bubbleTextUser,
                                        ]}
                                    >
                                        {msg.text}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}

                {/* ── Disclaimer right above the input – NOT below ───────── */}
                <Text style={styles.disclaimer}>
                    AIME ist kein Arzt. Bitte überprüfe alle Antworten.
                </Text>

                {/* ── Input area ─────────────────────────────────────────── */}
                <View style={styles.inputWrapper}>
                    <View style={styles.inputInner}>
                        {/* Text field */}
                        <TextInput
                            style={styles.textInput}
                            placeholder="Frag mich etwas…"
                            placeholderTextColor="#ADADAD"
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={() => sendMessage(inputText)}
                            returnKeyType="send"
                            multiline
                            maxLength={500}
                        />
                        {/* Icon row + send button */}
                        <View style={styles.inputActions}>
                            <TouchableOpacity style={styles.actionIcon}>
                                <Ionicons name="attach-outline" size={22} color="#ADADAD" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionIcon}>
                                <Ionicons name="add-circle-outline" size={22} color="#ADADAD" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionIcon}>
                                <Ionicons name="bulb-outline" size={22} color="#ADADAD" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionIcon}>
                                <Ionicons name="ellipsis-horizontal" size={22} color="#ADADAD" />
                            </TouchableOpacity>
                            <View style={styles.flex} />
                            <TouchableOpacity
                                style={[
                                    styles.sendBtn,
                                    inputText.trim() ? styles.sendBtnActive : null,
                                ]}
                                onPress={() => sendMessage(inputText)}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="arrow-up" size={18} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },

    container: {
        flex: 1,
        backgroundColor: '#EEF2FA',
    },

    // ── Header ──────────────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#EEF2FA',
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: BLUE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerAvatarText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },

    // ── Welcome state ────────────────────────────────────────────────────────
    welcomeOuter: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 8,
    },
    welcomeCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    welcomeTitle: {
        fontSize: 30,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
        lineHeight: 40,
    },
    // Three coloured chips (yellow / green / blue)
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 8,
        marginBottom: 8,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
    },

    // ── Messages ─────────────────────────────────────────────────────────────
    messagesList: { flex: 1 },
    messagesContent: {
        padding: 16,
        gap: 12,
    },
    msgRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    msgRowUser: {
        flexDirection: 'row-reverse',
    },
    aiAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: BLUE,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    aiAvatarText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
    },
    bubbleAI: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
    },
    bubbleUser: {
        backgroundColor: BLUE,
        borderBottomRightRadius: 4,
    },
    bubbleText: {
        fontSize: 15,
        color: '#1A1A1A',
        lineHeight: 22,
    },
    bubbleTextUser: {
        color: '#FFFFFF',
    },

    // ── Disclaimer (moved UP, right above the input field) ───────────────────
    disclaimer: {
        textAlign: 'center',
        fontSize: 11,
        color: '#ADADAD',
        paddingHorizontal: 20,
        paddingBottom: 5,
    },

    // ── Input ────────────────────────────────────────────────────────────────
    // Minimal paddingBottom so there is NO excess space between field and tab bar
    inputWrapper: {
        paddingHorizontal: 16,
        paddingBottom: 6,
    },
    inputInner: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingTop: 12,
        paddingHorizontal: 14,
        paddingBottom: 8,
    },
    textInput: {
        fontSize: 15,
        color: '#1A1A1A',
        maxHeight: 100,
        paddingBottom: 8,
        paddingTop: 0,
    },
    inputActions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 4,
    },
    actionIcon: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#CCCCCC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtnActive: {
        backgroundColor: '#1A1A1A',
    },
});
