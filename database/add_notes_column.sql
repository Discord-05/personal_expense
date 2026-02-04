-- Migration: Add notes column to expenses table
-- Run this if you already have the database set up and need to add the notes field

USE personal_expense_tracker;

-- Add notes column to expenses table if it doesn't exist
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS notes TEXT AFTER description;

-- Verify the change
DESCRIBE expenses;
