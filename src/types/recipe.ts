export type NutritionGoal = 'cut' | 'muscle' | 'healthy';
export type CookingStyle = 'mealprep' | 'daily';
export type Unit = 'g' | 'ml' | 'stk' | 'tl' | 'el' | 'prise' | 'zehe' | 'dose' | 'scheibe' | 'bund';

export interface Macros {
    protein: number;
    carbs: number;
    fat: number;
}

export interface RecipeIngredient {
    name: string;
    amount: number;
    unit: Unit;
    originalName?: string;
}

export interface Recipe {
    id: string;
    title: string;
    description: string;
    prepTime: number;
    portions: number;
    ingredients: RecipeIngredient[];
    steps: string[];
    calories: number;
    macros: Macros;
    tags: string[];
    suitableGoals: NutritionGoal[];
    suitableStyles: CookingStyle[];
    imageUrl?: string;
    source?: 'mock' | 'community';
    authorId?: string;
    authorName?: string;
    cuisine?: string;
    rating?: number;
    ratingCount?: number;
}
