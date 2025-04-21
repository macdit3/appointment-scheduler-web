// JavaScript for login page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Toggle between client and business owner login
    const clientBtn = document.getElementById('clientBtn');
    const businessBtn = document.getElementById('businessBtn');

    clientBtn.addEventListener('click', function() {
        clientBtn.classList.add('active');
        businessBtn.classList.remove('active');
        // You can modify form fields or validation based on the selected user type
    });

    businessBtn.addEventListener('click', function() {
        businessBtn.classList.add('active');
        clientBtn.classList.remove('active');
        // You can modify form fields or validation based on the selected user type
    });

    // Toggle password visibility
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Form submission
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const isBusinessLogin = businessBtn.classList.contains('active');

        // Validate form
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        // Check if email is valid
        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }

        // Perform login (replace with actual API call)
        performLogin(email, password, isBusinessLogin);
    });

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showError(message) {
        // You can implement a more sophisticated error display
        alert(message);
    }

    function performLogin(email, password, isBusinessLogin) {
        // In a real application, you would call your API here
        console.log('Logging in with:', { email, password, isBusinessOwner: isBusinessLogin });

        // For demonstration, simulate login success
        setTimeout(() => {
            // Redirect based on user type
            if (isBusinessLogin) {
                // Redirect to business dashboard
                window.location.href = 'business-dashboard.html';
            } else {
                // Redirect to client dashboard
                window.location.href = 'client-dashboard.html';
            }
        }, 1000);

        // Show loading state
        const loginBtn = document.querySelector('.login-btn');
        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;
    }
});