// /**
//  * Wealthwise - Personal Finance Tracker Script
//  */

// const CONFIG = {
//     maxHistoryItems: 5
// };

// document.addEventListener('DOMContentLoaded', () => {
//     // --- 1. WELCOME SCREEN & FULL NAME HANDLING ---
//     const welcomeScreen = document.getElementById('welcomeScreen');
//     const welcomeForm = document.getElementById('welcomeForm');
//     const nameInput = document.getElementById('nameInput');
//     const displayUserName = document.getElementById('displayUserName'); 
//     const displayUserFullName = document.getElementById('displayUserFullName'); 

//     const savedFullName = localStorage.getItem('userFullName');
//     const savedName = localStorage.getItem('userName');

//     if (!savedName) {
//         document.documentElement.classList.remove('has-user');
//     } else {
//         if (displayUserName) displayUserName.textContent = savedName.split(' ')[0];
//         if (displayUserFullName) displayUserFullName.textContent = savedFullName || savedName;
//     }

//     if (welcomeForm) {
//         welcomeForm.addEventListener('submit', (e) => {
//             e.preventDefault();
//             const fullName = nameInput.value.trim();
//             if (fullName) {
//                 const firstName = fullName.split(' ')[0];
//                 localStorage.setItem('userName', firstName);
//                 localStorage.setItem('userFullName', fullName);
//                 if (displayUserName) displayUserName.textContent = firstName;
//                 if (displayUserFullName) displayUserFullName.textContent = fullName;
//                 document.documentElement.classList.add('has-user');
//                 if (typeof WealthwiseGoogle !== 'undefined') WealthwiseGoogle.updateUI();
//             }
//         });
//     }

//     // --- 2. MOBILE DRIVE / SYNC DROPDOWN ---
//     const mobileDriveBtn = document.getElementById('mobileDriveBtn');
//     const mobileDriveMenu = document.getElementById('mobileDriveMenu');
//     if (mobileDriveBtn && mobileDriveMenu) {
//         mobileDriveBtn.addEventListener('click', (e) => {
//             e.preventDefault();
//             e.stopPropagation();
//             mobileDriveMenu.classList.toggle('show');
//         });
//         document.addEventListener('click', (e) => {
//             if (!mobileDriveBtn.contains(e.target) && !mobileDriveMenu.contains(e.target)) {
//                 mobileDriveMenu.classList.remove('show');
//             }
//         });
//     }

//     // --- 3. STATE & FINANCIAL HELPERS ---
//     let transactions = JSON.parse(localStorage.getItem('financeTransactions')) || [];
//     let chartInstance = null;
//     let currentFilter = 'all'; 
//     let searchQuery = '';      

//     window.getCurrency = () => localStorage.getItem('currency') || '$';
//     window.formatMoney = (amount) => {
//         const sym = window.getCurrency();
//         const val = parseFloat(amount) || 0;
//         const formatted = val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//         return sym === 'EGP' ? `${formatted} EGP` : `${sym}${formatted}`;
//     };

//     // Helper: Convert 24h to 12h AM/PM
//     window.formatTime12Hour = (timeStr) => {
//         if (!timeStr) return '';
//         let [h, m] = timeStr.split(':');
//         h = parseInt(h, 10);
//         const ampm = h >= 12 ? 'PM' : 'AM';
//         h = h % 12 || 12;
//         return `${h}:${m.padStart(2, '0')} ${ampm}`;
//     };

//     const triggerAutoBackup = () => {
//         if (localStorage.getItem('ww_auto_backup') === 'true' && window.WealthwiseGoogle) {
//             WealthwiseGoogle.saveToDrive(true);
//         }
//     };

//     // --- 4. GLOBAL THEME MANAGEMENT ---
//     const applyThemeActiveStates = (theme) => {
//         document.querySelectorAll('.theme-btn, .theme-option, .theme-card-option, .theme-menu-opt').forEach(el => {
//             if (el.getAttribute('data-theme-val') === theme) el.classList.add('active');
//             else el.classList.remove('active');
//         });
//     };

//     applyThemeActiveStates(localStorage.getItem('theme') || 'system');

//     document.querySelectorAll('.theme-btn, .theme-option, .theme-card-option, .theme-menu-opt').forEach(el => {
//         el.addEventListener('click', (e) => {
//             e.preventDefault();
//             const newTheme = el.getAttribute('data-theme-val');
//             if (window.ThemeManager) {
//                 ThemeManager.setTheme(newTheme);
//             } else {
//                 localStorage.setItem('theme', newTheme);
//                 const isDark = newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
//                 document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
//             }
//             applyThemeActiveStates(newTheme);
//             if (chartInstance) updateChart();
//             document.getElementById('themeIconMenu')?.classList.remove('show');
//         });
//     });

//     const themeIconBtn = document.getElementById('themeIconBtn');
//     const themeIconMenu = document.getElementById('themeIconMenu');
//     if (themeIconBtn && themeIconMenu) {
//         themeIconBtn.addEventListener('click', (e) => {
//             e.preventDefault();
//             e.stopPropagation();
//             themeIconMenu.classList.toggle('show');
//         });
//         document.addEventListener('click', (e) => {
//             if (!themeIconBtn.contains(e.target) && !themeIconMenu.contains(e.target)) themeIconMenu.classList.remove('show');
//         });
//     }

//     // --- 5. SIDEBAR (DESKTOP COLLAPSE) ---
//     const sidebarToggle = document.getElementById('sidebarToggle');
//     if (sidebarToggle) {
//         sidebarToggle.addEventListener('click', () => {
//             document.documentElement.classList.toggle('sidebar-collapsed');
//             localStorage.setItem('sidebarCollapsed', document.documentElement.classList.contains('sidebar-collapsed'));
//             setTimeout(() => { if (chartInstance) chartInstance.resize(); }, 310);
//         });
//     }

//     // --- 6. CHART RENDERING ---
//     const updateChart = () => {
//         const canvas = document.getElementById('mainChart');
//         if (!canvas) return;
//         const ctx = canvas.getContext('2d');
//         const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
//         const gridColor = isDark ? '#27272a' : '#e5e7eb';
//         const textColor = isDark ? '#a1a1aa' : '#6b7280';
//         const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#09090b';
        
//         const recent = [...transactions].sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)).slice(-10);
//         const labels = recent.map(t => new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
//         const dataValues = recent.map(t => t.type === 'income' ? t.amount : -t.amount);
//         const pointColors = recent.map(t => t.type === 'income' ? '#10b981' : '#ef4444');

//         if (chartInstance) chartInstance.destroy();

//         chartInstance = new Chart(ctx, {
//             type: 'line',
//             data: {
//                 labels: labels,
//                 datasets: [{
//                     data: dataValues,
//                     borderColor: primaryColor,
//                     borderWidth: 2.5,
//                     fill: true,
//                     backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(9,9,11,0.04)',
//                     tension: 0.3,
//                     pointBackgroundColor: pointColors,
//                     pointBorderColor: isDark ? '#18181b' : '#ffffff',
//                     pointBorderWidth: 2,
//                     pointRadius: 4,
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: { callbacks: { label: (context) => `Flow: ${formatMoney(context.raw)}` } }
//                 },
//                 scales: {
//                     x: { grid: { color: gridColor }, ticks: { color: textColor } },
//                     y: { grid: { color: gridColor }, ticks: { color: textColor, callback: (v) => formatMoney(v) } }
//                 }
//             }
//         });
//     };

//     // --- 7. DASHBOARD & LEDGER UPDATES ---
//     const updateDashboard = () => {
//         const valBalance = document.getElementById('valBalance');
//         if (!valBalance) return;

//         let totalIncome = 0, totalExpense = 0;
//         transactions.forEach(t => {
//             if (t.type === 'income') totalIncome += t.amount;
//             else totalExpense += t.amount;
//         });

//         const balance = totalIncome - totalExpense;
//         const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

//         valBalance.textContent = formatMoney(balance);
//         if (document.getElementById('valIncome')) document.getElementById('valIncome').textContent = formatMoney(totalIncome);
//         if (document.getElementById('valExpense')) document.getElementById('valExpense').textContent = formatMoney(totalExpense);
//         if (document.getElementById('valSavings')) document.getElementById('valSavings').textContent = `${savingsRate}%`;

