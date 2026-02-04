/**
 * Personal Expense Tracker - Dashboard JavaScript
 */

let expensesChart = null;
let categoryChart = null;

// Dashboard State
const dashboardState = {
    expenses: [],
    categories: [],
    currentFilter: 'all', // all, week, month, year
    currentExpense: null,
    mlSuggestions: null
};

/**
 * Initialize Dashboard
 */
async function initDashboard() {
    try {
        await Promise.all([
            loadExpenses(),
            loadCategories()
        ]);
        
        renderExpenses();
        updateStats();
        initCharts();
        setupEventListeners();
        
        // Load ML suggestions after initial data is loaded
        loadMLSuggestions();
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        utils.showAlert('Failed to load dashboard data', 'error');
    }
}

/**
 * Load expenses from API
 */
async function loadExpenses() {
    try {
        const data = await utils.apiRequest('/personal_expense/api/expenses.php');
        dashboardState.expenses = data.expenses || [];
    } catch (error) {
        throw new Error('Failed to load expenses');
    }
}

/**
 * Load categories from API
 */
async function loadCategories() {
    try {
        const data = await utils.apiRequest('/personal_expense/api/categories.php');
        dashboardState.categories = data.categories || [];
        renderCategoryOptions();
    } catch (error) {
        throw new Error('Failed to load categories');
    }
}

/**
 * Render category options in select dropdown
 */
function renderCategoryOptions() {
    const categorySelects = document.querySelectorAll('.category-select');
    categorySelects.forEach(select => {
        select.innerHTML = '<option value="">Select category</option>';
        dashboardState.categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });
    });
}

/**
 * Render expenses list
 */
