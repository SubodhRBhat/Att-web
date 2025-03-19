// This file is redundant with auth.js handling login/logout, but included for completeness
function login() { // Already defined in auth.js, so this can be removed if not needed separately
    const username = document.getElementById("username").value.trim();
    const role = document.getElementById("role").value;
    if (!username || !role) {
        alert("Please enter your email and select a role.");
        return;
    }
    // Delegate to auth.js login function
    login(); // This assumes auth.js is loaded first
}

function markAttendance() {
    // This function seems misplaced; moved functionality to faculty.js
    alert("Please use the faculty dashboard to mark attendance.");
}

function loadAttendance() {
    // This function seems misplaced; moved functionality to student.js
    alert("Please use the student dashboard to view attendance.");
}

function logout() { // Already defined in auth.js, so this can be removed if not needed separately
    sessionStorage.removeItem("loggedInUser");
    alert("You have been logged out.");
    window.location.href = "index.html";
}

window.onload = function() {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (user) {
        // Auto-redirect based on role
        const roleRedirects = {
            "admin": "admin.html",
            "faculty": "faculty-dashboard.html",
            "student": "student-dashboard.html"
        };
        window.location.href = roleRedirects[user.role] || "index.html";
    }
};