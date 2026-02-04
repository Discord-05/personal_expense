# Personal Expense Tracker

A clean and minimalistic full-stack web application for tracking personal expenses with user authentication, category management, and interactive data visualizations.

## 🚀 Features

- **User Authentication**: Secure signup/login with password hashing
- **Expense Management**: Add, edit, and delete expenses
- **Category System**: Organize expenses with customizable categories
- **Data Visualization**: Interactive charts showing expense trends and category breakdowns
- **Responsive Design**: Clean UI inspired by Shadcn, works on all devices
- **RESTful API**: Well-structured backend API for all operations

## 🛠️ Technology Stack

- **Frontend**:
  - HTML5
  - CSS3 (Shadcn-inspired design system)
  - Vanilla JavaScript
  - Chart.js for data visualization

- **Backend**:
  - PHP 7.4+
  - MySQL (via XAMPP)

- **Server**:
  - Apache (XAMPP)

## 📋 Prerequisites

- [XAMPP](https://www.apachefriends.org/) (includes Apache, MySQL, and PHP)
- Web browser (Chrome, Firefox, Safari, or Edge)
- Basic knowledge of web development

## ⚙️ Installation & Setup

### Step 1: Install XAMPP

1. Download and install XAMPP from [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Install it in the default location: `C:\xampp` (Windows) or `/Applications/XAMPP` (Mac)

### Step 2: Project Setup

1. The project files are already in:
   ```
   C:\xampp\htdocs\personal_expense
   ```

2. If you need to move the project, ensure all files are in the `htdocs` folder

### Step 3: Database Setup

1. **Start XAMPP**:
   - Open XAMPP Control Panel
   - Start **Apache** and **MySQL** modules

2. **Create Database**:
   - Open your browser and go to: `http://localhost/phpmyadmin`
   - Click on "SQL" tab
   - Copy and paste the entire contents of `database/schema.sql`
   - Click "Go" to execute

   Alternatively, you can:
   - Create a new database named `personal_expense_tracker`
   - Import the `database/schema.sql` file

3. **Verify Database**:
   - Check that the database has 3 tables: `users`, `categories`, and `expenses`
   - Verify the `expenses` table has a `notes` column (TEXT type)

**Note for Existing Users**: If you already have the database set up and need to add the new `notes` field, see `DATABASE_UPDATE.md` for migration instructions.

### Step 4: Configuration

1. **Database Configuration** (Optional):
   - If you changed MySQL credentials, edit `config/database.php`
   - Update the following constants:
     ```php
     define('DB_HOST', 'localhost');
     define('DB_USER', 'root');
     define('DB_PASS', '');  // Your MySQL password if set
     define('DB_NAME', 'personal_expense_tracker');
     ```

### Step 5: Launch the Application

1. Ensure Apache and MySQL are running in XAMPP Control Panel

2. Open your browser and navigate to:
   ```
   http://localhost/personal_expense
   ```

3. You should see the login page

## 🎯 Usage Guide

### First Time Setup

1. **Create an Account**:
   - Click "Sign up" on the login page
   - Enter username, email, and password
   - Click "Create Account"

2. **Login**:
   - Enter your email and password
   - Click "Sign In"

3. **Dashboard**:
   - After login, you'll see your dashboard with default categories

### Managing Expenses

1. **Add Expense**:
   - Click "+ Add New Expense" button
   - Fill in:
     - **Description**: What you spent on (required)
     - **Amount**: How much you spent (required)
     - **Date**: When you spent it (defaults to today)
     - **Category**: Select from your categories (required)
     - **Notes**: Optional additional details
   - Click "Save Expense"

2. **Edit Expense**:
   - Click the ✏️ (Edit) button on any expense
   - Modify the details
   - Click "Update Expense"

3. **Delete Expense**:
   - Click the 🗑️ (Delete) button on any expense
   - Confirm deletion in the popup

4. **View Expenses**:
   - Click "Expenses" in the sidebar for detailed table view
   - See all transactions with full details

### Filtering & Searching Expenses

1. **Search**: Type in the search box to filter by description or notes

2. **Filter by Category**: Select a category from the dropdown

3. **Filter by Date Range**:
   - **Today**: Expenses from today only
   - **This Week**: Last 7 days
   - **This Month**: Current calendar month
   - **Last 30 Days**: Rolling 30-day period
   - **Last 90 Days**: Rolling 90-day period
   - **This Year**: Current calendar year
   - **Custom Range**: Pick your own start and end dates

4. **Sort Expenses**:
   - Click on "Date" or "Amount" column headers to sort
   - Click again to reverse sort direction

5. **Clear Filters**: Click "Clear Filters" to reset all filters

### Using Charts

- **Expense Trend Chart**: Shows your spending over the last 7 days
- **Category Chart**: Displays expense distribution by category

### Filter Expenses

Use the filter buttons to view expenses by time period:
- **All**: View all expenses
- **Week**: Last 7 days
- **Month**: Current month
- **Year**: Current year

## 📁 Project Structure

```
personal_expense/
├── .github/
│   └── copilot-instructions.md    # Workspace instructions
├── api/
│   ├── auth.php                   # Authentication endpoints
│   ├── expenses.php               # Expense CRUD operations
│   └── categories.php             # Category management
├── assets/
│   ├── css/
│   │   ├── style.css             # Main styles (Shadcn-inspired)
│   │   ├── dashboard.css         # Dashboard-specific styles
│   │   ├── auth.css              # Authentication page styles
│   │   └── expenses.css          # Expenses page styles
│   └── js/
│       ├── main.js               # Utility functions
│       ├── dashboard.js          # Dashboard functionality
│       └── expenses.js           # Expenses page functionality
├── config/
│   ├── database.php              # Database connection
│   └── session.php               # Session management
├── database/
│   ├── schema.sql                # Database schema
│   └── add_notes_column.sql      # Migration for notes field
├── index.php                      # Login page
├── signup.php                     # Registration page
├── dashboard.php                  # Main dashboard
├── expenses.php                   # Expenses management page
└── README.md                      # This file
```

## 🔐 Security Features

- **Password Hashing**: Uses PHP's `password_hash()` with bcrypt
- **Prepared Statements**: All database queries use prepared statements to prevent SQL injection
- **Session Management**: Secure session handling for user authentication
- **Input Validation**: Both client-side and server-side validation
- **XSS Protection**: Output escaping with `htmlspecialchars()`

## 🎨 Design Philosophy

The application follows a clean, minimalistic design inspired by Shadcn:

- **Consistent spacing** with CSS variables
- **Modern color palette** with HSL color system
- **Accessible components** with proper focus states
- **Responsive layout** that works on all screen sizes
- **Smooth transitions** for better user experience

## 🐛 Troubleshooting

### Database Connection Issues

- Verify MySQL is running in XAMPP Control Panel
- Check database credentials in `config/database.php`
- Ensure database `personal_expense_tracker` exists

### Page Not Found (404)

- Verify Apache is running in XAMPP
- Check project is in `C:\xampp\htdocs\personal_expense`
- Access via `http://localhost/personal_expense` (not `file://`)

### Charts Not Displaying

- Ensure internet connection (Chart.js loads from CDN)
- Check browser console for JavaScript errors
- Verify you have added at least one expense

### Login/Signup Not Working

- Check PHP error log: `C:\xampp\php\logs\php_error_log`
- Verify database tables exist
- Ensure sessions are enabled in PHP

## 📊 Default Categories

When you create an account, these categories are automatically created:

1. 🍴 Food & Dining
2. 🚗 Transportation
3. 🛍️ Shopping
4. 🎬 Entertainment
5. 📄 Bills & Utilities
6. ❤️ Healthcare
7. 📚 Education
8. 🏷️ Other

## 🔄 API Endpoints

### Authentication
- `POST /api/auth.php?action=signup` - Create new user
- `POST /api/auth.php?action=login` - Login user
- `GET /api/auth.php?action=logout` - Logout user

### Expenses
- `GET /api/expenses.php` - Get all expenses
- `POST /api/expenses.php` - Create expense
- `PUT /api/expenses.php?id={id}` - Update expense
- `DELETE /api/expenses.php?id={id}` - Delete expense

### Categories
- `GET /api/categories.php` - Get all categories
- `POST /api/categories.php` - Create category
- `PUT /api/categories.php?id={id}` - Update category
- `DELETE /api/categories.php?id={id}` - Delete category

## 🚀 Future Enhancements

Potential features for future development:

- [ ] Budget planning and alerts
- [ ] Recurring expenses
- [ ] Export data (CSV, PDF)
- [ ] Multi-currency support
- [ ] Mobile app
- [ ] Expense receipts upload
- [ ] Advanced reporting and analytics
- [ ] Dark mode toggle

## 📝 License

This project is open source and available for educational purposes.

## 👨‍💻 Development

Built with ❤️ using HTML, CSS, JavaScript, PHP, and MySQL.

---

**Need Help?** Check the troubleshooting section or review the code comments for detailed explanations.
