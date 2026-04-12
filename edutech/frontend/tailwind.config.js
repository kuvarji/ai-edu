/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			'theme-page': 'var(--color-page)',
  			'theme-card': 'var(--color-card)',
  			'theme-card-hover': 'var(--color-card-hover)',
  			'theme-surface': 'var(--color-surface)',
  			'theme-input': 'var(--color-input)',
  			'theme-text': 'var(--color-text)',
  			'theme-text-secondary': 'var(--color-text-secondary)',
  			'theme-text-muted': 'var(--color-text-muted)',
  			'theme-border': 'var(--color-border)',
  			'theme-nav': 'var(--color-nav)',
  			'theme-nav-border': 'var(--color-nav-border)',
  		}
  	}
  },
  plugins: [import("tailwindcss-animate")],
}

