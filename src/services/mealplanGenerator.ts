import { OnboardingData } from '../context/OnboardingContext';
import { mockRecipes } from '../data/mockRecipes';
import { WeeklyPlan, DayPlan, MealSlot } from '../types/mealplan';
import { Recipe } from '../types/recipe';

// Hilfsfunktion: Kalenderwoche berechnen
const getWeekNumber = (d: Date): number => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const generateMealPlan = (userId: string, prefs: OnboardingData): WeeklyPlan => {
    // 1. FILTERING (T13)
    const availableRecipes = mockRecipes.filter((recipe) => {
        // Ziel muss passen
        if (!recipe.suitableGoals.includes(prefs.goal as any)) return false;

        // Stil muss passen
        if (!recipe.suitableStyles.includes(prefs.cookingStyle as any)) return false;

        // Zeitbudget beachten
        if (recipe.prepTime > prefs.maxTime) return false;

        // Allergien/No-Gos filtern (Einfacher String-Match)
        if (prefs.allergies.length > 0) {
            const hasAllergy = recipe.ingredients.some((ing) =>
                prefs.allergies.some((allergy) => ing.name.toLowerCase().includes(allergy.toLowerCase()))
            );
            if (hasAllergy) return false;
        }

        return true;
    });

    // Falls keine nach den strikten Filtern übrig bleiben, nehmen wir einfach alle MockRezepte (Fallback für MVP)
    let pool = availableRecipes;
    if (pool.length === 0) {
        // Logik für MVP: Notfall-Fallback, damit der User zumindest Rezepte zum Testen hat
        pool = mockRecipes;
    }
    // 2. ALLOCATION (T14 - Mealprep vs Daily Logik)
    const days: DayPlan[] = [];
    const weekDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

    if (prefs.cookingStyle === 'mealprep') {
        // Mealprep: Weniger kochen, mehr Reste. Z.B. 2-3 Rezepte für 7 Tage
        const r1 = pool[0];
        const r2 = pool[1 % pool.length];
        const r3 = pool[2 % pool.length];

        for (let i = 0; i < 7; i++) {
            let selectedRecipe: Recipe;
            if (i < 3) selectedRecipe = r1; // Mo-Mi
            else if (i < 5) selectedRecipe = r2; // Do-Fr
            else selectedRecipe = r3; // Sa-So

            const mealSlot: MealSlot = {
                id: `ms-${i}-${Date.now()}`,
                recipe: selectedRecipe,
                cooked: false,
            };

            days.push({
                date: weekDays[i],
                dayIndex: i,
                meals: [mealSlot],
            });
        }
    } else {
        // Daily: Möglichst jeden Tag etwas Neues
        for (let i = 0; i < 7; i++) {
            const selectedRecipe = pool[i % pool.length];

            const mealSlot: MealSlot = {
                id: `ms-${i}-${Date.now()}`,
                recipe: selectedRecipe,
                cooked: false,
            };

            days.push({
                date: weekDays[i],
                dayIndex: i,
                meals: [mealSlot],
            });
        }
    }

    // 3. PLAN ERSTELLEN (T15)
    const now = new Date();

    return {
        id: `plan-${now.getTime()}`,
        userId,
        weekNumber: getWeekNumber(now),
        year: now.getFullYear(),
        days,
        createdAt: now.toISOString(),
    };
};
