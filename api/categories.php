<?php
/**
 * Categories API
 * Handles CRUD operations for categories
 */

require_once '../config/database.php';
require_once '../config/session.php';

requireLogin();

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$userId = getCurrentUserId();

switch ($method) {
    case 'GET':
        getCategories($userId);
        break;
    case 'POST':
        createCategory($userId);
        break;
    case 'PUT':
        updateCategory($userId);
        break;
    case 'DELETE':
        deleteCategory($userId);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

/**
 * Check if columns exist in a table
 */
function checkColumnsExist($conn, $tableName, $columns) {
    try {
        $result = $conn->query("DESCRIBE `$tableName`");
        if (!$result) {
            return false;
        }
        
        $existingColumns = [];
        while ($row = $result->fetch_assoc()) {
            $existingColumns[] = $row['Field'];
        }
        
        foreach ($columns as $column) {
            if (!in_array($column, $existingColumns)) {
                return false;
            }
        }
        
        return true;
    } catch (Exception $e) {
        error_log('Column check error: ' . $e->getMessage());
        return false;
    }
}

/**
 * Get all categories for user
 */
function getCategories($userId) {
    try {
        $conn = getDBConnection();

        $stmt = $conn->prepare("
            SELECT c.*, COUNT(e.id) as expense_count, COALESCE(SUM(e.amount), 0) as total_amount
            FROM categories c
            LEFT JOIN expenses e ON c.id = e.category_id
            WHERE c.user_id = ?
            GROUP BY c.id
            ORDER BY c.name
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        $categories = [];
        while ($row = $result->fetch_assoc()) {
            $categories[] = $row;
        }

        echo json_encode([
            'success' => true,
            'categories' => $categories
        ]);

        $stmt->close();
        $conn->close();
    } catch (Exception $e) {
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch categories']);
    }
}

/**
 * Create new category
 */
function createCategory($userId) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        $name = trim($data['name'] ?? '');
        $color = $data['color'] ?? '#6366f1';
        $icon = $data['icon'] ?? 'tag';
        $budget = isset($data['budget']) && $data['budget'] !== '' ? floatval($data['budget']) : null;
        $priority = $data['priority'] ?? 'moderate';
        $alert_threshold = intval($data['alert_threshold'] ?? 80);
        $alert_enabled = intval($data['alert_enabled'] ?? 1);

        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Category name is required']);
            return;
        }

        $conn = getDBConnection();

        // Check if new columns exist
        $columnsExist = checkColumnsExist($conn, 'categories', ['priority', 'alert_threshold', 'alert_enabled']);

        if ($columnsExist) {
            // New version with budget alert features
            $stmt = $conn->prepare("
                INSERT INTO categories (user_id, name, color, icon, budget, priority, alert_threshold, alert_enabled)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->bind_param("isssdsis", $userId, $name, $color, $icon, $budget, $priority, $alert_threshold, $alert_enabled);
        } else {
            // Old version without budget alert features
            $stmt = $conn->prepare("
                INSERT INTO categories (user_id, name, color, icon, budget)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->bind_param("isssd", $userId, $name, $color, $icon, $budget);
        }
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Category created successfully',
                'id' => $conn->insert_id
            ]);
        } else {
            throw new Exception('Failed to create category: ' . $stmt->error);
        }

        $stmt->close();
        $conn->close();
    } catch (Exception $e) {
        error_log('Create Category Error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create category', 'error' => $e->getMessage()]);
    }
}

/**
 * Update category
 */
function updateCategory($userId) {
    try {
        $id = intval($_GET['id'] ?? 0);
        $data = json_decode(file_get_contents('php://input'), true);

        $name = trim($data['name'] ?? '');
        $color = $data['color'] ?? '#6366f1';
        $icon = $data['icon'] ?? 'tag';
        $budget = isset($data['budget']) && $data['budget'] !== '' ? floatval($data['budget']) : null;
        $priority = $data['priority'] ?? 'moderate';
        $alert_threshold = intval($data['alert_threshold'] ?? 80);
        $alert_enabled = intval($data['alert_enabled'] ?? 1);

        if ($id <= 0 || empty($name)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid data']);
            return;
        }

        $conn = getDBConnection();

        // Check if new columns exist
        $columnsExist = checkColumnsExist($conn, 'categories', ['priority', 'alert_threshold', 'alert_enabled']);

        if ($columnsExist) {
            // New version with budget alert features
            $stmt = $conn->prepare("
                UPDATE categories 
                SET name = ?, color = ?, icon = ?, budget = ?, priority = ?, alert_threshold = ?, alert_enabled = ?
                WHERE id = ? AND user_id = ?
            ");
            $stmt->bind_param("sssdsiiii", $name, $color, $icon, $budget, $priority, $alert_threshold, $alert_enabled, $id, $userId);
        } else {
            // Old version without budget alert features
            $stmt = $conn->prepare("
                UPDATE categories 
                SET name = ?, color = ?, icon = ?, budget = ?
                WHERE id = ? AND user_id = ?
            ");
            $stmt->bind_param("sssdii", $name, $color, $icon, $budget, $id, $userId);
        }
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Category updated successfully'
                ]);
            } else {
                // No rows affected - could be no changes or category not found
                // Check if category exists
                $checkStmt = $conn->prepare("SELECT id FROM categories WHERE id = ? AND user_id = ?");
                $checkStmt->bind_param("ii", $id, $userId);
                $checkStmt->execute();
                $checkResult = $checkStmt->get_result();
                
                if ($checkResult->num_rows > 0) {
                    // Category exists, just no changes made
                    echo json_encode([
                        'success' => true,
                        'message' => 'Category updated successfully'
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Category not found']);
                }
                $checkStmt->close();
            }
        } else {
            throw new Exception('Failed to update category: ' . $stmt->error);
        }

        $stmt->close();
        $conn->close();
    } catch (Exception $e) {
        error_log('Update Category Error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update category', 'error' => $e->getMessage()]);
    }
}

/**
 * Delete category
 */
function deleteCategory($userId) {
    try {
        $id = intval($_GET['id'] ?? 0);

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid ID']);
            return;
        }

        $conn = getDBConnection();

        $stmt = $conn->prepare("DELETE FROM categories WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $id, $userId);
        
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Category deleted successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Category not found']);
        }

        $stmt->close();
        $conn->close();
    } catch (Exception $e) {
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete category']);
    }
}
?>
