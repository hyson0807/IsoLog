/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./hooks/**/*.{js,jsx,ts,tsx}",
        "./lib/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#FF6B35',
                    light: '#FF8F66',
                    dark: '#E55A2B',
                },
                secondary: {
                    DEFAULT: '#4A90D9',
                    light: '#6BA8E8',
                    dark: '#3A7BC8',
                },
            },
        },
    },
    plugins: [],
}