//         // Recent Activity List (Dashboard)
//         const historyList = document.getElementById('recentHistoryList');
//         if (historyList) {
//             historyList.innerHTML = '';
//             if (transactions.length === 0) {
//                 historyList.innerHTML = '<div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 13px;">No transactions logged yet.</div>';
//             } else {
//                 [...transactions].sort((a,b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`)).slice(0, CONFIG.maxHistoryItems).forEach(t => {
//                     const originalIndex = transactions.indexOf(t);
//                     const isInc = t.type === 'income';
//                     const item = document.createElement('div');
//                     item.className = 'history-item clickable';
//                     item.onclick = () => openTransactionDetails(originalIndex);
                    
//                     const time12 = window.formatTime12Hour(t.time);
//                     const shortDate = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

//                     item.innerHTML = `
//                         <div class="hist-left">
//                             <div class="hist-val">${t.category} <span class="status-badge" style="background: var(--${isInc ? 'status-good-bg' : 'status-bad-bg'}); color: var(--${isInc ? 'status-good-text' : 'status-bad-text'});">${t.type}</span></div>
//                             <div class="hist-time">${shortDate} • ${time12}</div>
//                         </div>
//                         <div style="font-weight: 600; color: var(--${isInc ? 'dot-high' : 'dot-low'})">${isInc ? '+' : '-'}${formatMoney(t.amount)}</div>
//                     `;
//                     historyList.appendChild(item);
//                 });
//             }
//         }
//         updateChart();
//     };

//     // --- 8. TRANSACTIONS PAGE RENDERING (WITH EXACT MOBILE CARDS) ---
//     const updateAllTransactions = () => {
//         const allTxList = document.getElementById('allTransactionsList');
        
//         // Update Stats Grid
//         const statLatest = document.getElementById('rStatLatest');
//         if (statLatest) {
//             if (transactions.length === 0) {
//                 statLatest.textContent = '--';
//                 document.getElementById('rStatAvg').textContent = '--';
//                 document.getElementById('rStatRange').textContent = '--';
//                 document.getElementById('rStatTotal').textContent = '0';
//             } else {
//                 let inc = 0, exp = 0, sumAmount = 0;
//                 transactions.forEach(t => {
//                     t.type === 'income' ? inc += t.amount : exp += t.amount;
//                     sumAmount += t.amount;
//                 });
                
//                 const sortedByDate = [...transactions].sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
//                 const latestTx = sortedByDate[sortedByDate.length - 1];
                
//                 statLatest.textContent = formatMoney(latestTx.amount);
//                 document.getElementById('rStatAvg').textContent = formatMoney(sumAmount / transactions.length);
                
//                 const net = inc - exp;
//                 const rRange = document.getElementById('rStatRange');
//                 rRange.textContent = formatMoney(net);
//                 rRange.style.color = net < 0 ? 'var(--dot-low)' : 'var(--dot-high)';
                
//                 document.getElementById('rStatTotal').textContent = transactions.length;
//             }
//         }

//         if (!allTxList) return;
//         allTxList.innerHTML = '';

//         let filtered = [...transactions];
//         if (currentFilter !== 'all') filtered = filtered.filter(t => t.type === currentFilter);
//         if (searchQuery) {
//             const q = searchQuery.toLowerCase();
//             filtered = filtered.filter(t => t.category.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)));
//         }

//         if (filtered.length === 0) {
//             allTxList.innerHTML = '<div style="padding: 32px; text-align: center; color: var(--text-muted);">No records found.</div>';
//             return;
//         }

//         filtered.sort((a,b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`)).reverse().forEach((t) => {
//             const originalIndex = transactions.indexOf(t);
//             const isInc = t.type === 'income';
            
//             const time12 = window.formatTime12Hour(t.time);
//             const shortDate = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

//             const row = document.createElement('div');
//             row.className = 'r-row clickable';
//             row.onclick = (e) => {
//                 if (!e.target.closest('.r-action-btn')) openTransactionDetails(originalIndex);
//             };

//             // EXACT Layout matching image_20b718.png
//             row.innerHTML = `
//                 <div class="r-col-amount" style="color: var(--${isInc ? 'dot-high' : 'dot-low'})">${isInc ? '+' : '-'}${formatMoney(t.amount)}</div>
//                 <div class="r-col-date mobile-only">${shortDate}</div>
                
//                 <div class="r-col-date desktop-only">${t.date}</div>
//                 <div class="r-col-time desktop-only">${time12}</div>
                
//                 <div class="r-col-notes">
//                     <span class="r-cat-text">${t.category} <span class="mobile-only" style="color: var(--text-main);">&bull;</span></span>
//                     <span class="r-notes-text">${t.notes || 'No notes'}</span>
//                 </div>
                
//                 <div class="r-col-time mobile-only">${time12}</div>
//                 <div class="r-col-actions desktop-only"><button class="r-action-btn" onclick="openActionMenu(${originalIndex}, event)"><i class="ph ph-dots-three"></i></button></div>
//             `;
//             allTxList.appendChild(row);
//         });
//     };

//     // Filter Pills & Search
//     document.querySelectorAll('.r-pill').forEach(pill => {
//         pill.addEventListener('click', () => {
//             document.querySelectorAll('.r-pill').forEach(p => p.classList.remove('active'));
//             pill.classList.add('active');
//             currentFilter = pill.getAttribute('data-filter');
//             updateAllTransactions();
//         });
//     });

//     const searchInput = document.getElementById('searchReadingsInput');
//     if (searchInput) {
//         searchInput.addEventListener('input', (e) => {
//             searchQuery = e.target.value;
//             updateAllTransactions();
//         });
//     }

//     // --- 9. STABLE BOTTOM SHEETS & MODALS ---
//     function initBottomSheet(overlayId, openBtnIds, closeBtnId) {
//         const overlay = document.getElementById(overlayId);
//         if (!overlay) return null;
//         const sheet = overlay.querySelector('.bottom-sheet');
//         const closeBtn = document.getElementById(closeBtnId);
//         let startY = 0, currentY = 0, isDragging = false;

//         const openSheet = (e) => { if(e) e.preventDefault(); sheet.style.transform = ''; void sheet.offsetWidth; overlay.classList.add('active'); };
//         const closeSheet = () => { overlay.classList.remove('active'); setTimeout(() => sheet.style.transform = '', 300); };

//         openBtnIds.forEach(id => { const b = document.getElementById(id); if(b) b.addEventListener('click', openSheet); });
//         if(closeBtn) closeBtn.addEventListener('click', closeSheet);
//         overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSheet(); });

//         sheet.addEventListener('touchstart', (e) => {
//             if (window.innerWidth <= 768 && (e.target.closest('.drag-handle-wrapper') || e.target.closest('.sheet-header'))) {
//                 startY = e.touches[0].clientY; isDragging = true; sheet.style.transition = 'none';
//             }
//         }, { passive: true });
//         sheet.addEventListener('touchmove', (e) => {
//             if (!isDragging) return; currentY = e.touches[0].clientY;
//             if (currentY - startY > 0) window.requestAnimationFrame(() => sheet.style.transform = `translateY(${currentY - startY}px)`);
//         }, { passive: true });
//         sheet.addEventListener('touchend', () => {
//             if (!isDragging) return; isDragging = false;
//             sheet.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
//             if (currentY - startY > 80) closeSheet(); else sheet.style.transform = 'translateY(0)';
//         });
//         return { open: openSheet, close: closeSheet };
//     }

//     const logSheetCtrl = initBottomSheet('logSheetOverlay', ['openLogBtn', 'mobileLogBtn'], 'closeLogBtn');
//     initBottomSheet('menuSheetOverlay', ['openMobileMenuBtn'], 'closeMobileMenuBtn');
//     window.detailsSheetCtrl = initBottomSheet('detailsSheetOverlay', [], 'closeDetailsBtn');
//     window.actionMenuCtrl = initBottomSheet('actionMenuOverlay', [], 'closeActionMenuBtn');

//     // --- 10. AUTOMATIC DATE/TIME & ACTIONS ---
//     window.openAddLog = () => {
//         const titleEl = document.getElementById('logModalTitle');
//         if (titleEl) titleEl.textContent = 'Add Transaction';
        
