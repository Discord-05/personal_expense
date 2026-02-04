<?php
/**
 * Authentication API
 * Handles signup, login, and logout
 */

require_once '../config/database.php';
require_once '../config/session.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'signup':
        handleSignup();
        break;
    case 'login':
        handleLogin();
        break;
    case 'logout':
        handleLogout();
        break;
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

/**
 * Handle user signup
 */
function handleSignup() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        return;
    }

    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';

    // Validation
    if (empty($username) || empty($email) || empty($password)) {
        $_SESSION['error'] = 'All fields are required';
        header('Location: /personal_expense/signup.php');
        exit();
    }

    if (strlen($username) < 3 || strlen($username) > 50) {
        $_SESSION['error'] = 'Username must be between 3 and 50 characters';
        header('Location: /personal_expense/signup.php');
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $_SESSION['error'] = 'Invalid email format';
        header('Location: /personal_expense/signup.php');
        exit();
    }

    if (strlen($password) < 6) {
        $_SESSION['error'] = 'Password must be at least 6 characters';
        header('Location: /personal_expense/signup.php');
        exit();
    }

    if ($password !== $confirmPassword) {
        $_SESSION['error'] = 'Passwords do not match';
        header('Location: /personal_expense/signup.php');
        exit();
    }

    try {
        $conn = getDBConnection();

        // Check if username or email already exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->bind_param("ss", $username, $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $_SESSION['error'] = 'Username or email already exists';
            header('Location: /personal_expense/signup.php');
            exit();
        }

        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Insert user
        $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $username, $email, $hashedPassword);
        
        if ($stmt->execute()) {
            $userId = $conn->insert_id;

            // Create default categories for the new user
            createDefaultCategories($conn, $userId);

            $_SESSION['success'] = 'Account created successfully! Please login.';
            header('Location: /personal_expense/index.php');
        } else {
            $_SESSION['error'] = 'Failed to create account';
            header('Location: /personal_expense/signup.php');
        }

        $stmt->close();
        $conn->close();
    } catch (Exception $e) {
        error_log($e->getMessage());
        $_SESSION['error'] = 'An error occurred. Please try again.';
        header('Location: /personal_expense/signup.php');
    }
    exit();
}

/**
 * Handle user login
 */
function handleLogin() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        return;
    }

    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $_SESSION['error'] = 'Email and password are required';
        header('Location: /personal_expense/index.php');
        exit();
    }

    try {
        $conn = getDBConnection();

        $stmt = $conn->prepare("SELECT id, username, email, password FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $_SESSION['error'] = 'Invalid email or password';
            header('Location: /personal_expense/index.php');
            exit();
        }

        $user = $result->fetch_assoc();

        if (!password_verify($password, $user['password'])) {
            $_SESSION['error'] = 'Invalid email or password';
            header('Location: /personal_expense/index.php');
            exit();
        }

        // Set session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];

        header('Location: /personal_expense/dashboard.php');

        $stmt->close();
        $conn->close();
    } catch (Exception $e) {
        error_log($e->getMessage());
        $_SESSION['error'] = 'An error occurred. Please try again.';
        header('Location: /personal_expense/index.php');
    }
    exit();
}

/**
 * Handle user logout
 */
function handleLogout() {
    session_destroy();
    header('Location: /personal_expense/index.php');
    exit();
}

/**
 * Create default categories for new user
 */
function createDefaultCategories($conn, $userId) {
    $defaultCategories = [
        ['Food & Dining', '#ef4444', 'utensils'],
        ['Transportation', '#3b82f6', 'car'],
        ['Shopping', '#8b5cf6', 'shopping-bag'],
        ['Entertainment', '#ec4899', 'film'],
        ['Bills & Utilities', '#f59e0b', 'file-text'],
        ['Healthcare', '#10b981', 'heart'],
        ['Education', '#06b6d4', 'book'],
        ['Other', '#6b7280', 'tag']
    ];

    $stmt = $conn->prepare("INSERT INTO categories (user_id, name, color, icon) VALUES (?, ?, ?, ?)");

    foreach ($defaultCategories as $category) {
        $stmt->bind_param("isss", $userId, $category[0], $category[1], $category[2]);
        $stmt->execute();
    }

    $stmt->close();
}
?>
