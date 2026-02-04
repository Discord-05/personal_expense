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
    <title>Categories - Personal Expense Tracker</title>
    <link rel="stylesheet" href="assets/css/theme.css">
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/dashboard.css">
    <link rel="stylesheet" href="assets/css/categories.css">
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
                <a href="expenses.php" class="nav-item">
                    <span class="nav-icon">💳</span>
                    Expenses
                </a>
                <a href="categories.php" class="nav-item active">
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
                    <h1 class="dashboard-title">Categories</h1>
                    <p class="text-sm text-muted">Organize your expenses with custom categories and budgets</p>
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
                    <button id="addCategoryBtn" class="btn btn-primary">
                        + Add New Category
                    </button>
                </div>
            </header>

            <div class="dashboard-body">
                <!-- Summary Cards -->
                <div class="stats-grid mb-4">
                    <div class="stat-card">
                        <div class="stat-label">Total Categories</div>
                        <div class="stat-value" id="totalCategories">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Total Monthly Budget</div>
                        <div class="stat-value" id="totalBudget">$0.00</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">This Month's Spending</div>
                        <div class="stat-value" id="totalSpending">$0.00</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Budget Remaining</div>
                        <div class="stat-value" id="budgetRemaining">$0.00</div>
                    </div>
                </div>

                <!-- Categories Grid -->
                <div class="card">
                    <div class="card-header">
                        <div>
                            <h3 class="card-title">Your Categories</h3>
                            <p class="card-description">Manage categories and set monthly budgets</p>
                        </div>
                    </div>
                    <div class="card-content p-0">
                        <div id="categoriesGrid" class="categories-grid">
                            <!-- Categories will be loaded here -->
                            <div class="text-center p-4">
                                <div class="spinner" style="margin: 0 auto;"></div>
                                <p class="mt-2 text-muted">Loading categories...</p>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div id="emptyState" class="empty-state hidden">
                            <div class="empty-icon">📁</div>
                            <h3>No Categories Yet</h3>
                            <p class="text-muted">Create your first category to start organizing expenses!</p>
                            <button class="btn btn-primary mt-3" onclick="openAddCategoryModal()">
                                + Add New Category
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Budget Alerts -->
                <div id="budgetAlertsSection" class="mt-4 hidden">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">⚠️ Budget Alerts</h3>
                            <p class="card-description">Categories approaching or exceeding budget limits</p>
                        </div>
                        <div class="card-content">
                            <div id="budgetAlerts"></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Add/Edit Category Modal -->
    <div id="categoryModal" class="modal-overlay hidden">
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title" id="categoryModalTitle">Add New Category</h2>
                <button type="button" class="modal-close">✕</button>
            </div>
            <form id="categoryForm">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="categoryName" class="label">
                            Category Name <span class="text-destructive">*</span>
                        </label>
                        <input 
                            type="text" 
                            id="categoryName" 
                            name="name" 
                            class="input" 
                            placeholder="e.g., Food & Dining"
                            required
                            maxlength="50"
                        >
                        <div class="form-help">Choose a descriptive name for this category</div>
                    </div>

                    <div class="form-group">
                        <label for="categoryColor" class="label">
                            Category Color <span class="text-destructive">*</span>
                        </label>
                        <div class="color-picker-container">
                            <input 
                                type="color" 
                                id="categoryColor" 
                                name="color" 
                                class="color-input" 
                                value="#6366f1"
                                required
                            >
                            <div class="color-preview" id="colorPreview">
                                <div class="color-preview-box"></div>
                                <span class="color-preview-text">#6366f1</span>
                            </div>
                        </div>
                        <div class="form-help">This color will be used in charts and graphs</div>
                        
                        <!-- Preset Colors -->
                        <div class="preset-colors">
                            <button type="button" class="preset-color" data-color="#ef4444" style="background-color: #ef4444;" title="Red"></button>
                            <button type="button" class="preset-color" data-color="#f59e0b" style="background-color: #f59e0b;" title="Orange"></button>
                            <button type="button" class="preset-color" data-color="#eab308" style="background-color: #eab308;" title="Yellow"></button>
                            <button type="button" class="preset-color" data-color="#22c55e" style="background-color: #22c55e;" title="Green"></button>
                            <button type="button" class="preset-color" data-color="#06b6d4" style="background-color: #06b6d4;" title="Cyan"></button>
                            <button type="button" class="preset-color" data-color="#3b82f6" style="background-color: #3b82f6;" title="Blue"></button>
                            <button type="button" class="preset-color" data-color="#6366f1" style="background-color: #6366f1;" title="Indigo"></button>
                            <button type="button" class="preset-color" data-color="#8b5cf6" style="background-color: #8b5cf6;" title="Purple"></button>
                            <button type="button" class="preset-color" data-color="#ec4899" style="background-color: #ec4899;" title="Pink"></button>
                            <button type="button" class="preset-color" data-color="#14b8a6" style="background-color: #14b8a6;" title="Teal"></button>
                            <button type="button" class="preset-color" data-color="#10b981" style="background-color: #10b981;" title="Emerald"></button>
                            <button type="button" class="preset-color" data-color="#6b7280" style="background-color: #6b7280;" title="Gray"></button>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="categoryIcon" class="label">
                            Icon <span class="text-muted">(Optional)</span>
                        </label>
                        <select id="categoryIcon" name="icon" class="input">
                            <option value="tag">🏷️ Tag (Default)</option>
                            <option value="utensils">🍴 Utensils</option>
                            <option value="car">🚗 Car</option>
                            <option value="shopping-bag">🛍️ Shopping Bag</option>
                            <option value="film">🎬 Film</option>
                            <option value="file-text">📄 File</option>
                            <option value="heart">❤️ Heart</option>
                            <option value="book">📚 Book</option>
                            <option value="home">🏠 Home</option>
                            <option value="briefcase">💼 Briefcase</option>
                            <option value="phone">📱 Phone</option>
                            <option value="coffee">☕ Coffee</option>
                            <option value="plane">✈️ Plane</option>
                            <option value="gift">🎁 Gift</option>
                            <option value="tool">🔧 Tool</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="categoryBudget" class="label">
                            Monthly Budget <span class="text-muted">(Optional)</span>
                        </label>
                        <input 
                            type="number" 
                            id="categoryBudget" 
                            name="budget" 
                            class="input" 
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                        >
                        <div class="form-help">Set a monthly spending limit for this category</div>
                    </div>

                    <div class="form-group">
                        <label for="categoryPriority" class="label">
                            Category Priority <span class="text-destructive">*</span>
                        </label>
                        <select id="categoryPriority" name="priority" class="input" required>
                            <option value="essential">🟢 Essential - Necessary expenses (rent, groceries, medical, utilities)</option>
                            <option value="moderate" selected>🟡 Moderate - Reasonable expenses (shopping, personal care)</option>
                            <option value="discretionary">🔴 Discretionary - Can be reduced (entertainment, dining out, hobbies)</option>
                        </select>
                        <div class="form-help">This helps analyze your spending and provide savings recommendations</div>
                    </div>

                    <div class="form-group" id="budgetAlertSettings">
                        <label class="label">Budget Alert Settings</label>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="alertEnabled" name="alert_enabled" checked>
                                <span>Enable budget alerts for this category</span>
                            </label>
                        </div>
                        <div class="mt-2" id="alertThresholdContainer">
                            <label for="alertThreshold" class="label text-sm">
                                Alert me when spending reaches
                            </label>
                            <div class="input-group">
                                <input 
                                    type="number" 
                                    id="alertThreshold" 
                                    name="alert_threshold" 
                                    class="input" 
                                    value="80"
                                    min="1"
                                    max="100"
                                    step="1"
                                >
                                <span class="input-addon">%</span>
                            </div>
                            <div class="form-help">Default: Alert at 80% of budget</div>
                        </div>
                    </div>

                    <!-- Budget Preview -->
                    <div id="budgetPreview" class="budget-preview hidden">
                        <div class="budget-preview-header">
                            <span>Budget Preview</span>
                        </div>
                        <div class="budget-preview-bar">
                            <div class="budget-preview-progress" id="budgetPreviewProgress"></div>
                        </div>
                        <div class="budget-preview-text">
                            <span id="budgetPreviewSpent">$0.00</span> spent of 
                            <span id="budgetPreviewLimit">$0.00</span> budget
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline modal-close">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <span id="saveButtonText">Save Category</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="deleteModal" class="modal-overlay hidden">
        <div class="modal modal-sm">
            <div class="modal-header">
                <h2 class="modal-title">Delete Category</h2>
                <button type="button" class="modal-close">✕</button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete this category?</p>
                <div id="deleteCategoryWarning" class="alert alert-warning mt-3 hidden">
                    <strong>⚠️ Warning:</strong> This category has <span id="expenseCount">0</span> associated expenses. 
                    Deleting it will set those expenses to "Uncategorized".
                </div>
                <div id="deleteCategoryDetails" class="category-delete-preview mt-3"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline modal-close">Cancel</button>
                <button type="button" id="confirmDeleteBtn" class="btn btn-destructive">
                    Delete Category
                </button>
            </div>
        </div>
    </div>

    <script src="assets/js/theme.js"></script>
    <script src="assets/js/main.js"></script>
    <script src="assets/js/categories.js"></script>
</body>
</html>
