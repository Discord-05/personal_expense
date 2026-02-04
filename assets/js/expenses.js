/**
 * Personal Expense Tracker - Expenses Page JavaScript
 */

// Expenses Page State
const expensesState = {
    expenses: [],
    categories: [],
    filteredExpenses: [],
    currentExpense: null,
    currentPage: 1,
    itemsPerPage: 10,
    sortColumn: 'expense_date',
    sortDirection: 'desc',
    filters: {
        search: '',
        category: '',
        dateRange: 'month',
        startDate: '',
        endDate: ''
    }
};

/**
 * Initialize Expenses Page
 */
async function initExpensesPage() {
    try {
        await Promise.all([
            loadExpenses(),
            loadCategories()
        ]);
        
        applyFilters();
        renderExpensesTable();
        setupEventListeners();
        setupNotesCounter();
    } catch (error) {
        console.error('Expenses page initialization error:', error);
        utils.showAlert('Failed to load expenses data', 'error');
    }
}

/**
 * Load expenses from API
 */
async function loadExpenses() {
    try {
        const data = await utils.apiRequest('/personal_expense/api/expenses.php');
        expensesState.expenses = data.expenses || [];
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
        expensesState.categories = data.categories || [];
        renderCategoryOptions();
        renderCategoryFilters();
    } catch (error) {
        throw new Error('Failed to load categories');
    }
}

/**
 * Render category options in form select
 */
function renderCategoryOptions() {
    const categorySelect = document.getElementById('category_id');
    if (!categorySelect) return;

    categorySelect.innerHTML = '<option value="">Select a category</option>';
    expensesState.categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
    });
}

/**
 * Render category options in filter dropdown
 */
function renderCategoryFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;

    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    expensesState.categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        categoryFilter.appendChild(option);
    });
}

/**
 * Apply filters to expenses
 */
function applyFilters() {
    let filtered = [...expensesState.expenses];

    // Search filter
    if (expensesState.filters.search) {
        const searchTerm = expensesState.filters.search.toLowerCase();
        filtered = filtered.filter(expense => 
            (expense.description || '').toLowerCase().includes(searchTerm) ||
            (expense.notes || '').toLowerCase().includes(searchTerm)
        );
    }

    // Category filter
    if (expensesState.filters.category) {
        filtered = filtered.filter(expense => 
            expense.category_id == expensesState.filters.category
        );
    }

    // Date range filter
    filtered = filterByDateRange(filtered);

    // Sort
    filtered = sortExpenses(filtered);

    expensesState.filteredExpenses = filtered;
    expensesState.currentPage = 1; // Reset to first page
    updateFilterSummary();
}

/**
 * Filter expenses by date range
 */
function filterByDateRange(expenses) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return expenses.filter(expense => {
        const expenseDate = new Date(expense.expense_date);

        switch (expensesState.filters.dateRange) {
            case 'all':
                return true;

            case 'today':
                return expenseDate.toDateString() === today.toDateString();

            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return expenseDate >= weekAgo;

            case 'month':
                return expenseDate.getMonth() === now.getMonth() && 
                       expenseDate.getFullYear() === now.getFullYear();

            case 'last30':
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return expenseDate >= thirtyDaysAgo;

            case 'last90':
                const ninetyDaysAgo = new Date(today);
                ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                return expenseDate >= ninetyDaysAgo;

            case 'year':
                return expenseDate.getFullYear() === now.getFullYear();

            case 'custom':
                if (!expensesState.filters.startDate && !expensesState.filters.endDate) {
                    return true;
                }
                const start = expensesState.filters.startDate ? 
                    new Date(expensesState.filters.startDate) : new Date(0);
                const end = expensesState.filters.endDate ? 
                    new Date(expensesState.filters.endDate) : new Date();
                return expenseDate >= start && expenseDate <= end;

            default:
                return true;
        }
    });
}

/**
 * Sort expenses
 */
