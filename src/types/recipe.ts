export type NutritionGoal = 'cut' | 'muscle' | 'healthy';
export type CookingStyle = 'mealprep' | 'daily';
export type Unit = 'g' | 'ml' | 'stk' | 'tl' | 'el' | 'prise' | 'zehe';

export interface Macros {
    protein: number;
    carbs: number;
    fat: number;
}

export interface RecipeIngredient {
    name: string;
    amount: number;
    unit: Unit;
    originalName?: string; // e.g. "Rote Paprika" mapped to normalized "Paprika"
}

export interface Recipe {
    id: string;
    title: string;
    description: string;
    prepTime: number; // in minutes
    portions: number;
    ingredients: RecipeIngredient[];
    steps: string[];
    calories: number;
    macros: Macros;
    tags: string[]; // e.g., 'vegan', 'high-protein', 'low-carb', etc.
    suitableGoals: NutritionGoal[];
    suitableStyles: CookingStyle[];
}
