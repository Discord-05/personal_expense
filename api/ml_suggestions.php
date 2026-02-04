<?php
/**
 * ML-Based Spending Suggestions API
 * Analyzes past spending patterns and provides intelligent recommendations
 */

require_once '../config/database.php';
require_once '../config/session.php';

requireLogin();

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$userId = getCurrentUserId();

if ($method === 'GET') {
    generateSuggestions($userId);
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

/**
 * Generate ML-based spending suggestions
 */
function generateSuggestions($userId) {
    try {
        $conn = getDBConnection();
        
        // Get analysis period (last 3 months for better pattern detection)
        $suggestions = [
            'success' => true,
            'generated_at' => date('Y-m-d H:i:s'),
            'insights' => [],
            'spending_alerts' => [],
            'recommendations' => [],
            'category_analysis' => []
        ];
        
        // 1. Analyze spending trends by category
        $categoryAnalysis = analyzeCategoryTrends($conn, $userId);
        $suggestions['category_analysis'] = $categoryAnalysis;
        
        // 2. Detect unusual spending patterns (anomaly detection)
        $anomalies = detectSpendingAnomalies($conn, $userId, $categoryAnalysis);
        $suggestions['spending_alerts'] = $anomalies;
        
        // 3. Generate predictive insights
        $predictions = generatePredictiveInsights($conn, $userId, $categoryAnalysis);
        $suggestions['insights'] = $predictions;
        
        // 4. Create actionable recommendations
        $recommendations = createRecommendations($categoryAnalysis, $anomalies);
        $suggestions['recommendations'] = $recommendations;
        
        echo json_encode($suggestions);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to generate suggestions: ' . $e->getMessage()]);
    }
}

/**
 * Analyze spending trends by category using statistical methods
 */
function analyzeCategoryTrends($conn, $userId) {
    $analysis = [];
    
    // Get last 3 months of data for pattern recognition
    $stmt = $conn->prepare("
        SELECT 
            c.id,
            c.name,
            c.color,
            c.budget,
            MONTH(e.expense_date) as month,
            YEAR(e.expense_date) as year,
            SUM(e.amount) as total_spent,
            COUNT(e.id) as transaction_count,
            AVG(e.amount) as avg_transaction
        FROM categories c
        LEFT JOIN expenses e ON c.id = e.category_id 
            AND e.user_id = ?
            AND e.expense_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
        WHERE c.user_id = ?
        GROUP BY c.id, c.name, c.color, c.budget, MONTH(e.expense_date), YEAR(e.expense_date)
        ORDER BY c.name, year DESC, month DESC
    ");
    
    $stmt->bind_param("ii", $userId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $categoryData = [];
    while ($row = $result->fetch_assoc()) {
        $catId = $row['id'];
        if (!isset($categoryData[$catId])) {
            $categoryData[$catId] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'color' => $row['color'],
                'budget' => $row['budget'],
                'monthly_spending' => [],
                'total_spent' => 0,
                'transaction_count' => 0
            ];
        }
        
        if ($row['total_spent']) {
            $categoryData[$catId]['monthly_spending'][] = floatval($row['total_spent']);
            $categoryData[$catId]['total_spent'] += floatval($row['total_spent']);
            $categoryData[$catId]['transaction_count'] += intval($row['transaction_count']);
        }
    }
    
    // Calculate statistical metrics for each category
    foreach ($categoryData as $catId => $data) {
        if (count($data['monthly_spending']) > 0) {
            $spending = $data['monthly_spending'];
            
            // Calculate mean and standard deviation
            $mean = array_sum($spending) / count($spending);
            $variance = 0;
            foreach ($spending as $value) {
                $variance += pow($value - $mean, 2);
            }
            $stdDev = sqrt($variance / count($spending));
            
            // Calculate trend (simple linear regression)
            $trend = calculateTrend($spending);
            
            // Determine spending pattern
            $pattern = 'stable';
            if ($trend > 0.15) $pattern = 'increasing';
            elseif ($trend < -0.15) $pattern = 'decreasing';
            
            // Calculate coefficient of variation (CV) for volatility
            $volatility = ($mean > 0) ? ($stdDev / $mean) : 0;
            
            $analysis[$catId] = [
                'id' => $data['id'],
                'name' => $data['name'],
                'color' => $data['color'],
                'budget' => $data['budget'],
                'average_monthly' => round($mean, 2),
                'std_deviation' => round($stdDev, 2),
                'trend' => $trend,
                'pattern' => $pattern,
                'volatility' => round($volatility, 2),
                'total_spent' => round($data['total_spent'], 2),
                'transaction_count' => $data['transaction_count'],
                'monthly_data' => $spending
            ];
        }
    }
    
    return $analysis;
}

/**
 * Calculate simple linear regression trend
 * Returns slope normalized by mean (positive = increasing, negative = decreasing)
 */
function calculateTrend($values) {
    $n = count($values);
    if ($n < 2) return 0;
    
    $x = range(1, $n);
    $sumX = array_sum($x);
    $sumY = array_sum($values);
    $sumXY = 0;
    $sumX2 = 0;
    
    for ($i = 0; $i < $n; $i++) {
        $sumXY += $x[$i] * $values[$i];
        $sumX2 += $x[$i] * $x[$i];
    }
    
    $slope = ($n * $sumXY - $sumX * $sumY) / ($n * $sumX2 - $sumX * $sumX);
    $mean = $sumY / $n;
    
    // Normalize slope by mean to get percentage change
    return ($mean > 0) ? ($slope / $mean) : 0;
}

/**
 * Detect unusual spending patterns using statistical anomaly detection
 */
function detectSpendingAnomalies($conn, $userId, $categoryAnalysis) {
    $alerts = [];
    
    // Get current month spending
    $stmt = $conn->prepare("
        SELECT 
            c.id,
            c.name,
            c.budget,
            COALESCE(SUM(e.amount), 0) as current_month_spending
        FROM categories c
        LEFT JOIN expenses e ON c.id = e.category_id 
            AND e.user_id = ?
            AND MONTH(e.expense_date) = MONTH(CURDATE())
            AND YEAR(e.expense_date) = YEAR(CURDATE())
        WHERE c.user_id = ?
        GROUP BY c.id, c.name, c.budget
    ");
    
    $stmt->bind_param("ii", $userId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $catId = $row['id'];
        $currentSpending = floatval($row['current_month_spending']);
        
        if (isset($categoryAnalysis[$catId]) && $currentSpending > 0) {
            $analysis = $categoryAnalysis[$catId];
            $mean = $analysis['average_monthly'];
            $stdDev = $analysis['std_deviation'];
            
            // Z-score anomaly detection
            if ($stdDev > 0) {
                $zScore = ($currentSpending - $mean) / $stdDev;
                
                // Alert if spending is more than 2 standard deviations above mean
                if ($zScore > 2) {
                    $alerts[] = [
                        'type' => 'high_spending',
                        'severity' => 'warning',
                        'category' => $row['name'],
                        'message' => "Unusually high spending in " . $row['name'] . ". You've spent ₹" . 
                                   number_format($currentSpending, 2) . " this month, which is " . 
                                   round(($currentSpending - $mean) / $mean * 100) . "% above your average.",
                        'current' => $currentSpending,
                        'average' => round($mean, 2),
                        'z_score' => round($zScore, 2)
                    ];
                }
            }
            
            // Budget overspending alert
            if ($row['budget'] && $currentSpending > floatval($row['budget'])) {
                $overspend = $currentSpending - floatval($row['budget']);
                $alerts[] = [
                    'type' => 'budget_exceeded',
                    'severity' => 'critical',
                    'category' => $row['name'],
                    'message' => "Budget exceeded in " . $row['name'] . "! Over budget by ₹" . 
                               number_format($overspend, 2) . ".",
                    'current' => $currentSpending,
                    'budget' => floatval($row['budget']),
                    'overspend' => round($overspend, 2)
                ];
            }
            // Warning when approaching budget (80% threshold)
            elseif ($row['budget'] && $currentSpending > floatval($row['budget']) * 0.8) {
                $remaining = floatval($row['budget']) - $currentSpending;
                $alerts[] = [
                    'type' => 'budget_warning',
                    'severity' => 'info',
                    'category' => $row['name'],
                    'message' => "Approaching budget limit in " . $row['name'] . ". Only ₹" . 
                               number_format($remaining, 2) . " remaining.",
                    'current' => $currentSpending,
                    'budget' => floatval($row['budget']),
                    'remaining' => round($remaining, 2)
                ];
            }
        }
    }
    
    return $alerts;
}

/**
 * Generate predictive insights for next month
 */
function generatePredictiveInsights($conn, $userId, $categoryAnalysis) {
    $insights = [];
    
    foreach ($categoryAnalysis as $analysis) {
        // Predict next month spending based on trend
        $predicted = $analysis['average_monthly'] * (1 + $analysis['trend']);
        
        if ($analysis['pattern'] === 'increasing') {
            $insights[] = [
                'type' => 'trend_prediction',
                'category' => $analysis['name'],
                'message' => "Your spending in " . $analysis['name'] . " is trending upward. " .
                           "Expected spending next month: ₹" . number_format($predicted, 2) . 
                           " (vs. current average ₹" . number_format($analysis['average_monthly'], 2) . ").",
                'predicted_amount' => round($predicted, 2),
                'trend' => 'increasing',
                'confidence' => calculateConfidence($analysis['volatility'])
            ];
        }
        
        // High volatility warning
        if ($analysis['volatility'] > 0.5) {
            $insights[] = [
                'type' => 'volatility_warning',
                'category' => $analysis['name'],
                'message' => "High spending variability in " . $analysis['name'] . ". " .
                           "Consider creating a more consistent budget.",
                'volatility' => round($analysis['volatility'], 2)
            ];
        }
    }
    
    // Overall spending prediction
    $totalPredicted = 0;
    $totalAverage = 0;
    foreach ($categoryAnalysis as $analysis) {
        $totalPredicted += $analysis['average_monthly'] * (1 + $analysis['trend']);
        $totalAverage += $analysis['average_monthly'];
    }
    
    if ($totalAverage > 0) {
        $overallChange = (($totalPredicted - $totalAverage) / $totalAverage) * 100;
        if (abs($overallChange) > 5) {
            $insights[] = [
                'type' => 'overall_prediction',
                'category' => 'All Categories',
                'message' => "Overall spending is expected to " . 
                           ($overallChange > 0 ? "increase" : "decrease") . " by " . 
                           round(abs($overallChange), 1) . "% next month.",
                'predicted_total' => round($totalPredicted, 2),
                'current_average' => round($totalAverage, 2),
                'change_percent' => round($overallChange, 2)
            ];
        }
    }
    
    return $insights;
}

/**
 * Calculate confidence level based on volatility
 */
function calculateConfidence($volatility) {
    if ($volatility < 0.2) return 'high';
    if ($volatility < 0.5) return 'medium';
    return 'low';
}

/**
 * Create actionable recommendations
 */
function createRecommendations($categoryAnalysis, $anomalies) {
    $recommendations = [];
    
    // Sort categories by spending amount
    usort($categoryAnalysis, function($a, $b) {
        return $b['total_spent'] - $a['total_spent'];
    });
    
    // Top spending categories
    $topCategories = array_slice($categoryAnalysis, 0, 3);
    foreach ($topCategories as $cat) {
        if ($cat['pattern'] === 'increasing') {
            $savingsTarget = $cat['average_monthly'] * 0.1; // Suggest 10% reduction
            $recommendations[] = [
                'type' => 'reduce_spending',
                'priority' => 'high',
                'category' => $cat['name'],
                'message' => "Consider reducing spending in " . $cat['name'] . " by 10%. " .
                           "This could save you ₹" . number_format($savingsTarget, 2) . " per month.",
                'potential_savings' => round($savingsTarget, 2),
                'actionable' => true
            ];
        }
    }
    
    // Budget recommendations for categories without budgets
    foreach ($categoryAnalysis as $cat) {
        if (!$cat['budget'] && $cat['average_monthly'] > 0) {
            $suggestedBudget = $cat['average_monthly'] * 1.1; // 10% buffer
            $recommendations[] = [
                'type' => 'set_budget',
                'priority' => 'medium',
                'category' => $cat['name'],
                'message' => "Set a budget of ₹" . number_format($suggestedBudget, 2) . 
                           " for " . $cat['name'] . " based on your spending history.",
                'suggested_budget' => round($suggestedBudget, 2),
                'actionable' => true
            ];
        }
    }
    
    // Positive reinforcement for decreasing trends
    foreach ($categoryAnalysis as $cat) {
        if ($cat['pattern'] === 'decreasing') {
            $recommendations[] = [
                'type' => 'positive_feedback',
                'priority' => 'low',
                'category' => $cat['name'],
                'message' => "Great job! You're reducing spending in " . $cat['name'] . ". Keep it up!",
                'actionable' => false
            ];
        }
    }
    
    // Limit to top 5 most relevant recommendations
    usort($recommendations, function($a, $b) {
        $priority = ['high' => 3, 'medium' => 2, 'low' => 1];
        return $priority[$b['priority']] - $priority[$a['priority']];
    });
    
    return array_slice($recommendations, 0, 5);
}