function sortExpenses(expenses) {
    return expenses.sort((a, b) => {
        let aVal = a[expensesState.sortColumn];
        let bVal = b[expensesState.sortColumn];

        // Convert to numbers for amount
        if (expensesState.sortColumn === 'amount') {
            aVal = parseFloat(aVal);
            bVal = parseFloat(bVal);
        }

        // Convert to dates for expense_date
        if (expensesState.sortColumn === 'expense_date') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }

        if (aVal < bVal) {
            return expensesState.sortDirection === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
            return expensesState.sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
    });
}

/**
 * Update filter summary stats
 */
function updateFilterSummary() {
    const total = expensesState.filteredExpenses.reduce(
        (sum, exp) => sum + parseFloat(exp.amount), 0
    );
    const count = expensesState.filteredExpenses.length;
    const average = count > 0 ? total / count : 0;

    const totalEl = document.getElementById('filteredTotal');
    const countEl = document.getElementById('filteredCount');
    const averageEl = document.getElementById('filteredAverage');

    if (totalEl) totalEl.textContent = utils.formatCurrency(total);
    if (countEl) countEl.textContent = count;
    if (averageEl) averageEl.textContent = utils.formatCurrency(average);
}

/**
 * Render expenses table
 */
function renderExpensesTable() {
    const tbody = document.getElementById('expensesTableBody');
    const emptyState = document.getElementById('emptyState');
    const paginationContainer = document.getElementById('paginationContainer');

    if (!tbody) return;

    // Show empty state if no expenses
    if (expensesState.filteredExpenses.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        if (paginationContainer) paginationContainer.classList.add('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    // Pagination
    const startIndex = (expensesState.currentPage - 1) * expensesState.itemsPerPage;
    const endIndex = startIndex + expensesState.itemsPerPage;
    const paginatedExpenses = expensesState.filteredExpenses.slice(startIndex, endIndex);

    // Render table rows
    tbody.innerHTML = paginatedExpenses.map(expense => {
        const category = expensesState.categories.find(c => c.id == expense.category_id);
        const categoryColor = category?.color || '#6366f1';
        
        return `
            <tr class="expense-row" data-expense-id="${expense.id}">
                <td>
                    <div class="font-medium">${utils.formatDate(expense.expense_date)}</div>
                    <div class="text-sm text-muted">${getDayOfWeek(expense.expense_date)}</div>
                </td>
                <td>
                    <div class="font-medium">${escapeHtml(expense.description || 'No description')}</div>
                    ${expense.notes ? `<div class="text-sm text-muted expense-notes">${escapeHtml(expense.notes.substring(0, 50))}${expense.notes.length > 50 ? '...' : ''}</div>` : ''}
                </td>
                <td>
                    <span class="badge" style="background-color: ${categoryColor}20; color: ${categoryColor}; border: 1px solid ${categoryColor}40;">
                        ${escapeHtml(category?.name || 'Uncategorized')}
                    </span>
                </td>
                <td class="text-right">
                    <div class="font-semibold text-lg">${utils.formatCurrency(expense.amount)}</div>
                </td>
                <td class="text-center">
                    <div class="action-buttons">
                        <button 
                            class="btn btn-sm btn-ghost action-btn" 
                            onclick="editExpense(${expense.id})"
                            title="Edit expense"
                        >
                            ✏️
                        </button>
                        <button 
                            class="btn btn-sm btn-ghost action-btn text-destructive" 
                            onclick="showDeleteConfirmation(${expense.id})"
                            title="Delete expense"
                        >
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Update pagination
    renderPagination();
}

/**
 * Render pagination controls
 */
function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    const totalExpenses = expensesState.filteredExpenses.length;

    if (totalExpenses <= expensesState.itemsPerPage) {
        if (paginationContainer) paginationContainer.classList.add('hidden');
        return;
    }

    if (paginationContainer) paginationContainer.classList.remove('hidden');

    const totalPages = Math.ceil(totalExpenses / expensesState.itemsPerPage);
    const startIndex = (expensesState.currentPage - 1) * expensesState.itemsPerPage;
    const endIndex = Math.min(startIndex + expensesState.itemsPerPage, totalExpenses);

    // Update info text
    document.getElementById('showingFrom').textContent = startIndex + 1;
    document.getElementById('showingTo').textContent = endIndex;
    document.getElementById('totalExpenses').textContent = totalExpenses;

    // Update prev/next buttons
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
        prevBtn.disabled = expensesState.currentPage === 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = expensesState.currentPage === totalPages;
    }

    // Render page numbers
    const pageNumbers = document.getElementById('pageNumbers');
    if (pageNumbers) {
        pageNumbers.innerHTML = '';
        
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || 
                i === totalPages || 
                (i >= expensesState.currentPage - 1 && i <= expensesState.currentPage + 1)
            ) {
                const btn = document.createElement('button');
                btn.className = `btn btn-sm ${i === expensesState.currentPage ? 'btn-primary' : 'btn-outline'}`;
                btn.textContent = i;
                btn.onclick = () => goToPage(i);
                pageNumbers.appendChild(btn);
            } else if (
                i === expensesState.currentPage - 2 || 
                i === expensesState.currentPage + 2
            ) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.className = 'pagination-dots';
                pageNumbers.appendChild(dots);
            }
        }
    }
}

/**
 * Go to specific page
 */
function goToPage(page) {
    expensesState.currentPage = page;
    renderExpensesTable();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Add expense button
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', openAddExpenseModal);
    }

    // Expense form submit
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
    }

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                expensesState.filters.search = e.target.value;
                applyFilters();
                renderExpensesTable();
            }, 300); // Debounce
        });
    }

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            expensesState.filters.category = e.target.value;
            applyFilters();
            renderExpensesTable();
        });
    }

    // Date range filter
    const dateRangeFilter = document.getElementById('dateRangeFilter');
    if (dateRangeFilter) {
        dateRangeFilter.addEventListener('change', (e) => {
            expensesState.filters.dateRange = e.target.value;
            toggleCustomDateRange(e.target.value === 'custom');
            applyFilters();
            renderExpensesTable();
        });
    }

    // Custom date range inputs
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (startDate) {
        startDate.addEventListener('change', (e) => {
            expensesState.filters.startDate = e.target.value;
            applyFilters();
            renderExpensesTable();
        });
    }
    
    if (endDate) {
        endDate.addEventListener('change', (e) => {
            expensesState.filters.endDate = e.target.value;
            applyFilters();
            renderExpensesTable();
        });
    }

    // Clear filters button
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Sort table columns
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', (e) => {
            const column = e.currentTarget.dataset.sort;
            
            if (expensesState.sortColumn === column) {
                expensesState.sortDirection = expensesState.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                expensesState.sortColumn = column;
                expensesState.sortDirection = 'desc';
            }
            
            updateSortIcons();
            applyFilters();
            renderExpensesTable();
        });
    });

    // Pagination buttons
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (expensesState.currentPage > 1) {
                goToPage(expensesState.currentPage - 1);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(
                expensesState.filteredExpenses.length / expensesState.itemsPerPage
            );
            if (expensesState.currentPage < totalPages) {
                goToPage(expensesState.currentPage + 1);
            }
        });
    }

    // Delete confirmation
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDeleteExpense);
    }
}

/**
 * Setup notes character counter
 */
function setupNotesCounter() {
    const notesField = document.getElementById('notes');
    const notesCount = document.getElementById('notesCount');
    
    if (notesField && notesCount) {
        notesField.addEventListener('input', (e) => {
            notesCount.textContent = e.target.value.length;
        });
    }
}

/**
 * Toggle custom date range inputs
 */
function toggleCustomDateRange(show) {
    const customDateRange = document.getElementById('customDateRange');
    const customDateRangeTo = document.getElementById('customDateRangeTo');
    
    if (show) {
        customDateRange?.classList.remove('hidden');
        customDateRangeTo?.classList.remove('hidden');
    } else {
        customDateRange?.classList.add('hidden');
        customDateRangeTo?.classList.add('hidden');
    }
}

/**
 * Update sort icons
 */
function updateSortIcons() {
    document.querySelectorAll('.sortable').forEach(th => {
        const icon = th.querySelector('.sort-icon');
        if (!icon) return;
        
        if (th.dataset.sort === expensesState.sortColumn) {
            icon.textContent = expensesState.sortDirection === 'asc' ? '↑' : '↓';
            th.classList.add('sorted');
        } else {
            icon.textContent = '⇅';
            th.classList.remove('sorted');
        }
    });
}

/**
 * Clear all filters
 */
function clearFilters() {
    expensesState.filters = {
        search: '',
        category: '',
        dateRange: 'month',
        startDate: '',
        endDate: ''
    };
    
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('dateRangeFilter').value = 'month';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    
    toggleCustomDateRange(false);
    applyFilters();
    renderExpensesTable();
}

/**
 * Open add expense modal
 */
function openAddExpenseModal() {
    expensesState.currentExpense = null;
    document.getElementById('expenseForm').reset();
    document.getElementById('expense_date').value = new Date().toISOString().split('T')[0];
    document.getElementById('expenseModalTitle').textContent = 'Add New Expense';
    document.getElementById('saveButtonText').textContent = 'Save Expense';
    document.getElementById('notesCount').textContent = '0';
    modal.open('expenseModal');
}

/**
 * Edit expense
 */
async function editExpense(id) {
    const expense = expensesState.expenses.find(e => e.id == id);
    if (!expense) return;

    expensesState.currentExpense = id;
    
    // Fill form
    document.getElementById('description').value = expense.description || '';
    document.getElementById('amount').value = expense.amount;
    document.getElementById('category_id').value = expense.category_id;
    document.getElementById('expense_date').value = expense.expense_date;
    document.getElementById('notes').value = expense.notes || '';
    document.getElementById('notesCount').textContent = (expense.notes || '').length;
    
    document.getElementById('expenseModalTitle').textContent = 'Edit Expense';
    document.getElementById('saveButtonText').textContent = 'Update Expense';
    modal.open('expenseModal');
}

/**
 * Handle expense form submission
 */
async function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const expenseData = {
        description: formData.get('description'),
        amount: formData.get('amount'),
        category_id: formData.get('category_id'),
        expense_date: formData.get('expense_date'),
        notes: formData.get('notes')
    };

    try {
        const url = expensesState.currentExpense 
            ? `/personal_expense/api/expenses.php?id=${expensesState.currentExpense}`
            : '/personal_expense/api/expenses.php';
        
        const method = expensesState.currentExpense ? 'PUT' : 'POST';

        await utils.apiRequest(url, {
            method: method,
            body: JSON.stringify(expenseData)
        });

        modal.close('expenseModal');
        await loadExpenses();
        applyFilters();
        renderExpensesTable();
        
        utils.showAlert(
            expensesState.currentExpense ? 'Expense updated successfully' : 'Expense added successfully',
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
    const expense = expensesState.expenses.find(e => e.id == id);
    if (!expense) return;

    const category = expensesState.categories.find(c => c.id == expense.category_id);
    const detailsDiv = document.getElementById('deleteExpenseDetails');
    
    if (detailsDiv) {
        detailsDiv.innerHTML = `
            <div class="card" style="background-color: hsl(var(--muted));">
                <div class="card-content" style="padding: 1rem;">
                    <div class="font-medium">${escapeHtml(expense.description || 'No description')}</div>
                    <div class="text-sm text-muted mt-1">
                        ${utils.formatCurrency(expense.amount)} • ${category?.name || 'Uncategorized'}
                    </div>
                    <div class="text-sm text-muted">${utils.formatDate(expense.expense_date)}</div>
                </div>
            </div>
        `;
    }
    
    expensesState.currentExpense = id;
    modal.open('deleteModal');
}

/**
 * Confirm delete expense
 */
async function confirmDeleteExpense() {
    if (!expensesState.currentExpense) return;

    try {
        await utils.apiRequest(`/personal_expense/api/expenses.php?id=${expensesState.currentExpense}`, {
            method: 'DELETE'
        });

        modal.close('deleteModal');
        await loadExpenses();
        applyFilters();
        renderExpensesTable();
        
        utils.showAlert('Expense deleted successfully', 'success');
        expensesState.currentExpense = null;
    } catch (error) {
        utils.showAlert(error.message, 'error');
    }
}

/**
 * Utility: Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Utility: Get day of week
 */
function getDayOfWeek(dateString) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initExpensesPage);

// Make functions globally available
window.editExpense = editExpense;
window.showDeleteConfirmation = showDeleteConfirmation;
window.goToPage = goToPage;
