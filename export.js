// export.js
const EXPORT_CONFIG = {
    companyName: "Wealthwise Finance",
    reportTitleEn: "Financial Ledger Report",
    reportTitleAr: "تقرير الحسابات المالية",
    showPatientName: true,
    showStatistics: true,
    sortOrder: 'newest',
    primaryColor: '#09090b',
    tableHeaderBg: '#111827'
};

document.addEventListener('DOMContentLoaded', () => {
    const exportOverlay = document.getElementById('exportSheetOverlay');
    const exportSheet = document.getElementById('exportSheet');
    
    const closeSheet = () => {
        exportOverlay.classList.remove('active');
        setTimeout(() => { exportSheet.style.transform = ''; }, 300);
    };

    document.querySelectorAll('#openExportBtn, #mobileExportBtn').forEach(btn => {
        if(btn) btn.addEventListener('click', (e) => {
            e.preventDefault();
            exportSheet.style.transform = '';
            exportOverlay.classList.add('active');
        });
    });

    if(document.getElementById('closeExportBtn')) document.getElementById('closeExportBtn').addEventListener('click', closeSheet);
    if(exportOverlay) exportOverlay.addEventListener('click', (e) => { if (e.target === exportOverlay) closeSheet(); });

    const getProcessed = () => {
        let data = JSON.parse(localStorage.getItem('financeTransactions')) || [];
        data.sort((a, b) => {
            const dA = new Date(`${a.date}T${a.time}`), dB = new Date(`${b.date}T${b.time}`);
            return EXPORT_CONFIG.sortOrder === 'newest' ? dB - dA : dA - dB;
        });
        return data;
    };

    document.getElementById('btnExportJSON')?.addEventListener('click', () => {
        const data = getProcessed();
        if (!data.length) return alert('No data to export.');
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Wealthwise_Data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        closeSheet();
    });
});