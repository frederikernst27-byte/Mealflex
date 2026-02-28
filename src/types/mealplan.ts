import { Recipe } from './recipe';

export interface MealSlot {
    id: string; // Eindeutige ID für den Slot
    recipe: Recipe;
    cooked: boolean; // MVP: Ist das Gericht gekocht?
}

export interface DayPlan {
    date: string; // ISO String oder "Montag", "Dienstag"
    dayIndex: number; // 0 = Montag, 6 = Sonntag
    meals: MealSlot[]; // Für das MVP reicht 1 Hauptmahlzeit pro Tag (Lunch/Dinner)
}

export interface WeeklyPlan {
    id: string;
    userId: string;
    weekNumber: number; // Kalenderwoche
    year: number;
    days: DayPlan[];
    createdAt: string;
}
