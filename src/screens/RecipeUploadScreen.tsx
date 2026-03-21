import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
    ScrollView, TextInput, Switch, Alert, Image, ActionSheetIOS, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCommunity, UploadDraft } from '../context/CommunityContext';
import { NutritionGoal, CookingStyle } from '../types/recipe';
import { pickRecipeImage } from '../services/communityService';

const STEPS = ['Grundinfos', 'Nährwerte', 'Zutaten', 'Zubereitung', 'Fertigstellen'];

const CUISINE_OPTIONS = [
    '🍜 Asiatisch', '🍝 Italienisch', '🫒 Mediterran', '🌭 Deutsch',
    '🍔 Amerikanisch', '🌮 Mexikanisch', '🍛 Indisch', '🥙 Griechisch', '🐟 Skandinavisch',
];

const TAG_OPTIONS = [
    'high-protein', 'low-carb', 'vegan', 'keto', 'quick',
    'bulk', 'mealprep-friendly', 'breakfast', 'fish', 'bowl',
];

const UNITS = ['g', 'ml', 'stk', 'el', 'tl', 'prise', 'scheibe'];

// ── Shared UI Components ──────────────────────────────────────────
function Label({ text, required }: { text: string; required?: boolean }) {
    return (
        <Text style={s.label}>
            {text}{required && <Text style={{ color: '#FA4A0C' }}> *</Text>}
        </Text>
    );
}

function Field({ placeholder, value, onChange, multiline, keyboardType }: any) {
    return (
        <TextInput
            style={[s.input, multiline && s.inputMulti]}
            placeholder={placeholder}
            placeholderTextColor="#C0C0C0"
            value={value}
            onChangeText={onChange}
            multiline={multiline}
            keyboardType={keyboardType || 'default'}
            textAlignVertical={multiline ? 'top' : 'center'}
        />
    );
}

