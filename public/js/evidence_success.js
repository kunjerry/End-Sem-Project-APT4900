document.addEventListener('DOMContentLoaded', () => {
    console.log("Evidence Success page loaded.");
    
  

    const urlParams = new URLSearchParams(window.location.search);
    const evidenceId = urlParams.get('id');

    if (evidenceId) {
        document.getElementById('evidence-id-display').textContent = evidenceId;
        console.log(`Confirmation for Evidence ID: ${evidenceId}`);
        
        document.querySelector('a[href*="evidence_details.html"]').href = `evidence_details.html?id=${evidenceId}`;
    } else {
        // Fallback for simulation
        console.log("No evidence ID found in URL. Using placeholder.");
    }
});