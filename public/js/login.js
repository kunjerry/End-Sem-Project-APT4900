document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("errorMessage");
    const serverStatus = document.getElementById("serverStatus");
    
    if (!loginForm) return;
    
    // Check server status on load
    checkServerStatus();
    
    // Check if already logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
        const userRole = localStorage.getItem("userRole");
        redirectToDashboard(userRole);
        return;
    }
    
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        
        // Validation
        if (!username || !password) {
            showError("Please enter username and password");
            return;
        }
        
        // Show loading
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Logging in...';
        
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store user data
                localStorage.setItem("userId", data.userId);
                localStorage.setItem("username", data.username);
                localStorage.setItem("userRole", data.userRole);
                localStorage.setItem("fullName", data.fullName);
                localStorage.setItem("isLoggedIn", "true");
                
                showSuccess("Login successful! Redirecting...");
                
                // Redirect after delay
                setTimeout(() => {
                    redirectToDashboard(data.userRole);
                }, 1000);
                
            } else {
                showError(data.message || "Invalid username or password");
            }
            
        } catch (error) {
            console.error("Login error:", error);
            showError("Cannot connect to server. Please check if server is running.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
    
    async function checkServerStatus() {
        try {
            const response = await fetch("/api/health");
            const data = await response.json();
            
            if (serverStatus) {
                if (data.success) {
                    serverStatus.innerHTML = '<span class="text-success">✓ Server is online</span>';
                } else {
                    serverStatus.innerHTML = '<span class="text-danger">✗ Server error: ' + data.message + '</span>';
                }
            }
        } catch (error) {
            if (serverStatus) {
                serverStatus.innerHTML = '<span class="text-danger">✗ Cannot connect to server</span>';
            }
        }
    }
    
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.className = "text-danger text-center mt-3";
        }
    }
    
    function showSuccess(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.className = "text-success text-center mt-3";
        }
    }
    
    function redirectToDashboard(userRole) {
        const dashboards = {
            "admin": "admin_dashboard.html",
            "officer": "officer_dashboard.html",
            "analyst": "analyst_dashboard.html",
            "court": "court_presentation.html"
        };
        
        const dashboard = dashboards[userRole] || "index.html";
        window.location.href = dashboard;
    }
});