//         const editIdxEl = document.getElementById('editIndex');
//         if (editIdxEl) editIdxEl.value = '-1';
        
//         const formEl = document.getElementById('logForm');
//         if (formEl) formEl.reset();
        
//         // AUTO-POPULATE DATE AND TIME IF SETTING IS ENABLED
//         const autoFillEnabled = localStorage.getItem('ww_auto_time') !== 'false'; // true by default
        
//         const dateInput = document.getElementById('logDate');
//         const timeInput = document.getElementById('logTime');
        
//         if (autoFillEnabled) {
//             const now = new Date();
//             const year = now.getFullYear();
//             const month = String(now.getMonth() + 1).padStart(2, '0');
//             const day = String(now.getDate()).padStart(2, '0');
//             const hours = String(now.getHours()).padStart(2, '0');
//             const minutes = String(now.getMinutes()).padStart(2, '0');
            
//             if (dateInput) dateInput.value = `${year}-${month}-${day}`;
//             if (timeInput) timeInput.value = `${hours}:${minutes}`;
//         } else {
//             if (dateInput) dateInput.value = '';
//             if (timeInput) timeInput.value = '';
//         }

//         if (logSheetCtrl) logSheetCtrl.open();
//     };

//     window.openTransactionDetails = (idx) => {
//         const item = transactions[idx];
//         if (!item) return;
//         document.getElementById('detAmount').textContent = formatMoney(item.amount);
//         const badge = document.getElementById('detType');
//         if (badge) {
//             badge.textContent = item.type.toUpperCase();
//             badge.style.background = item.type === 'income' ? 'var(--status-good-bg)' : 'var(--status-bad-bg)';
//             badge.style.color = item.type === 'income' ? 'var(--status-good-text)' : 'var(--status-bad-text)';
//         }
//         document.getElementById('detCategory').textContent = item.category;
        
//         const time12 = window.formatTime12Hour(item.time);
//         document.getElementById('detDate').textContent = `${item.date} • ${time12}`;
//         document.getElementById('detNotes').textContent = item.notes || 'No notes provided.';
        
//         // Update edit button index to ensure the modal opens the correct record
//         currentEditIndex = idx;
        
//         if (window.detailsSheetCtrl) window.detailsSheetCtrl.open();
//     };

//     window.openActionMenu = (idx, event) => {
//         event.stopPropagation();
//         currentEditIndex = idx;
//         if (window.actionMenuCtrl) window.actionMenuCtrl.open();
//     };

//     // FIXED: Attach Edit/Delete Logic correctly to indices
//     window.handleEditTrigger = () => {
//         if (currentEditIndex === -1) return;
//         const item = transactions[currentEditIndex];
        
//         const titleEl = document.getElementById('logModalTitle');
//         if (titleEl) titleEl.textContent = 'Edit Transaction';
        
//         const editIdxEl = document.getElementById('editIndex');
//         if (editIdxEl) editIdxEl.value = currentEditIndex;
        
//         document.getElementById('logDate').value = item.date;
//         document.getElementById('logTime').value = item.time;
//         document.getElementById('logType').value = item.type;
//         document.getElementById('logAmount').value = item.amount;
//         document.getElementById('logCategory').value = item.category;
//         document.getElementById('logNotes').value = item.notes || '';
        
//         if (window.actionMenuCtrl) window.actionMenuCtrl.close();
//         if (window.detailsSheetCtrl) window.detailsSheetCtrl.close();
//         if (logSheetCtrl) setTimeout(() => logSheetCtrl.open(), 300);
//     };

//     window.handleDeleteTrigger = () => {
//         if (currentEditIndex === -1) return;
//         if (confirm("Delete this transaction?")) {
//             transactions.splice(currentEditIndex, 1);
//             localStorage.setItem('financeTransactions', JSON.stringify(transactions));
//             triggerAutoBackup();
//             updateDashboard();
//             updateAllTransactions();
//             if (window.actionMenuCtrl) window.actionMenuCtrl.close();
//             if (window.detailsSheetCtrl) window.detailsSheetCtrl.close();
//         }
//     };

//     // Bind Modals Buttons
//     document.getElementById('btnEditAction')?.addEventListener('click', window.handleEditTrigger);
//     document.getElementById('btnDeleteAction')?.addEventListener('click', window.handleDeleteTrigger);
//     document.getElementById('btnDetailsEdit')?.addEventListener('click', window.handleEditTrigger);
//     document.getElementById('btnDetailsDelete')?.addEventListener('click', window.handleDeleteTrigger);

//     const logForm = document.getElementById('logForm');
//     if (logForm) {
//         logForm.addEventListener('submit', (e) => {
//             e.preventDefault();
//             const editIndexInput = document.getElementById('editIndex');
//             const idx = editIndexInput ? parseInt(editIndexInput.value, 10) : -1;
            
//             const record = {
//                 date: document.getElementById('logDate').value,
//                 time: document.getElementById('logTime').value,
//                 type: document.getElementById('logType').value,
//                 amount: parseFloat(document.getElementById('logAmount').value),
//                 category: document.getElementById('logCategory').value,
//                 notes: (document.getElementById('logNotes')?.value || '').trim()
//             };

//             if (idx === -1 || isNaN(idx)) {
//                 transactions.push(record);
//             } else {
//                 transactions[idx] = record;
//             }

//             localStorage.setItem('financeTransactions', JSON.stringify(transactions));
//             triggerAutoBackup();
            
//             if (logSheetCtrl) logSheetCtrl.close();
//             logForm.reset();
//             if (editIndexInput) editIndexInput.value = '-1';
            
//             updateDashboard();
//             updateAllTransactions();
//         });
//     }

//     // Refresh layout dynamically on resize
//     let resizeTimer;
//     window.addEventListener('resize', () => {
//         clearTimeout(resizeTimer);
//         resizeTimer = setTimeout(() => { 
//             if (chartInstance) updateChart(); 
//         }, 150);
//     });

//     updateDashboard();
//     updateAllTransactions();
// });






























// /**
//  * Wealthwise - Personal Finance Tracker Script
//  * Ultimate Edition 😎
//  */

// const CONFIG = {
//     maxHistoryItems: 5
// };

// document.addEventListener('DOMContentLoaded', () => {
//     // --- 1. WELCOME SCREEN & ROBUST NAME HANDLING ---
//     const welcomeScreen = document.getElementById('welcomeScreen');
//     const welcomeForm = document.getElementById('welcomeForm');
//     const nameInput = document.getElementById('nameInput');
//     const balanceInput = document.getElementById('balanceInput');
    
//     // Function to universally update names across all pages (Fix for Settings page)
//     const updateNames = () => {
//         const savedFullName = localStorage.getItem('userFullName') || localStorage.getItem('userName');
//         const savedFirstName = localStorage.getItem('userName');
        
//         if (savedFirstName) {
//             document.documentElement.classList.add('has-user');
//             // Update all elements with these IDs or classes
//             document.querySelectorAll('#displayUserName, .displayUserName').forEach(el => el.textContent = savedFirstName);
//             document.querySelectorAll('#displayUserFullName, .displayUserFullName').forEach(el => el.textContent = savedFullName);
//         } else {
//             document.documentElement.classList.remove('has-user');
//         }
//     };
    
//     updateNames(); // Call immediately on load

//     if (welcomeForm) {
//         welcomeForm.addEventListener('submit', (e) => {
//             e.preventDefault();
//             const fullName = nameInput.value.trim();
//             const initBal = parseFloat(balanceInput?.value) || 0;
            
//             if (fullName) {
//                 localStorage.setItem('userName', fullName.split(' ')[0]);
//                 localStorage.setItem('userFullName', fullName);
//                 localStorage.setItem('initialBalance', initBal);
                
//                 updateNames();
//                 updateDashboard();
//                 updateAllTransactions();
                
//                 if (typeof WealthwiseGoogle !== 'undefined') WealthwiseGoogle.updateUI();
//             }
//         });
//     }

