/**
 * Personal Expense Tracker - Main JavaScript
 */

// Utility Functions
const utils = {
    /**
     * Format currency in Indian Rupees with Indian numbering system
     */
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    /**
     * Format date
     */
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    },

    /**
     * Show alert message
     */
    showAlert: (message, type = 'info') => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        const container = document.querySelector('.dashboard-body') || document.querySelector('.auth-card');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
            
            setTimeout(() => {
                alertDiv.remove();
            }, 5000);
        }
    },

    /**
     * Make API request
     */
    apiRequest: async (url, options = {}) => {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }
};

// Modal Functions
const modal = {
    /**
     * Open modal
     */
    open: (modalId) => {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            modalElement.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Close modal
     */
    close: (modalId) => {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            modalElement.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    },

    /**
     * Initialize modal close handlers
     */
    init: () => {
        // Close modal on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.add('hidden');
                    document.body.style.overflow = 'auto';
                }
            });
        });

        // Close modal on close button click
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal-overlay');
                if (modal) {
                    modal.classList.add('hidden');
                    document.body.style.overflow = 'auto';
                }
            });
        });
    }
};

// Form Validation
const validation = {
    /**
     * Validate email
     */
    isValidEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validate required field
     */
    isRequired: (value) => {
        return value.trim() !== '';
    },

    /**
     * Validate minimum length
     */
    minLength: (value, min) => {
        return value.length >= min;
    },

    /**
     * Show field error
     */
    showError: (field, message) => {
        const formGroup = field.closest('.form-group');
        let errorElement = formGroup.querySelector('.form-error');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        field.classList.add('error');
    },

    /**
     * Clear field error
     */
    clearError: (field) => {
        const formGroup = field.closest('.form-group');
        const errorElement = formGroup.querySelector('.form-error');
        
        if (errorElement) {
            errorElement.remove();
        }
        
        field.classList.remove('error');
    }
};

// Export for use in other files
window.utils = utils;
window.modal = modal;
window.validation = validation;

// Initialize modals when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    modal.init();
});
