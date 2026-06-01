// MealFlex Dark Design System
// Tiefschwarzer Hintergrund, dunkle Karten, Orange-Akzent (#FA4A0C), weißer Text.

export const colors = {
    // Flächen
    background: '#0A0A0A',      // Seiten-Hintergrund (fast schwarz)
    surface: '#161616',        // Karten
    surfaceAlt: '#1F1F1F',     // Chips / erhöhte Flächen
    surfaceElevated: '#242424',// Modale / Overlays

    // Text
    text: '#FFFFFF',           // Primärtext
    textSoft: '#E5E5E5',       // leicht gedämpft
    muted: '#9A9A9A',          // sekundärer Text
    mutedSoft: '#6E6E6E',      // tertiär / Platzhalter

    // Linien
    border: '#262626',
    borderSoft: '#1E1E1E',

    // Marke
    primary: '#FA4A0C',
    primaryDark: '#D43C08',
    primarySoft: 'rgba(250, 74, 12, 0.14)', // Orange-Tint auf Dunkel
    onPrimary: '#FFFFFF',

    // Status
    success: '#34C759',
    successSoft: 'rgba(52, 199, 89, 0.16)',
    warning: '#FF9500',
    warningSoft: 'rgba(255, 149, 0, 0.16)',
    danger: '#FF3B30',
    dangerSoft: 'rgba(255, 59, 48, 0.16)',
    info: '#2196F3',

    // Makro-Akzente
    protein: '#34C759',
    carbs: '#2196F3',
    fat: '#FF9500',

    // sonstige
    ink: '#000000',
    white: '#FFFFFF',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
};

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 999,
};

export const shadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
};

export const typography = {
    title: {
        fontSize: 30,
        fontWeight: '800' as const,
        color: colors.text,
        letterSpacing: -0.5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800' as const,
        color: colors.text,
    },
    body: {
        fontSize: 15,
        color: colors.text,
        lineHeight: 22,
    },
    caption: {
        fontSize: 13,
        color: colors.muted,
    },
};

export const theme = { colors, spacing, radius, shadow, typography };
export default theme;
