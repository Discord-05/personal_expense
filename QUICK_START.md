# 🚀 Quick Start - Expenses Page

## Access the Page
```
http://localhost/personal_expense/expenses.php
```
Or click **"Expenses"** in the sidebar after logging in.

## ⚡ Quick Actions

### Add Expense
1. Click **"+ Add New Expense"**
2. Fill in: Description, Amount, Date, Category
3. Optionally add Notes
4. Click **"Save Expense"**

### Search & Filter
- **Search**: Type in search box
- **Category**: Select from dropdown
- **Date**: Choose preset or custom range
- **Clear**: Click "Clear Filters"

### Sort
- Click **"Date"** or **"Amount"** column header
- Click again to reverse order

### Edit/Delete
- Click ✏️ to edit
- Click 🗑️ to delete (with confirmation)

## 🎯 Filter Presets

| Filter | Shows |
|--------|-------|
| All Time | Every expense |
| Today | Today only |
| This Week | Last 7 days |
| This Month | Current month (default) |
| Last 30 Days | Rolling 30 days |
| Last 90 Days | Rolling 90 days |
| This Year | Current year |
| Custom | Pick dates |

## 📊 What You'll See

### Table Columns
1. **Date** - When (with day of week)
2. **Description** - What (with notes preview)
3. **Category** - Color-coded badge
4. **Amount** - How much
5. **Actions** - Edit/Delete buttons

### Filter Summary
- **Total** - Sum of filtered expenses
- **Count** - Number shown
- **Average** - Average amount

### Pagination
- 10 expenses per page
- Previous/Next buttons
- Page numbers

## 💾 Database Update (Existing Users)

If you already have the database, add the notes field:

```sql
ALTER TABLE expenses 
ADD COLUMN notes TEXT AFTER description;
```

See `DATABASE_UPDATE.md` for detailed instructions.

## 📱 Mobile Tips

- Filters stack vertically
- Table becomes cards
- Large touch targets
- Swipe-friendly

## 🎨 Features at a Glance

✅ Table view with sorting  
✅ Real-time search  
✅ Multiple date filters  
✅ Category filtering  
✅ Add/Edit with Notes field  
✅ Delete confirmation  
✅ Pagination  
✅ Responsive design  
✅ Empty state handling  
✅ Live statistics  

## 📚 Learn More

- **Features**: See `EXPENSES_GUIDE.md`
- **Implementation**: See `EXPENSES_IMPLEMENTATION.md`
- **Setup**: See `README.md`
- **Database**: See `DATABASE_UPDATE.md`

---

**Pro Tip**: Use filters to focus on specific time periods or categories for better insights into your spending patterns!
