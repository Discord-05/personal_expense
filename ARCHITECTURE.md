# Expenses Page - Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     EXPENSES PAGE                            │
│                    (expenses.php)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─── HTML Structure
                              ├─── Filters Section
                              ├─── Table Section
                              └─── Modals Section
                              
┌─────────────────────────────────────────────────────────────┐
│                   JAVASCRIPT LAYER                           │
│                  (expenses.js)                               │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
    State Mgmt          UI Rendering          API Calls
        │                     │                     │
    ┌───────┐           ┌──────────┐          ┌─────────┐
    │filters│           │renderTable│         │expenses │
    │expenses│          │renderPagi │         │categories│
    │sorting│           │updateStats│         │CRUD ops │
    └───────┘           └──────────┘          └─────────┘
                                                    │
┌─────────────────────────────────────────────────┼─────────┐
│                   PHP API LAYER                 │         │
│                (api/expenses.php)               │         │
└─────────────────────────────────────────────────┼─────────┘
                                                  │
        ┌─────────┬───────────┬──────────────────┘
        │         │           │
     GET       POST        PUT         DELETE
     (load)   (create)   (update)    (delete)
        │         │           │           │
        └─────────┴───────────┴───────────┘
                      │
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                             │
│                 (MySQL - expenses table)                     │
│  Columns: id, user_id, category_id, amount,                 │
│           description, notes, expense_date,                  │
│           created_at, updated_at                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Page Load Flow
```
1. User navigates to expenses.php
        │
        ▼
2. PHP: Check authentication (requireLogin)
        │
        ▼
3. PHP: Render HTML structure
        │
        ▼
4. JS: initExpensesPage() executes
        │
        ├─── loadExpenses() → GET /api/expenses.php
        │                          │
        │                          ▼
        │                   MySQL: SELECT * FROM expenses
        │                          WHERE user_id = ?
        │                          │
        │                          ▼
        │                   Return: JSON array of expenses
        │
        └─── loadCategories() → GET /api/categories.php
                                   │
                                   ▼
                            MySQL: SELECT * FROM categories
                                   WHERE user_id = ?
                                   │
                                   ▼
                            Return: JSON array of categories
        │
        ▼
5. JS: Apply default filters (This Month)
        │
        ▼
6. JS: Sort by date (newest first)
        │
        ▼
7. JS: Render first 10 expenses in table
        │
        ▼
8. JS: Update filter summary stats
        │
        ▼
9. Page ready for user interaction
```

### Add Expense Flow
```
1. User clicks "+ Add New Expense"
        │
        ▼
2. JS: openAddExpenseModal()
        │
        ├─── Reset form
        ├─── Set date to today
        └─── Open modal
        │
        ▼
3. User fills form & clicks "Save Expense"
        │
        ▼
4. JS: handleExpenseSubmit(event)
        │
        ├─── Prevent default form submission
        ├─── Collect form data
        └─── Validate required fields
        │
        ▼
5. JS: POST to /api/expenses.php
        │
        ▼
6. PHP: createExpense()
        │
        ├─── Validate amount > 0
        ├─── Validate category exists
        └─── Check category belongs to user
        │
        ▼
7. MySQL: INSERT INTO expenses
           VALUES (user_id, category_id, amount,
                   description, notes, expense_date)
        │
        ▼
8. PHP: Return success JSON
        │
        ▼
9. JS: Close modal
        │
        ▼
10. JS: Reload expenses
        │
        ▼
11. JS: Re-apply filters & re-render table
        │
        ▼
12. JS: Show success message
```

### Filter Flow
```
1. User changes filter (search/category/date)
        │
        ▼
2. JS: Update expensesState.filters object
        │
        ▼
3. JS: applyFilters()
        │
        ├─── Start with all expenses
        │
        ├─── Apply search filter
        │    └─── Check description & notes
        │
        ├─── Apply category filter
        │    └─── Match category_id
        │
        ├─── Apply date range filter
        │    └─── filterByDateRange()
        │         ├─── Calculate date boundaries
        │         └─── Filter by expense_date
        │
        └─── Sort filtered results
             └─── sortExpenses()
                  └─── Sort by column & direction
        │
        ▼
4. JS: Update expensesState.filteredExpenses
        │
        ▼
5. JS: Reset to page 1
        │
        ▼
6. JS: renderExpensesTable()
        │
        ├─── Calculate pagination
        ├─── Get current page slice
        └─── Generate HTML rows
        │
        ▼
7. JS: updateFilterSummary()
        │
        └─── Calculate total, count, average
        │
        ▼
8. Table updates instantly (no API call needed!)
```

