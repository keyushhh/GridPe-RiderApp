/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#5260FE",
                background: "#FFFFFF",
                input: "#F7F8FA",
                border: "#E6E8EB",
            },
            fontFamily: {
                satoshi: ["Satoshi", "sans-serif"],
            },
        },
    },
    plugins: [],
}
