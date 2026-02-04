# Database Update Guide

If you already have the Personal Expense Tracker database set up and need to add the new `notes` field to the expenses table, follow these steps:

## Option 1: Using phpMyAdmin (Recommended)

1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Select the `personal_expense_tracker` database from the left sidebar
3. Click on the "SQL" tab at the top
4. Copy and paste the following SQL command:

```sql
ALTER TABLE expenses 
ADD COLUMN notes TEXT AFTER description;
```

5. Click "Go" to execute the command
6. You should see a success message: "1 row affected"

## Option 2: Using the Migration File

1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Select the `personal_expense_tracker` database
3. Click on the "Import" tab
4. Click "Choose File" and select: `database/add_notes_column.sql`
5. Click "Go" at the bottom

## Verify the Update

After running either option, verify the column was added:

1. In phpMyAdmin, click on the `expenses` table
2. Click on the "Structure" tab
3. You should see a new column called `notes` of type `TEXT` after the `description` column

## What This Adds

The `notes` column allows users to add optional detailed notes to their expenses. This field:
- Accepts up to 500 characters in the UI
- Stores text data in the database
- Is completely optional
- Can be searched along with descriptions

## If You Encounter Errors

**Error: "Duplicate column name 'notes'"**
- This means the column already exists. You're all set!

**Error: "Table 'expenses' doesn't exist"**
- Make sure you've selected the correct database
- Verify the database name is `personal_expense_tracker`

**Permission Error**
- Make sure MySQL is running in XAMPP
- Verify you're using the root user (default XAMPP setup)

## Fresh Installation

If you're setting up the database for the first time, use the main schema file instead:
```
database/schema.sql
```

This already includes the notes column and all other tables.
