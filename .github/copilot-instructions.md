# Personal Expense Tracker - Workspace Instructions

## Project Overview
A full-stack personal expense tracker with user authentication, expense management, and data visualization using HTML, CSS (Shadcn-style), JavaScript, PHP, and MySQL.

## Technology Stack
- **Frontend**: HTML5, CSS3 (Shadcn-inspired), Vanilla JavaScript, Chart.js
- **Backend**: PHP 7.4+
- **Database**: MySQL
- **Server**: XAMPP (Apache + MySQL)

## Project Structure
- `index.php` - Landing/login page
- `signup.php` - User registration
- `dashboard.php` - Main expense tracking interface
- `api/` - RESTful API endpoints
- `includes/` - Shared PHP components (header, footer, db connection)
- `config/` - Configuration files
- `assets/` - CSS, JS, and images
- `pages/` - Additional pages

## Development Guidelines
- Use prepared statements for all database queries (prevent SQL injection)
- Implement password hashing with `password_hash()` and `password_verify()`
- Use session management for authentication
- Follow clean, minimalistic design principles
- Mobile-responsive layouts
- Use modern CSS with CSS variables for theming
