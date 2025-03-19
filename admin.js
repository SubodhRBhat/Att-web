function loadPendingUsers() {
    const userList = document.getElementById("user-list");
    userList.innerHTML = "";

    db.collection("users").where("approved", "==", false).get()
        .then(snapshot => {
            if (snapshot.empty) {
                userList.innerHTML = "<p>No pending registration requests.</p>";
                return;
            }

            snapshot.forEach(doc => {
                const user = doc.data();
                const li = document.createElement("li");
                li.innerHTML = `${user.name} (${user.email}) - ${user.role}
                    <button onclick="approveUser('${user.email}')">Approve</button>
                    <button onclick="rejectUser('${user.email}')">Reject</button>`;
                userList.appendChild(li);
            });
        })
        .catch(error => console.error("Error loading pending users:", error));
}

function isAdmin() {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    return user && user.role === "admin";
}

function approveUser(email) {
    if (!isAdmin()) {
        alert("Unauthorized action! Only admins can approve users.");
        return;
    }

    db.collection("users").doc(email).update({ approved: true })
        .then(() => {
            alert("User approved successfully!");
            loadPendingUsers();
        })
        .catch(error => console.error("Error approving user:", error));
}

function rejectUser(email) {
    if (!isAdmin()) {
        alert("Unauthorized action! Only admins can reject users.");
        return;
    }

    if (!confirm("Are you sure you want to reject this user?")) return;

    db.collection("users").doc(email).delete()
        .then(() => {
            alert("User rejected successfully!");
            loadPendingUsers();
        })
        .catch(error => console.error("Error rejecting user:", error));
}

window.onload = function() {
    checkAdminAccess();
    loadPendingUsers();
};