// T12 - Zutatenstandardisierung (Einheiten + Normalisierung)
// Dieses Skript hilft später dabei, aus 7 Rezepten eine saubere Einkaufsliste ohne Duplikate zu generieren.

import { RecipeIngredient, Unit } from '../types/recipe';

/**
 * Normalisiert den Namen einer Zutat (z.B. "Rote Paprika würfeln" -> "Paprika").
 * In einem Produktionssystem würde man das über IDs oder eine relationale Tabelle mit Synonymen lösen.
 */
export const normalizeIngredientName = (rawName: string): string => {
    const name = rawName.toLowerCase().trim();

    // Synonym-Mapping (Hardcoded für MVP)
    if (name.includes('paprika')) return 'Paprika';
    if (name.includes('hähnchen') || name.includes('poulet')) return 'Hähnchenbrustfilet';
    if (name.includes('reis')) return 'Reis';
    if (name.includes('tomate') && name.includes('cherry')) return 'Cherrytomaten';
    if (name.includes('tomate')) return 'Tomaten';
    if (name.includes('zwiebel') && name.includes('rot')) return 'Rote Zwiebel';
    if (name.includes('zwiebel') && !name.includes('rot')) return 'Zwiebel';
    if (name.includes('knoblauch')) return 'Knoblauch';
    if (name.includes('haferflocken')) return 'Haferflocken';
    if (name.includes('olivenöl')) return 'Olivenöl';
    if (name.includes('salz')) return 'Salz';
    if (name.includes('pfeffer')) return 'Pfeffer';

    // Fallback: Erster Buchstabe groß
    return rawName.charAt(0).toUpperCase() + rawName.slice(1);
};

/**
 * Hilfsfunktion zum Aggregieren einer Einkaufsliste.
 * Fasst gleiche Zutaten und Einheiten zusammen.
 */
export const aggregateShoppingList = (ingredients: RecipeIngredient[]): RecipeIngredient[] => {
    const list = new Map<string, RecipeIngredient>();

    for (const item of ingredients) {
        const key = `${item.name}-${item.unit}`; // "Paprika-stk"

        if (list.has(key)) {
            const existing = list.get(key)!;
            list.set(key, { ...existing, amount: existing.amount + item.amount });
        } else {
            list.set(key, { ...item }); // Deep copy avoids mutating the original recipe recipe instances
        }
    }

    return Array.from(list.values());
};
