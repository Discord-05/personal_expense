/**
 * Personal Expense Tracker - Reports Page JavaScript
 */

// Reports Page State
const reportsState = {
    expenses: [],
    categories: [],
    filteredExpenses: [],
    dateRange: {
        preset: 'last30',
        startDate: null,
        endDate: null
    },
    charts: {
        categoryPie: null,
        expenseTrend: null
    },
    currentChartType: 'line'
};

/**
 * Initialize Reports Page
 */
async function initReportsPage() {
    try {
        await Promise.all([
            loadExpenses(),
            loadCategories()
        ]);
        
        setDefaultDateRange();
        applyDateFilter();
        renderCharts();
        renderCategorySummary();
        renderTransactionsTable();
        updateStats();
        setupEventListeners();
    } catch (error) {
        console.error('Reports page initialization error:', error);
        utils.showAlert('Failed to load reports data', 'error');
    }
}

/**
 * Load expenses from API
 */
async function loadExpenses() {
    try {
        const data = await utils.apiRequest('/personal_expense/api/expenses.php');
        reportsState.expenses = data.expenses || [];
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
        reportsState.categories = data.categories || [];
    } catch (error) {
        throw new Error('Failed to load categories');
    }
}

/**
 * Set default date range (Last 30 Days)
 */
function setDefaultDateRange() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    reportsState.dateRange.startDate = thirtyDaysAgo;
    reportsState.dateRange.endDate = today;
    reportsState.dateRange.preset = 'last30';
}

/**
 * Apply date filter to expenses
 */
function applyDateFilter() {
    const { startDate, endDate } = reportsState.dateRange;
    
    reportsState.filteredExpenses = reportsState.expenses.filter(expense => {
        const expenseDate = new Date(expense.expense_date);
        return expenseDate >= startDate && expenseDate <= endDate;
    });
    
    updateSelectedRangeDisplay();
}

/**
 * Update selected range display
 */
function updateSelectedRangeDisplay() {
    const { startDate, endDate, preset } = reportsState.dateRange;
    
    const presetNames = {
        'last30': 'Last 30 Days',
        'last60': 'Last 60 Days',
        'last90': 'Last 3 Months',
        'last180': 'Last 6 Months',
        'thisYear': 'This Year',
        'lastYear': 'Last Year',
        'allTime': 'All Time',
        'custom': 'Custom Range'
    };
    
    document.getElementById('selectedRangeText').textContent = presetNames[preset] || 'Custom Range';
    
    const dateStr = `${utils.formatDate(startDate)} - ${utils.formatDate(endDate)}`;
    document.getElementById('selectedRangeDates').textContent = dateStr;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Date preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', handlePresetClick);
    });
    
    // Custom date range apply
    const applyBtn = document.getElementById('applyCustomRange');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyCustomDateRange);
    }
    
    // Export CSV button
    const exportBtn = document.getElementById('exportCsvBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
    
    // Chart type toggle
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', handleChartTypeToggle);
    });
    
    // Sort controls
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', () => {
            renderCategorySummary();
        });
    }
}

/**
 * Handle preset date range click
 */
function handlePresetClick(e) {
    const preset = e.target.dataset.preset;
    
    // Update active state
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Show/hide custom date range
    const customRange = document.getElementById('customDateRange');
    if (preset === 'custom') {
        customRange.classList.remove('hidden');
        return;
    } else {
        customRange.classList.add('hidden');
    }
    
    // Calculate date range based on preset
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let startDate = new Date(today);
    
    switch (preset) {
        case 'last30':
            startDate.setDate(today.getDate() - 30);
            break;
        case 'last60':
            startDate.setDate(today.getDate() - 60);
            break;
        case 'last90':
            startDate.setDate(today.getDate() - 90);
            break;
        case 'last180':
            startDate.setDate(today.getDate() - 180);
            break;
        case 'thisYear':
            startDate = new Date(today.getFullYear(), 0, 1);
            break;
        case 'lastYear':
            startDate = new Date(today.getFullYear() - 1, 0, 1);
            const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
            reportsState.dateRange.endDate = endOfLastYear;
            break;
        case 'allTime':
            startDate = new Date('2000-01-01');
            break;
    }
    
    startDate.setHours(0, 0, 0, 0);
    
    reportsState.dateRange.startDate = startDate;
    if (preset !== 'lastYear') {
        reportsState.dateRange.endDate = today;
    }
    reportsState.dateRange.preset = preset;
    
    refreshReports();
}

/**
 * Apply custom date range
 */
