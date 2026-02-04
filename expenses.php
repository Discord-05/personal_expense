<?php
require_once 'config/session.php';
requireLogin();

$user = getCurrentUser();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expenses - Personal Expense Tracker</title>
    <link rel="stylesheet" href="assets/css/theme.css">
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/dashboard.css">
    <link rel="stylesheet" href="assets/css/expenses.css">
</head>
<body>
    <div class="dashboard-layout">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">💰 ExpenseTracker</div>
            </div>

            <nav class="sidebar-nav">
                <a href="dashboard.php" class="nav-item">
                    <span class="nav-icon">📊</span>
                    Dashboard
                </a>
                <a href="expenses.php" class="nav-item active">
                    <span class="nav-icon">💳</span>
                    Expenses
                </a>
                <a href="categories.php" class="nav-item">
                    <span class="nav-icon">📁</span>
                    Categories
                </a>
                <a href="reports.php" class="nav-item">
                    <span class="nav-icon">📈</span>
                    Reports
                </a>
            </nav>

            <div class="sidebar-footer">
                <div class="text-sm text-muted mb-2">
                    Logged in as <strong><?php echo htmlspecialchars($user['username']); ?></strong>
                </div>
                <a href="api/auth.php?action=logout" class="btn btn-outline w-full btn-sm">
                    Logout
                </a>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <header class="dashboard-header">
                <div>
                    <h1 class="dashboard-title">Expenses</h1>
                    <p class="text-sm text-muted">Manage all your expense transactions</p>
                </div>
                <div class="user-menu">
                    <button class="theme-toggle" role="button" tabindex="0" aria-label="Toggle theme" title="Toggle theme">
                        <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    </button>
                    <button id="addExpenseBtn" class="btn btn-primary">
                        + Add New Expense
                    </button>
                </div>
            </header>

            <div class="dashboard-body">
                <!-- Filters and Search -->
                <div class="card mb-4">
                    <div class="card-content">
                        <div class="filters-container">
                            <!-- Search Bar -->
                            <div class="filter-group">
                                <label for="searchInput" class="label">Search</label>
                                <input 
                                    type="text" 
                                    id="searchInput" 
                                    class="input" 
                                    placeholder="Search by description..."
                                >
                            </div>

                            <!-- Category Filter -->
                            <div class="filter-group">
                                <label for="categoryFilter" class="label">Category</label>
                                <select id="categoryFilter" class="input">
                                    <option value="">All Categories</option>
                                </select>
                            </div>

                            <!-- Date Range Filter -->
                            <div class="filter-group">
                                <label for="dateRangeFilter" class="label">Date Range</label>
                                <select id="dateRangeFilter" class="input">
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month" selected>This Month</option>
                                    <option value="last30">Last 30 Days</option>
                                    <option value="last90">Last 90 Days</option>
                                    <option value="year">This Year</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>

                            <!-- Custom Date Range (Hidden by default) -->
                            <div id="customDateRange" class="filter-group hidden">
                                <label for="startDate" class="label">From</label>
                                <input type="date" id="startDate" class="input">
                            </div>

                            <div id="customDateRangeTo" class="filter-group hidden">
                                <label for="endDate" class="label">To</label>
                                <input type="date" id="endDate" class="input">
                            </div>

                            <!-- Clear Filters Button -->
                            <div class="filter-group filter-actions">
                                <label class="label" style="visibility: hidden;">Actions</label>
                                <button id="clearFiltersBtn" class="btn btn-outline">
                                    Clear Filters
                                </button>
                            </div>
                        </div>

                        <!-- Summary Stats -->
                        <div class="filter-summary">
                            <div class="summary-item">
                                <span class="summary-label">Total:</span>
                                <span class="summary-value" id="filteredTotal">₹0.00</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Count:</span>
                                <span class="summary-value" id="filteredCount">0</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Average:</span>
                                <span class="summary-value" id="filteredAverage">₹0.00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Expenses Table -->
                <div class="card">
                    <div class="card-content p-0">
                        <div class="table-container">
                            <table class="table expenses-table">
                                <thead>
                                    <tr>
                                        <th class="sortable" data-sort="expense_date">
                                            Date
                                            <span class="sort-icon">⇅</span>
                                        </th>
                                        <th>Description</th>
                                        <th>Category</th>
                                        <th class="sortable text-right" data-sort="amount">
                                            Amount
                                            <span class="sort-icon">⇅</span>
                                        </th>
                                        <th class="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="expensesTableBody">
                                    <!-- Table rows will be populated by JavaScript -->
                                    <tr>
                                        <td colspan="5" class="text-center p-4">
                                            <div class="spinner" style="margin: 0 auto;"></div>
                                            <p class="mt-2 text-muted">Loading expenses...</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Empty State -->
                        <div id="emptyState" class="empty-state hidden">
                            <div class="empty-icon">📋</div>
                            <h3>No Expenses Found</h3>
                            <p class="text-muted">Add your first expense to get started!</p>
                            <button class="btn btn-primary mt-3" onclick="modal.open('expenseModal')">
                                + Add New Expense
                            </button>
                        </div>

                        <!-- Pagination -->
                        <div id="paginationContainer" class="pagination-container hidden">
                            <div class="pagination-info">
                                Showing <span id="showingFrom">1</span> to <span id="showingTo">10</span> of <span id="totalExpenses">0</span> expenses
                            </div>
                            <div class="pagination-controls">
                                <button id="prevPage" class="btn btn-sm btn-outline" disabled>Previous</button>
                                <div id="pageNumbers" class="page-numbers"></div>
                                <button id="nextPage" class="btn btn-sm btn-outline">Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Add/Edit Expense Modal -->
    <div id="expenseModal" class="modal-overlay hidden">
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title" id="expenseModalTitle">Add New Expense</h2>
                <button type="button" class="modal-close">✕</button>
            </div>
            <form id="expenseForm">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="description" class="label">
                            Description <span class="text-destructive">*</span>
                        </label>
                        <input 
                            type="text" 
                            id="description" 
                            name="description" 
                            class="input" 
                            placeholder="e.g., Lunch at restaurant"
                            required
                            maxlength="255"
                        >
                        <div class="form-help">Brief description of the expense</div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div class="form-group">
                            <label for="amount" class="label">
                                Amount <span class="text-destructive">*</span>
                            </label>
                            <input 
                                type="number" 
                                id="amount" 
                                name="amount" 
                                class="input" 
                                placeholder="0.00"
                                step="0.01"
                                min="0.01"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="expense_date" class="label">
                                Date <span class="text-destructive">*</span>
                            </label>
                            <input 
                                type="date" 
                                id="expense_date" 
                                name="expense_date" 
                                class="input" 
                                required
                                value="<?php echo date('Y-m-d'); ?>"
                                max="<?php echo date('Y-m-d'); ?>"
                            >
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="category_id" class="label">
                            Category <span class="text-destructive">*</span>
                        </label>
                        <select id="category_id" name="category_id" class="input category-select" required>
                            <option value="">Select a category</option>
                        </select>
                        <div class="form-help">Choose the category that best fits this expense</div>
                    </div>

                    <div class="form-group">
                        <label for="notes" class="label">
                            Notes <span class="text-muted">(Optional)</span>
                        </label>
                        <textarea 
                            id="notes" 
                            name="notes" 
                            class="input textarea" 
                            rows="3"
                            placeholder="Add any additional details about this expense..."
                            maxlength="500"
                        ></textarea>
                        <div class="form-help">
                            <span id="notesCount">0</span>/500 characters
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline modal-close">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <span id="saveButtonText">Save Expense</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="deleteModal" class="modal-overlay hidden">
        <div class="modal modal-sm">
            <div class="modal-header">
                <h2 class="modal-title">Delete Expense</h2>
                <button type="button" class="modal-close">✕</button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete this expense?</p>
                <p class="text-muted text-sm mt-2">This action cannot be undone.</p>
                <div id="deleteExpenseDetails" class="expense-delete-preview mt-3"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline modal-close">Cancel</button>
                <button type="button" id="confirmDeleteBtn" class="btn btn-destructive">
                    Delete
                </button>
            </div>
        </div>
    </div>

    <script src="assets/js/theme.js"></script>
    <script src="assets/js/main.js"></script>
    <script src="assets/js/expenses.js"></script>
</body>
</html>
