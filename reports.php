<?php
/**
 * Reports Page
 * Advanced expense reporting with charts, data tables, and export
 */

require_once 'config/session.php';
requireLogin();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reports - Personal Expense Tracker</title>
    <link rel="stylesheet" href="assets/css/theme.css">
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/reports.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>
    <div class="app-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2 class="sidebar-title">💰 Expense Tracker</h2>
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
                <a href="categories.php" class="nav-item">
                    <span class="nav-icon">📁</span>
                    Categories
                </a>
                <a href="reports.php" class="nav-item active">
                    <span class="nav-icon">📈</span>
                    Reports
                </a>
            </nav>
            
            <div class="sidebar-footer">
                <div class="user-info">
                    <span class="user-name"><?php echo htmlspecialchars($_SESSION['username']); ?></span>
                    <a href="api/auth.php?action=logout" class="btn btn-sm btn-outline">Logout</a>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Page Header -->
            <div class="page-header">
                <div>
                    <h1>Expense Reports</h1>
                    <p class="page-description">Analyze your spending patterns with detailed charts and data summaries</p>
                </div>
                <div class="header-actions">
                    <button class="theme-toggle" role="button" tabindex="0" aria-label="Toggle theme" title="Toggle theme">
                        <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    </button>
                    <button id="exportCsvBtn" class="btn btn-outline">
                        📥 Export to CSV
                    </button>
                </div>
            </div>

            <!-- Date Range Selector -->
            <div class="card mb-4">
                <div class="card-header">
                    <h3 class="card-title">📅 Date Range</h3>
                </div>
                <div class="card-content">
                    <div class="date-range-selector">
                        <div class="date-presets">
                            <button class="preset-btn active" data-preset="last30">Last 30 Days</button>
                            <button class="preset-btn" data-preset="last60">Last 60 Days</button>
                            <button class="preset-btn" data-preset="last90">Last 3 Months</button>
                            <button class="preset-btn" data-preset="last180">Last 6 Months</button>
                            <button class="preset-btn" data-preset="thisYear">This Year</button>
                            <button class="preset-btn" data-preset="lastYear">Last Year</button>
                            <button class="preset-btn" data-preset="allTime">All Time</button>
                            <button class="preset-btn" data-preset="custom">Custom Range</button>
                        </div>
                        
                        <div id="customDateRange" class="custom-date-range hidden">
                            <div class="form-group">
                                <label for="startDate">Start Date</label>
                                <input type="date" id="startDate" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="endDate">End Date</label>
                                <input type="date" id="endDate" class="form-control">
                            </div>
                            <button id="applyCustomRange" class="btn btn-primary">Apply Range</button>
                        </div>
                        
                        <div class="selected-range-display">
                            <span class="range-label">Selected Period:</span>
                            <span id="selectedRangeText" class="range-text">Last 30 Days</span>
                            <span class="range-dates" id="selectedRangeDates"></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary Stats -->
            <div class="reports-stats">
                <div class="stat-card">
                    <div class="stat-card-header">
                        <span class="stat-card-title">Total Expenses</span>
                        <span class="stat-card-icon">💳</span>
                    </div>
                    <div class="stat-card-value" id="totalExpenses">₹0.00</div>
                    <div class="stat-card-change" id="expenseCount">0 transactions</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-header">
                        <span class="stat-card-title">Daily Average</span>
                        <span class="stat-card-icon">📊</span>
                    </div>
                    <div class="stat-card-value" id="dailyAverage">₹0.00</div>
                    <div class="stat-card-change" id="dayCount">0 days</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-header">
                        <span class="stat-card-title">Top Category</span>
                        <span class="stat-card-icon">🏆</span>
                    </div>
                    <div class="stat-card-value" id="topCategory">-</div>
                    <div class="stat-card-change" id="topCategoryAmount">₹0.00</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-header">
                        <span class="stat-card-title">Categories</span>
                        <span class="stat-card-icon">📁</span>
                    </div>
                    <div class="stat-card-value" id="categoryCount">0</div>
                    <div class="stat-card-change">active categories</div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-grid">
                <!-- Pie Chart - Expenses by Category -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📊 Expenses by Category</h3>
                        <div class="card-actions">
                            <button class="btn btn-sm btn-ghost" onclick="downloadChart('categoryPieChart', 'expenses-by-category')">
                                💾 Save
                            </button>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="chart-container">
                            <canvas id="categoryPieChart"></canvas>
                        </div>
                        <div id="noCategoryData" class="chart-empty-state hidden">
                            <div class="empty-icon">📊</div>
                            <p>No expense data for selected period</p>
                        </div>
                    </div>
                </div>

                <!-- Line/Bar Chart - Expense Trend -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📈 Expense Trend</h3>
                        <div class="card-actions">
                            <div class="chart-type-toggle">
                                <button class="toggle-btn active" data-chart-type="line">Line</button>
                                <button class="toggle-btn" data-chart-type="bar">Bar</button>
                            </div>
                            <button class="btn btn-sm btn-ghost" onclick="downloadChart('expenseTrendChart', 'expense-trend')">
                                💾 Save
                            </button>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="chart-container">
                            <canvas id="expenseTrendChart"></canvas>
                        </div>
                        <div id="noTrendData" class="chart-empty-state hidden">
                            <div class="empty-icon">📈</div>
                            <p>No trend data for selected period</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Data Table Summary -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📋 Category Summary</h3>
                    <div class="card-actions">
                        <div class="sort-controls">
                            <label for="sortBy">Sort by:</label>
                            <select id="sortBy" class="form-control">
                                <option value="amount">Amount (High to Low)</option>
                                <option value="amountAsc">Amount (Low to High)</option>
                                <option value="category">Category (A-Z)</option>
                                <option value="percentage">Percentage</option>
                                <option value="count">Transaction Count</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="card-content">
                    <div class="table-responsive">
                        <table class="data-table" id="categorySummaryTable">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Color</th>
                                    <th class="text-right">Total Amount</th>
                                    <th class="text-right">Transactions</th>
                                    <th class="text-right">Average</th>
                                    <th class="text-right">Percentage</th>
                                    <th>Visual</th>
                                </tr>
                            </thead>
                            <tbody id="categorySummaryBody">
                                <!-- Data will be populated by JavaScript -->
                            </tbody>
                            <tfoot>
                                <tr class="total-row">
                                    <td colspan="2"><strong>Total</strong></td>
                                    <td class="text-right"><strong id="tableTotal">₹0.00</strong></td>
                                    <td class="text-right"><strong id="tableTransactions">0</strong></td>
                                    <td class="text-right"><strong id="tableAverage">₹0.00</strong></td>
                                    <td class="text-right"><strong>100%</strong></td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    
                    <div id="noTableData" class="empty-state hidden">
                        <div class="empty-state-icon">📊</div>
                        <h3>No Data Available</h3>
                        <p>No expenses found for the selected date range.</p>
                    </div>
                </div>
            </div>

            <!-- Detailed Transactions Table -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📝 Detailed Transactions</h3>
                    <div class="card-actions">
                        <span id="transactionCount" class="text-muted">0 transactions</span>
                    </div>
                </div>
                <div class="card-content">
                    <div class="table-responsive">
                        <table class="data-table" id="transactionsTable">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th class="text-right">Amount</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody id="transactionsBody">
                                <!-- Data will be populated by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                    
                    <div id="noTransactionData" class="empty-state hidden">
                        <div class="empty-state-icon">📝</div>
                        <h3>No Transactions</h3>
                        <p>No expense transactions found for the selected date range.</p>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Scripts -->
    <script src="assets/js/theme.js"></script>
    <script src="assets/js/main.js"></script>
    <script src="assets/js/reports.js"></script>
</body>
</html>
