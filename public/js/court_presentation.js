document.addEventListener("DOMContentLoaded", function () {

   //auth chec
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("userRole");

    if (!isLoggedIn || isLoggedIn !== "true") {
        alert("Please login first.");
        window.location.href = "index.html";
        return;
    }

    if (role !== "court" && role !== "admin" && role !== "analyst") {
        alert("Unauthorized. Court mode only.");
        window.location.href = "index.html";
        return;
    }

  
    const evidenceList = [
        { id: "DE-1A4C", file: "C:/Users/Jeremy/Desktop/evidence/e1.jpg" },
        { id: "DE-9DD2", file: "C:/Users/Jeremy/Desktop/evidence/e2.jpeg" },
        { id: "DE-A12F", file: "C:/Users/Jeremy/Desktop/evidence/e3.jpg" }
    ];

    let currentIndex = 0;

    //dom elements
    const imgElement = document.querySelector("#evidence-preview-container img");
    const detailsPanel = document.getElementById("details-panel");
    const headerText = document.querySelector("#court-header span");
    const descriptionText = document.querySelector("#evidence-preview-container p");

    const prevBtn = document.getElementById("prevEvidenceBtn");
    const nextBtn = document.getElementById("nextEvidenceBtn");
    const toggleDetailsBtn = document.getElementById("toggleDetailsBtn");
    const fullscreenBtn = document.getElementById("toggleFullscreenBtn");
    const exitBtn = document.getElementById("exitCourtModeBtn");

    //image load
    function loadEvidence() {
        const item = evidenceList[currentIndex];

        if (!item) return;

        imgElement.src = item.file;
        descriptionText.textContent = `Evidence ID: ${item.id} - File: ${item.file.split("/").pop()}`;
        headerText.textContent = `Evidence Item ${currentIndex + 1} of ${evidenceList.length}`;
    }

    loadEvidence();

    //button actions
    prevBtn.addEventListener("click", function () {
        if (currentIndex > 0) {
            currentIndex--;
            loadEvidence();
        }
    });

    nextBtn.addEventListener("click", function () {
        if (currentIndex < evidenceList.length - 1) {
            currentIndex++;
            loadEvidence();
        }
    });

    toggleDetailsBtn.addEventListener("click", function () {
        detailsPanel.style.display = 
            detailsPanel.style.display === "none" ? "block" : "none";
    });

    fullscreenBtn.addEventListener("click", function () {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    exitBtn.addEventListener("click", function () {
        const role = localStorage.getItem("userRole");

        const redirectMap = {
            admin: "admin_dashboard.html",
            analyst: "analyst_dashboard.html",
            officer: "officer_dashboard.html",
            court: "court_presentation.html"
        };

        window.location.href = redirectMap[role] || "index.html";
    });

});
