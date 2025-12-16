/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#FF6B6B', // Coral
                    secondary: '#4ECDC4', // Turquoise
                    accent: '#FFE66D', // Yellow
                    purple: '#6C5CE7', // Vendor CTA
                },
                background: {
                    DEFAULT: '#FFFFFF',
                    alt: '#F9FAFB', // Gray-50 equivalent
                },
                foreground: {
                    DEFAULT: '#1F2937', // Dark equivalent
                    muted: '#6B7280', // Gray equivalent
                }
            },
            fontFamily: {
                primary: ['Montserrat', 'sans-serif'],
                secondary: ['Poppins', 'sans-serif'],
                tertiary: ['"Noto Sans TC"', 'monospace'],
            },
            borderRadius: {
                'base': '0.625rem', // 10px
            },
            boxShadow: {
                'default': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // shadow-xl equivalent
                'hover': '0 25px 50px -12px rgb(0 0 0 / 0.25)', // shadow-2xl equivalent
            }
        },
    },
    plugins: [],
}