function applyCustomDateRange() {
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');
    
    if (!startInput.value || !endInput.value) {
        utils.showAlert('Please select both start and end dates', 'error');
        return;
    }
    
    const startDate = new Date(startInput.value);
    const endDate = new Date(endInput.value);
    
    if (startDate > endDate) {
        utils.showAlert('Start date must be before end date', 'error');
        return;
    }
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    reportsState.dateRange.startDate = startDate;
    reportsState.dateRange.endDate = endDate;
    reportsState.dateRange.preset = 'custom';
    
    refreshReports();
}

/**
 * Refresh all reports with current filters
 */
function refreshReports() {
    applyDateFilter();
    renderCharts();
    renderCategorySummary();
    renderTransactionsTable();
    updateStats();
}

/**
 * Update statistics
 */
function updateStats() {
    const expenses = reportsState.filteredExpenses;
    const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const expenseCount = expenses.length;
    
    // Calculate date range in days
    const daysDiff = Math.ceil(
        (reportsState.dateRange.endDate - reportsState.dateRange.startDate) / (1000 * 60 * 60 * 24)
    );
    const dailyAvg = daysDiff > 0 ? totalAmount / daysDiff : 0;
    
    // Find top category
    const categoryTotals = {};
    expenses.forEach(e => {
        const catId = e.category_id || 'uncategorized';
        categoryTotals[catId] = (categoryTotals[catId] || 0) + parseFloat(e.amount);
    });
    
    let topCategoryId = null;
    let topAmount = 0;
    Object.entries(categoryTotals).forEach(([catId, amount]) => {
        if (amount > topAmount) {
            topAmount = amount;
            topCategoryId = catId;
        }
    });
    
    const topCategory = reportsState.categories.find(c => c.id == topCategoryId);
    const categoryCount = Object.keys(categoryTotals).length;
    
    // Update DOM
    document.getElementById('totalExpenses').textContent = utils.formatCurrency(totalAmount);
    document.getElementById('expenseCount').textContent = `${expenseCount} transaction${expenseCount !== 1 ? 's' : ''}`;
    document.getElementById('dailyAverage').textContent = utils.formatCurrency(dailyAvg);
    document.getElementById('dayCount').textContent = `${daysDiff} day${daysDiff !== 1 ? 's' : ''}`;
    document.getElementById('topCategory').textContent = topCategory ? topCategory.name : 'N/A';
    document.getElementById('topCategoryAmount').textContent = utils.formatCurrency(topAmount);
    document.getElementById('categoryCount').textContent = categoryCount;
}

/**
 * Render charts
 */
function renderCharts() {
    renderCategoryPieChart();
    renderExpenseTrendChart();
}

/**
 * Render category pie chart
 */
