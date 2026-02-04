<?php
/**
 * Budget Alerts Installation Script
 * Run this file once to add budget alert features to your database
 */

require_once 'config/database.php';

// Check if already installed
function checkIfInstalled($conn) {
    $result = $conn->query("SHOW COLUMNS FROM categories LIKE 'priority'");
    return $result && $result->num_rows > 0;
}

try {
    $conn = getDBConnection();
    
    // Check if already installed
    if (checkIfInstalled($conn)) {
        echo "✅ Budget Alerts features are already installed!<br><br>";
        echo "The following features are available:<br>";
        echo "- Category Priority System (Essential/Moderate/Discretionary)<br>";
        echo "- Budget Alert Settings (Threshold & Enable/Disable)<br>";
        echo "- Spending Insights & Recommendations<br><br>";
        echo "<a href='categories.php'>Go to Categories</a> | <a href='dashboard.php'>Go to Dashboard</a>";
        exit;
    }
    
    echo "<h2>Installing Budget Alerts Features...</h2>";
    
    // Read SQL file - try complete update first
    $sqlFile = __DIR__ . '/database/complete_update.sql';
    if (!file_exists($sqlFile)) {
        $sqlFile = __DIR__ . '/database/add_budget_alerts.sql';
    }
    
    if (!file_exists($sqlFile)) {
        throw new Exception("SQL file not found. Please ensure database/complete_update.sql exists.");
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Split by semicolon to execute multiple statements
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    $successCount = 0;
    $errorCount = 0;
    
    foreach ($statements as $statement) {
        if (empty($statement)) continue;
        
        try {
            if ($conn->query($statement)) {
                $successCount++;
                echo "✅ Executed statement successfully<br>";
            } else {
                $errorCount++;
                echo "❌ Error: " . $conn->error . "<br>";
            }
        } catch (Exception $e) {
            $errorCount++;
            echo "❌ Error: " . $e->getMessage() . "<br>";
        }
    }
    
    echo "<br><h3>Installation Complete!</h3>";
    echo "✅ Successfully executed: $successCount statements<br>";
    
    if ($errorCount > 0) {
        echo "⚠️ Errors encountered: $errorCount<br><br>";
        echo "<strong>Note:</strong> Some errors might be normal (e.g., 'Duplicate column' if partially installed)<br>";
    }
    
    echo "<br><h3>🎉 Budget Alerts Features Installed!</h3>";
    echo "<p>You can now use the following features:</p>";
    echo "<ul>";
    echo "<li>🟢 <strong>Essential</strong> - Necessary expenses (rent, groceries, medical)</li>";
    echo "<li>🟡 <strong>Moderate</strong> - Reasonable expenses (shopping, transport)</li>";
    echo "<li>🔴 <strong>Discretionary</strong> - Can be reduced (entertainment, dining)</li>";
    echo "</ul>";
    
    echo "<br><p><strong>Next Steps:</strong></p>";
    echo "<ol>";
    echo "<li>Go to <a href='categories.php'>Categories</a> page</li>";
    echo "<li>Create or edit a category</li>";
    echo "<li>Select a priority level</li>";
    echo "<li>Set a monthly budget and alert threshold</li>";
    echo "<li>Start tracking expenses and get alerts!</li>";
    echo "</ol>";
    
    echo "<br><p><a href='categories.php' style='background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;'>Go to Categories Page</a></p>";
    
    $conn->close();
    
} catch (Exception $e) {
    echo "<h3>❌ Installation Failed</h3>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
    echo "<br><p><strong>Manual Installation:</strong></p>";
    echo "<ol>";
    echo "<li>Open phpMyAdmin (http://localhost/phpmyadmin)</li>";
    echo "<li>Select your 'expense_tracker' database</li>";
    echo "<li>Click on the 'SQL' tab</li>";
    echo "<li>Open the file: <code>database/add_budget_alerts.sql</code></li>";
    echo "<li>Copy all SQL code and paste it into phpMyAdmin</li>";
    echo "<li>Click 'Go' to execute</li>";
    echo "</ol>";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Budget Alerts Installation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f3f4f6;
        }
        h2, h3 {
            color: #1f2937;
        }
        code {
            background: #e5e7eb;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
        a {
            color: #2563eb;
        }
        ul, ol {
            line-height: 1.8;
        }
    </style>
</head>
<body>
</body>
</html>
```