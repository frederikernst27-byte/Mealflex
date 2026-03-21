import { ParsedFood } from '../context/CalorieContext';

// ── Gemini 2.5 Flash API ───────────────────────────────────────────────────────
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function getGeminiKey(): string {
    const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!key || key === 'DEIN_GEMINI_API_KEY_HIER') {
        throw new Error('Gemini API Key fehlt. Bitte EXPO_PUBLIC_GEMINI_API_KEY in .env setzen (von aistudio.google.com/app/apikey).');
    }
    return key;
}

async function callGemini(systemPrompt: string, userMessage: string, maxTokens = 1024): Promise<string> {
    const key = getGeminiKey();
    const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${key}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            generationConfig: {
                maxOutputTokens: maxTokens,
                temperature: 0.4,
            },
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API Fehler ${response.status}: ${err}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ── Food Parsing ──────────────────────────────────────────────────────────────
const PARSE_SYSTEM = `Du bist ein präziser Ernährungs-Assistent.
Analysiere die Texteingabe und extrahiere alle Lebensmittel mit Mengen und Nährwerten.
Antworte NUR mit einem JSON-Array, kein weiterer Text.

Regeln:
- Erkenne Mengenangaben: "200g", "1 Ei", "2 EL Olivenöl", "1 Tasse Reis", "eine Portion"
- Bei fehlender Menge: schätze typische Portion
- EL=Esslöffel(~15g), TL=Teelöffel(~5g), Stück/Ei(~60g), Tasse(~240ml), Portion(~150g)
- Eisenwert (iron_mg) ist wichtig für die Mangelanalyse
- Alle Werte pro angegebene Menge (NICHT per 100g)

Antwortformat (nur JSON):
[{"name":"Hähnchenbrust","amount_g":200,"kcal":330,"protein_g":62.0,"carbs_g":0.0,"fat_g":7.2,"iron_mg":1.4}]`;

export async function parseFoodWithGemini(rawText: string): Promise<ParsedFood[]> {
    const content = await callGemini(PARSE_SYSTEM, `Analysiere: "${rawText}"`);

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Keine Lebensmittel erkannt. Versuche konkretere Angaben.');

    const items: any[] = JSON.parse(jsonMatch[0]);
    return items.map(item => ({
        name: String(item.name ?? ''),
        amount_g: Number(item.amount_g ?? 100),
        kcal: Math.round(Number(item.kcal ?? 0)),
        protein: Math.round(Number(item.protein_g ?? 0) * 10) / 10,
        carbs: Math.round(Number(item.carbs_g ?? 0) * 10) / 10,
        fat: Math.round(Number(item.fat_g ?? 0) * 10) / 10,
        iron: Math.round(Number(item.iron_mg ?? 0) * 100) / 100,
    }));
}

// ── AI Coach ─────────────────────────────────────────────────────────────────
export interface CoachContext {
    goal: string;
    todayKcal: number;
    kcalGoal: number;
    todayProtein: number;
    proteinGoal: number;
    todayIron: number;
    ironGoal: number;
    weekAvgKcal?: number;
    deficiencies?: string[];
    recentHistory?: { role: 'user' | 'assistant'; content: string }[];
}

function buildCoachSystem(ctx: CoachContext): string {
    const goalLabel = ctx.goal === 'cut' ? 'Abnehmen / Kaloriendefizit'
        : ctx.goal === 'muscle' ? 'Muskelaufbau / Kalorienüberschuss'
        : 'Gesunde Ernährung';

    const defStr = ctx.deficiencies && ctx.deficiencies.length > 0
        ? `⚠️ Aktuelle Mängel: ${ctx.deficiencies.join(', ')}`
        : '✅ Keine Mängel erkannt';

    return `Du bist Amy, ein persönlicher KI-Ernährungscoach in MealFlex.
Du sprichst Deutsch, bist motivierend, empathisch und direkt.
Du gibst konkrete, umsetzbare Ernährungsempfehlungen.

Nutzer-Profil heute:
- Ziel: ${goalLabel}
- Kalorien: ${ctx.todayKcal} / ${ctx.kcalGoal} kcal (${Math.round(ctx.todayKcal / Math.max(ctx.kcalGoal, 1) * 100)}%)
- Protein: ${ctx.todayProtein}g / ${ctx.proteinGoal}g
- Eisen: ${ctx.todayIron.toFixed(1)} / ${ctx.ironGoal}mg
${ctx.weekAvgKcal ? `- Wochendurchschnitt: ${ctx.weekAvgKcal} kcal/Tag` : ''}
${defStr}

Regeln:
- Maximal 3-4 Sätze, direkt und freundlich
- Bei Eisenmangel: empfehle Linsen, Spinat, Kürbiskerne, rotes Fleisch + Vitamin C
- Bei Proteinmangel: empfehle Hähnchen, Quark, Eier, Hülsenfrüchte
- Kein medizinischer Rat, kein Ansprechen von Essstörungen ohne Hinweis auf Fachkraft
- Disclaimer wenn nötig: „Ich bin kein Arzt – bei Beschwerden bitte einen Arzt aufsuchen"`;
}

export async function getCoachResponse(userMessage: string, ctx: CoachContext): Promise<string> {
    return callGemini(buildCoachSystem(ctx), userMessage, 400);
}

// ── Deficiency Analysis ───────────────────────────────────────────────────────
export interface DeficiencyResult {
    type: 'iron' | 'protein' | 'calories';
    label: string;
    severity: 'low' | 'high';
    suggestion: string;
}

export function analyzeDeficiencies(
    weekLogs: { date: string; iron: number; protein: number; kcal: number }[],
    goals: { ironGoal: number; proteinGoal: number; kcalGoal: number }
): DeficiencyResult[] {
    const results: DeficiencyResult[] = [];
    if (weekLogs.length < 3) return results;

    const recentDays = weekLogs.slice(-4); // Letzte 4 Tage mit Logs

    const avgIron = recentDays.reduce((s, d) => s + d.iron, 0) / recentDays.length;
    const avgProtein = recentDays.reduce((s, d) => s + d.protein, 0) / recentDays.length;
    const avgKcal = recentDays.reduce((s, d) => s + d.kcal, 0) / recentDays.length;

    if (avgIron < goals.ironGoal * 0.5) {
        results.push({
            type: 'iron',
            label: 'Eisenmangel',
            severity: 'high',
            suggestion: 'Iss mehr Linsen, Spinat, Kürbiskerne oder rotes Fleisch. Vitamin C verbessert die Aufnahme.',
        });
    }

    if (avgProtein < goals.proteinGoal * 0.7) {
        results.push({
            type: 'protein',
            label: 'Zu wenig Protein',
            severity: 'low',
            suggestion: 'Ergänze deine Mahlzeiten mit Hähnchen, Quark, Eiern oder Hülsenfrüchten.',
        });
    }

    if (avgKcal < goals.kcalGoal * 0.75) {
        results.push({
            type: 'calories',
            label: 'Zu wenig Kalorien',
            severity: 'low',
            suggestion: 'Du isst deutlich weniger als dein Ziel. Ergänze nahrhafte Snacks.',
        });
    }

    return results;
}

// ── Weekly Summary ────────────────────────────────────────────────────────────
export async function generateWeeklySummary(ctx: CoachContext & {
    weekDays: { date: string; kcal: number; iron: number }[];
}): Promise<string> {
    const avgKcal = Math.round(ctx.weekDays.reduce((s, d) => s + d.kcal, 0) / Math.max(ctx.weekDays.length, 1));
    const avgIron = (ctx.weekDays.reduce((s, d) => s + d.iron, 0) / Math.max(ctx.weekDays.length, 1)).toFixed(1);
    const bestDay = ctx.weekDays.reduce((best, d) => d.kcal > best.kcal ? d : best, ctx.weekDays[0]);
    const worstDay = ctx.weekDays.reduce((worst, d) => d.kcal < worst.kcal ? d : worst, ctx.weekDays[0]);

    const prompt = `Erstelle eine motivierende Wochen-Zusammenfassung für den Nutzer:
- Durchschnitt: ${avgKcal} kcal/Tag (Ziel: ${ctx.kcalGoal})
- Durchschnitt Eisen: ${avgIron}mg (Ziel: ${ctx.ironGoal}mg)
- Bester Tag: ${bestDay?.date} mit ${bestDay?.kcal} kcal
- Schlechtester Tag: ${worstDay?.date} mit ${worstDay?.kcal} kcal
Gib 3 konkrete Empfehlungen für nächste Woche. Max 150 Wörter.`;

    return callGemini(buildCoachSystem(ctx), prompt, 300);
}
