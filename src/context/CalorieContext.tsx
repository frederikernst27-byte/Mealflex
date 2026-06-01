import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface ParsedFood {
    name: string;
    amount_g: number;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    iron: number;
}

export interface CalorieLog {
    id: string;
    user_id: string;
    log_date: string;
    meal_type: MealType;
    raw_text?: string;
    parsed_foods: ParsedFood[];
    total_kcal: number;
    total_protein_g: number;
    total_carbs_g: number;
    total_fat_g: number;
    total_iron_mg: number;
    created_at: string;
}

export interface NutritionGoals {
    daily_kcal_goal: number;
    protein_goal_g: number;
    carbs_goal_g: number;
    fat_goal_g: number;
    iron_goal_mg: number;
    goal_type: string;
}

export interface FoodItem {
    id: string;
    name: string;
    name_aliases: string[];
    kcal_per_100g: number;
    protein_per_100g: number;
    carbs_per_100g: number;
    fat_per_100g: number;
    iron_mg_per_100g: number;
    fiber_g_per_100g: number;
    category: string;
}

interface CalorieContextType {
    logs: CalorieLog[];
    goals: NutritionGoals;
    currentDate: string;
    isLoading: boolean;
    setCurrentDate: (date: string) => void;
    addLog: (log: Omit<CalorieLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
    deleteLog: (logId: string) => Promise<void>;
    updateGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
    searchFoods: (query: string) => Promise<FoodItem[]>;
    parseFoodText: (text: string) => Promise<ParsedFood[]>;
    getDayTotals: (date: string) => { kcal: number; protein: number; carbs: number; fat: number; iron: number };
    getWeekData: () => { date: string; kcal: number }[];
    getLogsForDate: (date: string) => CalorieLog[];
}

const DEFAULT_GOALS: NutritionGoals = {
    daily_kcal_goal: 2000,
    protein_goal_g: 150,
    carbs_goal_g: 200,
    fat_goal_g: 65,
    iron_goal_mg: 10,
    goal_type: 'healthy',
};

const CalorieContext = createContext<CalorieContextType | undefined>(undefined);

function todayStr(): string {
    return new Date().toISOString().split('T')[0];
}

export function CalorieProvider({ children }: { children: React.ReactNode }) {
    const [logs, setLogs] = useState<CalorieLog[]>([]);
    const [goals, setGoals] = useState<NutritionGoals>(DEFAULT_GOALS);
    const [currentDate, setCurrentDate] = useState(todayStr());
    const [isLoading, setIsLoading] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            // Letzte 7 Tage laden
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const fromDate = sevenDaysAgo.toISOString().split('T')[0];

            const { data: logsData } = await supabase
                .from('calorie_logs')
                .select('*')
                .eq('user_id', session.user.id)
                .gte('log_date', fromDate)
                .order('created_at', { ascending: false });

            if (logsData) {
                setLogs(logsData.map(row => ({
                    ...row,
                    parsed_foods: Array.isArray(row.parsed_foods) ? row.parsed_foods : [],
                })));
            }

            // Ziele laden
            const { data: goalsData } = await supabase
                .from('nutrition_goals')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();

            if (goalsData) {
                setGoals({
                    daily_kcal_goal: goalsData.daily_kcal_goal,
                    protein_goal_g: goalsData.protein_goal_g,
                    carbs_goal_g: goalsData.carbs_goal_g,
                    fat_goal_g: goalsData.fat_goal_g,
                    iron_goal_mg: goalsData.iron_goal_mg,
                    goal_type: goalsData.goal_type,
                });
            } else {
                // Ziele aus Onboarding-Profil ableiten
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('goal')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (profile?.goal) {
                    const derived = deriveGoalsFromProfile(profile.goal);
                    setGoals(derived);
                    // In DB speichern
                    await supabase.from('nutrition_goals').upsert({
                        user_id: session.user.id,
                        ...derived,
                        updated_at: new Date().toISOString(),
                    });
                }
            }
        } catch (e) {
            console.error('CalorieContext loadData error:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const addLog = async (log: Omit<CalorieLog, 'id' | 'user_id' | 'created_at'>) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
            .from('calorie_logs')
            .insert({
                user_id: session.user.id,
                ...log,
            })
            .select()
            .single();

        if (!error && data) {
            setLogs(prev => [{ ...data, parsed_foods: data.parsed_foods ?? [] }, ...prev]);
        }
    };

    const deleteLog = async (logId: string) => {
        await supabase.from('calorie_logs').delete().eq('id', logId);
        setLogs(prev => prev.filter(l => l.id !== logId));
    };

    const updateGoals = async (newGoals: Partial<NutritionGoals>) => {
        const updated = { ...goals, ...newGoals };
        setGoals(updated);

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await supabase.from('nutrition_goals').upsert({
                user_id: session.user.id,
                ...updated,
                updated_at: new Date().toISOString(),
            });
        }
    };

    const searchFoods = async (query: string): Promise<FoodItem[]> => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();

        const { data } = await supabase
            .from('food_database')
            .select('*')
            .or(`name.ilike.%${q}%`)
            .limit(10);

        return (data ?? []) as FoodItem[];
    };

    const parseFoodText = async (_text: string): Promise<ParsedFood[]> => {
        return [];
    };

    const getDayTotals = (date: string) => {
        const dayLogs = logs.filter(l => l.log_date === date);
        return dayLogs.reduce(
            (acc, l) => ({
                kcal: acc.kcal + l.total_kcal,
                protein: acc.protein + l.total_protein_g,
                carbs: acc.carbs + l.total_carbs_g,
                fat: acc.fat + l.total_fat_g,
                iron: acc.iron + l.total_iron_mg,
            }),
            { kcal: 0, protein: 0, carbs: 0, fat: 0, iron: 0 }
        );
    };

    const getWeekData = () => {
        const days: { date: string; kcal: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const totals = getDayTotals(dateStr);
            days.push({ date: dateStr, kcal: totals.kcal });
        }
        return days;
    };

    const getLogsForDate = (date: string): CalorieLog[] =>
        logs.filter(l => l.log_date === date);

    return (
        <CalorieContext.Provider value={{
            logs, goals, currentDate, isLoading,
            setCurrentDate, addLog, deleteLog, updateGoals,
            searchFoods, parseFoodText,
            getDayTotals, getWeekData, getLogsForDate,
        }}>
            {children}
        </CalorieContext.Provider>
    );
}

export function useCalorie() {
    const ctx = useContext(CalorieContext);
    if (!ctx) throw new Error('useCalorie must be used within CalorieProvider');
    return ctx;
}

function deriveGoalsFromProfile(goal: string): NutritionGoals {
    switch (goal) {
        case 'cut':
            return { daily_kcal_goal: 1700, protein_goal_g: 160, carbs_goal_g: 150, fat_goal_g: 55, iron_goal_mg: 10, goal_type: 'cut' };
        case 'muscle':
            return { daily_kcal_goal: 2800, protein_goal_g: 200, carbs_goal_g: 300, fat_goal_g: 80, iron_goal_mg: 10, goal_type: 'muscle' };
        default:
            return { daily_kcal_goal: 2000, protein_goal_g: 150, carbs_goal_g: 200, fat_goal_g: 65, iron_goal_mg: 10, goal_type: 'healthy' };
    }
}
