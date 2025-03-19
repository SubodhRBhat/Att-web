// Firebase initialization (replace with your config)
const firebaseConfig = {
    apiKey: "AIzaSyAlTeuaZbKr0yMIUM-KJZsydnG_hGeVbOI",
    authDomain: "attendease-saaa.firebaseapp.com",
    projectId: "attendease-saaa",
    storageBucket: "attendease-saaa.firebasestorage.app",
    messagingSenderId: "660715693928",
    appId: "1:660715693928:web:272f1d8f440584498618dd"
  };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Function to handle user registration
function registerUser() {
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const role = document.getElementById("reg-role").value;

    if (!name || !email || !role) {
        alert("All fields are required.");
        return;
    }

    db.collection("users").doc(email).get().then(doc => {
        if (doc.exists) {
            alert("User already exists. Please log in.");
            return;
        }

        const newUser = {
            name,
            email,
            role,
            approved: role === "admin" // Auto-approve admin
        };

        db.collection("users").doc(email).set(newUser)
            .then(() => {
                alert("Registration successful! Please wait for admin approval if required.");
                window.location.href = "index.html";
            })
            .catch(error => console.error("Error registering user:", error));
    });
}

// Function to handle user login
function login() {
    const email = document.getElementById("username").value.trim();
    const role = document.getElementById("role").value;

    if (!email || !role) {
        alert("Please enter your email and select a role.");
        return;
    }

    db.collection("users").doc(email).get().then(doc => {
        if (!doc.exists) {
            alert("User not found. Please register first.");
            return;
        }

        const user = doc.data();
        if (user.role !== role) {
            alert("Incorrect role selection.");
            return;
        }

        if (!user.approved && role !== "admin") {
            alert("Your account is pending admin approval.");
            return;
        }

        alert("Login successful!");
        sessionStorage.setItem("loggedInUser", JSON.stringify(user));

        const roleRedirects = {
            "admin": "admin.html",
            "faculty": "faculty-dashboard.html",
            "student": "student-dashboard.html"
        };
        window.location.href = roleRedirects[role] || "index.html";
    }).catch(error => console.error("Error logging in:", error));
}

// Function to check authentication based on role
function checkAuth(requiredRole) {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (!user || user.role !== requiredRole) {
        alert("Unauthorized access. Redirecting to login.");
        window.location.href = "index.html";
    }
}

// Function to check admin access
function checkAdminAccess() {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (!user || user.role !== "admin") {
        alert("Unauthorized access!");
        window.location.href = "index.html";
    }
}

// Function to logout
function logout() {
    sessionStorage.removeItem("loggedInUser");
    alert("You have been logged out.");
    window.location.href = "index.html";
}