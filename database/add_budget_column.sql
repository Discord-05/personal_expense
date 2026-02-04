-- Migration: Add budget column to categories table
-- Run this if you already have the database created without the budget column

USE personal_expense_tracker;

-- Add budget column to categories table
ALTER TABLE categories 
ADD COLUMN budget DECIMAL(10, 2) DEFAULT NULL AFTER icon;

-- Optional: Set some example budgets (uncomment if needed)
/*
UPDATE categories SET budget = 500.00 WHERE name = 'Food & Dining';
UPDATE categories SET budget = 300.00 WHERE name = 'Transportation';
UPDATE categories SET budget = 400.00 WHERE name = 'Shopping';
UPDATE categories SET budget = 200.00 WHERE name = 'Entertainment';
UPDATE categories SET budget = 350.00 WHERE name = 'Bills & Utilities';
UPDATE categories SET budget = 250.00 WHERE name = 'Healthcare';
*/