//     // --- 2. MOBILE DRIVE / SYNC DROPDOWN ---
//     const mobileDriveBtn = document.getElementById('mobileDriveBtn');
//     const mobileDriveMenu = document.getElementById('mobileDriveMenu');
//     if (mobileDriveBtn && mobileDriveMenu) {
//         mobileDriveBtn.addEventListener('click', (e) => {
//             e.preventDefault();
//             e.stopPropagation();
//             mobileDriveMenu.classList.toggle('show');
//         });
//         document.addEventListener('click', (e) => {
//             if (!mobileDriveBtn.contains(e.target) && !mobileDriveMenu.contains(e.target)) {
//                 mobileDriveMenu.classList.remove('show');
//             }
//         });
//     }

//     // --- 3. STATE & FINANCIAL HELPERS ---
//     let transactions = JSON.parse(localStorage.getItem('financeTransactions')) || [];
//     let chartInstance = null;
//     let currentFilter = 'all'; 
//     let searchQuery = '';      

//     window.getCurrency = () => localStorage.getItem('currency') || '$';
    
//     window.formatMoney = (amount) => {
//         const sym = window.getCurrency();
//         const val = parseFloat(amount) || 0;
//         const formatted = val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//         return sym === 'EGP' ? `${formatted} EGP` : `${sym}${formatted}`;
//     };

//     window.formatTime12Hour = (timeStr) => {
//         if (!timeStr) return '';
//         let [h, m] = timeStr.split(':');
//         h = parseInt(h, 10);
//         const ampm = h >= 12 ? 'PM' : 'AM';
//         h = h % 12 || 12;
//         return `${h}:${m.padStart(2, '0')} ${ampm}`;
//     };

//     const animateValue = (obj, start, end, duration) => {
//         if(!obj) return;
//         let startTimestamp = null;
//         const step = (timestamp) => {
//             if (!startTimestamp) startTimestamp = timestamp;
//             const progress = Math.min((timestamp - startTimestamp) / duration, 1);
//             obj.innerHTML = window.formatMoney(progress * (end - start) + start);
//             if (progress < 1) {
//                 window.requestAnimationFrame(step);
//             } else {
//                 obj.classList.remove('animate-count');
//                 void obj.offsetWidth; 
//                 obj.classList.add('animate-count');
//             }
//         };
//         window.requestAnimationFrame(step);
//     };

//     // Auto Backup Trigger (Silent background sync)
//     const triggerAutoBackup = () => {
//         if (localStorage.getItem('ww_auto_backup') === 'true' && typeof WealthwiseGoogle !== 'undefined') {
//             WealthwiseGoogle.saveToDrive(true);
//         }
//     };

//     // --- 4. GLOBAL THEME MANAGEMENT ---
//     const applyThemeActiveStates = (theme) => {
//         document.querySelectorAll('.theme-btn, .theme-option, .theme-card-option, .theme-menu-opt').forEach(el => {
//             if (el.getAttribute('data-theme-val') === theme) el.classList.add('active');
//             else el.classList.remove('active');
//         });
//     };

//     applyThemeActiveStates(localStorage.getItem('theme') || 'system');

//     document.querySelectorAll('.theme-btn, .theme-option, .theme-card-option, .theme-menu-opt').forEach(el => {
//         el.addEventListener('click', (e) => {
//             e.preventDefault();
//             const newTheme = el.getAttribute('data-theme-val');
//             if (window.ThemeManager) {
//                 ThemeManager.setTheme(newTheme);
//             } else {
//                 localStorage.setItem('theme', newTheme);
//                 const isDark = newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
//                 document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
//             }
//             applyThemeActiveStates(newTheme);
//             if (chartInstance) updateChart();
//             document.getElementById('themeIconMenu')?.classList.remove('show');
//         });
//     });

//     const themeIconBtn = document.getElementById('themeIconBtn');
//     const themeIconMenu = document.getElementById('themeIconMenu');
//     if (themeIconBtn && themeIconMenu) {
//         themeIconBtn.addEventListener('click', (e) => {
//             e.preventDefault();
//             e.stopPropagation();
//             themeIconMenu.classList.toggle('show');
//         });
//         document.addEventListener('click', (e) => {
//             if (!themeIconBtn.contains(e.target) && !themeIconMenu.contains(e.target)) closeMenu(themeIconMenu);
//         });
//     }

//     const sidebarToggle = document.getElementById('sidebarToggle');
//     if (sidebarToggle) {
//         sidebarToggle.addEventListener('click', () => {
//             document.documentElement.classList.toggle('sidebar-collapsed');
//             localStorage.setItem('sidebarCollapsed', document.documentElement.classList.contains('sidebar-collapsed'));
//             setTimeout(() => { if (chartInstance) chartInstance.resize(); }, 310);
//         });
//     }

//     // --- 5. SMART FINANCIAL INSIGHTS ---
//     const generateSmartInsights = (inc, exp) => {
//         const container = document.getElementById('insightsContainer');
//         if (!container) return;
//         container.innerHTML = '';
        
//         let insights = [];
//         const savingsRate = inc > 0 ? ((inc - exp) / inc) * 100 : 0;

//         if (inc === 0 && exp === 0) {
//             insights.push({ icon: 'ph-trend-up', color: '#0ea5e9', title: 'Welcome to Wealthwise', text: 'Add your first income or expense to unlock smart financial insights.' });
//         } else {
//             // Savings Insight
//             if (savingsRate >= 20) {
//                 insights.push({ icon: 'ph-piggy-bank', color: '#10b981', title: 'Excellent Saver', text: `You're saving ${savingsRate.toFixed(1)}% of your income. Outstanding financial health! 🚀` });
//             } else if (savingsRate > 0) {
//                 insights.push({ icon: 'ph-coins', color: '#eab308', title: 'Good Start', text: `You're saving ${savingsRate.toFixed(1)}%. Try to push it to 20% for long-term growth.` });
//             } else {
//                 insights.push({ icon: 'ph-warning-circle', color: '#ef4444', title: 'Deficit Warning', text: `You're spending more than you're earning. Review your recent expenses.` });
//             }

//             // Burn Rate Insight
//             if (exp > (inc * 0.6) && inc > 0) {
//                  insights.push({ icon: 'ph-chart-pie-slice', color: '#8b5cf6', title: 'High Burn Rate', text: 'Expenses are consuming over 60% of your inflow. Monitor discretionary spending closely.' });
//             } else if (inc > 0 && exp < (inc * 0.4)) {
//                  insights.push({ icon: 'ph-shield-check', color: '#38bdf8', title: 'Well Protected', text: 'Your burn rate is low. Consider investing the surplus capital.' });
//             }
//         }

//         insights.forEach(ins => {
//             container.innerHTML += `
//                 <div class="insight-item">
//                     <div class="insight-icon" style="background: ${ins.color}20; color: ${ins.color};"><i class="ph ${ins.icon}"></i></div>
//                     <div class="insight-content"><h4>${ins.title}</h4><p>${ins.text}</p></div>
//                 </div>
//             `;
//         });
//     };

//     // --- 6. CHART RENDERING ---
//     const updateChart = () => {
//         const canvas = document.getElementById('mainChart');
//         if (!canvas) return;
//         const ctx = canvas.getContext('2d');
//         const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
//         const gridColor = isDark ? '#27272a' : '#e5e7eb';
//         const textColor = isDark ? '#a1a1aa' : '#6b7280';
//         const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#09090b';
        
//         const recent = [...transactions].sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)).slice(-10);
//         const labels = recent.map(t => new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
//         const dataValues = recent.map(t => t.type === 'income' ? t.amount : -t.amount);
//         const pointColors = recent.map(t => t.type === 'income' ? '#10b981' : '#ef4444');

//         if (chartInstance) chartInstance.destroy();

//         chartInstance = new Chart(ctx, {
//             type: 'line',
//             data: {
//                 labels: labels,
//                 datasets: [{
//                     data: dataValues,
//                     borderColor: primaryColor,
//                     borderWidth: 2.5,
//                     fill: true,
//                     backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(9,9,11,0.04)',
//                     tension: 0.3,
//                     pointBackgroundColor: pointColors,
//                     pointBorderColor: isDark ? '#18181b' : '#ffffff',
//                     pointBorderWidth: 2,
//                     pointRadius: 4,
//                 }]
//             },
//             options: {
//                 responsive: true, maintainAspectRatio: false,
//                 plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `Flow: ${formatMoney(context.raw)}` } } },
//                 scales: { x: { grid: { color: gridColor }, ticks: { color: textColor } }, y: { grid: { color: gridColor }, ticks: { color: textColor, callback: (v) => formatMoney(v) } } }
//             }
//         });
//     };

