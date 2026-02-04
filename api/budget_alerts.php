<?php
/**
 * Budget Alerts API
 * Handles budget monitoring, alerts, and spending insights
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json');
requireAuth();

$action = $_GET['action'] ?? '';
$userId = $_SESSION['user_id'];

try {
    switch ($action) {
        case 'check_budgets':
            checkAndCreateAlerts($userId);
            break;
            
        case 'get_alerts':
            getAlerts($userId);
            break;
            
        case 'mark_alert_read':
            markAlertRead($userId);
            break;
            
        case 'get_insights':
            getSpendingInsights($userId);
            break;
            
        case 'generate_insights':
            generateSpendingInsights($userId);
            break;
            
        case 'get_recommendations':
            getRecommendations($userId);
            break;
            
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * Check budgets and create alerts if necessary
 */
function checkAndCreateAlerts($userId) {
    global $conn;
    
    // Get current month/year
    $currentMonth = date('Y-m');
    
    // Get all categories with budgets
    $stmt = $conn->prepare("
        SELECT c.id, c.name, c.budget, c.alert_threshold, c.priority,
               COALESCE(SUM(e.amount), 0) as current_spent
        FROM categories c
        LEFT JOIN expenses e ON c.id = e.category_id 
            AND DATE_FORMAT(e.expense_date, '%Y-%m') = ?
        WHERE c.user_id = ? AND c.budget IS NOT NULL AND c.budget > 0 AND c.alert_enabled = TRUE
        GROUP BY c.id
    ");
    $stmt->bind_param("si", $currentMonth, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $alerts = [];
    
    while ($category = $result->fetch_assoc()) {
        $budget = (float)$category['budget'];
        $spent = (float)$category['current_spent'];
        $percentage = ($budget > 0) ? ($spent / $budget) * 100 : 0;
        
        $alertType = null;
        $message = null;
        
        // Determine alert type based on percentage
        if ($percentage >= 100) {
            $alertType = 'exceeded';
            $message = "Budget exceeded! You've spent ₹" . number_format($spent, 2) . " out of ₹" . number_format($budget, 2) . " for {$category['name']}.";
        } elseif ($percentage >= 90) {
            $alertType = 'danger';
            $message = "Critical! You've used " . round($percentage, 1) . "% of your {$category['name']} budget (₹" . number_format($spent, 2) . "/₹" . number_format($budget, 2) . ").";
        } elseif ($percentage >= $category['alert_threshold']) {
            $alertType = 'warning';
            $message = "Warning! You've used " . round($percentage, 1) . "% of your {$category['name']} budget (₹" . number_format($spent, 2) . "/₹" . number_format($budget, 2) . ").";
        }
        
        // Create alert if necessary
        if ($alertType) {
            // Check if alert already exists for this category this month
            $checkStmt = $conn->prepare("
                SELECT id FROM budget_alerts 
                WHERE user_id = ? AND category_id = ? 
                AND alert_type = ? 
                AND DATE_FORMAT(created_at, '%Y-%m') = ?
            ");
            $checkStmt->bind_param("iiss", $userId, $category['id'], $alertType, $currentMonth);
            $checkStmt->execute();
            $existingAlert = $checkStmt->get_result()->fetch_assoc();
            
            if (!$existingAlert) {
                // Create new alert
                $insertStmt = $conn->prepare("
                    INSERT INTO budget_alerts (user_id, category_id, alert_type, current_amount, budget_amount, percentage_used, message)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                $insertStmt->bind_param("iisddds", 
                    $userId, 
                    $category['id'], 
                    $alertType, 
                    $spent, 
                    $budget, 
                    $percentage, 
                    $message
                );
                $insertStmt->execute();
            }
            
            $alerts[] = [
                'category' => $category['name'],
                'type' => $alertType,
                'percentage' => round($percentage, 1),
                'spent' => $spent,
                'budget' => $budget,
                'message' => $message,
                'priority' => $category['priority']
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'alerts' => $alerts
    ]);
}

/**
 * Get all alerts for user
 */
function getAlerts($userId) {
    global $conn;
    
    $unreadOnly = isset($_GET['unread_only']) && $_GET['unread_only'] === 'true';
    
    $query = "
        SELECT ba.*, c.name as category_name, c.color, c.priority
        FROM budget_alerts ba
        JOIN categories c ON ba.category_id = c.id
        WHERE ba.user_id = ?
    ";
    
    if ($unreadOnly) {
        $query .= " AND ba.is_read = FALSE";
    }
    
    $query .= " ORDER BY ba.created_at DESC LIMIT 50";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $alerts = [];
    while ($row = $result->fetch_assoc()) {
        $alerts[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'alerts' => $alerts
    ]);
}

/**
 * Mark alert as read
 */
function markAlertRead($userId) {
    global $conn;
    
    $alertId = $_POST['alert_id'] ?? null;
    
    if (!$alertId) {
        throw new Exception('Alert ID is required');
    }
    
    $stmt = $conn->prepare("
        UPDATE budget_alerts 
        SET is_read = TRUE 
        WHERE id = ? AND user_id = ?
    ");
    $stmt->bind_param("ii", $alertId, $userId);
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'Alert marked as read'
    ]);
}

/**
 * Generate spending insights for the current month
 */
function generateSpendingInsights($userId) {
    global $conn;
    
    $currentMonth = date('n');
    $currentYear = date('Y');
    
    // Get spending by priority
    $stmt = $conn->prepare("
        SELECT 
            c.priority,
            SUM(e.amount) as total_spent,
            COUNT(e.id) as transaction_count
        FROM expenses e
        JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = ? 
        AND MONTH(e.expense_date) = ? 
        AND YEAR(e.expense_date) = ?
        GROUP BY c.priority
    ");
    $stmt->bind_param("iii", $userId, $currentMonth, $currentYear);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $spending = [
        'essential' => 0,
        'moderate' => 0,
        'discretionary' => 0
    ];
    
    while ($row = $result->fetch_assoc()) {
        $spending[$row['priority']] = (float)$row['total_spent'];
    }
    
    $totalSpent = array_sum($spending);
    
    // Calculate savings potential (assuming 50% of discretionary + 20% of moderate can be saved)
    $savingsPotential = ($spending['discretionary'] * 0.5) + ($spending['moderate'] * 0.2);
    
    // Generate recommendations
    $recommendations = generateRecommendationsArray($userId, $spending);
    
    // Store insights
    $stmt = $conn->prepare("
        INSERT INTO spending_insights 
        (user_id, month, year, total_spent, essential_spent, moderate_spent, discretionary_spent, savings_potential, recommendations)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        total_spent = VALUES(total_spent),
        essential_spent = VALUES(essential_spent),
        moderate_spent = VALUES(moderate_spent),
        discretionary_spent = VALUES(discretionary_spent),
        savings_potential = VALUES(savings_potential),
        recommendations = VALUES(recommendations)
    ");
    
    $recommendationsJson = json_encode($recommendations);
    
    $stmt->bind_param("iiiddddds",
        $userId,
        $currentMonth,
        $currentYear,
        $totalSpent,
        $spending['essential'],
        $spending['moderate'],
        $spending['discretionary'],
        $savingsPotential,
        $recommendationsJson
    );
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'insights' => [
            'total_spent' => $totalSpent,
            'essential' => $spending['essential'],
            'moderate' => $spending['moderate'],
            'discretionary' => $spending['discretionary'],
            'savings_potential' => $savingsPotential,
            'recommendations' => $recommendations
        ]
    ]);
}

/**
 * Get spending insights
 */
function getSpendingInsights($userId) {
    global $conn;
    
    $month = $_GET['month'] ?? date('n');
    $year = $_GET['year'] ?? date('Y');
    
    $stmt = $conn->prepare("
        SELECT * FROM spending_insights
        WHERE user_id = ? AND month = ? AND year = ?
    ");
    $stmt->bind_param("iii", $userId, $month, $year);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $insights = $result->fetch_assoc();
    
    if ($insights && $insights['recommendations']) {
        $insights['recommendations'] = json_decode($insights['recommendations'], true);
    }
    
    echo json_encode([
        'success' => true,
        'insights' => $insights
    ]);
}

/**
 * Get personalized recommendations
 */
function getRecommendations($userId) {
    global $conn;
    
    $currentMonth = date('n');
    $currentYear = date('Y');
    
    $stmt = $conn->prepare("
        SELECT 
            c.id,
            c.name,
            c.priority,
            c.budget,
            SUM(e.amount) as spent
        FROM categories c
        LEFT JOIN expenses e ON c.id = e.category_id 
            AND MONTH(e.expense_date) = ? 
            AND YEAR(e.expense_date) = ?
        WHERE c.user_id = ?
        GROUP BY c.id
        ORDER BY c.priority DESC, spent DESC
    ");
    $stmt->bind_param("iii", $currentMonth, $currentYear, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $recommendations = [];
    
    while ($category = $result->fetch_assoc()) {
        $spent = (float)$category['spent'];
        $budget = (float)$category['budget'];
        
        if ($category['priority'] === 'discretionary' && $spent > 0) {
            $potentialSaving = $spent * 0.5;
            $recommendations[] = [
                'category' => $category['name'],
                'type' => 'reduce',
                'priority' => 'discretionary',
                'current_spending' => $spent,
                'suggested_reduction' => $potentialSaving,
                'message' => "Consider reducing spending on {$category['name']} by 50% to save ₹" . number_format($potentialSaving, 2)
            ];
        } elseif ($category['priority'] === 'moderate' && $spent > $budget && $budget > 0) {
            $overspent = $spent - $budget;
            $recommendations[] = [
                'category' => $category['name'],
                'type' => 'optimize',
                'priority' => 'moderate',
                'current_spending' => $spent,
                'budget' => $budget,
                'overspent' => $overspent,
                'message' => "You've exceeded your {$category['name']} budget by ₹" . number_format($overspent, 2) . ". Look for cost-effective alternatives."
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'recommendations' => $recommendations
    ]);
}

/**
 * Generate recommendations array (internal function)
 */
function generateRecommendationsArray($userId, $spending) {
    global $conn;
    
    $recommendations = [];
    
    // Overall spending analysis
    $totalSpent = array_sum($spending);
    $discretionaryPercentage = $totalSpent > 0 ? ($spending['discretionary'] / $totalSpent) * 100 : 0;
    
    if ($discretionaryPercentage > 30) {
        $recommendations[] = [
            'type' => 'warning',
            'title' => 'High Discretionary Spending',
            'message' => 'Discretionary expenses make up ' . round($discretionaryPercentage, 1) . '% of your total spending. Consider reducing non-essential expenses.',
            'impact' => 'high'
        ];
    }
    
    // Get top discretionary categories
    $stmt = $conn->prepare("
        SELECT c.name, SUM(e.amount) as total
        FROM expenses e
        JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = ? 
        AND c.priority = 'discretionary'
        AND MONTH(e.expense_date) = MONTH(CURRENT_DATE())
        AND YEAR(e.expense_date) = YEAR(CURRENT_DATE())
        GROUP BY c.id
        ORDER BY total DESC
        LIMIT 3
    ");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $potentialSaving = (float)$row['total'] * 0.5;
        $recommendations[] = [
            'type' => 'savings',
            'title' => 'Reduce ' . $row['name'],
            'message' => 'Cut your ' . $row['name'] . ' spending by 50% to save ₹' . number_format($potentialSaving, 2) . ' this month.',
            'impact' => 'medium',
            'category' => $row['name'],
            'potential_savings' => $potentialSaving
        ];
    }
    
    return $recommendations;
}
