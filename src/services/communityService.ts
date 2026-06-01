/**
 * communityService.ts
 * Zentrale Schicht für alle Community-Rezepte: Upload, Laden, Foto-Upload.
 */

import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { UploadDraft, CommunityRecipe } from '../context/CommunityContext';

const BUCKET = 'recipe-photos';

// ── Foto aus Galerie / Kamera wählen ─────────────────────────────
export async function pickRecipeImage(source: 'gallery' | 'camera'): Promise<string | null> {
    // Berechtigungen anfragen
    if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') throw new Error('Kamera-Zugriff verweigert. Bitte in den Einstellungen erlauben.');
    } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') throw new Error('Galerie-Zugriff verweigert. Bitte in den Einstellungen erlauben.');
    }

    const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

    if (result.canceled || !result.assets?.[0]) return null;
    return result.assets[0].uri;
}

// ── Foto zu Supabase Storage hochladen ───────────────────────────
export async function uploadRecipePhoto(localUri: string, userId: string): Promise<string> {
    // Datei als Blob lesen
    const response = await fetch(localUri);
    const blob = await response.blob();

    const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const filename = `${userId}/${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(filename, blob, {
            contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
            upsert: false,
        });

    if (error) throw new Error(`Foto-Upload fehlgeschlagen: ${error.message}`);

    // Öffentliche URL zurückgeben
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return urlData.publicUrl;
}

// ── Rezept in Supabase DB speichern ──────────────────────────────
export async function saveRecipeToDb(
    draft: UploadDraft,
    imageUrl: string | undefined,
    userId: string,
    displayName: string,
): Promise<string> {
    const { data, error } = await supabase
        .from('recipes')
        .insert({
            owner_id: userId,
            author_name: displayName,
            title: draft.title,
            description: draft.description,
            cuisine: draft.cuisine,
            prep_time_min: draft.prepTime,
            calories: draft.calories,
            protein: draft.protein,
            carbs: draft.carbs,
            fat: draft.fat,
            ingredients: JSON.stringify(draft.ingredients),
            steps: JSON.stringify(draft.steps),
            tags: draft.tags,
            goals: draft.suitableGoals,
            styles: draft.suitableStyles,
            portions: 1,
            image_url: imageUrl ?? null,
            status: 'pending',
            source_type: 'community',
        })
        .select('id')
        .single();

    if (error) throw new Error(`Rezept konnte nicht gespeichert werden: ${error.message}`);
    return data.id;
}

// ── Genehmigte Community-Rezepte aus DB laden ────────────────────
export async function fetchApprovedRecipes(): Promise<CommunityRecipe[]> {
    const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('status', 'approved')
        .eq('source_type', 'community')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('fetchApprovedRecipes error:', error);
        return [];
    }

    return (data ?? []).map(rowToRecipe);
}

// ── Eigene Rezepte des Users laden (inkl. pending) ───────────────
export async function fetchMyRecipes(userId: string): Promise<CommunityRecipe[]> {
    const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('fetchMyRecipes error:', error);
        return [];
    }

    return (data ?? []).map(rowToRecipe);
}

// ── Gespeicherte Rezept-IDs des Users laden ──────────────────────
export async function fetchSavedRecipeIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('saved_recipes')
        .select('recipe_id')
        .eq('user_id', userId);

    if (error) return [];
    return (data ?? []).map(r => r.recipe_id);
}

// ── Save-Status toggeln ──────────────────────────────────────────
export async function toggleSaveDb(
    userId: string,
    recipeId: string,
    currentlySaved: boolean,
): Promise<void> {
    if (currentlySaved) {
        await supabase.from('saved_recipes').delete()
            .eq('user_id', userId).eq('recipe_id', recipeId);
    } else {
        await supabase.from('saved_recipes').upsert({
            user_id: userId,
            recipe_id: recipeId,
        });
    }
}

// ── Like toggeln ─────────────────────────────────────────────────
export async function toggleLikeDb(
    userId: string,
    recipeId: string,
    currentlyLiked: boolean,
): Promise<void> {
    if (currentlyLiked) {
        await supabase.from('recipe_likes').delete()
            .eq('user_id', userId).eq('recipe_id', recipeId);
    } else {
        await supabase.from('recipe_likes').upsert({
            user_id: userId,
            recipe_id: recipeId,
        });
    }
}

// ── DB-Zeile → CommunityRecipe ────────────────────────────────────
function rowToRecipe(row: any): CommunityRecipe {
    let ingredients: any[] = [];
    let steps: string[] = [];
    try { ingredients = typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : (row.ingredients ?? []); } catch {}
    try { steps = typeof row.steps === 'string' ? JSON.parse(row.steps) : (row.steps ?? []); } catch {}

    return {
        id: row.id,
        title: row.title ?? '',
        description: row.description ?? '',
        prepTime: row.prep_time_min ?? 0,
        portions: row.portions ?? 1,
        calories: row.calories ?? row.kcal ?? 0,
        macros: {
            protein: row.protein ?? row.protein_g ?? 0,
            carbs: row.carbs ?? row.carbs_g ?? 0,
            fat: row.fat ?? row.fat_g ?? 0,
        },
        tags: row.tags ?? [],
        suitableGoals: row.goals ?? [],
        suitableStyles: row.styles ?? [],
        ingredients: ingredients.map((i: any) => ({
            name: i.name ?? '',
            amount: typeof i.amount === 'number' ? i.amount : parseFloat(i.amount ?? '0') || 0,
            unit: i.unit ?? 'g',
        })),
        steps,
        imageUrl: row.image_url ?? undefined,
        cuisine: row.cuisine ?? '',
        source: 'community',
        authorId: row.owner_id ?? '',
        authorName: row.author_name ?? 'Anonym',
        status: row.status ?? 'pending',
        uploadedAt: row.created_at ?? new Date().toISOString(),
        saveCount: row.save_count ?? 0,
        likeCount: row.like_count ?? 0,
        ratingAvg: parseFloat(row.rating_avg ?? '0'),
        ratingCount: row.rating_count ?? 0,
        sourceType: row.source_type ?? 'community',
    };
}