//     // --- 7. DASHBOARD & LEDGER UPDATES ---
//     const updateDashboard = () => {
//         const valMainBalance = document.getElementById('valMainBalance');
//         const initialBalance = parseFloat(localStorage.getItem('initialBalance')) || 0;
//         let totalIncome = 0, totalExpense = 0;
        
//         transactions.forEach(t => {
//             if (t.type === 'income') totalIncome += t.amount;
//             else totalExpense += t.amount;
//         });

//         const netBalance = initialBalance + totalIncome - totalExpense;
//         const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

//         // Dashboard specific updates
//         if (valMainBalance) {
//             animateValue(valMainBalance, 0, netBalance, 800);
//             if (document.getElementById('valTotalInc')) document.getElementById('valTotalInc').textContent = formatMoney(totalIncome);
//             if (document.getElementById('valTotalExp')) document.getElementById('valTotalExp').textContent = formatMoney(totalExpense);
//         }

//         // Generic Stats
//         if (document.getElementById('valBalance')) document.getElementById('valBalance').textContent = formatMoney(netBalance);
//         if (document.getElementById('valIncome')) document.getElementById('valIncome').textContent = formatMoney(totalIncome);
//         if (document.getElementById('valExpense')) document.getElementById('valExpense').textContent = formatMoney(totalExpense);
//         if (document.getElementById('valSavings')) document.getElementById('valSavings').textContent = `${savingsRate}%`;

//         const historyList = document.getElementById('recentHistoryList');
//         if (historyList) {
//             historyList.innerHTML = '';
//             if (transactions.length === 0) {
//                 historyList.innerHTML = '<div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 13px;">No transactions logged yet.</div>';
//             } else {
//                 [...transactions].sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)).reverse().slice(0, CONFIG.maxHistoryItems).forEach(t => {
//                     const originalIndex = transactions.indexOf(t);
//                     const isInc = t.type === 'income';
//                     const time12 = window.formatTime12Hour(t.time);
//                     const shortDate = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

//                     const item = document.createElement('div');
//                     item.className = 'history-item clickable';
//                     item.onclick = () => openTransactionDetails(originalIndex);
//                     item.innerHTML = `
//                         <div class="hist-left">
//                             <div class="hist-val">${t.category} <span class="status-badge" style="background: var(--${isInc ? 'status-good-bg' : 'status-bad-bg'}); color: var(--${isInc ? 'status-good-text' : 'status-bad-text'});">${t.type}</span></div>
//                             <div class="hist-time">${shortDate} • ${time12}</div>
//                         </div>
//                         <div style="font-weight: 600; color: var(--${isInc ? 'dot-high' : 'dot-low'})">${isInc ? '+' : '-'}${formatMoney(t.amount)}</div>
//                     `;
//                     historyList.appendChild(item);
//                 });
//             }
//         }
        
//         generateSmartInsights(totalIncome, totalExpense);
//         updateChart();
//     };

//     // --- 8. TRANSACTIONS PAGE RENDERING ---
//     const updateAllTransactions = () => {
//         const allTxList = document.getElementById('allTransactionsList');
//         const statLatest = document.getElementById('rStatLatest');
        
//         if (statLatest) {
//             const initialBalance = parseFloat(localStorage.getItem('initialBalance')) || 0;
            
//             if (transactions.length === 0) {
//                 statLatest.textContent = '--';
//                 document.getElementById('rStatAvg').textContent = '--';
//                 document.getElementById('rStatRange').textContent = formatMoney(initialBalance);
//                 document.getElementById('rStatTotal').textContent = '0';
//             } else {
//                 let inc = 0, exp = 0, sumAmount = 0;
//                 transactions.forEach(t => { t.type === 'income' ? inc += t.amount : exp += t.amount; sumAmount += t.amount; });
                
//                 const sortedByDate = [...transactions].sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
//                 const latestTx = sortedByDate[sortedByDate.length - 1];
                
//                 statLatest.textContent = formatMoney(latestTx.amount);
//                 document.getElementById('rStatAvg').textContent = formatMoney(sumAmount / transactions.length);
                
//                 const net = initialBalance + inc - exp;
//                 const rRange = document.getElementById('rStatRange');
//                 rRange.textContent = formatMoney(net);
//                 rRange.style.color = net < 0 ? 'var(--dot-low)' : 'var(--dot-high)';
                
//                 document.getElementById('rStatTotal').textContent = transactions.length;
//             }
//         }

//         if (!allTxList) return;
//         allTxList.innerHTML = '';

//         let filtered = [...transactions];
//         if (currentFilter !== 'all') filtered = filtered.filter(t => t.type === currentFilter);
//         if (searchQuery) {
//             const q = searchQuery.toLowerCase();
//             filtered = filtered.filter(t => t.category.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)));
//         }

//         if (filtered.length === 0) {
//             allTxList.innerHTML = '<div style="padding: 32px; text-align: center; color: var(--text-muted);">No records found.</div>';
//             return;
//         }

//         // filtered.sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)).reverse().forEach((t) => {
//         //     const originalIndex = transactions.indexOf(t);
//         //     const isInc = t.type === 'income';
            
//         //     const time12 = window.formatTime12Hour(t.time);
//         //     const shortDate = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

//         //     const row = document.createElement('div');
//         //     row.className = 'r-row clickable';
//         //     row.onclick = (e) => { if (!e.target.closest('.r-action-btn')) openTransactionDetails(originalIndex); };

//         //     row.innerHTML = `
//         //         <div class="r-col-amount" style="color: var(--${isInc ? 'dot-high' : 'dot-low'})">${isInc ? '+' : '-'}${formatMoney(t.amount)}</div>
//         //         <div class="r-col-date mobile-only">${shortDate}</div>
//         //         <div class="r-col-date desktop-only">${t.date}</div>
//         //         <div class="r-col-time desktop-only">${time12}</div>
//         //         <div class="r-col-notes">
//         //             <span class="r-cat-text">${t.category} <span class="mobile-only" style="color: var(--text-muted);">&bull;</span></span>
//         //             <span class="r-notes-text">${t.notes || 'No notes'}</span>
//         //         </div>
//         //         <div class="r-col-time mobile-only">${time12}</div>
//         //         <div class="r-col-actions desktop-only"><button class="r-action-btn" onclick="openActionMenu(${originalIndex}, event)"><i class="ph ph-dots-three"></i></button></div>
//         //     `;
//         //     allTxList.appendChild(row);
//         // });
//         filtered.sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)).reverse().forEach((t) => {
//             const originalIndex = transactions.indexOf(t);
//             const isInc = t.type === 'income';
            
//             const time12 = window.formatTime12Hour(t.time);
//             const shortDate = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

//             const row = document.createElement('div');
//             row.className = 'r-row clickable';
//             row.onclick = (e) => { if (!e.target.closest('.r-action-btn')) openTransactionDetails(originalIndex); };

//             row.innerHTML = `
//                 <!-- Mobile Only Elements -->
//                 <div class="r-col-amount mobile-only" style="color: var(--${isInc ? 'dot-high' : 'dot-low'})">${isInc ? '+' : '-'}${formatMoney(t.amount)}</div>
//                 <div class="r-col-date mobile-only">${shortDate}</div>
//                 <div class="r-col-notes mobile-only">
//                     <span class="r-cat-text">${t.category} <span style="color: var(--text-muted);">&bull;</span></span>
//                     <span class="r-notes-text">${t.notes || 'No notes'}</span>
//                 </div>
//                 <div class="r-col-time mobile-only">${time12}</div>
                
//                 <!-- Desktop Only Elements -->
//                 <div class="r-col-date desktop-only">${t.date}</div>
//                 <div class="r-col-time desktop-only">${time12}</div>
//                 <div class="r-col-amount desktop-only" style="color: var(--${isInc ? 'dot-high' : 'dot-low'}); font-weight: 600;">${isInc ? '+' : '-'}${formatMoney(t.amount)}</div>
//                 <div class="r-col-category desktop-only">${t.category}</div>
//                 <div class="desktop-only"><span class="r-notes-text" style="color: var(--text-muted);">${t.notes || '-'}</span></div>
//                 <div class="r-col-actions desktop-only"><button class="r-action-btn" onclick="openActionMenu(${originalIndex}, event)"><i class="ph ph-dots-three"></i></button></div>
//             `;
//             allTxList.appendChild(row);
//         });
//     };

