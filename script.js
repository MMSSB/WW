/**
 * Wealthwise - Personal Finance Tracker Script
 * Fully separated multi-file architecture cloned from SugarTrack Pro
 */

const CONFIG = {
    maxHistoryItems: 5
};

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. WELCOME SCREEN & FULL NAME HANDLING ---
    const welcomeScreen = document.getElementById('welcomeScreen');
    const welcomeForm = document.getElementById('welcomeForm');
    const nameInput = document.getElementById('nameInput');
    const displayUserName = document.getElementById('displayUserName'); 
    const displayUserFullName = document.getElementById('displayUserFullName'); 

    const savedFullName = localStorage.getItem('userFullName');
    const savedName = localStorage.getItem('userName');

    if (!savedName) {
        document.documentElement.classList.remove('has-user');
    } else {
        if (displayUserName) displayUserName.textContent = savedName.split(' ')[0];
        if (displayUserFullName) displayUserFullName.textContent = savedFullName || savedName;
    }

    if (welcomeForm) {
        welcomeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = nameInput.value.trim();
            if (fullName) {
                const firstName = fullName.split(' ')[0];
                localStorage.setItem('userName', firstName);
                localStorage.setItem('userFullName', fullName);
                if (displayUserName) displayUserName.textContent = firstName;
                if (displayUserFullName) displayUserFullName.textContent = fullName;
                document.documentElement.classList.add('has-user');
                if (typeof WealthwiseGoogle !== 'undefined') {
                    WealthwiseGoogle.updateUI();
                }
            }
        });
    }

    // --- 2. MOBILE DRIVE / SYNC DROPDOWN ---
    const mobileDriveBtn = document.getElementById('mobileDriveBtn');
    const mobileDriveMenu = document.getElementById('mobileDriveMenu');
    if (mobileDriveBtn && mobileDriveMenu) {
        mobileDriveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            mobileDriveMenu.classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
            if (!mobileDriveBtn.contains(e.target) && !mobileDriveMenu.contains(e.target)) {
                mobileDriveMenu.classList.remove('show');
            }
        });
    }

    // --- 3. STATE & FINANCIAL HELPERS ---
    let transactions = JSON.parse(localStorage.getItem('financeTransactions')) || [];
    let chartInstance = null;
    let currentFilter = 'all'; 
    let searchQuery = '';      

    window.getCurrency = () => localStorage.getItem('currency') || '$';
    window.formatMoney = (amount) => {
        const sym = window.getCurrency();
        const val = parseFloat(amount) || 0;
        const formatted = val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return sym === 'EGP' ? `${formatted} EGP` : `${sym}${formatted}`;
    };

    const triggerAutoBackup = () => {
        if (localStorage.getItem('ww_auto_backup') === 'true' && window.WealthwiseGoogle) {
            WealthwiseGoogle.saveToDrive(true);
        }
    };

    // --- 4. GLOBAL THEME MANAGEMENT ---
    const applyThemeActiveStates = (theme) => {
        const allSelectors = document.querySelectorAll('.theme-btn, .theme-option, .theme-card-option, .theme-menu-opt');
        allSelectors.forEach(el => {
            if (el.getAttribute('data-theme-val') === theme) el.classList.add('active');
            else el.classList.remove('active');
        });
    };

    const currentSavedTheme = localStorage.getItem('theme') || 'system';
    applyThemeActiveStates(currentSavedTheme);

    document.querySelectorAll('.theme-btn, .theme-option, .theme-card-option, .theme-menu-opt').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const newTheme = el.getAttribute('data-theme-val');
            if (window.ThemeManager) {
                ThemeManager.setTheme(newTheme);
            } else {
                localStorage.setItem('theme', newTheme);
                const isDark = newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
            }
            applyThemeActiveStates(newTheme);
            if (chartInstance) updateChart();
            document.getElementById('themeIconMenu')?.classList.remove('show');
        });
    });

    const themeIconBtn = document.getElementById('themeIconBtn');
    const themeIconMenu = document.getElementById('themeIconMenu');
    if (themeIconBtn && themeIconMenu) {
        themeIconBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            themeIconMenu.classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
            if (!themeIconBtn.contains(e.target) && !themeIconMenu.contains(e.target)) {
                themeIconMenu.classList.remove('show');
            }
        });
    }

    // --- 5. SIDEBAR (DESKTOP COLLAPSE) ---
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('sidebar-collapsed');
            localStorage.setItem('sidebarCollapsed', document.documentElement.classList.contains('sidebar-collapsed'));
            setTimeout(() => { if (chartInstance) chartInstance.resize(); }, 310);
        });
    }

    // --- 6. CHART RENDERING ---
    const updateChart = () => {
        const canvas = document.getElementById('mainChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        const gridColor = isDark ? '#27272a' : '#e5e7eb';
        const textColor = isDark ? '#a1a1aa' : '#6b7280';
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#09090b';
        
        const recent = [...transactions].sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)).slice(-10);
        const labels = recent.map(t => `${t.date}`);
        const dataValues = recent.map(t => t.type === 'income' ? t.amount : -t.amount);
        const pointColors = recent.map(t => t.type === 'income' ? '#10b981' : '#ef4444');

        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    data: dataValues,
                    borderColor: primaryColor,
                    borderWidth: 2.5,
                    fill: true,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(9,9,11,0.04)',
                    tension: 0.3,
                    pointBackgroundColor: pointColors,
                    pointBorderColor: isDark ? '#18181b' : '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: { label: (context) => `Flow: ${formatMoney(context.raw)}` }
                    }
                },
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor } },
                    y: { grid: { color: gridColor }, ticks: { color: textColor, callback: (v) => formatMoney(v) } }
                }
            }
        });
    };

    // --- 7. DASHBOARD & LEDGER UPDATES ---
    const updateDashboard = () => {
        const valBalance = document.getElementById('valBalance');
        if (!valBalance) return;

        let totalIncome = 0, totalExpense = 0;
        transactions.forEach(t => {
            if (t.type === 'income') totalIncome += t.amount;
            else totalExpense += t.amount;
        });

        const balance = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

        valBalance.textContent = formatMoney(balance);
        if (document.getElementById('valIncome')) document.getElementById('valIncome').textContent = formatMoney(totalIncome);
        if (document.getElementById('valExpense')) document.getElementById('valExpense').textContent = formatMoney(totalExpense);
        if (document.getElementById('valSavings')) document.getElementById('valSavings').textContent = `${savingsRate}%`;

        // Recent Activity List
        const historyList = document.getElementById('historyList');
        if (historyList) {
            historyList.innerHTML = '';
            if (transactions.length === 0) {
                historyList.innerHTML = '<div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 13px;">No transactions logged yet.</div>';
            } else {
                [...transactions].reverse().slice(0, CONFIG.maxHistoryItems).forEach((t, index) => {
                    const originalIndex = transactions.length - 1 - index;
                    const isInc = t.type === 'income';
                    const item = document.createElement('div');
                    item.className = 'history-item clickable';
                    item.onclick = () => openTransactionDetails(originalIndex);
                    item.innerHTML = `
                        <div class="hist-left">
                            <div class="hist-val">${t.category} <span class="status-badge" style="background: var(--${isInc ? 'status-good-bg' : 'status-bad-bg'}); color: var(--${isInc ? 'status-good-text' : 'status-bad-text'});">${t.type}</span></div>
                            <div class="hist-time">${t.date} • ${t.time}</div>
                        </div>
                        <div style="font-weight: 600; color: var(--${isInc ? 'dot-high' : 'dot-low'})">${isInc ? '+' : '-'}${formatMoney(t.amount)}</div>
                    `;
                    historyList.appendChild(item);
                });
            }
        }
        updateChart();
    };

    // --- 8. TRANSACTIONS PAGE RENDERING ---
    const updateAllTransactions = () => {
        const allTxList = document.getElementById('allTransactionsList');
        if (!allTxList) return;
        allTxList.innerHTML = '';

        let filtered = [...transactions];
        if (currentFilter !== 'all') filtered = filtered.filter(t => t.type === currentFilter);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(t => t.category.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)));
        }

        if (filtered.length === 0) {
            allTxList.innerHTML = '<div style="padding: 32px; text-align: center; color: var(--text-muted);">No records found.</div>';
            return;
        }

        filtered.reverse().forEach((t) => {
            const originalIndex = transactions.indexOf(t);
            const isInc = t.type === 'income';
            const row = document.createElement('div');
            row.className = 'r-row clickable';
            row.onclick = (e) => {
                if (!e.target.closest('.r-action-btn')) openTransactionDetails(originalIndex);
            };

            row.innerHTML = `
                <div>${t.date}</div>
                <div class="r-col-desktop">${t.time}</div>
                <div style="font-weight: 600; color: var(--${isInc ? 'dot-high' : 'dot-low'})">${isInc ? '+' : '-'}${formatMoney(t.amount)}</div>
                <div><span class="status-badge" style="background: var(--${isInc ? 'status-good-bg' : 'status-bad-bg'}); color: var(--${isInc ? 'status-good-text' : 'status-bad-text'})">${t.category}</span></div>
                <div class="r-col-desktop" style="color: var(--text-muted);">${t.notes || '-'}</div>
                <div class="r-col-actions"><button class="r-action-btn" onclick="openActionMenu(${originalIndex}, event)"><i class="ph ph-dots-three"></i></button></div>
            `;
            allTxList.appendChild(row);
        });
    };

    // Filter Pills & Search
    document.querySelectorAll('.r-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.r-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.getAttribute('data-filter');
            updateAllTransactions();
        });
    });

    const searchInput = document.getElementById('searchReadingsInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            updateAllTransactions();
        });
    }

    // --- 9. STABLE BOTTOM SHEETS & MODALS ---
    function initBottomSheet(overlayId, openBtnIds, closeBtnId) {
        const overlay = document.getElementById(overlayId);
        if (!overlay) return null;
        const sheet = overlay.querySelector('.bottom-sheet');
        const closeBtn = document.getElementById(closeBtnId);
        let startY = 0, currentY = 0, isDragging = false;

        const openSheet = (e) => { if(e) e.preventDefault(); sheet.style.transform = ''; void sheet.offsetWidth; overlay.classList.add('active'); };
        const closeSheet = () => { overlay.classList.remove('active'); setTimeout(() => sheet.style.transform = '', 300); };

        openBtnIds.forEach(id => { const b = document.getElementById(id); if(b) b.addEventListener('click', openSheet); });
        if(closeBtn) closeBtn.addEventListener('click', closeSheet);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSheet(); });

        sheet.addEventListener('touchstart', (e) => {
            if (window.innerWidth <= 768 && (e.target.closest('.drag-handle-wrapper') || e.target.closest('.sheet-header'))) {
                startY = e.touches[0].clientY; isDragging = true; sheet.style.transition = 'none';
            }
        }, { passive: true });
        sheet.addEventListener('touchmove', (e) => {
            if (!isDragging) return; currentY = e.touches[0].clientY;
            if (currentY - startY > 0) window.requestAnimationFrame(() => sheet.style.transform = `translateY(${currentY - startY}px)`);
        }, { passive: true });
        sheet.addEventListener('touchend', () => {
            if (!isDragging) return; isDragging = false;
            sheet.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
            if (currentY - startY > 80) closeSheet(); else sheet.style.transform = 'translateY(0)';
        });
        return { open: openSheet, close: closeSheet };
    }

    const logSheetCtrl = initBottomSheet('logSheetOverlay', ['openLogBtn', 'mobileLogBtn'], 'closeLogBtn');
    initBottomSheet('menuSheetOverlay', ['openMobileMenuBtn'], 'closeMobileMenuBtn');
    window.detailsSheetCtrl = initBottomSheet('detailsSheetOverlay', [], 'closeDetailsBtn');
    window.actionMenuCtrl = initBottomSheet('actionMenuOverlay', [], 'closeActionMenuBtn');

    // --- 10. AUTOMATIC DATE & TIME FILLING & ACTIONS ---
    window.openAddLog = () => {
        const titleEl = document.getElementById('logModalTitle');
        if (titleEl) titleEl.textContent = 'Add Transaction';
        
        const editIdxEl = document.getElementById('editIndex');
        if (editIdxEl) editIdxEl.value = '-1';
        
        const formEl = document.getElementById('logForm');
        if (formEl) formEl.reset();
        
        // Automatic current date and time injection
        const now = new Date();
        const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        const timeString = now.toTimeString().substring(0, 5);
        
        const dateInput = document.getElementById('logDate');
        const timeInput = document.getElementById('logTime');
        if (dateInput) dateInput.value = localDate;
        if (timeInput) timeInput.value = timeString;

        if (logSheetCtrl) logSheetCtrl.open();
    };

    window.openTransactionDetails = (idx) => {
        const item = transactions[idx];
        if (!item) return;
        document.getElementById('detAmount').textContent = formatMoney(item.amount);
        const badge = document.getElementById('detType');
        if (badge) {
            badge.textContent = item.type.toUpperCase();
            badge.style.background = item.type === 'income' ? 'var(--status-good-bg)' : 'var(--status-bad-bg)';
            badge.style.color = item.type === 'income' ? 'var(--status-good-text)' : 'var(--status-bad-text)';
        }
        document.getElementById('detCategory').textContent = item.category;
        document.getElementById('detDate').textContent = `${item.date} • ${item.time}`;
        document.getElementById('detNotes').textContent = item.notes || 'No notes provided.';
        if (window.detailsSheetCtrl) window.detailsSheetCtrl.open();
    };

    window.openActionMenu = (idx, event) => {
        event.stopPropagation();
        currentEditIndex = idx;
        if (window.actionMenuCtrl) window.actionMenuCtrl.open();
    };

    const handleEditTrigger = (idx) => {
        if (idx === -1) return;
        currentEditIndex = idx;
        const item = transactions[idx];
        
        const titleEl = document.getElementById('logModalTitle');
        if (titleEl) titleEl.textContent = 'Edit Transaction';
        
        const editIdxEl = document.getElementById('editIndex');
        if (editIdxEl) editIdxEl.value = currentEditIndex;
        
        document.getElementById('logDate').value = item.date;
        document.getElementById('logTime').value = item.time;
        document.getElementById('logType').value = item.type;
        document.getElementById('logAmount').value = item.amount;
        document.getElementById('logCategory').value = item.category;
        document.getElementById('logNotes').value = item.notes || '';
        
        if (window.actionMenuCtrl) window.actionMenuCtrl.close();
        if (window.detailsSheetCtrl) window.detailsSheetCtrl.close();
        if (logSheetCtrl) setTimeout(() => logSheetCtrl.open(), 300);
    };

    const handleDeleteTrigger = (idx) => {
        if (idx === -1) return;
        if (confirm("Delete this transaction?")) {
            transactions.splice(idx, 1);
            localStorage.setItem('financeTransactions', JSON.stringify(transactions));
            triggerAutoBackup();
            updateDashboard();
            updateAllTransactions();
            if (window.actionMenuCtrl) window.actionMenuCtrl.close();
            if (window.detailsSheetCtrl) window.detailsSheetCtrl.close();
        }
    };

    document.getElementById('btnEditAction')?.addEventListener('click', () => handleEditTrigger(currentEditIndex));
    document.getElementById('btnDeleteAction')?.addEventListener('click', () => handleDeleteTrigger(currentEditIndex));

    const logForm = document.getElementById('logForm');
    if (logForm) {
        logForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const editIndexInput = document.getElementById('editIndex');
            const idx = editIndexInput ? parseInt(editIndexInput.value, 10) : -1;
            
            const record = {
                date: document.getElementById('logDate').value,
                time: document.getElementById('logTime').value,
                type: document.getElementById('logType').value,
                amount: parseFloat(document.getElementById('logAmount').value),
                category: document.getElementById('logCategory').value,
                notes: (document.getElementById('logNotes')?.value || '').trim()
            };

            if (idx === -1 || isNaN(idx)) {
                transactions.push(record);
            } else {
                transactions[idx] = record;
            }

            localStorage.setItem('financeTransactions', JSON.stringify(transactions));
            triggerAutoBackup();
            
            if (logSheetCtrl) logSheetCtrl.close();
            logForm.reset();
            if (editIndexInput) editIndexInput.value = '-1';
            
            updateDashboard();
            updateAllTransactions();
        });
    }

    updateDashboard();
    updateAllTransactions();
});