// ── Step 1: Basic Info ────────────────────────────────────────────
function Step1({ draft, update }: { draft: UploadDraft; update: (p: Partial<UploadDraft>) => void }) {
    const cuisineValue = draft.cuisine.replace(/^[^\s]+ /, '');

    return (
        <View style={s.stepBody}>
            <Label text="Titel" required />
            <Field
                placeholder="z.B. Hähnchen Teriyaki Bowl"
                value={draft.title}
                onChange={(t: string) => update({ title: t })}
            />

            <Label text="Kurzbeschreibung" required />
            <Field
                placeholder="Was macht dieses Gericht besonders?"
                value={draft.description}
                onChange={(t: string) => update({ description: t })}
                multiline
            />

            <Label text="Küche" />
            <View style={s.chipGrid}>
                {CUISINE_OPTIONS.map(c => {
                    const clean = c.replace(/^[^\s]+ /, '');
                    const isActive = draft.cuisine === clean || draft.cuisine === c;
                    return (
                        <TouchableOpacity
                            key={c}
                            style={[s.chip, isActive && s.chipOn]}
                            onPress={() => update({ cuisine: isActive ? '' : clean })}
                        >
                            <Text style={[s.chipText, isActive && s.chipTextOn]}>{c}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Label text="Vorbereitungszeit (Minuten)" />
            <Field
                placeholder="20"
                value={draft.prepTime > 0 ? String(draft.prepTime) : ''}
                onChange={(t: string) => update({ prepTime: parseInt(t) || 0 })}
                keyboardType="numeric"
            />
        </View>
    );
}

// ── Step 2: Macros ───────────────────────────────────────────────
function Step2({ draft, update }: { draft: UploadDraft; update: (p: Partial<UploadDraft>) => void }) {
    const total = draft.protein * 4 + draft.carbs * 4 + draft.fat * 9;
    const pct = total > 0
        ? { p: Math.round(draft.protein * 4 / total * 100), c: Math.round(draft.carbs * 4 / total * 100) }
        : { p: 33, c: 34 };

    return (
        <View style={s.stepBody}>
            <View style={s.macroGrid}>
                {[
                    { label: '🔥 Kalorien', key: 'calories', color: '#FF6B35' },
                    { label: '💪 Protein (g)', key: 'protein', color: '#4CAF50' },
                    { label: '🌾 Carbs (g)', key: 'carbs', color: '#2196F3' },
                    { label: '🥑 Fett (g)', key: 'fat', color: '#FF9800' },
                ].map(({ label, key, color }) => (
                    <View key={key} style={s.macroBox}>
                        <Text style={[s.macroLabel, { color }]}>{label}</Text>
                        <TextInput
                            style={[s.macroInput, { borderColor: color + '40' }]}
                            keyboardType="numeric"
                            value={(draft as any)[key] > 0 ? String((draft as any)[key]) : ''}
                            onChangeText={t => update({ [key]: parseInt(t) || 0 } as any)}
                            placeholder="0"
                            placeholderTextColor="#CCC"
                        />
                    </View>
                ))}
            </View>

            {total > 0 && (
                <View style={s.macroBarCard}>
                    <Text style={s.macroBarTitle}>Macro-Verteilung</Text>
                    <View style={s.macroBarTrack}>
                        <View style={[s.macroBarSeg, { flex: pct.p, backgroundColor: '#4CAF50' }]} />
                        <View style={[s.macroBarSeg, { flex: pct.c, backgroundColor: '#2196F3' }]} />
                        <View style={[s.macroBarSeg, { flex: Math.max(100 - pct.p - pct.c, 0), backgroundColor: '#FF9800' }]} />
                    </View>
                    <View style={s.macroBarLegend}>
                        <Text style={[s.legendDot, { color: '#4CAF50' }]}>● Protein {pct.p}%</Text>
                        <Text style={[s.legendDot, { color: '#2196F3' }]}>● Carbs {pct.c}%</Text>
                        <Text style={[s.legendDot, { color: '#FF9800' }]}>● Fett {100 - pct.p - pct.c}%</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

// ── Step 3: Ingredients ──────────────────────────────────────────
function Step3({ draft, update }: { draft: UploadDraft; update: (p: Partial<UploadDraft>) => void }) {
    const setIngredient = (i: number, field: string, val: string) => {
        update({ ingredients: draft.ingredients.map((ing, idx) => idx === i ? { ...ing, [field]: val } : ing) });
    };
    const add = () => update({ ingredients: [...draft.ingredients, { name: '', amount: '', unit: 'g' }] });
    const remove = (i: number) => {
        if (draft.ingredients.length <= 1) return;
        update({ ingredients: draft.ingredients.filter((_, idx) => idx !== i) });
    };

    return (
        <View style={s.stepBody}>
            {draft.ingredients.map((ing, i) => (
                <View key={i} style={s.ingRow}>
                    <View style={s.ingInputs}>
                        <TextInput
                            style={[s.input, s.ingName]}
                            placeholder="Zutat"
                            placeholderTextColor="#C0C0C0"
                            value={ing.name}
                            onChangeText={t => setIngredient(i, 'name', t)}
                        />
                        <TextInput
                            style={[s.input, s.ingAmt]}
                            placeholder="100"
                            placeholderTextColor="#C0C0C0"
                            keyboardType="numeric"
                            value={ing.amount}
                            onChangeText={t => setIngredient(i, 'amount', t)}
                        />
                    </View>
                    <View style={s.unitRow}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {UNITS.map(u => (
                                <TouchableOpacity
                                    key={u}
                                    style={[s.unitChip, ing.unit === u && s.unitChipOn]}
                                    onPress={() => setIngredient(i, 'unit', u)}
                                >
                                    <Text style={[s.unitText, ing.unit === u && s.unitTextOn]}>{u}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity onPress={() => remove(i)} style={s.deleteBtn}>
                            <Ionicons name="trash-outline" size={16} color="#E53935" />
                        </TouchableOpacity>
                    </View>
                </View>
            ))}

            <TouchableOpacity style={s.addRow} onPress={add}>
                <Ionicons name="add-circle" size={22} color="#FA4A0C" />
                <Text style={s.addText}>Zutat hinzufügen</Text>
            </TouchableOpacity>
        </View>
    );
}

// ── Step 4: Steps ────────────────────────────────────────────────
function Step4({ draft, update }: { draft: UploadDraft; update: (p: Partial<UploadDraft>) => void }) {
    const setStep = (i: number, val: string) =>
        update({ steps: draft.steps.map((s, idx) => idx === i ? val : s) });
    const add = () => update({ steps: [...draft.steps, ''] });
    const remove = (i: number) => {
        if (draft.steps.length <= 1) return;
        update({ steps: draft.steps.filter((_, idx) => idx !== i) });
    };

    return (
        <View style={s.stepBody}>
            {draft.steps.map((step, i) => (
                <View key={i} style={s.stepRow}>
                    <View style={s.stepNum}>
                        <Text style={s.stepNumText}>{i + 1}</Text>
                    </View>
                    <TextInput
                        style={[s.input, s.stepInput]}
                        placeholder={`Schritt ${i + 1} beschreiben...`}
                        placeholderTextColor="#C0C0C0"
                        value={step}
                        onChangeText={t => setStep(i, t)}
                        multiline
                        textAlignVertical="top"
                    />
                    <TouchableOpacity onPress={() => remove(i)} style={s.deleteBtn}>
                        <Ionicons name="trash-outline" size={16} color="#E53935" />
                    </TouchableOpacity>
                </View>
            ))}

            <TouchableOpacity style={s.addRow} onPress={add}>
                <Ionicons name="add-circle" size={22} color="#FA4A0C" />
                <Text style={s.addText}>Schritt hinzufügen</Text>
            </TouchableOpacity>
        </View>
    );
}

// ── Foto-Picker Komponente ────────────────────────────────────────
function PhotoPicker({ uri, onPick }: { uri?: string; onPick: (uri: string) => void }) {
    const handlePress = async () => {
        const choose = async (source: 'gallery' | 'camera') => {
            try {
                const picked = await pickRecipeImage(source);
                if (picked) onPick(picked);
            } catch (e: any) {
                Alert.alert('Fehler', e.message);
            }
        };

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                { options: ['Abbrechen', 'Galerie', 'Kamera'], cancelButtonIndex: 0 },
                (idx) => { if (idx === 1) choose('gallery'); if (idx === 2) choose('camera'); }
            );
        } else {
            Alert.alert('Foto auswählen', '', [
                { text: 'Galerie', onPress: () => choose('gallery') },
                { text: 'Kamera', onPress: () => choose('camera') },
                { text: 'Abbrechen', style: 'cancel' },
            ]);
        }
    };

    if (uri) {
        return (
            <TouchableOpacity style={s.photoPreviewBox} onPress={handlePress}>
                <Image source={{ uri }} style={s.photoPreviewImg} />
                <View style={s.photoEditOverlay}>
                    <Ionicons name="camera" size={20} color="#FFF" />
                    <Text style={s.photoEditText}>Ändern</Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity style={s.photoBox} onPress={handlePress}>
            <Ionicons name="camera-outline" size={36} color="#CCC" />
            <Text style={s.photoText}>Foto aufnehmen oder aus Galerie</Text>
            <Text style={s.photoSub}>JPG / PNG · max. 10 MB</Text>
        </TouchableOpacity>
    );
}

// ── Step 5: Finish ────────────────────────────────────────────────
function Step5({ draft, update }: { draft: UploadDraft; update: (p: Partial<UploadDraft>) => void }) {
    const toggleGoal = (g: NutritionGoal) => {
        const cur = draft.suitableGoals;
        update({ suitableGoals: cur.includes(g) ? cur.filter(x => x !== g) : [...cur, g] });
    };
    const toggleStyle = (s: CookingStyle) => {
        const cur = draft.suitableStyles;
        update({ suitableStyles: cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s] });
    };
    const toggleTag = (t: string) => {
        const cur = draft.tags;
        update({ tags: cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t] });
    };

    return (
        <View style={s.stepBody}>
            {/* Goals */}
            <Label text="Passt zu welchem Ziel?" required />
            <View style={s.optionRow}>
                {(['cut', 'muscle', 'healthy'] as NutritionGoal[]).map(g => {
                    const meta = { cut: { label: 'Cut', emoji: '🔥' }, muscle: { label: 'Muskelaufbau', emoji: '💪' }, healthy: { label: 'Gesund', emoji: '🥗' } }[g];
                    const on = draft.suitableGoals.includes(g);
                    return (
                        <TouchableOpacity key={g} style={[s.optionCard, on && s.optionCardOn]} onPress={() => toggleGoal(g)}>
                            <Text style={s.optionEmoji}>{meta.emoji}</Text>
                            <Text style={[s.optionText, on && s.optionTextOn]}>{meta.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Styles */}
            <Label text="Kochstil" />
            <View style={s.optionRow}>
                {(['mealprep', 'daily'] as CookingStyle[]).map(style => {
                    const meta = { mealprep: { label: 'Mealprep', emoji: '📦' }, daily: { label: 'Täglich', emoji: '🍳' } }[style];
                    const on = draft.suitableStyles.includes(style);
                    return (
                        <TouchableOpacity key={style} style={[s.optionCard, on && s.optionCardOn]} onPress={() => toggleStyle(style)}>
                            <Text style={s.optionEmoji}>{meta.emoji}</Text>
                            <Text style={[s.optionText, on && s.optionTextOn]}>{meta.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Tags */}
            <Label text="Tags" />
            <View style={s.chipGrid}>
                {TAG_OPTIONS.map(t => {
                    const on = draft.tags.includes(t);
                    return (
                        <TouchableOpacity key={t} style={[s.chip, on && s.chipOn]} onPress={() => toggleTag(t)}>
                            <Text style={[s.chipText, on && s.chipTextOn]}>{t}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Foto-Upload */}
            <Label text="Foto (optional)" />
            <PhotoPicker uri={draft.imageUri} onPick={uri => update({ imageUri: uri })} />

            {/* Swap Toggle */}
            <View style={s.swapToggleCard}>
                <View style={{ flex: 1 }}>
                    <Text style={s.swapToggleTitle}>Direkt zum Swap hinzufügen</Text>
                    <Text style={s.swapToggleSub}>Rezept sofort als Swap-Option nutzen</Text>
                </View>
                <Switch
                    value={draft.addToSwap}
                    onValueChange={v => update({ addToSwap: v })}
                    trackColor={{ false: '#E8E8E8', true: '#FA4A0C' }}
                    thumbColor="#FFF"
                />
            </View>
        </View>
    );
}

// ── Main Screen ───────────────────────────────────────────────────
export default function RecipeUploadScreen() {
    const navigation = useNavigation<any>();
    const { uploadDraft, updateUploadDraft, resetUploadDraft, submitRecipe } = useCommunity();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    const canNext = () => {
        if (step === 1) return uploadDraft.title.trim().length >= 3 && uploadDraft.description.trim().length >= 5;
        if (step === 2) return uploadDraft.calories > 0;
        if (step === 3) return uploadDraft.ingredients.some(i => i.name.trim());
        if (step === 4) return uploadDraft.steps.some(s => s.trim());
        if (step === 5) return uploadDraft.suitableGoals.length > 0;
        return true;
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await submitRecipe(uploadDraft);
            Alert.alert('Eingereicht! 🎉', 'Dein Rezept wird geprüft und erscheint dann im Community-Feed.', [
                { text: 'Super!', onPress: () => navigation.goBack() },
            ]);
        } catch {
            Alert.alert('Fehler', 'Bitte versuche es erneut.');
        } finally {
            setSubmitting(false);
        }
    };

    const stepProps = { draft: uploadDraft, update: updateUploadDraft };

    return (
        <SafeAreaView style={s.safeArea}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => step > 1 ? setStep(p => p - 1) : navigation.goBack()} style={s.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={s.headerTitle}>Rezept hinzufügen</Text>
                    <Text style={s.headerSub}>{STEPS[step - 1]}</Text>
                </View>
                <TouchableOpacity onPress={() => { resetUploadDraft(); navigation.goBack(); }}>
                    <Text style={s.cancelText}>Abbrechen</Text>
                </TouchableOpacity>
            </View>

            {/* Step Dots */}
            <View style={s.dotsRow}>
                {STEPS.map((_, i) => (
                    <View
                        key={i}
                        style={[s.dot, i + 1 === step && s.dotActive, i + 1 < step && s.dotDone]}
                    />
                ))}
            </View>

            {/* Content */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={s.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {step === 1 && <Step1 {...stepProps} />}
                {step === 2 && <Step2 {...stepProps} />}
                {step === 3 && <Step3 {...stepProps} />}
                {step === 4 && <Step4 {...stepProps} />}
                {step === 5 && <Step5 {...stepProps} />}
            </ScrollView>

            {/* Footer */}
            <View style={s.footer}>
                {step < STEPS.length ? (
                    <TouchableOpacity
                        style={[s.nextBtn, !canNext() && s.nextBtnOff]}
                        onPress={() => setStep(p => p + 1)}
                        disabled={!canNext()}
                    >
                        <Text style={s.nextBtnText}>Weiter</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFF" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[s.submitBtn, (!canNext() || submitting) && s.nextBtnOff]}
                        onPress={handleSubmit}
                        disabled={!canNext() || submitting}
                    >
                        <Ionicons name="cloud-upload-outline" size={18} color="#FFF" />
                        <Text style={s.nextBtnText}>{submitting ? 'Wird eingereicht...' : 'Einreichen'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFF' },

    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
    headerSub: { fontSize: 12, color: '#999', marginTop: 1 },
    cancelText: { fontSize: 14, color: '#999' },

    dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 16 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E8E8E8' },
    dotActive: { width: 24, backgroundColor: '#FA4A0C' },
    dotDone: { backgroundColor: '#FA4A0C', opacity: 0.35 },

    scroll: { padding: 20, paddingBottom: 40 },
    stepBody: { gap: 16 },

    label: { fontSize: 14, fontWeight: '600', color: '#444' },
    input: {
        backgroundColor: '#F7F7F7', borderRadius: 12, borderWidth: 1, borderColor: '#EBEBEB',
        paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: '#1A1A1A',
    },
    inputMulti: { minHeight: 90, textAlignVertical: 'top' },

    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F4F4F6' },
    chipOn: { backgroundColor: '#1A1A1A' },
    chipText: { fontSize: 13, color: '#555', fontWeight: '500' },
    chipTextOn: { color: '#FFF' },

    macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    macroBox: { width: '47%', gap: 6 },
    macroLabel: { fontSize: 13, fontWeight: '700' },
    macroInput: {
        backgroundColor: '#F7F7F7', borderRadius: 12, borderWidth: 1.5,
        paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: '#1A1A1A', fontWeight: '600',
    },
    macroBarCard: { backgroundColor: '#F7F7F7', borderRadius: 14, padding: 16, gap: 10 },
    macroBarTitle: { fontSize: 13, fontWeight: '600', color: '#555' },
    macroBarTrack: { height: 10, borderRadius: 5, flexDirection: 'row', overflow: 'hidden', backgroundColor: '#E8E8E8' },
    macroBarSeg: { height: 10 },
    macroBarLegend: { flexDirection: 'row', gap: 16 },
    legendDot: { fontSize: 12, fontWeight: '500' },

    ingRow: { gap: 8, backgroundColor: '#F9F9F9', borderRadius: 14, padding: 12 },
    ingInputs: { flexDirection: 'row', gap: 8 },
    ingName: { flex: 1 },
    ingAmt: { width: 80 },
    unitRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    unitChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: '#EBEBEB' },
    unitChipOn: { backgroundColor: '#FA4A0C' },
    unitText: { fontSize: 12, color: '#666' },
    unitTextOn: { color: '#FFF', fontWeight: '600' },
    deleteBtn: { padding: 6 },

    addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
    addText: { fontSize: 15, color: '#FA4A0C', fontWeight: '600' },

    stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FA4A0C', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
    stepNumText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
    stepInput: { flex: 1, minHeight: 70 },

    optionRow: { flexDirection: 'row', gap: 10 },
    optionCard: {
        flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14,
        backgroundColor: '#F4F4F6', borderWidth: 2, borderColor: 'transparent', gap: 4,
    },
    optionCardOn: { borderColor: '#FA4A0C', backgroundColor: '#FFF5F2' },
    optionEmoji: { fontSize: 22 },
    optionText: { fontSize: 12, fontWeight: '600', color: '#666', textAlign: 'center' },
    optionTextOn: { color: '#FA4A0C' },

    photoBox: {
        height: 160, borderRadius: 16, borderWidth: 2, borderColor: '#E8E8E8', borderStyle: 'dashed',
        backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    photoText: { fontSize: 14, color: '#AAA', fontWeight: '600', textAlign: 'center' },
    photoSub: { fontSize: 12, color: '#CCC' },
    photoPreviewBox: { height: 200, borderRadius: 16, overflow: 'hidden' },
    photoPreviewImg: { width: '100%', height: '100%' },
    photoEditOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.45)', flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 6,
    },
    photoEditText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

    swapToggleCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F7F7',
        borderRadius: 14, padding: 16, gap: 12,
    },
    swapToggleTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
    swapToggleSub: { fontSize: 12, color: '#999', marginTop: 2 },

    footer: { padding: 20, paddingBottom: 28, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    nextBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#FA4A0C', borderRadius: 16, paddingVertical: 16,
        shadowColor: '#FA4A0C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#4CAF50', borderRadius: 16, paddingVertical: 16,
        shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    nextBtnOff: { opacity: 0.4, shadowOpacity: 0 },
    nextBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
