-- Complete Database Update Script
-- This will add all missing columns to bring your database up to date
-- Safe to run multiple times (will skip if columns already exist)

USE expense_tracker;

-- Step 1: Add basic budget column if it doesn't exist
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS budget DECIMAL(10, 2) DEFAULT NULL AFTER icon;

-- Step 2: Add budget alert columns
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS priority ENUM('essential', 'moderate', 'discretionary') DEFAULT 'moderate' AFTER budget;

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS alert_threshold INT DEFAULT 80 AFTER priority;

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS alert_enabled BOOLEAN DEFAULT TRUE AFTER alert_threshold;

-- Step 3: Create budget_alerts table
CREATE TABLE IF NOT EXISTS budget_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    alert_type ENUM('warning', 'danger', 'exceeded') NOT NULL,
    percentage_used DECIMAL(5,2) NOT NULL,
    amount_spent DECIMAL(10,2) NOT NULL,
    budget_limit DECIMAL(10,2) NOT NULL,
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

-- Step 4: Create spending_insights table
CREATE TABLE IF NOT EXISTS spending_insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    month VARCHAR(7) NOT NULL,
    essential_spending DECIMAL(10,2) DEFAULT 0,
    moderate_spending DECIMAL(10,2) DEFAULT 0,
    discretionary_spending DECIMAL(10,2) DEFAULT 0,
    total_spending DECIMAL(10,2) DEFAULT 0,
    savings_potential DECIMAL(10,2) DEFAULT 0,
    recommendations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_month (user_id, month),
    INDEX idx_user_id (user_id),
    INDEX idx_month (month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 5: Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    email_alerts_enabled BOOLEAN DEFAULT TRUE,
    notification_frequency ENUM('realtime', 'daily', 'weekly') DEFAULT 'realtime',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Success message
SELECT 'Database updated successfully! All budget alert features are now available.' AS Status;
