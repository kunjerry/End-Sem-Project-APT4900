document.addEventListener("DOMContentLoaded", function() {
    
    const currentPage = window.location.pathname.split('/').pop();
    const isLoginPage = currentPage === "index.html" || currentPage === "" || currentPage === "login.html";
    
    if (!isLoginPage) {
        checkAuthentication();
    }
       
    setupLogoutButton();
        
    displayUserInfo();
});

function checkAuthentication() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("userRole");
    
    if (!isLoggedIn || isLoggedIn !== "true" || !userRole) {
        // If not logged in redirect to login
        console.log("Not authenticated, redirecting to login...");
        window.location.href = "index.html";
        return;
    }
    
    //Checks if user has permission for current page
    const currentPage = window.location.pathname.split('/').pop();
    const pageRoles = {
        "admin_dashboard.html": ["admin"],
        "officer_dashboard.html": ["officer", "admin"],
        "evidence_upload.html": ["officer", "admin"],
        "analyst_dashboard.html": ["analyst", "admin"],
        "court_presentation.html": ["court", "admin"],
        "my_evidence.html": ["officer", "analyst", "admin", "court"],
        "evidence_details.html": ["officer", "analyst", "admin", "court"],
        "admin_create_user.html": ["admin"],
        "admin_view_users.html": ["admin"],
        "admin_view_evidence.html": ["admin"]
    };
    
    const allowedRoles = pageRoles[currentPage];
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        alert("Access denied. You don't have permission to view this page.");
        redirectToDashboard(userRole);
    }
}

function setupLogoutButton() {
    // Find logout button by ID
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(event) {
            event.preventDefault();
            
            if (confirm("Are you sure you want to logout?")) {
                performLogout();
            }
        });
    }
    
    
    const logoutLinks = document.querySelectorAll(".logout-link");
    logoutLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            if (confirm("Are you sure you want to logout?")) {
                performLogout();
            }
        });
    });
    
    
    document.addEventListener("keydown", function(event) {
        if (event.ctrlKey && event.key === 'l') {
            event.preventDefault();
            if (confirm("Logout using Ctrl+L. Are you sure?")) {
                performLogout();
            }
        }
    });
}

function performLogout() {
    // Clear all user data from localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    localStorage.removeItem("fullName");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginTime");
    
  
    
    console.log("User logged out, redirecting to login...");
    
    // Redirect to login page
    window.location.href = "index.html";
}

function displayUserInfo() {
    const username = localStorage.getItem("username");
    const fullName = localStorage.getItem("fullName");
    const userRole = localStorage.getItem("userRole");
    
    if (!username) return; // No user info to display
    
    // Update elements with specific IDs
    document.querySelectorAll("#displayUsername").forEach(el => {
        el.textContent = username;
    });
    
    document.querySelectorAll("#displayFullName").forEach(el => {
        el.textContent = fullName || username;
    });
    
    document.querySelectorAll("#displayRole").forEach(el => {
        if (userRole) {
            el.textContent = userRole.charAt(0).toUpperCase() + userRole.slice(1);
        }
    });
    
    // Update elements with classes
    document.querySelectorAll(".display-username").forEach(el => {
        el.textContent = username;
    });
    
    document.querySelectorAll(".display-fullname").forEach(el => {
        el.textContent = fullName || username;
    });
    
    document.querySelectorAll(".display-role").forEach(el => {
        if (userRole) {
            el.textContent = userRole.charAt(0).toUpperCase() + userRole.slice(1);
        }
    });
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

// Export functions for use in other files
if (typeof window !== 'undefined') {
    window.auth = {
        checkAuthentication,
        logout: performLogout,
        getUserInfo: function() {
            return {
                userId: localStorage.getItem("userId"),
                username: localStorage.getItem("username"),
                fullName: localStorage.getItem("fullName"),
                userRole: localStorage.getItem("userRole")
            };
        },
        isAuthenticated: function() {
            return localStorage.getItem("isLoggedIn") === "true";
        }
    };
}