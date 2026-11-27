module.exports = {
    future: { hoverOnlyWhenSupported: true },
    content: ['./*.html', './en/*.html', './partials/*.html', './assets/js/*.js'], theme: {
        extend: {
            colors: { 'brand-dark': '#172E4E', 'brand-card-dark': '#1E3558', 'brand-deep': '#0F1E36', gold: '#C88D28', 'gold-dark': '#8F6414', 'gold-light': '#E3B866', 'brand-bg': '#F2F4F7', 'brand-panel': '#EBF0F5', 'brand-text': '#111827', 'brand-subtext': '#6B7280', 'brand-accent': '#2A4165' },
            fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], heading: ['Newsreader', 'Georgia', 'serif'] },
            borderRadius: { xl: '.5rem', '2xl': '1rem', '3xl': '1.25rem', '4xl': '2rem' },
            boxShadow: { sm: '0 1px 2px rgba(15,30,54,.06)', md: '0 1px 2px rgba(15,30,54,.06)', lg: '0 18px 40px -22px rgba(15,30,54,.35)', xl: '0 18px 40px -22px rgba(15,30,54,.35)', '2xl': '0 24px 60px -28px rgba(15,30,54,.45)' }
        }
    }
}
