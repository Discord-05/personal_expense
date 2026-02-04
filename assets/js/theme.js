/**
 * Theme Switcher
 * Handles light/dark mode toggling with localStorage persistence
 */

const ThemeManager = {
    STORAGE_KEY: 'expense-tracker-theme',
    THEME_ATTR: 'data-theme',
    DEFAULT_THEME: 'light',

    /**
     * Initialize theme system
     */
    init() {
        // Load saved theme or use default
        const savedTheme = this.getSavedTheme();
        this.applyTheme(savedTheme, true);

        // Set up toggle button listeners
        this.setupToggleButtons();

        // Listen for theme changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === this.STORAGE_KEY) {
                this.applyTheme(e.newValue || this.DEFAULT_THEME, true);
            }
        });
    },

    /**
     * Get saved theme from localStorage
     */
    getSavedTheme() {
        return localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_THEME;
    },

    /**
     * Save theme to localStorage
     */
    saveTheme(theme) {
        localStorage.setItem(this.STORAGE_KEY, theme);
    },

    /**
     * Get current active theme
     */
    getCurrentTheme() {
        return document.documentElement.getAttribute(this.THEME_ATTR) || this.DEFAULT_THEME;
    },

    /**
     * Apply theme to document
     * @param {string} theme - 'light' or 'dark'
     * @param {boolean} skipTransition - Skip transition animation
     */
    applyTheme(theme, skipTransition = false) {
        const validTheme = theme === 'dark' ? 'dark' : 'light';

        // Temporarily disable transitions for instant theme change
        if (skipTransition) {
            document.documentElement.classList.add('no-transition');
        }

        // Apply theme
        if (validTheme === 'dark') {
            document.documentElement.setAttribute(this.THEME_ATTR, 'dark');
        } else {
            document.documentElement.removeAttribute(this.THEME_ATTR);
        }

        // Save to localStorage
        this.saveTheme(validTheme);

        // Re-enable transitions
        if (skipTransition) {
            setTimeout(() => {
                document.documentElement.classList.remove('no-transition');
            }, 10);
        }

        // Dispatch custom event for charts to update
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: validTheme } 
        }));

        // Update ARIA label for accessibility
        this.updateAriaLabel(validTheme);
    },

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme, false);
    },

    /**
     * Set up event listeners for toggle buttons
     */
    setupToggleButtons() {
        const toggleButtons = document.querySelectorAll('.theme-toggle');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => this.toggleTheme());
            
            // Add keyboard support
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
        });
    },

    /**
     * Update ARIA label for accessibility
     */
    updateAriaLabel(theme) {
        const toggleButtons = document.querySelectorAll('.theme-toggle');
        const label = theme === 'dark' 
            ? 'Switch to light mode' 
            : 'Switch to dark mode';
        
        toggleButtons.forEach(button => {
            button.setAttribute('aria-label', label);
            button.setAttribute('title', label);
        });
    },

    /**
     * Get theme-aware chart colors
     */
    getChartColors() {
        const root = getComputedStyle(document.documentElement);
        
        return {
            grid: root.getPropertyValue('--chart-grid').trim(),
            text: root.getPropertyValue('--chart-text').trim(),
            tooltipBg: root.getPropertyValue('--chart-tooltip-bg').trim(),
            tooltipBorder: root.getPropertyValue('--chart-tooltip-border').trim(),
            palette: [
                root.getPropertyValue('--chart-color-1').trim(),
                root.getPropertyValue('--chart-color-2').trim(),
                root.getPropertyValue('--chart-color-3').trim(),
                root.getPropertyValue('--chart-color-4').trim(),
                root.getPropertyValue('--chart-color-5').trim(),
                root.getPropertyValue('--chart-color-6').trim(),
                root.getPropertyValue('--chart-color-7').trim(),
                root.getPropertyValue('--chart-color-8').trim(),
                root.getPropertyValue('--chart-color-9').trim(),
                root.getPropertyValue('--chart-color-10').trim()
            ]
        };
    },

    /**
     * Check if dark mode is active
     */
    isDarkMode() {
        return this.getCurrentTheme() === 'dark';
    }
};

// Initialize theme system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
    ThemeManager.init();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
