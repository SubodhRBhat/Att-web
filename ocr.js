// Load Tesseract.js (included in faculty.html instead of document.write)
function processTimetableImage(event) {
    const imageFile = event.target.files[0];
    if (!imageFile) {
        alert("Please upload an image file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function() {
        Tesseract.recognize(reader.result, 'eng', {
            logger: m => console.log(m)
        }).then(({ data: { text } }) => {
            extractTimetableData(text);
        }).catch(error => {
            console.error("OCR Processing Error:", error);
            alert("Failed to process the timetable image.");
        });
    };
    reader.readAsDataURL(imageFile);
}

function extractTimetableData(ocrText) {
    console.log("Extracted Text:", ocrText);

    const match = ocrText.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
    const day = match ? match[0] : "Unknown";

    const timeMatch = ocrText.match(/(\d{1,2}:\d{2} (AM|PM))/i);
    const time = timeMatch ? timeMatch[0] : "Unknown";

    const periodMatch = ocrText.match(/(Period \d+)/i);
    const period = periodMatch ? periodMatch[0] : "Unknown";

    console.log(`Detected Timetable - Day: ${day}, Time: ${time}, Period: ${period}`);
    validateFacultyAttendance(day, time, period);
}

function validateFacultyAttendance(day, time, period) {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    db.collection("facultySchedule").where("email", "==", user.email).get()
        .then(snapshot => {
            let canMark = false;
            snapshot.forEach(doc => {
                const schedule = doc.data();
                if (schedule.day === day && schedule.time === time && schedule.period === period) {
                    canMark = true;
                }
            });
            if (canMark) {
                alert("You are allowed to mark attendance for this class.");
                document.getElementById("mark-attendance-btn").disabled = false;
            } else {
                alert("You are not scheduled for this class.");
                document.getElementById("mark-attendance-btn").disabled = true;
            }
        }).catch(error => console.error("Error checking faculty schedule:", error));
}