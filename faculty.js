function loadSubjects() {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    const subjectSelect = document.getElementById("subject-select");
    subjectSelect.innerHTML = '<option value="">Select a subject</option>';

    db.collection("subjects").where("faculty", "==", user.email).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const subject = doc.data().name;
                const option = document.createElement("option");
                option.value = subject;
                option.textContent = subject;
                subjectSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error loading subjects:", error));
}

function loadStudents() {
    const subject = document.getElementById("subject-select").value;
    if (!subject) return;

    const studentList = document.getElementById("student-list");
    studentList.innerHTML = "";

    db.collection("students").where("subjects", "array-contains", subject).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const student = doc.data();
                const li = document.createElement("li");
                li.innerHTML = `<input type="checkbox" value="${student.email}"> ${student.name} (${student.email})`;
                studentList.appendChild(li);
            });
        })
        .catch(error => console.error("Error loading students:", error));
}

function submitAttendance() {
    const subject = document.getElementById("subject-select").value;
    if (!subject) {
        alert("Please select a subject.");
        return;
    }

    const markedAttendance = [];
    document.querySelectorAll("#student-list input:checked").forEach(input => {
        markedAttendance.push({ email: input.value, date: new Date().toISOString(), subject });
    });

    const batch = db.batch();
    markedAttendance.forEach(record => {
        const ref = db.collection("attendance").doc();
        batch.set(ref, record);
    });

    batch.commit()
        .then(() => {
            alert("Attendance submitted successfully!");
            document.getElementById("mark-attendance-btn").disabled = true;
        })
        .catch(error => console.error("Error marking attendance:", error));
}

function loadFacultySchedule() {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    const scheduleList = document.getElementById("faculty-schedule");
    scheduleList.innerHTML = "";

    db.collection("facultySchedule").where("email", "==", user.email)
        .onSnapshot(snapshot => {
            scheduleList.innerHTML = "";
            snapshot.forEach(doc => {
                const schedule = doc.data();
                const li = document.createElement("li");
                li.textContent = `${schedule.day} - ${schedule.time} - ${schedule.subject}`;
                scheduleList.appendChild(li);
            });
        });
}