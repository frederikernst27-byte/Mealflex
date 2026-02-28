import { Recipe } from '../types/recipe';

// T11 - Rezeptdatenmodell & Seed.
// Hier sind representative Rezepte für den MVP. 
// Ein separates Node.js Admin-Skript könnte diese später per supabase-js in die DB pushen.

export const mockRecipes: Recipe[] = [
    {
        id: 'R1',
        title: 'Hähnchen-Reis-Bowl',
        description: 'Klassisches Meal Prep Gericht für Muskelaufbau.',
        prepTime: 25,
        portions: 1,
        calories: 650,
        macros: { protein: 55, carbs: 70, fat: 12 },
        tags: ['high-protein', 'mealprep-friendly', 'chicken'],
        suitableGoals: ['muscle', 'healthy'],
        suitableStyles: ['mealprep', 'daily'],
        ingredients: [
            { name: 'Hähnchenbrustfilet', amount: 200, unit: 'g' },
            { name: 'Reis', amount: 80, unit: 'g' },
            { name: 'Brokkoli', amount: 150, unit: 'g' },
            { name: 'Olivenöl', amount: 1, unit: 'el' },
        ],
        steps: [
            'Reis nach Packungsanweisung kochen.',
            'Brokkoli in Röschen schneiden und 5 Min. dämpfen.',
            'Hähnchen in Würfel schneiden und in Olivenöl anbraten.',
            'Alles in einer Bowl anrichten.'
        ],
    },
    {
        id: 'R2',
        title: 'Low-Carb Zucchini-Nudeln',
        description: 'Leichtes Abendessen, ideal für den Cut.',
        prepTime: 15,
        portions: 1,
        calories: 320,
        macros: { protein: 25, carbs: 15, fat: 18 },
        tags: ['low-carb', 'vegan', 'quick'],
        suitableGoals: ['cut', 'healthy'],
        suitableStyles: ['daily'],
        ingredients: [
            { name: 'Zucchini', amount: 1, unit: 'stk' },
            { name: 'Cherrytomaten', amount: 150, unit: 'g' },
            { name: 'Tofu (Räucher)', amount: 100, unit: 'g' },
            { name: 'Olivenöl', amount: 1, unit: 'el' },
        ],
        steps: [
            'Zucchini mit einem Spiralschneider zu Nudeln (Zoodles) verarbeiten.',
            'Tofu würfeln und in der Pfanne knusprig anbraten.',
            'Tomaten halbieren und kurz mitbraten.',
            'Zoodles unterheben und 2 Min. erwärmen. Nicht verkochen lassen!'
        ],
    },
    {
        id: 'R3',
        title: 'Protein-Oatmeal',
        description: 'Schnelles und nahrhaftes Frühstück für jeden Tag.',
        prepTime: 10,
        portions: 1,
        calories: 450,
        macros: { protein: 30, carbs: 55, fat: 10 },
        tags: ['breakfast', 'high-protein', 'sweet'],
        suitableGoals: ['muscle', 'healthy', 'cut'],
        suitableStyles: ['mealprep', 'daily'],
        ingredients: [
            { name: 'Haferflocken', amount: 70, unit: 'g' },
            { name: 'Whey Protein (Vanille)', amount: 30, unit: 'g' },
            { name: 'Mandelmilch', amount: 200, unit: 'ml' },
            { name: 'Beerenmix (TK)', amount: 100, unit: 'g' },
        ],
        steps: [
            'Haferflocken mit Mandelmilch in einem Topf kurz aufkochen.',
            'Topf vom Herd nehmen und das Proteinpulver zügig unterrühren.',
            'TK-Beeren als Topping darauf geben und genießen.'
        ],
    },
    {
        id: 'R4',
        title: 'Lachs mit Süßkartoffel-Püree',
        description: 'Viel Omega-3 und gute Carbs für die Regeneration.',
        prepTime: 30,
        portions: 1,
        calories: 580,
        macros: { protein: 35, carbs: 45, fat: 28 },
        tags: ['fish', 'healthy-fats', 'post-workout'],
        suitableGoals: ['muscle', 'healthy'],
        suitableStyles: ['daily'],
        ingredients: [
            { name: 'Lachsfilet', amount: 150, unit: 'g' },
            { name: 'Süßkartoffel', amount: 200, unit: 'g' },
            { name: 'Spinat', amount: 100, unit: 'g' },
            { name: 'Olivenöl', amount: 1, unit: 'el' },
        ],
        steps: [
            'Süßkartoffel schälen, würfeln und in Salzwasser weichkochen. Danach pürieren.',
            'Lachsfilet in der Pfanne von beiden Seiten ca. 4 Min. anbraten.',
            'Spinat in der gleichen Pfanne kurz zusammenfallen lassen.',
            'Zervieren und abschmecken.'
        ],
    },
    {
        id: 'R5',
        title: 'Schneller Kichererbsen-Thunfisch-Salat',
        description: 'Perfekt fürs Büro oder als kalter Prep.',
        prepTime: 10,
        portions: 1,
        calories: 410,
        macros: { protein: 40, carbs: 35, fat: 10 },
        tags: ['cold', 'high-protein', 'no-cook'],
        suitableGoals: ['cut', 'healthy', 'muscle'],
        suitableStyles: ['mealprep', 'daily'],
        ingredients: [
            { name: 'Kichererbsen (Dose)', amount: 150, unit: 'g' },
            { name: 'Thunfisch (im eigenen Saft)', amount: 100, unit: 'g' },
            { name: 'Rote Zwiebel', amount: 0.5, unit: 'stk' },
            { name: 'Tomaten', amount: 1, unit: 'stk' },
            { name: 'Olivenöl', amount: 1, unit: 'el' },
        ],
        steps: [
            'Kichererbsen abspülen und abtropfen lassen.',
            'Zwiebel und Tomate in kleine Würfel schneiden.',
            'Alle Zutaten in einer Schüssel vermengen, mit Salz und Pfeffer abschmecken.'
        ],
    },
];
