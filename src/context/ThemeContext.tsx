'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
type AccentColor = 'indigo' | 'rose' | 'emerald' | 'amber' | 'cyan' | 'violet';

interface ThemeContextType {
    theme: Theme;
    accentColor: AccentColor;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const accentColors: { name: AccentColor; primary: string; secondary: string; label: string }[] = [
    { name: 'indigo', primary: '#6366f1', secondary: '#ec4899', label: 'Indigo' },
    { name: 'rose', primary: '#f43f5e', secondary: '#fb7185', label: 'Rose' },
    { name: 'emerald', primary: '#10b981', secondary: '#34d399', label: 'Emerald' },
    { name: 'amber', primary: '#f59e0b', secondary: '#fbbf24', label: 'Amber' },
    { name: 'cyan', primary: '#06b6d4', secondary: '#22d3ee', label: 'Cyan' },
    { name: 'violet', primary: '#8b5cf6', secondary: '#a78bfa', label: 'Violet' },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');
    const [accentColor, setAccentColorState] = useState<AccentColor>('indigo');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load theme
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) {
            setThemeState(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme = prefersDark ? 'dark' : 'light';
            setThemeState(systemTheme);
            document.documentElement.setAttribute('data-theme', systemTheme);
        }

        // Load accent color
        const savedAccent = localStorage.getItem('accentColor') as AccentColor | null;
        if (savedAccent) {
            setAccentColorState(savedAccent);
            applyAccentColor(savedAccent);
        }
    }, []);

    const applyAccentColor = (color: AccentColor) => {
        const colorData = accentColors.find(c => c.name === color);
        if (colorData) {
            document.documentElement.style.setProperty('--color-primary', colorData.primary);
            document.documentElement.style.setProperty('--color-secondary', colorData.secondary);
        }
    };

    useEffect(() => {
        if (mounted) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
    }, [theme, mounted]);

    useEffect(() => {
        if (mounted) {
            applyAccentColor(accentColor);
            localStorage.setItem('accentColor', accentColor);
        }
    }, [accentColor, mounted]);

    const toggleTheme = () => {
        setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const setAccentColor = (color: AccentColor) => {
        setAccentColorState(color);
    };

    return (
        <ThemeContext.Provider value={{ theme, accentColor, toggleTheme, setTheme, setAccentColor }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
