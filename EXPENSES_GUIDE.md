# Expenses Page - Feature Guide

## Overview
The Expenses page is a comprehensive transaction management interface that allows you to view, filter, sort, and manage all your expense transactions in a detailed table format.

## 🎯 Key Features

### 1. **Expenses Table View**
A clean, sortable table displaying all your transactions with the following columns:

- **Date**: When the expense occurred (with day of week)
- **Description**: What you spent on (with notes preview if available)
- **Category**: Color-coded category badge
- **Amount**: Prominently displayed rupee amount (Indian numbering)
- **Actions**: Edit and delete buttons

### 2. **Advanced Filtering System**

#### Search
- **Real-time search** as you type
- Searches through both description and notes fields
- **Debounced** for performance (300ms delay)

#### Category Filter
- Filter by any of your expense categories
- Instantly updates the table
- Shows "All Categories" by default

#### Date Range Filters
Multiple preset options:
- **All Time**: Every expense ever recorded
- **Today**: Only today's expenses
- **This Week**: Last 7 days
- **This Month**: Current calendar month (default)
- **Last 30 Days**: Rolling 30-day window
- **Last 90 Days**: Rolling 90-day window
- **This Year**: Current calendar year
- **Custom Range**: Pick your own start and end dates

#### Filter Summary
Live statistics based on filtered results:
- **Total**: Sum of all filtered expenses
- **Count**: Number of expenses shown
- **Average**: Average expense amount

#### Clear Filters
One-click button to reset all filters to defaults

### 3. **Sortable Columns**

Click on column headers to sort:
- **Date Column**: Sort by expense date (newest/oldest first)
- **Amount Column**: Sort by amount (highest/lowest first)
- Visual indicators (↑/↓) show current sort direction
- Click again to reverse sort order

### 4. **Add/Edit Expense Modal**

Comprehensive form with the following fields:

#### Required Fields
- **Description** (max 255 characters)
  - Brief description of the expense
  - Example: "Lunch at restaurant"
  
- **Amount** (decimal number)
  - Must be greater than 0
  - Supports cents (e.g., 45.99)
  
- **Date** (date picker)
  - Defaults to today
  - Cannot select future dates
  
- **Category** (dropdown)
  - Choose from your created categories
  - Populated dynamically

#### Optional Fields
- **Notes** (max 500 characters)
  - Add detailed information
  - Character counter shows remaining characters
  - Displayed as preview in table (first 50 chars)

#### Smart Behavior
- Modal title changes: "Add New Expense" vs "Edit Expense"
- Save button changes: "Save Expense" vs "Update Expense"
- Form resets when opening for new expense
- Pre-fills data when editing existing expense

### 5. **Delete Confirmation**

Safety features for deletion:
- **Confirmation modal** before deleting
- Shows expense details in preview
- Two-step process prevents accidental deletion
- Clear "Cancel" option

### 6. **Pagination**

For better performance with many expenses:
- **10 expenses per page** (default)
- Smart page number display
  - Shows first page, last page
  - Shows current page ± 1 page
  - Uses "..." for skipped pages
- **Previous/Next buttons** with disabled states
- **Page info**: "Showing X to Y of Z expenses"

### 7. **Responsive Design**

Mobile-friendly features:
- **Desktop**: Full table layout
- **Tablet**: Responsive grid
- **Mobile**: 
  - Card-based layout
  - Filters stack vertically
  - Touch-friendly buttons
  - Optimized for small screens

### 8. **Empty State**

User-friendly empty state when no expenses found:
- Friendly icon and message
- Quick "Add New Expense" button
- Appears when filters return no results

### 9. **Performance Optimizations**

- **Debounced search** (300ms delay)
- **Client-side filtering** for instant results
- **Pagination** prevents rendering too many rows
- **Efficient sorting** algorithm

## 🎨 Visual Design

### Color-Coded Categories
Each category displays with its unique color:
- Background: 20% opacity of category color
- Text: Full category color
- Border: 40% opacity border

### Hover Effects
- Table rows highlight on hover
- Action buttons scale up slightly
- Smooth transitions throughout

### Icons & Emojis
- Edit button: ✏️
- Delete button: 🗑️
- Empty state: 📋
- Consistent with app design

## 💡 Usage Tips

### Best Practices

1. **Use Descriptive Names**
   - Instead of: "Food"
   - Better: "Lunch at Olive Garden"

2. **Utilize Notes Field**
   - Add payment method
   - Include who you were with
   - Note if it's reimbursable
   - Add receipt number

3. **Regular Entry**
   - Enter expenses daily for accuracy
   - Use date picker for past expenses

4. **Use Filters**
   - Monthly reviews: "This Month" filter
   - Tax preparation: "This Year" filter
   - Budget tracking: Category filter

5. **Sort for Insights**
   - Find largest expenses: Sort by amount
   - Review chronologically: Sort by date

### Keyboard Shortcuts (Future Enhancement)
- `Ctrl/Cmd + N`: New expense
- `Esc`: Close modal
- `Enter`: Submit form (when focused)

## 🔧 Technical Details

### Data Flow
1. Page loads → Fetch expenses from API
2. Apply default filters (This Month)
3. Sort by date (newest first)
4. Render first 10 results
5. User interaction → Update state → Re-render

### State Management
JavaScript maintains state for:
- All expenses (from API)
- Filtered expenses
- Current page number
- Sort column & direction
- Filter values
- Current expense being edited/deleted

### API Endpoints Used
- `GET /api/expenses.php` - Load all expenses
- `POST /api/expenses.php` - Create expense
- `PUT /api/expenses.php?id={id}` - Update expense
- `DELETE /api/expenses.php?id={id}` - Delete expense
- `GET /api/categories.php` - Load categories

## 🚀 Future Enhancements

Potential additions:
- [ ] Bulk delete expenses
- [ ] Export to CSV/PDF
- [ ] Duplicate expense feature
- [ ] Recurring expenses
- [ ] Receipt image upload
- [ ] Quick add from any page
- [ ] Expense templates
- [ ] Advanced search (amount ranges, etc.)
- [ ] Customizable table columns
- [ ] Print-friendly view

## 📱 Mobile Experience

Optimizations for mobile:
- **Touch targets**: Large, tap-friendly buttons
- **Vertical layout**: Filters stack for easier use
- **Card view**: Better than table on small screens
- **Swipe actions**: Could add swipe to delete (future)
- **Bottom sheets**: Could use for modals (future)

## ♿ Accessibility Features

- Semantic HTML structure
- Proper form labels
- Focus management in modals
- Keyboard navigation support
- Clear visual feedback
- High contrast text

---

**Need Help?** Refer to the main README.md for setup instructions or troubleshooting.