//     document.querySelectorAll('.r-pill').forEach(pill => {
//         pill.addEventListener('click', () => {
//             document.querySelectorAll('.r-pill').forEach(p => p.classList.remove('active'));
//             pill.classList.add('active');
//             currentFilter = pill.getAttribute('data-filter');
//             updateAllTransactions();
//         });
//     });

//     const searchInput = document.getElementById('searchReadingsInput');
//     if (searchInput) {
//         searchInput.addEventListener('input', (e) => {
//             searchQuery = e.target.value;
//             updateAllTransactions();
//         });
//     }

//     // --- 9. STABLE BOTTOM SHEETS & MODALS ---
//     function initBottomSheet(overlayId, openBtnIds, closeBtnId) {
//         const overlay = document.getElementById(overlayId);
//         if (!overlay) return null;
//         const sheet = overlay.querySelector('.bottom-sheet');
//         const closeBtn = document.getElementById(closeBtnId);
//         let startY = 0, currentY = 0, isDragging = false;

//         const openSheet = (e) => { if(e) e.preventDefault(); sheet.style.transform = ''; void sheet.offsetWidth; overlay.classList.add('active'); };
//         const closeSheet = () => { overlay.classList.remove('active'); setTimeout(() => sheet.style.transform = '', 300); };

//         openBtnIds.forEach(id => { const b = document.getElementById(id); if(b) b.addEventListener('click', openSheet); });
//         if(closeBtn) closeBtn.addEventListener('click', closeSheet);
//         overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSheet(); });

//         sheet.addEventListener('touchstart', (e) => {
//             if (window.innerWidth <= 768 && (e.target.closest('.drag-handle-wrapper') || e.target.closest('.sheet-header'))) {
//                 startY = e.touches[0].clientY; isDragging = true; sheet.style.transition = 'none';
//             }
//         }, { passive: true });
//         sheet.addEventListener('touchmove', (e) => {
//             if (!isDragging) return; currentY = e.touches[0].clientY;
//             if (currentY - startY > 0) window.requestAnimationFrame(() => sheet.style.transform = `translateY(${currentY - startY}px)`);
//         }, { passive: true });
//         sheet.addEventListener('touchend', () => {
//             if (!isDragging) return; isDragging = false;
//             sheet.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
//             if (currentY - startY > 80) closeSheet(); else sheet.style.transform = 'translateY(0)';
//         });
//         return { open: openSheet, close: closeSheet };
//     }

//     const logSheetCtrl = initBottomSheet('logSheetOverlay', ['openLogBtn', 'mobileLogBtn'], 'closeLogBtn');
//     initBottomSheet('menuSheetOverlay', ['openMobileMenuBtn'], 'closeMobileMenuBtn');
//     window.detailsSheetCtrl = initBottomSheet('detailsSheetOverlay', [], 'closeDetailsBtn');
//     window.actionMenuCtrl = initBottomSheet('actionMenuOverlay', [], 'closeActionMenuBtn');

//     // --- 10. ADD/EDIT ACTIONS ---
//     window.openAddLog = () => {
//         document.getElementById('logModalTitle').textContent = 'Add Transaction';
//         document.getElementById('editIndex').value = '-1';
//         document.getElementById('logForm').reset();
        
//         const autoFillEnabled = localStorage.getItem('ww_auto_time') !== 'false';
//         const dateInput = document.getElementById('logDate');
//         const timeInput = document.getElementById('logTime');
        
//         if (autoFillEnabled) {
//             const now = new Date();
//             const year = now.getFullYear();
//             const month = String(now.getMonth() + 1).padStart(2, '0');
//             const day = String(now.getDate()).padStart(2, '0');
//             const hours = String(now.getHours()).padStart(2, '0');
//             const minutes = String(now.getMinutes()).padStart(2, '0');
            
//             if (dateInput) dateInput.value = `${year}-${month}-${day}`;
//             if (timeInput) timeInput.value = `${hours}:${minutes}`;
//         }
//         if (logSheetCtrl) logSheetCtrl.open();
//     };

//     let currentEditIndex = -1;

//     window.openTransactionDetails = (idx) => {
//         const item = transactions[idx];
//         if (!item) return;
//         currentEditIndex = idx;
        
//         document.getElementById('detAmount').textContent = formatMoney(item.amount);
//         const badge = document.getElementById('detType');
//         if (badge) {
//             badge.textContent = item.type.toUpperCase();
//             badge.style.background = item.type === 'income' ? 'var(--status-good-bg)' : 'var(--status-bad-bg)';
//             badge.style.color = item.type === 'income' ? 'var(--status-good-text)' : 'var(--status-bad-text)';
//         }
//         document.getElementById('detCategory').textContent = item.category;
        
//         const time12 = window.formatTime12Hour(item.time);
//         document.getElementById('detDate').textContent = `${item.date} • ${time12}`;
//         document.getElementById('detNotes').textContent = item.notes || 'No notes provided.';
        
//         if (window.detailsSheetCtrl) window.detailsSheetCtrl.open();
//     };

//     window.openActionMenu = (idx, event) => {
//         event.stopPropagation();
//         currentEditIndex = idx;
//         if (window.actionMenuCtrl) window.actionMenuCtrl.open();
//     };

//     window.handleEditTrigger = () => {
//         if (currentEditIndex === -1) return;
//         const item = transactions[currentEditIndex];
        
//         document.getElementById('logModalTitle').textContent = 'Edit Transaction';
//         document.getElementById('editIndex').value = currentEditIndex;
//         document.getElementById('logDate').value = item.date;
//         document.getElementById('logTime').value = item.time;
//         document.getElementById('logType').value = item.type;
//         document.getElementById('logAmount').value = item.amount;
//         document.getElementById('logCategory').value = item.category;
//         document.getElementById('logNotes').value = item.notes || '';
        
//         if (window.actionMenuCtrl) window.actionMenuCtrl.close();
//         if (window.detailsSheetCtrl) window.detailsSheetCtrl.close();
//         if (logSheetCtrl) setTimeout(() => logSheetCtrl.open(), 300);
//     };

//     window.handleDeleteTrigger = () => {
//         if (currentEditIndex === -1) return;
//         if (confirm("Delete this transaction?")) {
//             transactions.splice(currentEditIndex, 1);
//             localStorage.setItem('financeTransactions', JSON.stringify(transactions));
//             triggerAutoBackup();
//             updateDashboard();
//             updateAllTransactions();
//             if (window.actionMenuCtrl) window.actionMenuCtrl.close();
//             if (window.detailsSheetCtrl) window.detailsSheetCtrl.close();
//         }
//     };

//     document.getElementById('btnEditAction')?.addEventListener('click', window.handleEditTrigger);
//     document.getElementById('btnDeleteAction')?.addEventListener('click', window.handleDeleteTrigger);
//     document.getElementById('btnDetailsEdit')?.addEventListener('click', window.handleEditTrigger);
//     document.getElementById('btnDetailsDelete')?.addEventListener('click', window.handleDeleteTrigger);

//     const logForm = document.getElementById('logForm');
//     if (logForm) {
//         logForm.addEventListener('submit', (e) => {
//             e.preventDefault();
//             const editIndexInput = document.getElementById('editIndex');
//             const idx = editIndexInput ? parseInt(editIndexInput.value, 10) : -1;
            
//             const record = {
//                 date: document.getElementById('logDate').value,
//                 time: document.getElementById('logTime').value,
//                 type: document.getElementById('logType').value,
//                 amount: parseFloat(document.getElementById('logAmount').value),
//                 category: document.getElementById('logCategory').value,
//                 notes: (document.getElementById('logNotes')?.value || '').trim()
//             };

//             if (idx === -1 || isNaN(idx)) {
//                 transactions.push(record);
//             } else {
//                 transactions[idx] = record;
//             }

//             localStorage.setItem('financeTransactions', JSON.stringify(transactions));
//             triggerAutoBackup();
            
//             if (logSheetCtrl) logSheetCtrl.close();
//             logForm.reset();
//             if (editIndexInput) editIndexInput.value = '-1';
            