function renderExpenses() {
    const expenseList = document.getElementById('expenseList');
    if (!expenseList) return;

    if (dashboardState.expenses.length === 0) {
        expenseList.innerHTML = `
            <div class="text-center p-4 text-muted">
                <p>No expenses found. Add your first expense to get started!</p>
            </div>
        `;
        return;
    }

    const filteredExpenses = filterExpenses();
    
    expenseList.innerHTML = filteredExpenses.map(expense => {
        const category = dashboardState.categories.find(c => c.id == expense.category_id);
        const categoryColor = category?.color || '#6366f1';
        
        return `
            <div class="expense-item">
                <div class="expense-info">
                    <div class="expense-icon" style="background-color: ${categoryColor}20; color: ${categoryColor};">
                        ${getCategoryIcon(category?.icon || 'tag')}
                    </div>
                    <div class="expense-details">
                        <div class="expense-description">${expense.description || 'No description'}</div>
                        <div class="expense-meta">
                            <span class="badge badge-outline">${category?.name || 'Uncategorized'}</span>
                            <span class="text-muted">• ${utils.formatDate(expense.expense_date)}</span>
                        </div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="expense-amount">${utils.formatCurrency(expense.amount)}</div>
                    <div class="expense-actions">
                        <button class="btn btn-sm btn-ghost" onclick="editExpense(${expense.id})">Edit</button>
                        <button class="btn btn-sm btn-ghost text-destructive" onclick="deleteExpense(${expense.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Filter expenses based on current filter
 */
function filterExpenses() {
    const now = new Date();
    
    return dashboardState.expenses.filter(expense => {
        const expenseDate = new Date(expense.expense_date);
        
        switch (dashboardState.currentFilter) {
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return expenseDate >= weekAgo;
            case 'month':
                return expenseDate.getMonth() === now.getMonth() && 
                       expenseDate.getFullYear() === now.getFullYear();
            case 'year':
                return expenseDate.getFullYear() === now.getFullYear();
            default:
                return true;
        }
    });
}

/**
 * Update statistics
 */
function updateStats() {
    const filteredExpenses = filterExpenses();
    const total = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const count = filteredExpenses.length;
    const average = count > 0 ? total / count : 0;

    // Update DOM elements
    const totalElement = document.getElementById('totalExpense');
    const countElement = document.getElementById('expenseCount');
    const averageElement = document.getElementById('averageExpense');

    if (totalElement) totalElement.textContent = utils.formatCurrency(total);
    if (countElement) countElement.textContent = count;
    if (averageElement) averageElement.textContent = utils.formatCurrency(average);
}

/**
 * Initialize charts
 */
function initCharts() {
    initExpenseChart();
    initCategoryChart();
}

/**
 * Initialize expense trend chart
 */
function initExpenseChart() {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;

    // Prepare data for last 7 days
    const last7Days = [];
    const expensesByDay = {};
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days.push(dateStr);
        expensesByDay[dateStr] = 0;
    }

    dashboardState.expenses.forEach(expense => {
        if (expensesByDay.hasOwnProperty(expense.expense_date)) {
            expensesByDay[expense.expense_date] += parseFloat(expense.amount);
        }
    });

    const data = last7Days.map(date => expensesByDay[date]);
    const labels = last7Days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    if (expensesChart) {
        expensesChart.destroy();
    }

    const themeColors = ThemeManager.getChartColors();

    expensesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Expenses',
                data: data,
                borderColor: themeColors.palette[0],
                backgroundColor: themeColors.palette[0] + '20',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: themeColors.tooltipBg,
                    titleColor: themeColors.text,
                    bodyColor: themeColors.text,
                    borderColor: themeColors.tooltipBorder,
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        color: themeColors.grid
                    },
                    ticks: {
                        color: themeColors.text
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: themeColors.grid
                    },
                    ticks: {
                        color: themeColors.text,
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
}

/**
 * Initialize category chart
 */
function initCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    // Calculate expenses by category
    const categoryTotals = {};
    dashboardState.expenses.forEach(expense => {
        const categoryId = expense.category_id || 'uncategorized';
        categoryTotals[categoryId] = (categoryTotals[categoryId] || 0) + parseFloat(expense.amount);
    });

    const labels = [];
    const data = [];
    const colors = [];

    Object.entries(categoryTotals).forEach(([catId, total]) => {
        const category = dashboardState.categories.find(c => c.id == catId);
        labels.push(category?.name || 'Uncategorized');
        data.push(total);
        colors.push(category?.color || '#6b7280');
    });

    if (categoryChart) {
        categoryChart.destroy();
    }

    const themeColors = ThemeManager.getChartColors();

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim()
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: themeColors.text
                    }
                },
                tooltip: {
                    backgroundColor: themeColors.tooltipBg,
                    titleColor: themeColors.text,
                    bodyColor: themeColors.text,
                    borderColor: themeColors.tooltipBorder,
                    borderWidth: 1
                }
            }
        }
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Add expense button
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', () => {
            dashboardState.currentExpense = null;
            document.getElementById('expenseForm').reset();
            document.getElementById('expenseModalTitle').textContent = 'Add Expense';
            modal.open('expenseModal');
        });
    }

    // Expense form submit
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
    }

    // Filter buttons
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            dashboardState.currentFilter = e.target.dataset.filter;
            renderExpenses();
            updateStats();
            initCharts();
            
            // Update active state
            document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

/**
 * Handle expense form submission
 */
async function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const expenseData = {
        amount: formData.get('amount'),
        category_id: formData.get('category_id'),
        description: formData.get('description'),
        expense_date: formData.get('expense_date')
    };

    try {
        const url = dashboardState.currentExpense 
            ? `/personal_expense/api/expenses.php?id=${dashboardState.currentExpense}`
            : '/personal_expense/api/expenses.php';
        
        const method = dashboardState.currentExpense ? 'PUT' : 'POST';

        await utils.apiRequest(url, {
            method: method,
            body: JSON.stringify(expenseData)
        });

        modal.close('expenseModal');
        await loadExpenses();
        renderExpenses();
        updateStats();
        initCharts();
        
        utils.showAlert(
            dashboardState.currentExpense ? 'Expense updated successfully' : 'Expense added successfully',
            'success'
        );
    } catch (error) {
        utils.showAlert(error.message, 'error');
    }
}

/**
 * Edit expense
 */
async function editExpense(id) {
    const expense = dashboardState.expenses.find(e => e.id == id);
    if (!expense) return;

    dashboardState.currentExpense = id;
    
    // Fill form
    document.getElementById('amount').value = expense.amount;
    document.getElementById('category_id').value = expense.category_id;
    document.getElementById('description').value = expense.description;
    document.getElementById('expense_date').value = expense.expense_date;
    
    document.getElementById('expenseModalTitle').textContent = 'Edit Expense';
    modal.open('expenseModal');
}

/**
 * Delete expense
 */
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    try {
        await utils.apiRequest(`/personal_expense/api/expenses.php?id=${id}`, {
            method: 'DELETE'
        });

        await loadExpenses();
        renderExpenses();
        updateStats();
        initCharts();
        
        utils.showAlert('Expense deleted successfully', 'success');
    } catch (error) {
        utils.showAlert(error.message, 'error');
    }
}

/**
 * Get category icon (simple text for now)
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
        'tag': '🏷️'
    };
    return icons[icon] || '🏷️';
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);

// Listen for theme changes and update charts
window.addEventListener('themeChanged', () => {
    if (expensesChart || categoryChart) {
        initCharts();
    }
});

// Make functions globally available
window.editExpense = editExpense;
window.deleteExpense = deleteExpense;
/**
 * ===== ML SUGGESTIONS FEATURE =====
 * Load and display AI-powered spending insights
 */

/**
 * Load ML suggestions from API
 */
async function loadMLSuggestions() {
    try {
        // Only show suggestions if user has expenses
        if (dashboardState.expenses.length === 0) {
            return;
        }

        const data = await utils.apiRequest('/personal_expense/api/ml_suggestions.php');
        
        if (data.success) {
            dashboardState.mlSuggestions = data;
            renderMLSuggestions();
        }
    } catch (error) {
        console.error('Failed to load ML suggestions:', error);
        // Fail silently - this is an enhancement feature
    }
}

/**
 * Render ML suggestions in the UI
 */
function renderMLSuggestions() {
    const card = document.getElementById('mlSuggestionsCard');
    const content = document.getElementById('mlSuggestionsContent');
    
    if (!card || !content || !dashboardState.mlSuggestions) return;
    
    const { spending_alerts, insights, recommendations } = dashboardState.mlSuggestions;
    
    // Show the card
    card.style.display = 'block';
    
    let html = '';
    
    // Spending Alerts Section
    if (spending_alerts && spending_alerts.length > 0) {
        html += `
            <div class="ml-section">
                <h4 class="ml-section-title">
                    <span class="ml-section-icon">⚠️</span>
                    Spending Alerts
                </h4>
                <div class="ml-suggestions-grid">
                    ${spending_alerts.map(alert => renderAlert(alert)).join('')}
                </div>
            </div>
        `;
    }
    
    // Insights Section
    if (insights && insights.length > 0) {
        html += `
            <div class="ml-section">
                <h4 class="ml-section-title">
                    <span class="ml-section-icon">💡</span>
                    Predictive Insights
                </h4>
                <div class="ml-suggestions-grid">
                    ${insights.map(insight => renderInsight(insight)).join('')}
                </div>
            </div>
        `;
    }
    
    // Recommendations Section
    if (recommendations && recommendations.length > 0) {
        html += `
            <div class="ml-section">
                <h4 class="ml-section-title">
                    <span class="ml-section-icon">🎯</span>
                    Smart Recommendations
                </h4>
                <div class="ml-suggestions-grid">
                    ${recommendations.map(rec => renderRecommendation(rec)).join('')}
                </div>
            </div>
        `;
    }
    
    // Empty state if no suggestions
    if (!html) {
        html = `
            <div class="ml-empty-state">
                <div class="ml-empty-state-icon">📊</div>
                <div class="ml-empty-state-message">
                    Keep tracking your expenses! We'll provide personalized insights once we have enough data to analyze.
                </div>
            </div>
        `;
    }
    
    content.innerHTML = html;
}

/**
 * Render spending alert card
 */
function renderAlert(alert) {
    const severityClass = alert.severity || 'info';
    const icons = {
        'high_spending': '📈',
        'budget_exceeded': '🚨',
        'budget_warning': '⚡'
    };
    
    let details = '';
    if (alert.current && alert.average) {
        details = `
            <div class="ml-insight-details">
                <div class="ml-metric">
                    <span class="ml-metric-label">Current</span>
                    <span class="ml-metric-value">₹${alert.current.toFixed(2)}</span>
                </div>
                <div class="ml-metric">
                    <span class="ml-metric-label">Average</span>
                    <span class="ml-metric-value">₹${alert.average.toFixed(2)}</span>
                </div>
            </div>
        `;
    } else if (alert.current && alert.budget) {
        details = `
            <div class="ml-insight-details">
                <div class="ml-metric">
                    <span class="ml-metric-label">Current</span>
                    <span class="ml-metric-value">₹${alert.current.toFixed(2)}</span>
                </div>
                <div class="ml-metric">
                    <span class="ml-metric-label">Budget</span>
                    <span class="ml-metric-value">₹${alert.budget.toFixed(2)}</span>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="ml-insight-card">
            <div class="ml-insight-header">
                <div class="ml-insight-type">
                    <span class="ml-insight-icon">${icons[alert.type] || '⚠️'}</span>
                    <span>${alert.category}</span>
                </div>
                <span class="ml-insight-severity ${severityClass}">${severityClass}</span>
            </div>
            <div class="ml-insight-message">${alert.message}</div>
            ${details}
        </div>
    `;
}

/**
 * Render predictive insight card
 */
function renderInsight(insight) {
    const icons = {
        'trend_prediction': '📊',
        'volatility_warning': '📉',
        'overall_prediction': '🔮'
    };
    
    let trendIndicator = '';
    if (insight.trend) {
        const trendClass = insight.trend;
        const trendIcon = trendClass === 'increasing' ? '↗️' : trendClass === 'decreasing' ? '↘️' : '→';
        trendIndicator = `
            <span class="trend-indicator ${trendClass}">
                ${trendIcon} ${trendClass}
            </span>
        `;
    }
    
    let details = '';
    if (insight.predicted_amount) {
        details = `
            <div class="ml-insight-details">
                <div class="ml-metric">
                    <span class="ml-metric-label">Predicted Next Month</span>
                    <span class="ml-metric-value">₹${insight.predicted_amount.toFixed(2)}</span>
                </div>
                ${insight.confidence ? `
                    <div class="ml-metric">
                        <span class="ml-metric-label">Confidence</span>
                        <span class="ml-metric-value">${insight.confidence}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    return `
        <div class="ml-insight-card">
            <div class="ml-insight-header">
                <div class="ml-insight-type">
                    <span class="ml-insight-icon">${icons[insight.type] || '💡'}</span>
                    <span>${insight.category}</span>
                </div>
                ${trendIndicator}
            </div>
            <div class="ml-insight-message">${insight.message}</div>
            ${details}
        </div>
    `;
}

/**
 * Render recommendation card
 */
function renderRecommendation(rec) {
    const priorityClass = rec.priority || 'medium';
    const icons = {
        'reduce_spending': '💰',
        'set_budget': '🎯',
        'positive_feedback': '✨'
    };
    
    let details = '';
    if (rec.potential_savings) {
        details = `
            <div class="ml-insight-details">
                <div class="ml-metric">
                    <span class="ml-metric-label">Potential Savings</span>
                    <span class="ml-metric-value">₹${rec.potential_savings.toFixed(2)}/month</span>
                </div>
            </div>
        `;
    } else if (rec.suggested_budget) {
        details = `
            <div class="ml-insight-details">
                <div class="ml-metric">
                    <span class="ml-metric-label">Suggested Budget</span>
                    <span class="ml-metric-value">₹${rec.suggested_budget.toFixed(2)}/month</span>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="ml-recommendation">
            <div class="ml-recommendation-header">
                <div class="ml-insight-type">
                    <span class="ml-insight-icon">${icons[rec.type] || '🎯'}</span>
                    <span class="ml-recommendation-title">${rec.category}</span>
                </div>
                <span class="ml-recommendation-priority ${priorityClass}">${priorityClass}</span>
            </div>
            <div class="ml-recommendation-message">${rec.message}</div>
            ${details}
        </div>
    `;
}

/**
 * Setup ML suggestions refresh button
 */
document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refreshSuggestions');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '🔄 Analyzing...';
            
            await loadMLSuggestions();
            
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '🔄 Refresh';
            
            utils.showAlert('Insights refreshed successfully', 'success');
        });
    }
});