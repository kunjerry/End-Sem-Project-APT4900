document.addEventListener("DOMContentLoaded", async () => {
    console.log("Court dashboard loaded.");

    const userData = JSON.parse(localStorage.getItem("userData"));
    if (!userData || userData.role !== "court") {
        console.warn("Unauthorized access — redirecting.");
        window.location.href = "login.html";
        return;
    }

    // Fill profile info
    document.getElementById("courtName").textContent = userData.fullname || "Unknown";
    document.getElementById("courtUsername").textContent = userData.username || "Unknown";

    // Load dashboard stats 
    try {
        const response = await fetch("http://localhost:5000/court/stats", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });

        if (!response.ok) throw new Error("Failed to load stats");

        const stats = await response.json();

        document.getElementById("pendingCases").textContent = stats.pendingCases ?? 0;
        document.getElementById("submittedReports").textContent = stats.submittedReports ?? 0;

    } catch (error) {
        console.error("Stats loading error:", error);
    }
});


// BUTTON ACTIONS
function goToCases() {
    window.location.href = "court_view_cases.html";
}

function goToUpload() {
    window.location.href = "court_upload_evidence.html";
}

function goToReports() {
    window.location.href = "court_submit_reports.html";
}
