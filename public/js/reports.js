document.addEventListener('DOMContentLoaded', () => {
    console.log("Reports page loaded.");
    
    const reportForm = document.getElementById('report-form');
    const previewBtn = document.getElementById('previewReportBtn');

    
    previewBtn.addEventListener('click', function() {
        const reportType = document.getElementById('reportType').value;
        const itemId = document.getElementById('itemId').value;
        
        if (!reportType || !itemId) {
            alert("Please select a Report Type and enter an Evidence ID/Case Number.");
            return;
        }

        const previewText = document.getElementById('preview-text');
        previewText.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Generating preview for ${reportType}...`;

       
        setTimeout(() => {
            previewText.innerHTML = `
                <p class="text-dark fw-bold">PREVIEW LOADED: ${reportType.toUpperCase()}</p>
                <p class="small text-muted">A sample of the PDF content for ${itemId} is ready. This is a conceptual view.</p>
                <i class="bi bi-file-earmark-pdf display-4 text-success"></i>
            `;
            console.log("Report preview success.");
        }, 1500);
    });

    
    reportForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const generateBtn = document.getElementById('generatePdfBtn');
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Generating...';

        
        setTimeout(() => {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="bi bi-file-earmark-pdf me-1"></i> Generate PDF Report';
            alert("PDF generated successfully! Downloading now.");
            
        }, 3000);
    });
});