function renderCategoryPieChart() {
    const canvas = document.getElementById('categoryPieChart');
    const emptyState = document.getElementById('noCategoryData');
    
    if (!canvas) return;
    
    // Calculate category totals
    const categoryTotals = {};
    const categoryColors = {};
    
    reportsState.filteredExpenses.forEach(expense => {
        const catId = expense.category_id || 'uncategorized';
        const catName = expense.category_name || 'Uncategorized';
        const catColor = expense.category_color || '#6b7280';
        
        if (!categoryTotals[catName]) {
            categoryTotals[catName] = 0;
            categoryColors[catName] = catColor;
        }
        categoryTotals[catName] += parseFloat(expense.amount);
    });
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = labels.map(label => categoryColors[label]);
    
    // Show/hide empty state
    if (labels.length === 0) {
        canvas.style.display = 'none';
        emptyState.classList.remove('hidden');
        if (reportsState.charts.categoryPie) {
            reportsState.charts.categoryPie.destroy();
            reportsState.charts.categoryPie = null;
        }
        return;
    } else {
        canvas.style.display = 'block';
        emptyState.classList.add('hidden');
    }
    
    // Destroy existing chart
    if (reportsState.charts.categoryPie) {
        reportsState.charts.categoryPie.destroy();
    }
    
    // Create new chart
    const ctx = canvas.getContext('2d');
    const themeColors = ThemeManager.getChartColors();
    
    reportsState.charts.categoryPie = new Chart(ctx, {
        type: 'pie',
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
                        padding: 15,
                        font: {
                            size: 12
                        },
                        color: themeColors.text
                    }
                },
                tooltip: {
                    backgroundColor: themeColors.tooltipBg,
                    titleColor: themeColors.text,
                    bodyColor: themeColors.text,
                    borderColor: themeColors.tooltipBorder,
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${utils.formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Render expense trend chart
 */
function renderExpenseTrendChart() {
    const canvas = document.getElementById('expenseTrendChart');
    const emptyState = document.getElementById('noTrendData');
    
    if (!canvas) return;
    
    // Group expenses by date
    const dateGroups = {};
    
    reportsState.filteredExpenses.forEach(expense => {
        const date = expense.expense_date;
        if (!dateGroups[date]) {
            dateGroups[date] = 0;
        }
        dateGroups[date] += parseFloat(expense.amount);
    });
    
    // Sort by date
    const sortedDates = Object.keys(dateGroups).sort();
    
    // Show/hide empty state
    if (sortedDates.length === 0) {
        canvas.style.display = 'none';
        emptyState.classList.remove('hidden');
        if (reportsState.charts.expenseTrend) {
            reportsState.charts.expenseTrend.destroy();
            reportsState.charts.expenseTrend = null;
        }
        return;
    } else {
        canvas.style.display = 'block';
        emptyState.classList.add('hidden');
    }
    
    // Fill in missing dates for better visualization
    const filledData = fillMissingDates(
        reportsState.dateRange.startDate,
        reportsState.dateRange.endDate,
        dateGroups
    );
    
    const labels = filledData.map(d => utils.formatDate(new Date(d.date)));
    const data = filledData.map(d => d.amount);
    
    // Destroy existing chart
    if (reportsState.charts.expenseTrend) {
        reportsState.charts.expenseTrend.destroy();
    }
    
    // Create new chart
    const ctx = canvas.getContext('2d');
    const themeColors = ThemeManager.getChartColors();
    
    reportsState.charts.expenseTrend = new Chart(ctx, {
        type: reportsState.currentChartType,
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Expenses',
                data: data,
                backgroundColor: reportsState.currentChartType === 'line' 
                    ? themeColors.palette[0] + '20'
                    : themeColors.palette[0] + 'B3',
                borderColor: themeColors.palette[0],
                borderWidth: 2,
                fill: reportsState.currentChartType === 'line',
                tension: 0.4
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
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `Expenses: ${utils.formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: themeColors.grid
                    },
                    ticks: {
                        color: themeColors.text,
                        callback: function(value) {
                            return '₹' + value.toFixed(0).toLocaleString('en-IN');
                        }
                    }
                },
                x: {
                    grid: {
                        color: themeColors.grid
                    },
                    ticks: {
                        color: themeColors.text,
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 15
                    }
                }
            }
        }
    });
}

/**
 * Fill missing dates in data
 */
function fillMissingDates(startDate, endDate, dateGroups) {
    const result = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0];
        result.push({
            date: dateStr,
            amount: dateGroups[dateStr] || 0
        });
        current.setDate(current.getDate() + 1);
    }
    
    return result;
}

/**
 * Handle chart type toggle
 */
function handleChartTypeToggle(e) {
    const chartType = e.target.dataset.chartType;
    
    // Update active state
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    reportsState.currentChartType = chartType;
    renderExpenseTrendChart();
}

/**
 * Render category summary table
 */
function renderCategorySummary() {
    const tbody = document.getElementById('categorySummaryBody');
    const emptyState = document.getElementById('noTableData');
    const table = document.getElementById('categorySummaryTable');
    
    if (!tbody) return;
    
    // Calculate category summaries
    const categorySummaries = {};
    let grandTotal = 0;
    
    reportsState.filteredExpenses.forEach(expense => {
        const catId = expense.category_id || 'uncategorized';
        const catName = expense.category_name || 'Uncategorized';
        const catColor = expense.category_color || '#6b7280';
        const amount = parseFloat(expense.amount);
        
        if (!categorySummaries[catId]) {
            categorySummaries[catId] = {
                id: catId,
                name: catName,
                color: catColor,
                total: 0,
                count: 0
            };
        }
        
        categorySummaries[catId].total += amount;
        categorySummaries[catId].count += 1;
        grandTotal += amount;
    });
    
    let summaries = Object.values(categorySummaries);
    
    // Show/hide empty state
    if (summaries.length === 0) {
        table.style.display = 'none';
        emptyState.classList.remove('hidden');
        return;
    } else {
        table.style.display = 'table';
        emptyState.classList.add('hidden');
    }
    
    // Sort based on selected option
    const sortBy = document.getElementById('sortBy').value;
    summaries = sortCategorySummaries(summaries, sortBy);
    
    // Render rows
    tbody.innerHTML = summaries.map(summary => {
        const percentage = grandTotal > 0 ? (summary.total / grandTotal) * 100 : 0;
        const average = summary.count > 0 ? summary.total / summary.count : 0;
        
        return `
            <tr>
                <td>
                    <div class="category-cell">
                        <span class="category-icon" style="background-color: ${summary.color}20; color: ${summary.color};">
                            ${getCategoryIcon(summary.id)}
                        </span>
                        <span class="category-name">${escapeHtml(summary.name)}</span>
                    </div>
                </td>
                <td>
                    <div class="color-indicator">
                        <span class="color-dot" style="background-color: ${summary.color};"></span>
                        <span class="color-code">${summary.color}</span>
                    </div>
                </td>
                <td class="text-right">${utils.formatCurrency(summary.total)}</td>
                <td class="text-right">${summary.count}</td>
                <td class="text-right">${utils.formatCurrency(average)}</td>
                <td class="text-right">${percentage.toFixed(1)}%</td>
                <td>
                    <div class="percentage-bar">
                        <div class="percentage-fill" style="width: ${percentage}%; background-color: ${summary.color};"></div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Update footer totals
    document.getElementById('tableTotal').textContent = utils.formatCurrency(grandTotal);
    document.getElementById('tableTransactions').textContent = reportsState.filteredExpenses.length;
    const avgPerTransaction = reportsState.filteredExpenses.length > 0 
        ? grandTotal / reportsState.filteredExpenses.length 
        : 0;
    document.getElementById('tableAverage').textContent = utils.formatCurrency(avgPerTransaction);
}

/**
 * Sort category summaries
 */
function sortCategorySummaries(summaries, sortBy) {
    const sorted = [...summaries];
    
    switch (sortBy) {
        case 'amount':
            return sorted.sort((a, b) => b.total - a.total);
        case 'amountAsc':
            return sorted.sort((a, b) => a.total - b.total);
        case 'category':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'percentage':
            return sorted.sort((a, b) => b.total - a.total); // Same as amount
        case 'count':
            return sorted.sort((a, b) => b.count - a.count);
        default:
            return sorted;
    }
}

/**
 * Render transactions table
 */
function renderTransactionsTable() {
    const tbody = document.getElementById('transactionsBody');
    const emptyState = document.getElementById('noTransactionData');
    const table = document.getElementById('transactionsTable');
    const countEl = document.getElementById('transactionCount');
    
    if (!tbody) return;
    
    const expenses = [...reportsState.filteredExpenses].sort((a, b) => {
        return new Date(b.expense_date) - new Date(a.expense_date);
    });
    
    if (expenses.length === 0) {
        table.style.display = 'none';
        emptyState.classList.remove('hidden');
        countEl.textContent = '0 transactions';
        return;
    } else {
        table.style.display = 'table';
        emptyState.classList.add('hidden');
        countEl.textContent = `${expenses.length} transaction${expenses.length !== 1 ? 's' : ''}`;
    }
    
    tbody.innerHTML = expenses.map(expense => `
        <tr>
            <td>${utils.formatDate(new Date(expense.expense_date))}</td>
            <td>${escapeHtml(expense.description || 'No description')}</td>
            <td>
                <div class="category-cell">
                    <span class="color-dot" style="background-color: ${expense.category_color || '#6b7280'};"></span>
                    <span>${escapeHtml(expense.category_name || 'Uncategorized')}</span>
                </div>
            </td>
            <td class="text-right">${utils.formatCurrency(expense.amount)}</td>
            <td class="text-muted text-sm">${escapeHtml(expense.notes || '-')}</td>
        </tr>
    `).join('');
}

/**
 * Export data to CSV
 */
function exportToCSV() {
    if (reportsState.filteredExpenses.length === 0) {
        utils.showAlert('No data to export', 'error');
        return;
    }
    
    // Create CSV content
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Notes'];
    const rows = reportsState.filteredExpenses.map(expense => [
        expense.expense_date,
        expense.description || '',
        expense.category_name || 'Uncategorized',
        expense.amount,
        expense.notes || ''
    ]);
    
    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
            // Escape cells containing commas or quotes
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
        }).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const startDate = reportsState.dateRange.startDate.toISOString().split('T')[0];
    const endDate = reportsState.dateRange.endDate.toISOString().split('T')[0];
    const filename = `expenses_${startDate}_to_${endDate}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    utils.showAlert(`Exported ${reportsState.filteredExpenses.length} transactions to CSV`, 'success');
}

/**
 * Download chart as image
 */
function downloadChart(chartId, filename) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = url;
    link.click();
    
    utils.showAlert('Chart downloaded successfully', 'success');
}

/**
 * Get category icon
 */
function getCategoryIcon(categoryId) {
    const category = reportsState.categories.find(c => c.id == categoryId);
    if (!category) return '🏷️';
    
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
    return icons[category.icon] || '🏷️';
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
document.addEventListener('DOMContentLoaded', initReportsPage);

// Listen for theme changes and update charts
window.addEventListener('themeChanged', () => {
    if (reportsState.charts.categoryPie || reportsState.charts.expenseTrend) {
        renderCharts();
    }
});

// Make functions globally available
window.downloadChart = downloadChart;
