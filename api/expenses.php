<?php
/**
 * Expenses API
 * Handles CRUD operations for expenses
 */

require_once '../config/database.php';
require_once '../config/session.php';

requireLogin();

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$userId = getCurrentUserId();

switch ($method) {
    case 'GET':
        getExpenses($userId);
        break;
    case 'POST':
        createExpense($userId);
        break;
    case 'PUT':
        updateExpense($userId);
        break;
    case 'DELETE':
        deleteExpense($userId);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

/**
 * Get all expenses for user
 */
function getExpenses($userId) {
    try {
        $conn = getDBConnection();

        $stmt = $conn->prepare("
            SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
            FROM expenses e
            LEFT JOIN categories c ON e.category_id = c.id
            WHERE e.user_id = ?
            ORDER BY e.expense_date DESC, e.created_at DESC
            LIMIT 100
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        $expenses = [];
        while ($row = $result->fetch_assoc()) {
            $expenses[] = $row;
        }

        echo json_encode([
            'success' => true,
            'expenses' => $expenses
        ]);

        $stmt->close();
        $conn->close();
    } catch (Exception $e) {
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch expenses']);
    }
}

/**
 * Create new expense
 */
function createExpense($userId) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        $amount = floatval($data['amount'] ?? 0);
        $categoryId = intval($data['category_id'] ?? 0);
        $description = trim($data['description'] ?? '');
        $expenseDate = $data['expense_date'] ?? date('Y-m-d');
        $notes = trim($data['notes'] ?? '');

        // Validation
        if ($amount <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Amount must be greater than 0']);
            return;
        }

        if (empty($categoryId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Category is required']);
            return;
        }

        $conn = getDBConnection();

        // Verify category belongs to user
        $stmt = $conn->prepare("SELECT id FROM categories WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $categoryId, $userId);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Invalid category']);
            return;
        }

        // Insert expense
        $stmt = $conn->prepare("
            INSERT INTO expenses (user_id, category_id, amount, description, expense_date, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("iidsss", $userId, $categoryId, $amount, $description, $expenseDate, $notes);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Expense created successfully',
                'id' => $conn->insert_id
            ]);
        } else {
            throw new Exception('Failed to create expense');
        }

        $stmt->close();
        $conn->close();
    } catch (Exception $e) {
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create expense']);
    }
}

/**
 * Update expense
 */
function updateExpense($userId) {
    try {
        $id = intval($_GET['id'] ?? 0);
        $data = json_decode(file_get_contents('php://input'), true);

        $amount = floatval($data['amount'] ?? 0);
        $categoryId = intval($data['category_id'] ?? 0);
        $description = trim($data['description'] ?? '');
        $expenseDate = $data['expense_date'] ?? date('Y-m-d');
        $notes = trim($data['notes'] ?? '');

        if ($id <= 0 || $amount <= 0 || empty($categoryId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid data']);
            return;
        }

        $conn = getDBConnection();

        // Verify expense belongs to user
        $stmt = $conn->prepare("SELECT id FROM expenses WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $id, $userId);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Expense not found']);
            return;
        }

        // Update expense
        $stmt = $conn->prepare("
            UPDATE expenses 
            SET category_id = ?, amount = ?, description = ?, expense_date = ?, notes = ?
            WHERE id = ? AND user_id = ?
        ");
        $stmt->bind_param("idsssii", $categoryId, $amount, $description, $expenseDate, $notes, $id, $userId);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Expense updated successfully'
            ]);
        } else {
            throw new Exception('Failed to update expense');
        }

        $stmt->close();
        $conn->close();
    } catch (Exception $e) {
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update expense']);
    }
}

/**
 * Delete expense
 */
function deleteExpense($userId) {
    try {
        $id = intval($_GET['id'] ?? 0);

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid ID']);
            return;
        }

        $conn = getDBConnection();

        $stmt = $conn->prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $id, $userId);
        
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Expense deleted successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Expense not found']);
        }

        $stmt->close();
        $conn->close();
    } catch (Exception $e) {
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete expense']);
    }
}
?>