### Edit Expense Flow
```
1. User clicks ✏️ (Edit button)
        │
        ▼
2. JS: editExpense(id)
        │
        ├─── Find expense in state
        ├─── Set currentExpense = id
        └─── Pre-fill form with expense data
        │
        ▼
3. Modal opens with existing data
        │
        ▼
4. User modifies & clicks "Update Expense"
        │
        ▼
5. JS: handleExpenseSubmit(event)
        │
        └─── Detects currentExpense exists
        │
        ▼
6. JS: PUT to /api/expenses.php?id={id}
        │
        ▼
7. PHP: updateExpense()
        │
        ├─── Verify expense belongs to user
        └─── Validate data
        │
        ▼
8. MySQL: UPDATE expenses
           SET category_id = ?, amount = ?,
               description = ?, expense_date = ?,
               notes = ?
           WHERE id = ? AND user_id = ?
        │
        ▼
9. PHP: Return success JSON
        │
        ▼
10. JS: Reload & re-render
```

### Delete Expense Flow
```
1. User clicks 🗑️ (Delete button)
        │
        ▼
2. JS: showDeleteConfirmation(id)
        │
        ├─── Find expense in state
        ├─── Set currentExpense = id
        └─── Show expense preview in modal
        │
        ▼
3. Delete confirmation modal opens
        │
        ▼
4. User clicks "Delete" button
        │
        ▼
5. JS: confirmDeleteExpense()
        │
        ▼
6. JS: DELETE to /api/expenses.php?id={id}
        │
        ▼
7. PHP: deleteExpense()
        │
        └─── Verify expense belongs to user
        │
        ▼
8. MySQL: DELETE FROM expenses
           WHERE id = ? AND user_id = ?
        │
        ▼
9. PHP: Return success JSON
        │
        ▼
10. JS: Reload & re-render
```

## State Management

```javascript
expensesState = {
    expenses: [],              // All expenses from DB
    categories: [],            // All categories from DB
    filteredExpenses: [],      // After applying filters
    currentExpense: null,      // ID when editing/deleting
    currentPage: 1,            // Current pagination page
    itemsPerPage: 10,          // Items per page
    sortColumn: 'expense_date',// Column to sort by
    sortDirection: 'desc',     // asc or desc
    filters: {
        search: '',            // Search term
        category: '',          // Category ID
        dateRange: 'month',    // Preset name
        startDate: '',         // Custom start
        endDate: ''            // Custom end
    }
}
```

## Component Hierarchy

```
expenses.php
├── Sidebar Navigation
│   ├── Logo
│   ├── Nav Items
│   │   ├── Dashboard (link)
│   │   ├── Expenses (active)
│   │   ├── Categories (link)
│   │   └── Reports (link)
│   └── User Info & Logout
│
├── Main Content
│   ├── Header
│   │   ├── Title & Description
│   │   └── Add Expense Button
│   │
│   ├── Filters Card
│   │   ├── Search Input
│   │   ├── Category Dropdown
│   │   ├── Date Range Dropdown
│   │   ├── Custom Date Inputs (conditional)
│   │   ├── Clear Filters Button
│   │   └── Filter Summary Stats
│   │
│   └── Table Card
│       ├── Table
│       │   ├── Header Row (sortable columns)
│       │   └── Data Rows (expenses)
│       ├── Empty State (conditional)
│       └── Pagination (conditional)
│
└── Modals
    ├── Add/Edit Expense Modal
    │   ├── Header (dynamic title)
    │   ├── Form
    │   │   ├── Description Input
    │   │   ├── Amount Input
    │   │   ├── Date Picker
    │   │   ├── Category Dropdown
    │   │   └── Notes Textarea (with counter)
    │   └── Footer (Save/Cancel)
    │
    └── Delete Confirmation Modal
        ├── Header
        ├── Warning Message
        ├── Expense Preview
        └── Footer (Delete/Cancel)
```

## Security Layers

```
┌─────────────────────────────────────────┐
│         User Input (Form)               │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   Client-Side Validation (JavaScript)   │
│   - Required fields                     │
│   - Format validation                   │
│   - Length limits                       │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   XSS Prevention (escapeHtml)           │
│   - Sanitize display output             │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   Session Authentication (PHP)          │
│   - requireLogin() check                │
│   - getCurrentUserId()                  │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   Server-Side Validation (PHP)          │
│   - Type checking                       │
│   - Business rules                      │
│   - User ownership verification         │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   SQL Injection Prevention              │
│   - Prepared statements                 │
│   - Parameterized queries               │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Database (MySQL)                │
│   - Foreign key constraints             │
│   - Data type enforcement               │
└─────────────────────────────────────────┘
```

---

This architecture ensures:
✅ Separation of concerns
✅ Security at multiple layers
✅ Optimal performance
✅ Maintainable code
✅ Scalable design
