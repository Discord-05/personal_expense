/**
 * Personal Expense Tracker - Categories Page JavaScript
 */

// Categories Page State
const categoriesState = {
    categories: [],
    expenses: [],
    currentCategory: null,
    currentMonthSpending: {}
};

/**
 * Initialize Categories Page
 */
async function initCategoriesPage() {
    try {
        await Promise.all([
            loadCategories(),
            loadExpenses()
        ]);
        
        calculateMonthlySpending();
        renderCategories();
        updateSummaryStats();
        checkBudgetAlerts();
        setupEventListeners();
        setupColorPicker();
    } catch (error) {
        console.error('Categories page initialization error:', error);
        utils.showAlert('Failed to load categories data', 'error');
    }
}

/**
 * Load categories from API
 */
async function loadCategories() {
    try {
        const data = await utils.apiRequest('/personal_expense/api/categories.php');
        categoriesState.categories = data.categories || [];
    } catch (error) {
        throw new Error('Failed to load categories');
    }
}

/**
 * Load expenses from API (for budget tracking)
 */
async function loadExpenses() {
    try {
        const data = await utils.apiRequest('/personal_expense/api/expenses.php');
        categoriesState.expenses = data.expenses || [];
    } catch (error) {
        throw new Error('Failed to load expenses');
    }
}

/**
 * Calculate monthly spending per category
 */
function calculateMonthlySpending() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    categoriesState.currentMonthSpending = {};
    
    categoriesState.expenses.forEach(expense => {
        const expenseDate = new Date(expense.expense_date);
        
        if (expenseDate.getMonth() === currentMonth && 
            expenseDate.getFullYear() === currentYear) {
            
            const categoryId = expense.category_id || 'uncategorized';
            if (!categoriesState.currentMonthSpending[categoryId]) {
                categoriesState.currentMonthSpending[categoryId] = 0;
            }
            categoriesState.currentMonthSpending[categoryId] += parseFloat(expense.amount);
        }
    });
}

/**
 * Update summary statistics
 */
function updateSummaryStats() {
    const totalCategories = categoriesState.categories.length;
    const totalBudget = categoriesState.categories.reduce(
        (sum, cat) => sum + (parseFloat(cat.budget) || 0), 0
    );
    const totalSpending = Object.values(categoriesState.currentMonthSpending).reduce(
        (sum, amount) => sum + amount, 0
    );
    const budgetRemaining = totalBudget - totalSpending;
    
    document.getElementById('totalCategories').textContent = totalCategories;
    document.getElementById('totalBudget').textContent = utils.formatCurrency(totalBudget);
    document.getElementById('totalSpending').textContent = utils.formatCurrency(totalSpending);
    
    const remainingEl = document.getElementById('budgetRemaining');
    remainingEl.textContent = utils.formatCurrency(Math.abs(budgetRemaining));
    
    // Color code remaining budget
    if (budgetRemaining < 0) {
        remainingEl.style.color = 'hsl(0, 84%, 60%)'; // Red
    } else if (budgetRemaining < totalBudget * 0.2) {
        remainingEl.style.color = 'hsl(38, 92%, 50%)'; // Orange
    } else {
        remainingEl.style.color = 'hsl(142, 76%, 46%)'; // Green
    }
}

/**
 * Render categories grid
 */
