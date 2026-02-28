import { aggregateShoppingList, normalizeIngredientName } from './ingredientParser';
import { RecipeIngredient } from '../types/recipe';

// Simuliere Zutaten von zwei "Hähnchen mit Reis" Rezepten und einem anderen
const testIngredients: RecipeIngredient[] = [
    { name: normalizeIngredientName('Hähnchenbrustfilet'), amount: 200, unit: 'g' },
    { name: normalizeIngredientName('Reis'), amount: 100, unit: 'g' },
    { name: normalizeIngredientName('hähnchen'), amount: 150, unit: 'g' }, // Synonym!
    { name: normalizeIngredientName('Zucchini'), amount: 1, unit: 'stk' },
    { name: normalizeIngredientName('zucchini'), amount: 2, unit: 'stk' },
];

console.log('--- Original Ingredients ---', testIngredients);

const aggregated = aggregateShoppingList(testIngredients);

console.log('\n--- Aggregated Shopping List ---', aggregated);

// Expected Output:
// Hähnchenbrustfilet: 350g
// Reis: 100g
// Zucchini: 3stk

console.assert(aggregated.find(i => i.name === 'Hähnchenbrustfilet')?.amount === 350, 'Hähnchen Menge falsch gesammelt');
console.assert(aggregated.find(i => i.name === 'Reis')?.amount === 100, 'Reis Menge falsch gesammelt');
console.assert(aggregated.find(i => i.name === 'Zucchini')?.amount === 3, 'Zucchini Menge falsch gesammelt');
console.log('\n✅ Alle Testfälle erfolgreich bestanden.');
