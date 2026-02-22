/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                emergency: { DEFAULT: '#E63946', dark: '#C62828', light: '#FF6B6B' },
                navy: { DEFAULT: '#1D3557', light: '#264573', dark: '#0F1923' },
                success: { DEFAULT: '#2A9D8F', light: '#3DB8A9' },
                surface: { DEFAULT: '#1A2332', light: '#243447', lighter: '#2D4258' },
                muted: '#8899AA',
            },
            fontFamily: {
                inter: ['Inter'],
            },
        },
    },
    plugins: [],
};