function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!grid) return;
    
    if (categoriesState.categories.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    grid.innerHTML = categoriesState.categories.map(category => {
        const spent = categoriesState.currentMonthSpending[category.id] || 0;
        const budget = parseFloat(category.budget) || 0;
        const hasBudget = budget > 0;
        const percentage = hasBudget ? (spent / budget) * 100 : 0;
        const remaining = budget - spent;
        
        // Determine budget status
        let budgetStatus = 'good';
        let budgetClass = '';
        if (hasBudget) {
            if (percentage >= 100) {
                budgetStatus = 'exceeded';
                budgetClass = 'budget-exceeded';
            } else if (percentage >= 80) {
                budgetStatus = 'warning';
                budgetClass = 'budget-warning';
            }
        }
        
        return `
            <div class="category-card ${budgetClass}" data-category-id="${category.id}">
                <div class="category-card-header">
                    <div class="category-icon-wrapper" style="background-color: ${category.color}20; color: ${category.color};">
                        ${getCategoryIcon(category.icon)}
                    </div>
                    <div class="category-info">
                        <h4 class="category-name">${escapeHtml(category.name)}</h4>
                        <div class="category-color-indicator">
                            <span class="color-dot" style="background-color: ${category.color};"></span>
                            <span class="color-code">${category.color}</span>
                        </div>
                        ${getPriorityBadge(category.priority || 'moderate')}
                    </div>
                    <div class="category-actions">
                        <button 
                            class="btn btn-sm btn-ghost" 
                            onclick="editCategory(${category.id})"
                            title="Edit category"
                        >
                            ✏️
                        </button>
                        <button 
                            class="btn btn-sm btn-ghost text-destructive" 
                            onclick="showDeleteConfirmation(${category.id})"
                            title="Delete category"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
                
                ${hasBudget ? `
                    <div class="category-budget">
                        <div class="budget-header">
                            <span class="budget-label">Monthly Budget ${category.alert_enabled === '1' ? '<span class="alert-icon" title="Alerts enabled">🔔</span>' : ''}</span>
                            <span class="budget-amount">${utils.formatCurrency(budget)}</span>
                        </div>
                        <div class="budget-bar">
                            <div class="budget-progress" style="width: ${Math.min(percentage, 100)}%; background-color: ${getBudgetColor(percentage)};"></div>
                        </div>
                        <div class="budget-details">
                            <div class="budget-spent">
                                <span class="label">Spent:</span>
                                <span class="value">${utils.formatCurrency(spent)}</span>
                            </div>
                            <div class="budget-remaining">
                                <span class="label">${remaining >= 0 ? 'Remaining:' : 'Over by:'}</span>
                                <span class="value ${remaining < 0 ? 'text-destructive' : ''}">${utils.formatCurrency(Math.abs(remaining))}</span>
                            </div>
                        </div>
                        <div class="budget-percentage">${percentage.toFixed(0)}%</div>
                    </div>
                ` : `
                    <div class="category-no-budget">
                        <span class="text-muted text-sm">No budget set</span>
                        <button class="btn btn-sm btn-outline" onclick="editCategory(${category.id})">
                            Set Budget
                        </button>
                    </div>
                `}
                
                <div class="category-stats">
                    <div class="stat-item">
                        <span class="stat-label">Expenses</span>
                        <span class="stat-value">${category.expense_count || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">This Month</span>
                        <span class="stat-value">${utils.formatCurrency(spent)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">All Time</span>
                        <span class="stat-value">${utils.formatCurrency(category.total_amount || 0)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Check for budget alerts
 */
function checkBudgetAlerts() {
    const alerts = [];
    
    categoriesState.categories.forEach(category => {
        const budget = parseFloat(category.budget) || 0;
        if (budget <= 0) return;
        
        const spent = categoriesState.currentMonthSpending[category.id] || 0;
        const percentage = (spent / budget) * 100;
        
        if (percentage >= 80) {
            alerts.push({
                category: category,
                spent: spent,
                budget: budget,
                percentage: percentage,
                exceeded: percentage >= 100
            });
        }
    });
    
    const alertsSection = document.getElementById('budgetAlertsSection');
    const alertsContainer = document.getElementById('budgetAlerts');
    
    if (alerts.length === 0) {
        if (alertsSection) alertsSection.classList.add('hidden');
        return;
    }
    
    if (alertsSection) alertsSection.classList.remove('hidden');
    
    if (alertsContainer) {
        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert ${alert.exceeded ? 'alert-error' : 'alert-warning'} mb-2">
                <div class="flex justify-between items-center">
                    <div>
                        <strong>${escapeHtml(alert.category.name)}</strong>
                        <span class="ml-2">${alert.exceeded ? 'Budget exceeded!' : 'Approaching budget limit'}</span>
                    </div>
                    <div class="text-right">
                        <div class="font-semibold">${utils.formatCurrency(alert.spent)} / ${utils.formatCurrency(alert.budget)}</div>
                        <div class="text-sm">${alert.percentage.toFixed(0)}% used</div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Add category button
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', openAddCategoryModal);
    }
    
    // Category form submit
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }
    
    // Delete confirmation
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDeleteCategory);
    }
    
    // Budget input change
    const budgetInput = document.getElementById('categoryBudget');
    if (budgetInput) {
        budgetInput.addEventListener('input', updateBudgetPreview);
    }
    
    // Alert enabled checkbox
    const alertEnabled = document.getElementById('alertEnabled');
    const alertThresholdContainer = document.getElementById('alertThresholdContainer');
    if (alertEnabled && alertThresholdContainer) {
        alertEnabled.addEventListener('change', (e) => {
            alertThresholdContainer.style.opacity = e.target.checked ? '1' : '0.5';
            document.getElementById('alertThreshold').disabled = !e.target.checked;
        });
    }
    
    // Budget input - show/hide alert settings
    if (budgetInput) {
        const budgetAlertSettings = document.getElementById('budgetAlertSettings');
        budgetInput.addEventListener('input', (e) => {
            const hasBudget = parseFloat(e.target.value) > 0;
            if (budgetAlertSettings) {
                budgetAlertSettings.style.display = hasBudget ? 'block' : 'none';
            }
        });
    }
}

/**
 * Setup color picker
 */
function setupColorPicker() {
    const colorInput = document.getElementById('categoryColor');
    const colorPreview = document.getElementById('colorPreview');
    
    if (colorInput && colorPreview) {
        colorInput.addEventListener('input', (e) => {
            const color = e.target.value;
            updateColorPreview(color);
        });
    }
    
    // Preset color buttons
    document.querySelectorAll('.preset-color').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const color = e.target.dataset.color;
            if (colorInput) {
                colorInput.value = color;
                updateColorPreview(color);
            }
        });
    });
}

/**
 * Update color preview
 */
function updateColorPreview(color) {
    const preview = document.getElementById('colorPreview');
    if (preview) {
        const box = preview.querySelector('.color-preview-box');
        const text = preview.querySelector('.color-preview-text');
        
        if (box) box.style.backgroundColor = color;
        if (text) text.textContent = color;
    }
}

/**
 * Update budget preview
 */
function updateBudgetPreview() {
    const budgetInput = document.getElementById('categoryBudget');
    const preview = document.getElementById('budgetPreview');
    
    if (!budgetInput || !preview) return;
    
    const budget = parseFloat(budgetInput.value) || 0;
    
    if (budget <= 0) {
        preview.classList.add('hidden');
        return;
    }
    
    preview.classList.remove('hidden');
    
    // If editing, show current spending
    let spent = 0;
    if (categoriesState.currentCategory) {
        spent = categoriesState.currentMonthSpending[categoriesState.currentCategory] || 0;
    }
    
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    
    const progress = document.getElementById('budgetPreviewProgress');
    const spentEl = document.getElementById('budgetPreviewSpent');
    const limitEl = document.getElementById('budgetPreviewLimit');
    
    if (progress) {
        progress.style.width = `${Math.min(percentage, 100)}%`;
        progress.style.backgroundColor = getBudgetColor(percentage);
    }
    
    if (spentEl) spentEl.textContent = utils.formatCurrency(spent);
    if (limitEl) limitEl.textContent = utils.formatCurrency(budget);
}

/**
 * Open add category modal
 */
function openAddCategoryModal() {
    categoriesState.currentCategory = null;
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryColor').value = '#6366f1';
    document.getElementById('categoryPriority').value = 'moderate';
    document.getElementById('alertThreshold').value = '80';
    document.getElementById('alertEnabled').checked = true;
    document.getElementById('budgetAlertSettings').style.display = 'none';
    updateColorPreview('#6366f1');
    document.getElementById('categoryModalTitle').textContent = 'Add New Category';
    document.getElementById('saveButtonText').textContent = 'Save Category';
    document.getElementById('budgetPreview').classList.add('hidden');
    modal.open('categoryModal');
}

/**
 * Edit category
 */
async function editCategory(id) {
    const category = categoriesState.categories.find(c => c.id == id);
    if (!category) return;
    
    categoriesState.currentCategory = id;
    
    // Fill form
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryColor').value = category.color;
    document.getElementById('categoryIcon').value = category.icon || 'tag';
    document.getElementById('categoryBudget').value = category.budget || '';
    document.getElementById('categoryPriority').value = category.priority || 'moderate';
    document.getElementById('alertThreshold').value = category.alert_threshold || '80';
    document.getElementById('alertEnabled').checked = category.alert_enabled !== '0';
    
    // Show/hide budget alert settings
    const budgetAlertSettings = document.getElementById('budgetAlertSettings');
    if (budgetAlertSettings) {
        budgetAlertSettings.style.display = category.budget && parseFloat(category.budget) > 0 ? 'block' : 'none';
    }
    
    updateColorPreview(category.color);
    updateBudgetPreview();
    
    document.getElementById('categoryModalTitle').textContent = 'Edit Category';
    document.getElementById('saveButtonText').textContent = 'Update Category';
    modal.open('categoryModal');
}

/**
 * Handle category form submission
 */
async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const categoryData = {
        name: formData.get('name'),
        color: formData.get('color'),
        icon: formData.get('icon'),
        budget: formData.get('budget') || null,
        priority: formData.get('priority') || 'moderate',
        alert_threshold: formData.get('alert_threshold') || 80,
        alert_enabled: formData.get('alert_enabled') ? 1 : 0
    };
    
    try {
        const url = categoriesState.currentCategory 
            ? `/personal_expense/api/categories.php?id=${categoriesState.currentCategory}`
            : '/personal_expense/api/categories.php';
        
        const method = categoriesState.currentCategory ? 'PUT' : 'POST';
        
        await utils.apiRequest(url, {
            method: method,
            body: JSON.stringify(categoryData)
        });
        
        modal.close('categoryModal');
        await loadCategories();
        calculateMonthlySpending();
        renderCategories();
        updateSummaryStats();
        checkBudgetAlerts();
        
        utils.showAlert(
            categoriesState.currentCategory ? 'Category updated successfully' : 'Category created successfully',
            'success'
        );
    } catch (error) {
        utils.showAlert(error.message, 'error');
    }
}

/**
 * Show delete confirmation modal
 */
function showDeleteConfirmation(id) {
    const category = categoriesState.categories.find(c => c.id == id);
    if (!category) return;
    
    const expenseCount = parseInt(category.expense_count) || 0;
    const detailsDiv = document.getElementById('deleteCategoryDetails');
    const warningDiv = document.getElementById('deleteCategoryWarning');
    const expenseCountSpan = document.getElementById('expenseCount');
    
    if (detailsDiv) {
        detailsDiv.innerHTML = `
            <div class="card" style="background-color: hsl(var(--muted));">
                <div class="card-content" style="padding: 1rem;">
                    <div class="flex items-center gap-3">
                        <div class="category-icon-wrapper" style="background-color: ${category.color}20; color: ${category.color}; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                            ${getCategoryIcon(category.icon)}
                        </div>
                        <div>
                            <div class="font-medium">${escapeHtml(category.name)}</div>
                            <div class="text-sm text-muted">
                                ${expenseCount} expense${expenseCount !== 1 ? 's' : ''} • 
                                ${utils.formatCurrency(category.total_amount || 0)} total
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (warningDiv && expenseCountSpan) {
        if (expenseCount > 0) {
            expenseCountSpan.textContent = expenseCount;
            warningDiv.classList.remove('hidden');
        } else {
            warningDiv.classList.add('hidden');
        }
    }
    
    categoriesState.currentCategory = id;
    modal.open('deleteModal');
}

/**
 * Confirm delete category
 */
async function confirmDeleteCategory() {
    if (!categoriesState.currentCategory) return;
    
    try {
        await utils.apiRequest(`/personal_expense/api/categories.php?id=${categoriesState.currentCategory}`, {
            method: 'DELETE'
        });
        
        modal.close('deleteModal');
        await loadCategories();
        await loadExpenses();
        calculateMonthlySpending();
        renderCategories();
        updateSummaryStats();
        checkBudgetAlerts();
        
        utils.showAlert('Category deleted successfully', 'success');
        categoriesState.currentCategory = null;
    } catch (error) {
        utils.showAlert(error.message, 'error');
    }
}

/**
 * Get priority badge HTML
 */
function getPriorityBadge(priority) {
    const badges = {
        'essential': '🟢 Essential',
        'moderate': '🟡 Moderate',
        'discretionary': '🔴 Discretionary'
    };
    
    const text = badges[priority] || badges['moderate'];
    const className = `priority-${priority}`;
    
    return `<span class="category-priority-badge ${className}">${text}</span>`;
}

/**
 * Get budget color based on percentage
 */
function getBudgetColor(percentage) {
    if (percentage >= 100) return '#ef4444'; // Red
    if (percentage >= 80) return '#f59e0b'; // Orange
    return '#22c55e'; // Green
}

/**
 * Get category icon
 */
function getCategoryIcon(icon) {
    const icons = {
        'utensils': '🍴',
        'car': '🚗',
        'shopping-bag': '🛍️',
        'film': '🎬',
        'file-text': '📄',
        'heart': '❤️',
        'book': '📚',
        'tag': '🏷️',
        'home': '🏠',
        'briefcase': '💼',
        'phone': '📱',
        'coffee': '☕',
        'plane': '✈️',
        'gift': '🎁',
        'tool': '🔧'
    };
    return icons[icon] || '🏷️';
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initCategoriesPage);

// Make functions globally available
window.editCategory = editCategory;
window.showDeleteConfirmation = showDeleteConfirmation;
window.openAddCategoryModal = openAddCategoryModal;
