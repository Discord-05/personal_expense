-- Personal Expense Tracker Database Schema
-- Run this script in phpMyAdmin or MySQL command line

CREATE DATABASE IF NOT EXISTS personal_expense_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE personal_expense_tracker;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',
    icon VARCHAR(50) DEFAULT 'tag',
    budget DECIMAL(10, 2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    notes TEXT,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_expense_date (expense_date),
    INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default categories for new users (these will be created via PHP when user signs up)
-- Sample data is commented out - uncomment if you want to test with sample data

/*
-- Sample user (password: password123)
INSERT INTO users (username, email, password) VALUES 
('testuser', 'test@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Sample categories for user ID 1
INSERT INTO categories (user_id, name, color, icon) VALUES
(1, 'Food & Dining', '#ef4444', 'utensils'),
(1, 'Transportation', '#3b82f6', 'car'),
(1, 'Shopping', '#8b5cf6', 'shopping-bag'),
(1, 'Entertainment', '#ec4899', 'film'),
(1, 'Bills & Utilities', '#f59e0b', 'file-text'),
(1, 'Healthcare', '#10b981', 'heart'),
(1, 'Education', '#06b6d4', 'book'),
(1, 'Other', '#6b7280', 'tag');

-- Sample expenses for user ID 1
INSERT INTO expenses (user_id, category_id, amount, description, expense_date) VALUES
(1, 1, 45.50, 'Lunch at restaurant', '2025-10-27'),
(1, 2, 30.00, 'Uber ride', '2025-10-27'),
(1, 3, 120.00, 'New shoes', '2025-10-26'),
(1, 1, 85.75, 'Grocery shopping', '2025-10-25'),
(1, 5, 150.00, 'Electricity bill', '2025-10-24');
*/
