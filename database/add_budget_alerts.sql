-- Add Budget Alerts and Category Priority Features
-- Run this script to add new columns and tables for budget tracking

USE personal_expense_tracker;

-- Add priority and alert settings to categories table
ALTER TABLE categories 
ADD COLUMN priority ENUM('essential', 'moderate', 'discretionary') DEFAULT 'moderate' COMMENT 'Essential: necessities, Moderate: reasonable, Discretionary: can be reduced',
ADD COLUMN alert_threshold INT DEFAULT 80 COMMENT 'Alert when budget reaches this percentage (default 80%)',
ADD COLUMN alert_enabled BOOLEAN DEFAULT TRUE COMMENT 'Enable/disable alerts for this category';

-- Create budget alerts table to track alert history
CREATE TABLE IF NOT EXISTS budget_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    alert_type ENUM('warning', 'danger', 'exceeded') NOT NULL COMMENT 'warning: 80%, danger: 90%, exceeded: 100%',
    current_amount DECIMAL(10, 2) NOT NULL,
    budget_amount DECIMAL(10, 2) NOT NULL,
    percentage_used DECIMAL(5, 2) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create spending insights table for AI-powered analysis
CREATE TABLE IF NOT EXISTS spending_insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    month INT NOT NULL COMMENT 'Month (1-12)',
    year INT NOT NULL COMMENT 'Year',
    total_spent DECIMAL(10, 2) NOT NULL,
    essential_spent DECIMAL(10, 2) DEFAULT 0,
    moderate_spent DECIMAL(10, 2) DEFAULT 0,
    discretionary_spent DECIMAL(10, 2) DEFAULT 0,
    savings_potential DECIMAL(10, 2) DEFAULT 0 COMMENT 'Estimated amount that could be saved',
    recommendations TEXT COMMENT 'JSON array of recommendations',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_month (user_id, year, month),
    UNIQUE KEY unique_user_month (user_id, year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user preferences table for notification settings
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    email_alerts BOOLEAN DEFAULT TRUE,
    budget_alert_frequency ENUM('instant', 'daily', 'weekly') DEFAULT 'instant',
    spending_insights_enabled BOOLEAN DEFAULT TRUE,
    insights_frequency ENUM('weekly', 'monthly') DEFAULT 'monthly',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update existing categories to have default priorities (if you have existing data)
-- Uncomment and modify based on your category names
/*
UPDATE categories SET priority = 'essential' WHERE name IN ('Food & Dining', 'Healthcare', 'Bills & Utilities', 'Transportation', 'Education', 'Rent', 'Grocery', 'Medical');
UPDATE categories SET priority = 'moderate' WHERE name IN ('Shopping', 'Personal Care', 'Insurance', 'Home');
UPDATE categories SET priority = 'discretionary' WHERE name IN ('Entertainment', 'Dining Out', 'Hobbies', 'Travel', 'Gaming', 'Subscriptions');
*/
