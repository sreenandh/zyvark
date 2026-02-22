/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
            },
            colors: {
                primary: { 50: '#fef2f2', 100: '#fee2e2', 500: '#E63946', 600: '#C62828', 700: '#B71C1C' },
                navy: { DEFAULT: '#1D3557', light: '#264573', dark: '#0F1923' },
                surface: { DEFAULT: '#1A2332', light: '#243447' },
            },
        },
    },
    plugins: [],
};
