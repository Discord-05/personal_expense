# Categories Management Guide

## Overview
The Categories page allows you to manage expense categories with custom colors, icons, and monthly budgets. Categories are used to organize and track your expenses effectively.

## Features

### 1. Category Management
- **Create Categories**: Add new categories with custom names, colors, and icons
- **Edit Categories**: Update existing category details
- **Delete Categories**: Remove categories (with warnings if expenses exist)
- **Color Customization**: Choose from preset colors or use a custom color picker
- **Icon Selection**: 15 emoji icons to visually represent categories

### 2. Budget Tracking
- **Monthly Budgets**: Set spending limits for each category
- **Real-time Tracking**: See how much you've spent vs. your budget
- **Visual Progress Bars**: Color-coded bars show budget usage (green/orange/red)
- **Budget Alerts**: Automatic alerts when reaching 80% or exceeding budget
- **Budget Preview**: Live preview when setting/editing budgets

### 3. Category Statistics
- **Expense Count**: Number of expenses in each category
- **Monthly Spending**: Current month's total for each category
- **All-Time Total**: Lifetime spending per category
- **Summary Dashboard**: Overview of total categories, budgets, and spending

## Page Layout

### Summary Stats (Top Section)
Four cards displaying:
1. **Total Categories** - Number of categories created
2. **Total Budget** - Combined monthly budgets across all categories
3. **This Month's Spending** - Total expenses for current month
4. **Budget Remaining** - How much budget is left (color-coded)

### Budget Alerts Section
- Shows categories approaching (80%+) or exceeding budget limits
- Displays percentage used and amount remaining
- Orange warning for 80-99% usage
- Red alert for 100%+ (over budget)

### Categories Grid
Displays all categories as cards with:
- **Category Icon & Name** - Visual identifier
- **Color Indicator** - Shows selected color with hex code
- **Budget Bar** - Visual progress of spending (if budget set)
- **Spending Details** - Spent amount and remaining budget
- **Statistics** - Expense count, monthly total, all-time total
- **Action Buttons** - Edit and Delete options

## Using the Categories Page

### Creating a Category

1. Click the **"Add Category"** button (top right)
2. Fill in the category details:
   - **Category Name** (required): e.g., "Food & Dining", "Transportation"
   - **Color**: Click preset colors or use the color picker
   - **Icon**: Select from 15 emoji options
   - **Monthly Budget** (optional): Set spending limit
3. Click **"Save Category"**

**Available Icons:**
- 🍴 Utensils (Food & Dining)
- 🚗 Car (Transportation)
- 🛍️ Shopping Bag (Shopping)
- 🎬 Film (Entertainment)
- 📄 File (Bills & Utilities)
- ❤️ Heart (Healthcare)
- 📚 Book (Education)
- 🏷️ Tag (General/Other)
- 🏠 Home (Housing)
- 💼 Briefcase (Business)
- 📱 Phone (Technology)
- ☕ Coffee (Café/Social)
- ✈️ Plane (Travel)
- 🎁 Gift (Gifts)
- 🔧 Tool (Maintenance)

**Preset Colors:**
- 🔴 Red (#ef4444)
- 🟠 Orange (#f97316)
- 🟡 Yellow (#eab308)
- 🟢 Green (#22c55e)
- 🔵 Cyan (#06b6d4)
- 🔵 Blue (#3b82f6)
- 🟣 Indigo (#6366f1)
- 🟣 Purple (#a855f7)
- 🌸 Pink (#ec4899)
- 🟦 Teal (#14b8a6)
- 💚 Emerald (#10b981)
- ⚫ Gray (#6b7280)

### Editing a Category

1. Click the **Edit button (✏️)** on any category card
2. Modify the desired fields
3. Watch the **Budget Preview** update in real-time
4. Click **"Update Category"**

### Setting/Editing Budgets

1. Enter the budget amount in the **Monthly Budget** field
2. The preview section shows:
   - Current spending for this month
   - Budget bar visualization
   - Remaining budget calculation
3. Budget colors:
   - **Green**: Under 80% of budget
   - **Orange**: 80-99% of budget
   - **Red**: At or over budget

### Deleting a Category

1. Click the **Delete button (🗑️)** on the category card
2. Review the confirmation modal showing:
   - Category name and color
   - Number of associated expenses
   - Total spending in this category
3. **Warning**: Deleting a category will set associated expenses to "Uncategorized"
4. Click **"Delete Category"** to confirm

## Budget System

### How Budgets Work

1. **Monthly Reset**: Budgets track current calendar month only
2. **Automatic Calculation**: System calculates spending from expenses
3. **Visual Indicators**: Color-coded progress bars and percentage
4. **Alert System**: Notifications when approaching or exceeding limits

### Budget Status Colors

- **Green Bar** (0-79%): Spending is under control
- **Orange Bar** (80-99%): Approaching budget limit
- **Red Bar** (100%+): Budget exceeded

### Budget Alerts

Alerts appear when:
- **Warning** (Orange): Category at 80%+ of budget
- **Error** (Red): Category exceeded budget (100%+)

Alert shows:
- Category name
- Amount spent vs. budget
- Percentage used

## Best Practices

### Category Organization
1. **Keep it Simple**: Use 5-10 main categories
2. **Be Consistent**: Stick to your category names
3. **Use Colors Wisely**: Different colors for different expense types
4. **Set Realistic Budgets**: Based on historical spending

### Budget Management
1. **Review Monthly**: Check spending vs. budget regularly
2. **Adjust as Needed**: Update budgets based on actual spending patterns
3. **Watch Alerts**: Take action when approaching limits
4. **Track Trends**: Use statistics to understand spending habits

### Color Coding Tips
- 🔴 Red: Essential/urgent (utilities, bills)
- 🟢 Green: Variable (groceries, gas)
- 🔵 Blue: Optional (entertainment, shopping)
- 🟣 Purple: Savings/investments
- 🟠 Orange: Health & wellness

## Database Migration

If you already have the database created, run the migration:

```sql
-- In phpMyAdmin or MySQL command line
source database/add_budget_column.sql
```

Or manually execute:
```sql
ALTER TABLE categories 
ADD COLUMN budget DECIMAL(10, 2) DEFAULT NULL AFTER icon;
```

## Technical Details

### Files
- `categories.php` - Main HTML structure
- `assets/js/categories.js` - JavaScript functionality
- `assets/css/categories.css` - Styling
- `api/categories.php` - API endpoints (GET/POST/PUT/DELETE)
- `database/add_budget_column.sql` - Database migration

### API Endpoints
- `GET /api/categories.php` - Fetch all categories with stats
- `POST /api/categories.php` - Create new category
- `PUT /api/categories.php?id={id}` - Update category
- `DELETE /api/categories.php?id={id}` - Delete category

### Data Structure
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Food & Dining",
  "color": "#ef4444",
  "icon": "utensils",
  "budget": 500.00,
  "expense_count": 12,
  "total_amount": 450.50
}
```

## Troubleshooting

### Budget Not Showing
- Ensure database migration has been run
- Check that budget field has a value (not NULL)
- Verify browser console for JavaScript errors

### Colors Not Updating
- Clear browser cache
- Check that color value is valid hex code
- Try using preset colors first

### Delete Not Working
- Verify you own the category
- Check for database foreign key constraints
- Review browser console for errors

## Future Enhancements
- Category templates/presets
- Budget history tracking
- Spending trends by category
- Category grouping/subcategories
- Export category reports
- Budget rollover options

---

**Need Help?** Check the main README.md or project documentation.