//             updateDashboard();
//             updateAllTransactions();
//         });
//     }

//     // Refresh layout dynamically on resize
//     let resizeTimer;
//     window.addEventListener('resize', () => {
//         clearTimeout(resizeTimer);
//         resizeTimer = setTimeout(() => { 
//             if (chartInstance) updateChart(); 
//         }, 150);
//     });

//     updateNames();
//     updateDashboard();
//     updateAllTransactions();
// });
































/**
 * Wealthwise - Personal Finance Tracker Script
 * Ultimate Edition 😎
 */

const CONFIG = {
    maxHistoryItems: 3
};

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. WELCOME SCREEN & ROBUST NAME HANDLING ---
    const welcomeScreen = document.getElementById('welcomeScreen');
    const welcomeForm = document.getElementById('welcomeForm');
    const nameInput = document.getElementById('nameInput');
    const balanceInput = document.getElementById('balanceInput');
    
    // Function to universally update names across all pages
    window.updateNames = () => {
        // Safe check for missing names
        let rawFullName = localStorage.getItem('userFullName') || localStorage.getItem('userName') || '';
        let rawFirstName = localStorage.getItem('userName') || '';

        // If no names exist, fallback safely and remove the 'has-user' state
        if (!rawFullName || !rawFirstName) {
            document.documentElement.classList.remove('has-user');
            document.querySelectorAll('.user-avatar-target').forEach(el => el.removeAttribute('title'));
            return;
        }

        // Clean names
        rawFullName = rawFullName.trim();
        rawFirstName = rawFirstName.trim();

        // 🟢 1. First Name ONLY (For Sidebar & Dashboard Welcome)
        document.querySelectorAll('#displayUserName, .displayUserName, #sidebarProfileName').forEach(el => {
            el.textContent = rawFirstName;
        });
        
        // 🔵 2. Full Name ONLY (For Settings Profile Card)
        document.querySelectorAll('#displayUserFullName, .displayUserFullName').forEach(el => {
            el.textContent = rawFullName;
        });
        
        // 🟣 3. Tooltip on Hover for Avatar (Shows Full Name)
        document.querySelectorAll('.user-avatar-target').forEach(el => {
            el.setAttribute('title', rawFullName);
        });

        document.documentElement.classList.add('has-user');
    };
    
    window.updateNames(); // Call immediately on load

    if (welcomeForm) {
        welcomeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = nameInput.value.trim();
            const initBal = parseFloat(balanceInput?.value) || 0;
            
            if (fullName) {
                const firstName = fullName.split(' ')[0]; // Extract exactly the first word
                
                localStorage.setItem('userName', firstName);
                localStorage.setItem('userFullName', fullName);
                localStorage.setItem('initialBalance', initBal);
                
                window.updateNames();
                updateDashboard();
                updateAllTransactions();
                
                if (typeof WealthwiseGoogle !== 'undefined') WealthwiseGoogle.updateUI();
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

    window.formatTime12Hour = (timeStr) => {
        if (!timeStr) return '';
        let [h, m] = timeStr.split(':');
        h = parseInt(h, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${m.padStart(2, '0')} ${ampm}`;
    };

    const animateValue = (obj, start, end, duration) => {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = window.formatMoney(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.classList.remove('animate-count');
                void obj.offsetWidth; 
                obj.classList.add('animate-count');
            }
        };
        window.requestAnimationFrame(step);
    };

    const triggerAutoBackup = () => {
        if (localStorage.getItem('ww_auto_backup') === 'true' && typeof WealthwiseGoogle !== 'undefined') {
            WealthwiseGoogle.saveToDrive(true);
        }
    };

    // --- 4. THEME & SMART RESPONSIVE SIDEBAR ---
    const applyThemeActiveStates = (theme) => {
        document.querySelectorAll('.theme-btn, .theme-option, .theme-card-option, .theme-menu-opt').forEach(el => {
            if (el.getAttribute('data-theme-val') === theme) el.classList.add('active');
            else el.classList.remove('active');
        });
    };

    applyThemeActiveStates(localStorage.getItem('theme') || 'system');

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

    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('sidebar-collapsed');
            localStorage.setItem('sidebarCollapsed', document.documentElement.classList.contains('sidebar-collapsed'));
            setTimeout(() => { if (chartInstance) chartInstance.resize(); }, 310);
        });
    }

    // Smart Responsive Auto-Collapse
    const handleSmartSidebar = () => {
        if (window.innerWidth <= 1024 && window.innerWidth > 768) {
            document.documentElement.classList.add('sidebar-collapsed');
        } else if (window.innerWidth > 1024) {
            if (localStorage.getItem('sidebarCollapsed') !== 'true') {
                document.documentElement.classList.remove('sidebar-collapsed');
            }
        }
    };
    handleSmartSidebar();

    // --- 5. SMART FINANCIAL INSIGHTS ---
    const generateSmartInsights = (inc, exp) => {
        const container = document.getElementById('insightsContainer');
        if (!container) return;
        container.innerHTML = '';
        
        let insights = [];
        const savingsRate = inc > 0 ? ((inc - exp) / inc) * 100 : 0;

        if (inc === 0 && exp === 0) {
            insights.push({ icon: 'ph-trend-up', color: '#0ea5e9', title: 'Welcome to Wealthwise', text: 'Add your first income or expense to unlock smart financial insights.' });
        } else {
            if (savingsRate >= 20) {
                insights.push({ icon: 'ph-piggy-bank', color: '#10b981', title: 'Excellent Saver', text: `You're saving ${savingsRate.toFixed(1)}% of your income. Outstanding financial health! 🚀` });
            } else if (savingsRate > 0) {
                insights.push({ icon: 'ph-coins', color: '#eab308', title: 'Good Start', text: `You're saving ${savingsRate.toFixed(1)}%. Try to push it to 20% for long-term growth.` });
            } else {
                insights.push({ icon: 'ph-warning-circle', color: '#ef4444', title: 'Deficit Warning', text: `You're spending more than you're earning. Review your recent expenses.` });
            }

            if (exp > (inc * 0.6) && inc > 0) {
                insights.push({ icon: 'ph-chart-pie-slice', color: '#8b5cf6', title: 'High Burn Rate', text: 'Expenses are consuming over 60% of your inflow. Monitor discretionary spending closely.' });
            } else if (inc > 0 && exp < (inc * 0.4)) {
                insights.push({ icon: 'ph-shield-check', color: '#38bdf8', title: 'Well Protected', text: 'Your burn rate is low. Consider investing the surplus capital.' });
            }
        }

        insights.forEach(ins => {
            container.innerHTML += `
                <div class="insight-item">
                    <div class="insight-icon" style="background: ${ins.color}20; color: ${ins.color};"><i class="ph ${ins.icon}"></i></div>
                    <div class="insight-content"><h4>${ins.title}</h4><p>${ins.text}</p></div>
                </div>
            `;
        });
    };

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
        const labels = recent.map(t => new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
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
                    tooltip: { callbacks: { label: (context) => `Flow: ${formatMoney(context.raw)}` } }
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
        const valMainBalance = document.getElementById('valMainBalance');
        const initialBalance = parseFloat(localStorage.getItem('initialBalance')) || 0;
        let totalIncome = 0, totalExpense = 0;
        
        transactions.forEach(t => {
            if (t.type === 'income') totalIncome += t.amount;
            else totalExpense += t.amount;
        });

        const netBalance = initialBalance + totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

        if (valMainBalance) {
            animateValue(valMainBalance, 0, netBalance, 800);
            if (document.getElementById('valTotalInc')) document.getElementById('valTotalInc').textContent = formatMoney(totalIncome);
            if (document.getElementById('valTotalExp')) document.getElementById('valTotalExp').textContent = formatMoney(totalExpense);
        }

        if (document.getElementById('valBalance')) document.getElementById('valBalance').textContent = formatMoney(netBalance);
        if (document.getElementById('valIncome')) document.getElementById('valIncome').textContent = formatMoney(totalIncome);
        if (document.getElementById('valExpense')) document.getElementById('valExpense').textContent = formatMoney(totalExpense);
        if (document.getElementById('valSavings')) document.getElementById('valSavings').textContent = `${savingsRate}%`;

        const historyList = document.getElementById('recentHistoryList');
        if (historyList) {
            historyList.innerHTML = '';
            if (transactions.length === 0) {
                historyList.innerHTML = '<div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 13px;">No transactions logged yet.</div>';
            } else {
                [...transactions].sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)).reverse().slice(0, CONFIG.maxHistoryItems).forEach(t => {
                    const originalIndex = transactions.indexOf(t);
                    const isInc = t.type === 'income';
                    const time12 = window.formatTime12Hour(t.time);
                    const shortDate = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    const item = document.createElement('div');
                    item.className = 'history-item clickable';
                    item.onclick = () => openTransactionDetails(originalIndex);
                    item.innerHTML = `
                        <div class="hist-left">
                            <div class="hist-val">${t.category} <span class="status-badge" style="background: var(--${isInc ? 'status-good-bg' : 'status-bad-bg'}); color: var(--${isInc ? 'status-good-text' : 'status-bad-text'});">${t.type}</span></div>
                            <div class="hist-time">${shortDate} • ${time12}</div>
                        </div>
                        <div style="font-weight: 600; color: var(--${isInc ? 'dot-high' : 'dot-low'})">${isInc ? '+' : '-'}${formatMoney(t.amount)}</div>
                    `;
                    historyList.appendChild(item);
                });
            }
        }
        
        generateSmartInsights(totalIncome, totalExpense);
        updateChart();
    };

    // --- 8. TRANSACTIONS PAGE RENDERING ---
    const updateAllTransactions = () => {
        const allTxList = document.getElementById('allTransactionsList');
        const statLatest = document.getElementById('rStatLatest');
        
        if (statLatest) {
            const initialBalance = parseFloat(localStorage.getItem('initialBalance')) || 0;
            
            if (transactions.length === 0) {
                statLatest.textContent = '--';
                document.getElementById('rStatAvg').textContent = '--';
                document.getElementById('rStatRange').textContent = formatMoney(initialBalance);
                document.getElementById('rStatTotal').textContent = '0';
            } else {
                let inc = 0, exp = 0, sumAmount = 0;
                transactions.forEach(t => { 
                    t.type === 'income' ? inc += t.amount : exp += t.amount; 
                    sumAmount += t.amount; 
                });
                
                const sortedByDate = [...transactions].sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
                const latestTx = sortedByDate[sortedByDate.length - 1];
                
                statLatest.textContent = formatMoney(latestTx.amount);
                document.getElementById('rStatAvg').textContent = formatMoney(sumAmount / transactions.length);
                
                const net = initialBalance + inc - exp;
                const rRange = document.getElementById('rStatRange');
                rRange.textContent = formatMoney(net);
                rRange.style.color = net < 0 ? 'var(--dot-low)' : 'var(--dot-high)';
                
                document.getElementById('rStatTotal').textContent = transactions.length;
            }
        }

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

        filtered.sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)).reverse().forEach((t) => {
            const originalIndex = transactions.indexOf(t);
            const isInc = t.type === 'income';
            
            const time12 = window.formatTime12Hour(t.time);
            const shortDate = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const row = document.createElement('div');
            row.className = 'r-row clickable';
            row.onclick = (e) => { 
                if (!e.target.closest('.r-action-btn')) openTransactionDetails(originalIndex); 
            };

            row.innerHTML = `
                <!-- Mobile Only Elements -->
                <div class="r-col-amount mobile-only" style="color: var(--${isInc ? 'dot-high' : 'dot-low'})">${isInc ? '+' : '-'}${formatMoney(t.amount)}</div>
                <div class="r-col-date mobile-only">${shortDate}</div>
                <div class="r-col-notes mobile-only">
                    <span class="r-cat-text">${t.category} <span style="color: var(--text-muted);">&bull;</span></span>
                    <span class="r-notes-text">${t.notes || 'No notes'}</span>
                </div>
                <div class="r-col-time mobile-only">${time12}</div>
                
                <!-- Desktop Only Elements -->
                <div class="r-col-date desktop-only">${t.date}</div>
                <div class="r-col-time desktop-only">${time12}</div>
                <div class="r-col-amount desktop-only" style="color: var(--${isInc ? 'dot-high' : 'dot-low'}); font-weight: 600;">${isInc ? '+' : '-'}${formatMoney(t.amount)}</div>
                <div class="r-col-category desktop-only"><span style="font-weight:600;font-size:12px;padding:4px 8px;border-radius:6px;background:var(--bg-hover);color:var(--text-main);">${t.category}</span></div>
                <div class="desktop-only" style="min-width:0;"><span class="r-notes-text" style="color: var(--text-muted);">${t.notes || '-'}</span></div>
                <div class="r-col-actions desktop-only"><button class="r-action-btn" onclick="openActionMenu(${originalIndex}, event)"><i class="ph ph-dots-three"></i></button></div>
            `;
            allTxList.appendChild(row);
        });
    };

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

    // --- 10. ADD/EDIT ACTIONS ---
    window.openAddLog = () => {
        document.getElementById('logModalTitle').textContent = 'Add Transaction';
        document.getElementById('editIndex').value = '-1';
        document.getElementById('logForm').reset();
        
        const autoFillEnabled = localStorage.getItem('ww_auto_time') !== 'false';
        const dateInput = document.getElementById('logDate');
        const timeInput = document.getElementById('logTime');
        
        if (autoFillEnabled) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            if (dateInput) dateInput.value = `${year}-${month}-${day}`;
            if (timeInput) timeInput.value = `${hours}:${minutes}`;
        }
        if (logSheetCtrl) logSheetCtrl.open();
    };

    let currentEditIndex = -1;

    window.openTransactionDetails = (idx) => {
        const item = transactions[idx];
        if (!item) return;
        currentEditIndex = idx;
        
        document.getElementById('detAmount').textContent = formatMoney(item.amount);
        const badge = document.getElementById('detType');
        if (badge) {
            badge.textContent = item.type.toUpperCase();
            badge.style.background = item.type === 'income' ? 'var(--status-good-bg)' : 'var(--status-bad-bg)';
            badge.style.color = item.type === 'income' ? 'var(--status-good-text)' : 'var(--status-bad-text)';
        }
        document.getElementById('detCategory').textContent = item.category;
        
        const time12 = window.formatTime12Hour(item.time);
        document.getElementById('detDate').textContent = `${item.date} • ${time12}`;
        document.getElementById('detNotes').textContent = item.notes || 'No notes provided.';
        
        if (window.detailsSheetCtrl) window.detailsSheetCtrl.open();
    };

    window.openActionMenu = (idx, event) => {
        event.stopPropagation();
        currentEditIndex = idx;
        if (window.actionMenuCtrl) window.actionMenuCtrl.open();
    };

    window.handleEditTrigger = () => {
        if (currentEditIndex === -1) return;
        const item = transactions[currentEditIndex];
        
        document.getElementById('logModalTitle').textContent = 'Edit Transaction';
        document.getElementById('editIndex').value = currentEditIndex;
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

    window.handleDeleteTrigger = () => {
        if (currentEditIndex === -1) return;
        if (confirm("Delete this transaction?")) {
            transactions.splice(currentEditIndex, 1);
            localStorage.setItem('financeTransactions', JSON.stringify(transactions));
            triggerAutoBackup();
            updateDashboard();
            updateAllTransactions();
            if (window.actionMenuCtrl) window.actionMenuCtrl.close();
            if (window.detailsSheetCtrl) window.detailsSheetCtrl.close();
        }
    };

    document.getElementById('btnEditAction')?.addEventListener('click', window.handleEditTrigger);
    document.getElementById('btnDeleteAction')?.addEventListener('click', window.handleDeleteTrigger);
    document.getElementById('btnDetailsEdit')?.addEventListener('click', window.handleEditTrigger);
    document.getElementById('btnDetailsDelete')?.addEventListener('click', window.handleDeleteTrigger);

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

    // Refresh layout dynamically on resize & handle smart sidebar
    let resizeTimer;
    window.addEventListener('resize', () => {
        handleSmartSidebar(); // Instantly manage sidebar based on width
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { 
            if (chartInstance) updateChart(); 
        }, 150);
    });

    window.updateNames();
    updateDashboard();
    updateAllTransactions();
});