import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { ThemeContextType, ThemeColors } from '../types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    const theme = useMemo<ThemeContextType>(() => ({
        isDarkMode,
        colors: {
            background: isDarkMode ? '#111827' : '#F3F4F6',
            card: isDarkMode ? '#1F2937' : '#FFFFFF',
            text: isDarkMode ? '#F9FAFB' : '#111827',
            subText: isDarkMode ? '#9CA3AF' : '#6B7280',
            primary: '#007AFF',
            border: isDarkMode ? '#374151' : '#E5E7EB',
            input: isDarkMode ? '#374151' : '#F9FAFB',
        },
        toggleTheme
    }), [isDarkMode]);

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
