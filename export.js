/**
 * ============================================================================
 * WEALTHWISE EXPORT CONFIGURATION DASHBOARD
 * ============================================================================
 */
const EXPORT_CONFIG = {
    companyName: "Wealthwise Financial",
    reportTitleEn: "Financial Transactions Ledger",
    reportTitleAr: "سجل المعاملات المالية",
    showPatientName: true,
    showStatistics: true, 
    showClinicalSuggestions: true, // Renamed internally for PDF spacing
    sortOrder: 'newest', 
    primaryColor: '#09090b', 
    tableHeaderBg: '#111827', 
};

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. MODAL DRAG & INITIALIZATION LOGIC ---
    const exportOverlay = document.getElementById('exportSheetOverlay');
    const exportSheet = document.getElementById('exportSheet');
    
    if (!exportOverlay || !exportSheet) return;

    let startY = 0, currentY = 0, isDragging = false;

    const openSheet = (e) => {
        if (e) e.preventDefault();
        exportSheet.style.transform = '';
        exportSheet.style.transition = '';
        void exportSheet.offsetWidth; // Force repaint
        exportOverlay.classList.add('active');
    };

    const closeSheet = () => {
        exportOverlay.classList.remove('active');
        setTimeout(() => {
            exportSheet.style.transform = '';
            exportSheet.style.transition = '';
        }, 300);
    };

    // Attach Openers (Checks for multiple instances across desktop/mobile UI)
    document.querySelectorAll('#openExportBtn, #mobileExportBtn').forEach(btn => {
        btn.addEventListener('click', openSheet);
    });

    const closeExportBtn = document.getElementById('closeExportBtn');
    if (closeExportBtn) closeExportBtn.addEventListener('click', closeSheet);
    exportOverlay.addEventListener('click', (e) => { if (e.target === exportOverlay) closeSheet(); });

    // Drag Physics Setup
    exportSheet.addEventListener('touchstart', (e) => {
        if (window.innerWidth <= 768 && (e.target.closest('.drag-handle-wrapper') || e.target.closest('.sheet-header'))) {
            startY = e.touches[0].clientY;
            isDragging = true;
            exportSheet.style.transition = 'none';
        }
    }, { passive: true });

    exportSheet.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        if (diff > 0) {
            window.requestAnimationFrame(() => { exportSheet.style.transform = `translateY(${diff}px)`; });
        }
    }, { passive: true });

    exportSheet.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        exportSheet.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'; 
        const diff = currentY - startY;
        if (diff > 80) closeSheet();
        else exportSheet.style.transform = 'translateY(0)';
    });

    // --- 2. DATA PROCESSING ---
    const getProcessedReadings = () => {
        let data = JSON.parse(localStorage.getItem('financeTransactions')) || [];
        data.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return EXPORT_CONFIG.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
        return data;
    };

    const getUserName = () => localStorage.getItem('userFullName') || localStorage.getItem('userName') || 'Account User';

    const getStatus = (type) => {
        if (type === 'income') return { text: 'Income / دخل', color: '#10b981' };
        return { text: 'Expense / مصروف', color: '#ef4444' };
    };

    const formatTime12Hour = (timeStr) => {
        if (!timeStr) return '';
        let [h, m] = timeStr.split(':');
        h = parseInt(h, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${m} ${ampm}`;
    };

    const formatCurrency = (val) => {
        const sym = localStorage.getItem('currency') || '$';
        return sym === 'EGP' ? `${parseFloat(val).toFixed(2)} EGP` : `${sym}${parseFloat(val).toFixed(2)}`;
    };

    // --- 3. EXPORT HANDLERS ---
    
    // JSON Export
    document.getElementById('btnExportJSON')?.addEventListener('click', () => {
        const data = getProcessedReadings();
        if (data.length === 0) return alert('No data to export.');
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Wealthwise_Data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        closeSheet();
    });

    // Excel Export
    document.getElementById('btnExportExcel')?.addEventListener('click', () => {
        if (typeof XLSX === 'undefined') return alert('Excel library is still loading. Please try again.');
        const data = getProcessedReadings();
        if (data.length === 0) return alert('No data to export.');

        const excelData = data.map(r => ({
            "Date": r.date,
            "Time": formatTime12Hour(r.time),
            "Type": r.type.toUpperCase(),
            "Category": r.category,
            "Amount": r.amount,
            "Notes": r.notes || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
        XLSX.writeFile(workbook, `Wealthwise_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
        closeSheet();
    });

    // PDF Export
    document.getElementById('btnExportPDF')?.addEventListener('click', () => {
        if (typeof html2pdf === 'undefined') return alert('PDF library is still loading. Please try again.');
        
        const data = getProcessedReadings();
        if (data.length === 0) return alert('No data to export.');

        let totalInc = 0, totalExp = 0;
        data.forEach(r => { r.type === 'income' ? totalInc += r.amount : totalExp += r.amount; });
        const net = totalInc - totalExp;

        let tableRows = '';
        data.forEach(r => {
            const status = getStatus(r.type);
            const dateObj = new Date(r.date);
            const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
            
            tableRows += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="width: 15%; padding: 10px 8px; font-size: 12px; white-space: nowrap;">${formattedDate}</td>
                    <td style="width: 15%; padding: 10px 8px; font-size: 12px; white-space: nowrap;">${formatTime12Hour(r.time)}</td>
                    <td style="width: 20%; padding: 10px 8px; font-size: 13px; font-weight: bold; white-space: nowrap;">${formatCurrency(r.amount)}</td>
                    <td style="width: 15%; padding: 10px 8px; font-size: 11px; font-weight: bold; color: ${status.color}; white-space: nowrap;">${status.text}</td>
                    <td style="width: 35%; padding: 10px 8px; font-size: 12px; color: #4b5563; word-break: break-word;">${r.category}<br><span style="font-size: 10px;">${r.notes || '-'}</span></td>
                </tr>
            `;
        });

        const pdfContainer = document.createElement('div');
        pdfContainer.style.padding = '30px';
        pdfContainer.style.fontFamily = 'Arial, sans-serif';
        pdfContainer.style.color = '#111827';
        pdfContainer.style.direction = 'auto';
        pdfContainer.style.background = '#ffffff';

        pdfContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid ${EXPORT_CONFIG.primaryColor}; padding-bottom: 14px; margin-bottom: 24px;">
                <div>
                    <h1 style="margin: 0; font-size: 24px; color: ${EXPORT_CONFIG.primaryColor};">${EXPORT_CONFIG.reportTitleEn}</h1>
                    <h2 style="margin: 4px 0 0 0; font-size: 16px; color: #4b5563;">${EXPORT_CONFIG.reportTitleAr}</h2>
                </div>
                <div style="text-align: right; color: #6b7280; font-size: 11px;">
                    Generated: ${new Date().toLocaleDateString('en-US')}<br>
                    <strong>${EXPORT_CONFIG.companyName}</strong>
                </div>
            </div>

            ${EXPORT_CONFIG.showPatientName || EXPORT_CONFIG.showStatistics ? `
                <div style="background: #f3f4f6; border-radius: 10px; padding: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
                    ${EXPORT_CONFIG.showPatientName ? `
                        <div>
                            <p style="margin: 0; font-size: 11px; color: #6b7280; text-transform: uppercase;">Account Holder / صاحب الحساب</p>
                            <p style="margin: 3px 0 0 0; font-size: 16px; font-weight: bold; color: #111827;">${getUserName()}</p>
                        </div>
                    ` : ''}
                    ${EXPORT_CONFIG.showStatistics ? `
                        <div style="text-align: center;">
                            <p style="margin: 0; font-size: 11px; color: #6b7280; text-transform: uppercase;">Total Income / الدخل</p>
                            <p style="margin: 3px 0 0 0; font-size: 16px; font-weight: bold; color: #10b981;">${formatCurrency(totalInc)}</p>
                        </div>
                        <div style="text-align: center;">
                            <p style="margin: 0; font-size: 11px; color: #6b7280; text-transform: uppercase;">Total Expenses / المصروفات</p>
                            <p style="margin: 3px 0 0 0; font-size: 16px; font-weight: bold; color: #ef4444;">${formatCurrency(totalExp)}</p>
                        </div>
                        <div style="text-align: center;">
                            <p style="margin: 0; font-size: 11px; color: #6b7280; text-transform: uppercase;">Net Balance / الصافي</p>
                            <p style="margin: 3px 0 0 0; font-size: 16px; font-weight: bold; color: ${net >= 0 ? '#10b981' : '#ef4444'};">${formatCurrency(net)}</p>
                        </div>
                    ` : ''}
                </div>
            ` : ''}

            <h3 style="font-size: 14px; color: #111827; margin-bottom: 12px;">Transaction History / سجل المعاملات (${data.length} entries)</h3>
            
            <table style="width: 100%; table-layout: fixed; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: ${EXPORT_CONFIG.tableHeaderBg}; color: #ffffff;">
                        <th style="width: 15%; padding: 10px 8px; font-size: 10px; text-transform: uppercase;">Date</th>
                        <th style="width: 15%; padding: 10px 8px; font-size: 10px; text-transform: uppercase;">Time</th>
                        <th style="width: 20%; padding: 10px 8px; font-size: 10px; text-transform: uppercase;">Amount</th>
                        <th style="width: 15%; padding: 10px 8px; font-size: 10px; text-transform: uppercase;">Type</th>
                        <th style="width: 35%; padding: 10px 8px; font-size: 10px; text-transform: uppercase;">Category/Notes</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;

        const printWrapper = document.createElement('div');
        printWrapper.style.position = 'absolute';
        printWrapper.style.left = '-9999px';
        printWrapper.style.top = '0';
        printWrapper.appendChild(pdfContainer);
        document.body.appendChild(printWrapper);

        const btnIcon = document.querySelector('#btnExportPDF i');
        const oldClass = btnIcon ? btnIcon.className : '';
        if (btnIcon) btnIcon.className = 'ph ph-spinner fa-spin';

        const opt = {
            margin:       0.3,
            filename:     `Wealthwise_Report_${new Date().toISOString().split('T')[0]}.pdf`,
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(pdfContainer).save().then(() => {
            document.body.removeChild(printWrapper);
            if (btnIcon) btnIcon.className = oldClass;
            closeSheet();
        });
    });
});