function loadAttendance() {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    const attendanceList = document.getElementById("attendance-list");
    attendanceList.innerHTML = "";

    let subjectAttendance = {};

    db.collection("attendance").where("email", "==", user.email).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const record = doc.data();
                if (!subjectAttendance[record.subject]) {
                    subjectAttendance[record.subject] = { attended: 0, total: 0 };
                }
                subjectAttendance[record.subject].attended++;
            });

            // Fetch total classes per subject
            Promise.all(
                Object.keys(subjectAttendance).map(subject =>
                    db.collection("subjects").doc(subject).get().then(doc => {
                        subjectAttendance[subject].total = doc.exists ? doc.data().totalClasses : 0;
                    })
                )
            ).then(() => displayAttendance(subjectAttendance));
        })
        .catch(error => console.error("Error loading attendance:", error));
}

function displayAttendance(subjectAttendance) {
    const attendanceList = document.getElementById("attendance-list");
    let warnings = [];
    let safeBunks = {};

    for (let subject in subjectAttendance) {
        const attended = subjectAttendance[subject].attended;
        const total = subjectAttendance[subject].total || 1; // Avoid division by zero
        const percentage = (attended / total) * 100;
        const requiredAttendance = Math.ceil(total * 0.75);
        const safeBunkDays = attended - requiredAttendance;

        if (percentage < 75) {
            warnings.push(`${subject}: ${percentage.toFixed(2)}% (Below 75%)`);
        }
        safeBunks[subject] = safeBunkDays > 0 ? safeBunkDays : 0;

        const li = document.createElement("li");
        li.textContent = `${subject}: ${attended}/${total} classes attended (${percentage.toFixed(2)}%)`;
        attendanceList.appendChild(li);
    }

    if (warnings.length > 0) {
        document.getElementById("attendance-warning").textContent = "⚠️ Low Attendance Warning: " + warnings.join(", ");
        document.getElementById("attendance-warning").style.display = "block";
    }

    let safeBunkMessage = "You can safely bunk these many classes and maintain 75%:\n";
    for (let subject in safeBunks) {
        safeBunkMessage += `${subject}: ${safeBunks[subject]} days\n`;
    }
    document.getElementById("safe-bunk-info").textContent = safeBunkMessage;
}