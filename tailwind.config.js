/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./index.html",
		"./src/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Outfit"', 'sans-serif'],
			},
			colors: {
				primary: {
					DEFAULT: '#6366f1', // Indigo 500
					hover: '#4f46e5',   // Indigo 600
				},
				secondary: {
					DEFAULT: '#ec4899', // Pink 500
					hover: '#db2777',   // Pink 600
				},
				dark: {
					950: '#0a0a0a', // Almost black
					900: '#171717',
					800: '#262626',
				}
			},
			backgroundImage: {
				'gradient-main': 'linear-gradient(to bottom right, #0f172a, #1e1b4b, #312e81)', // Slate 900 -> Indigo 950 -> Indigo 900
				'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
			}
		},
	},
	plugins: [],
};


