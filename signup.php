<?php
require_once 'config/session.php';
redirectIfLoggedIn();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up - Personal Expense Tracker</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/auth.css">
    <link rel="stylesheet" href="assets/css/theme.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <!-- Brand with Icon -->
            <div class="auth-brand">
                <span class="brand-emoji">💰</span>
                <h1>ExpenseTracker</h1>
            </div>

            <!-- Header -->
            <div class="auth-header">
                <h2 class="auth-title">Create Account</h2>
                <p class="auth-subtitle">Start tracking your expenses today</p>
            </div>

                <?php if (isset($_SESSION['error'])): ?>
                    <div class="alert alert-error">
                        <?php 
                            echo htmlspecialchars($_SESSION['error']); 
                            unset($_SESSION['error']);
                        ?>
                    </div>
                <?php endif; ?>

                <form action="api/auth.php?action=signup" method="POST" class="auth-form" id="signupForm">
                    <div class="form-group">
                        <label for="username" class="form-label">Username</label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            class="form-input" 
                            placeholder="dishita"
                            required
                            minlength="3"
                            maxlength="50"
                        >
                    </div>

                    <div class="form-group">
                        <label for="email" class="form-label">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            class="form-input" 
                            placeholder="dishita@exp.com"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="password" class="form-label">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            class="form-input" 
                            placeholder="••••••"
                            required
                            minlength="6"
                        >
                        <div class="form-help">At least 6 characters</div>
                    </div>

                    <div class="form-group">
                        <label for="confirm_password" class="form-label">Confirm Password</label>
                        <input 
                            type="password" 
                            id="confirm_password" 
                            name="confirm_password" 
                            class="form-input" 
                            placeholder="••••••"
                            required
                        >
                    </div>

                    <button type="submit" class="btn-signup">
                        Create Account
                    </button>

                    <div class="auth-footer">
                        Already have an account? 
                        <a href="index.php" class="auth-link">Sign In</a>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="assets/js/main.js"></script>
    <script>
        // Client-side password confirmation validation
        document.getElementById('signupForm').addEventListener('submit', function(e) {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;

            if (password !== confirmPassword) {
                e.preventDefault();
                utils.showAlert('Passwords do not match', 'error');
            }
        });
    </script>
</body>
</html>
