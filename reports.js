function loadAttendanceReports() {
    const ctx = document.getElementById("attendanceChart").getContext("2d");
    let attendanceData = {};

    db.collection("attendance").onSnapshot(snapshot => {
        attendanceData = {};
        snapshot.forEach(doc => {
            const record = doc.data();
            if (!attendanceData[record.subject]) {
                attendanceData[record.subject] = 0;
            }
            attendanceData[record.subject]++;
        });

        generateChart(attendanceData, ctx);
    }, error => console.error("Error loading reports:", error));
}

function generateChart(data, ctx) {
    if (window.attendanceChart) {
        window.attendanceChart.destroy();
    }
    window.attendanceChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: "Attendance Count",
                data: Object.values(data),
                backgroundColor: "#007bff"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function exportCSV() {
    let csvContent = "Subject,Attendance Count\n";
    db.collection("attendance").get()
        .then(snapshot => {
            const subjectCounts = {};
            snapshot.forEach(doc => {
                const record = doc.data();
                subjectCounts[record.subject] = (subjectCounts[record.subject] || 0) + 1;
            });

            for (const [subject, count] of Object.entries(subjectCounts)) {
                csvContent += `${subject},${count}\n`;
            }

            const blob = new Blob([csvContent], { type: "text/csv" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "attendance_report.csv";
            link.click();
        })
        .catch(error => console.error("Error exporting CSV:", error));
} 