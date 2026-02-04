# Budget Alerts & Spending Insights Guide

## 🎯 Overview

Your Personal Expense Tracker now includes **intelligent budget monitoring** and **AI-powered spending analysis** to help you save more money!

---

## 🚀 Getting Started

### Step 1: Run Database Migration

Before using the new features, you need to update your database:

1. Open **phpMyAdmin** (http://localhost/phpmyadmin)
2. Select your `expense_tracker` database
3. Click the **SQL** tab
4. Open the file: `database/add_budget_alerts.sql`
5. Copy all the SQL code and paste it into phpMyAdmin
6. Click **Go** to execute

This will add:
- Category priority fields (essential/moderate/discretionary)
- Alert threshold settings (default 80%)
- Budget alerts tracking table
- Spending insights table
- User notification preferences

---

## 📋 Features

### 1. **Category Priority System**

When creating or editing a category, you can now classify it by priority:

- **🟢 Essential** - Necessary expenses (rent, groceries, medical, utilities)
- **🟡 Moderate** - Reasonable expenses (shopping, personal care, transport)
- **🔴 Discretionary** - Can be reduced (entertainment, dining out, hobbies)

**Why it matters:** The system analyzes your spending by priority and suggests cutting discretionary expenses to save money.

---

### 2. **Budget Alerts**

Set a monthly budget for any category and receive automatic alerts when you're approaching the limit:

- **Warning (80%)** - You've spent 80% of your budget 🟡
- **Danger (90%)** - You've spent 90% of your budget 🟠
- **Exceeded (100%)** - You've exceeded your budget 🔴

**How to set up:**
1. Go to **Categories** page
2. Click **Edit** on any category (or create new)
3. Enter a **Monthly Budget** amount
4. The system will automatically:
   - Show **alert threshold** input (default 80%)
   - Enable **alert notifications** (can be toggled off)
5. Save the category

**Customization:**
- Adjust the **Alert Threshold** (50%-100%)
  - Example: Set to 90% if you want alerts only when very close to limit
- Toggle **Enable budget alerts** on/off for each category

---

### 3. **AI-Powered Spending Analysis**

The system analyzes your spending patterns and provides:

#### Monthly Breakdown:
- Total spent on **Essential** categories
- Total spent on **Moderate** categories  
- Total spent on **Discretionary** categories

#### Savings Potential:
- Reduce discretionary spending by **50%**
- Reduce moderate spending by **20%**
- Shows how much you could save each month

#### Personalized Recommendations:
- "Consider reducing entertainment expenses by 50%"
- "You could save $150 by cutting discretionary dining out"
- "Review your subscription services in the discretionary category"

---

## 🎨 Using the Features

### On Categories Page:

1. **Priority Badge** - See the priority level of each category at a glance
2. **Alert Icon (🔔)** - Shows if alerts are enabled for that category
3. **Budget Progress Bar** - Color-coded:
   - Green: Under 80%
   - Orange: 80-99%
   - Red: 100%+

### When Adding/Editing Categories:

#### Priority Selection:
```
🟢 Essential - Necessary expenses (rent, groceries, medical, utilities)
🟡 Moderate - Reasonable expenses (shopping, personal care)
🔴 Discretionary - Can be reduced (entertainment, dining out, hobbies)
```

#### Budget Alert Settings:
- Only appear when you set a budget amount
- **Enable budget alerts** - Toggle on/off
- **Alert threshold** - Set percentage (default 80%)

---

## 📊 Checking Budget Alerts

### Method 1: Categories Page
- Budget alerts appear at the top of the page
- Color-coded warning/danger alerts
- Shows spending vs. budget for each category

### Method 2: API Endpoint (For Developers)
```javascript
// Get all alerts
fetch('/personal_expense/api/budget_alerts.php?action=get_alerts')
    .then(res => res.json())
    .then(data => console.log(data.alerts));

// Get unread alerts only
fetch('/personal_expense/api/budget_alerts.php?action=get_alerts&unread_only=true')
    .then(res => res.json())
    .then(data => console.log(data.alerts));

// Mark alert as read
fetch('/personal_expense/api/budget_alerts.php?action=mark_read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alert_id: 123 })
});
```

---

## 💡 Getting Spending Insights

### API Endpoint:
```javascript
// Generate monthly insights
fetch('/personal_expense/api/budget_alerts.php?action=generate_insights', {
    method: 'POST'
})
.then(res => res.json())
.then(data => {
    console.log('Insights:', data.insights);
    console.log('Recommendations:', data.recommendations);
});

// Get recommendations
fetch('/personal_expense/api/budget_alerts.php?action=get_recommendations')
    .then(res => res.json())
    .then(data => console.log(data.recommendations));
```

### Response Format:
```json
{
    "success": true,
    "insights": {
        "month": "2024-01",
        "essential_spending": 2500.00,
        "moderate_spending": 800.00,
        "discretionary_spending": 600.00,
        "total_spending": 3900.00,
        "savings_potential": 420.00
    },
    "recommendations": [
        "Consider reducing entertainment expenses by 50% to save $150.00",
        "Review your dining out expenses. Reducing by half could save $100.00",
        "You're spending responsibly on essential categories!"
    ]
}
```

---

## 🔧 Configuration

### Default Settings:
- **Alert Threshold**: 80%
- **Alert Enabled**: Yes (for categories with budgets)
- **Priority**: Moderate (when creating new categories)

### User Preferences (Future Feature):
You can customize:
- Email alerts on/off
- Notification frequency (real-time, daily digest, weekly summary)

---

## 💰 Examples

### Example 1: Rent (Essential)
```
Category: Rent
Priority: 🟢 Essential
Monthly Budget: $1,500
Alert Threshold: 95% (you don't want to miss rent!)
Alert Enabled: Yes
```

### Example 2: Groceries (Essential)
```
Category: Groceries
Priority: 🟢 Essential
Monthly Budget: $600
Alert Threshold: 80%
Alert Enabled: Yes
```

### Example 3: Entertainment (Discretionary)
```
Category: Entertainment
Priority: 🔴 Discretionary
Monthly Budget: $200
Alert Threshold: 70% (alert earlier to cut back)
Alert Enabled: Yes
```

### Example 4: Shopping (Moderate)
```
Category: Shopping
Priority: 🟡 Moderate
Monthly Budget: $300
Alert Threshold: 80%
Alert Enabled: Yes
```

---

## 🎯 Tips for Maximum Savings

1. **Set realistic budgets** for each category based on your needs
2. **Classify categories correctly**:
   - Essential: Must-have expenses
   - Moderate: Nice-to-have, but can adjust
   - Discretionary: Want-to-have, easy to cut
3. **Lower alert thresholds** for discretionary categories (60-70%)
4. **Review insights monthly** to see where you can cut costs
5. **Follow AI recommendations** - they're calculated based on your actual spending patterns

---

## 🛠️ Technical Details

### Database Tables:

#### `categories` (Updated)
- `priority` - ENUM('essential','moderate','discretionary')
- `alert_threshold` - INT (50-100)
- `alert_enabled` - BOOLEAN

#### `budget_alerts` (New)
- Tracks all budget alerts
- Types: warning, danger, exceeded
- Timestamps and read status

#### `spending_insights` (New)
- Monthly spending breakdown by priority
- Savings potential calculations
- AI recommendations (JSON)

#### `user_preferences` (New)
- Email notification settings
- Notification frequency preferences

---

## 🎉 Next Steps

1. ✅ Run database migration
2. ✅ Set budgets for your categories
3. ✅ Classify each category by priority
4. ✅ Add expenses and track spending
5. ✅ Watch for budget alerts
6. ✅ Review monthly insights
7. ✅ Follow recommendations to save money!

---

## ❓ Troubleshooting

**Q: I don't see the new priority field when editing categories**
- Clear your browser cache (Ctrl+Shift+R)
- Make sure database migration was run successfully

**Q: Budget alerts aren't showing**
- Check that you've set a budget amount
- Verify that "Enable budget alerts" is checked
- Add some expenses to trigger alerts

**Q: How are savings calculated?**
- Discretionary: 50% reduction
- Moderate: 20% reduction
- Essential: No reduction (necessary expenses)

**Q: Can I change the savings percentages?**
- Currently fixed at 50% and 20%
- Future update will allow customization

---

## 📞 Support

For issues or questions:
1. Check the console for errors (F12 → Console)
2. Verify database migration was successful
3. Review the `QUICK_START.md` for setup instructions

---

**Enjoy smarter spending and more savings! 💰**
