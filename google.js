// /**
//  * Wealthwise - Google Identity & Google Drive Integration
//  */
// const GOOGLE_CONFIG = {
//     clientId: '884057504637-lo16damkhhb55v1hmmmhrl9m2dm0p5rr.apps.googleusercontent.com', 
//     scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile',
//     notifyMode: 'modal'
// };

// const WealthwiseGoogle = {
//     tokenClient: null,
//     accessToken: null,
//     userProfile: null,

//     notify(type, title, message, onConfirm = null) {
//         if (GOOGLE_CONFIG.notifyMode === 'toast') this.showToast(type, title, message);
//         else this.showModal(type, title, message, onConfirm);
//     },

//     showToast(type, title, message) {
//         let toast = document.getElementById('wwGoogleToast');
//         if (!toast) {
//             toast = document.createElement('div');
//             toast.id = 'wwGoogleToast';
//             toast.className = 'st-google-toast';
//             document.body.appendChild(toast);
//         }
//         const icons = { success: 'ph-check-circle', warning: 'ph-warning-circle', error: 'ph-x-circle', info: 'ph-info' };
//         const colors = { success: '#10b981', warning: '#eab308', error: '#ef4444', info: '#0ea5e9' };
        
//         toast.innerHTML = `<i class="ph-fill ${icons[type]}" style="color: ${colors[type]}; font-size: 20px;"></i>
//             <div class="st-toast-content"><strong>${title}</strong><span>${message}</span></div>`;
        
//         toast.classList.add('visible');
//         clearTimeout(this._toastTimer);
//         this._toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
//     },

//     showModal(type, title, message, onConfirm = null) {
//         let overlay = document.getElementById('wwGoogleModalOverlay');
//         if (!overlay) {
//             overlay = document.createElement('div');
//             overlay.id = 'wwGoogleModalOverlay';
//             overlay.className = 'st-modal-overlay';
//             overlay.innerHTML = `
//                 <div class="st-modal-card">
//                     <div class="st-modal-icon-wrap" id="wwModalIconWrap"><i id="wwModalIcon"></i></div>
//                     <h3 id="wwModalTitle">Notice</h3><p id="wwModalMessage"></p>
//                     <br>
//                     <div class="st-modal-actions"><button type="button" id="wwModalCloseBtn" class="btn-primary" style="width: 100%; justify-content: center;">OK</button></div>
//                 </div>`;
//             document.body.appendChild(overlay);
//         }
//         const icons = {
//             success: { icon: 'ph-check-circle', bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
//             error: { icon: 'ph-x-circle', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
//             info: { icon: 'ph-google-logo', bg: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' },
//             warning: { icon: 'ph-warning-circle', bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }
//         };
//         const config = icons[type] || icons.info;
//         overlay.querySelector('#wwModalIconWrap').style.background = config.bg;
//         overlay.querySelector('#wwModalIconWrap').style.color = config.color;
//         overlay.querySelector('#wwModalIcon').className = `ph-fill ${config.icon}`;
//         overlay.querySelector('#wwModalTitle').textContent = title;
//         overlay.querySelector('#wwModalMessage').textContent = message;

//         const closeModal = () => { overlay.classList.remove('active'); if (onConfirm) onConfirm(); };
//         overlay.querySelector('#wwModalCloseBtn').onclick = closeModal;
//         overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
//         overlay.classList.add('active');
//     },

//     init() {
//         if (!document.getElementById('wwGoogleStyles')) {
//             const s = document.createElement('style');
//             s.id = 'wwGoogleStyles';
//             s.textContent = `.st-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;z-index:100000;opacity:0;visibility:hidden;transition:0.25s;} .st-modal-overlay.active{opacity:1;visibility:visible;} .st-modal-card{background:var(--bg-dashboard);border:1px solid var(--border-color);border-radius:24px;width:100%;max-width:360px;padding:28px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;transform:scale(0.92);transition:0.25s cubic-bezier(0.34,1.56,0.64,1);} .st-modal-overlay.active .st-modal-card{transform:scale(1);} .st-modal-icon-wrap{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:16px;} @keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .fa-spin { animation: fa-spin 1s linear infinite; }`;
//             document.head.appendChild(s);
//         }
//         this.accessToken = sessionStorage.getItem('ww_g_token');
//         this.updateUI();
//         if (typeof google !== 'undefined' && google.accounts) this.setupClient();
//         else window.addEventListener('load', () => { if (typeof google !== 'undefined') this.setupClient(); });
//     },

//     setupClient() {
//         this.tokenClient = google.accounts.oauth2.initTokenClient({
//             client_id: GOOGLE_CONFIG.clientId,
//             scope: GOOGLE_CONFIG.scopes,
//             callback: async (res) => {
//                 if (res && res.access_token) {
//                     this.accessToken = res.access_token;
//                     sessionStorage.setItem('ww_g_token', this.accessToken);
//                     await this.fetchUser();
//                     this.updateUI();
//                     this.notify('success', 'Connected', 'Google Drive linked successfully.');
                    
//                     // Auto-sync immediately if enabled
//                     if (localStorage.getItem('ww_auto_backup') === 'true') {
//                         this.saveToDrive(true);
//                     }
//                 }
//             }
//         });
//     },

//     signIn() {
//         if (this.accessToken) return this.notify('info', 'Already Connected', 'Drive is already linked.');
//         if (!this.tokenClient) return this.notify('error', 'Not Ready', 'Google Auth initializing...');
//         this.tokenClient.requestAccessToken({ prompt: 'consent' });
//     },

//     signOut() {
//         if (this.accessToken) google.accounts.oauth2.revoke(this.accessToken);
//         this.accessToken = null;
//         sessionStorage.removeItem('ww_g_token');
//         localStorage.removeItem('ww_user_avatar');
//         localStorage.removeItem('ww_google_user');
//         this.updateUI();
//         this.notify('info', 'Disconnected', 'Google Drive unlinked.');
//     },

//     async fetchUser() {
//         try {
//             const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${this.accessToken}` } });
//             const info = await res.json();
//             if (info.picture) localStorage.setItem('ww_user_avatar', info.picture);
//             if (info.name) localStorage.setItem('ww_google_user', info.name);
//         } catch (e) { console.error('Profile fetch failed'); }
//     },

//     updateUI() {
//         const isConnected = !!this.accessToken;
        
//         // Update avatars
//         const avatarUrl = localStorage.getItem('ww_user_avatar');
//         document.querySelectorAll('.user-avatar-target').forEach(el => {
//             if (avatarUrl) {
//                 if (el.id === 'mobileDriveBtn') el.style.borderColor = 'var(--border-color)';
//                 el.innerHTML = `<img src="${avatarUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
//             } else {
//                 if (el.id === 'mobileDriveBtn') { el.style.borderColor = 'transparent'; el.innerHTML = `<i class="ph ph-google-logo"></i>`; }
//                 else { el.innerHTML = `<i class="ph ph-user"></i>`; }
//             }
//         });

//         // Update Dashboard Sync Button
//         const syncBtn = document.getElementById('googleSyncBtn');
//         if (syncBtn) {
//             if (isConnected) {
//                 syncBtn.innerHTML = `<i class="ph-fill ph-check-circle" style="color:#10b981;"></i> Connected`;
//                 syncBtn.onclick = () => this.notify('info', 'Connected', 'Your drive is linked. Disable in settings to unlink.');
//             } else {
//                 syncBtn.innerHTML = `<i class="ph ph-google-logo"></i> Connect Drive`;
//                 syncBtn.onclick = () => this.signIn();
//             }
//         }

//         // Update Settings Buttons
//         const btns = document.querySelectorAll('.drive-btn-state');
//         btns.forEach(b => {
//             if (isConnected) {
//                 b.innerHTML = `<i class="ph-fill ph-check-circle" style="color:#10b981;"></i> Unlink Account`;
//                 b.onclick = () => this.signOut();
//             } else {
//                 b.innerHTML = `<i class="ph ph-google-logo"></i> Connect Drive`;
//                 b.onclick = () => this.signIn();
//             }
//         });
//     },

//     async saveToDrive(auto = false) {
//         if (!this.accessToken) return auto ? null : this.notify('warning', 'Sign In Required', 'Please connect Google Drive.', () => this.signIn());
        
//         const data = localStorage.getItem('financeTransactions') || '[]';
//         const fileContent = JSON.stringify(JSON.parse(data), null, 2);
        
//         // Visual Loading state on the cloud icons
//         const cloudIcons = document.querySelectorAll('.ph-cloud-arrow-up');
//         if (auto) cloudIcons.forEach(i => i.className = 'ph ph-spinner fa-spin');

//         try {
//             const s = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='wealthwise_data.json' and trashed=false`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
//             const sData = await s.json();
//             const existing = sData.files && sData.files[0];
//             const url = existing ? `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart` : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
//             const method = existing ? 'PATCH' : 'POST';
            
//             const boundary = 'foo_bar_baz';
//             const body = `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{"name":"wealthwise_data.json","mimeType":"application/json"}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${fileContent}\r\n--${boundary}--`;
            
//             const res = await fetch(url, { method, headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': `multipart/related; boundary=${boundary}` }, body });
            
//             if (auto) cloudIcons.forEach(i => i.className = 'ph ph-cloud-arrow-up');
            
//             if (res.ok && !auto) this.notify('success', 'Backup Successful', 'Transactions saved to Drive.');
//             if (res.ok && auto) console.log("Auto-Sync Complete");
//         } catch (e) { 
//             if (auto) cloudIcons.forEach(i => i.className = 'ph ph-cloud-arrow-up');
//             if (!auto) this.notify('error', 'Error', 'Backup failed. Please check connection.'); 
//         }
//     },

//     async loadFromDrive() {
//         if (!this.accessToken) return this.notify('warning', 'Sign In Required', 'Please connect Google Drive.', () => this.signIn());
//         try {
//             const s = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='wealthwise_data.json' and trashed=false`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
//             const sData = await s.json();
//             if (!sData.files || sData.files.length === 0) return this.notify('info', 'No Backup', 'No Wealthwise backup found on Drive.');
            
//             const res = await fetch(`https://www.googleapis.com/drive/v3/files/${sData.files[0].id}?alt=media`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
//             const data = await res.json();
//             if (Array.isArray(data)) {
//                 localStorage.setItem('financeTransactions', JSON.stringify(data));
//                 this.notify('success', 'Restored', 'Transactions restored from cloud.', () => window.location.reload());
//             }
//         } catch (e) { this.notify('error', 'Error', 'Failed to restore backup.'); }
//     }
// };

// document.addEventListener('DOMContentLoaded', () => WealthwiseGoogle.init());











// /**
//  * Wealthwise - Google Cloud Sync & Config Manager
//  * Coded for Easy Control & Smart Auto-Sync 😎
//  */

// const GOOGLE_CONFIG = {
//     clientId: '884057504637-lo16damkhhb55v1hmmmhrl9m2dm0p5rr.apps.googleusercontent.com', 
//     scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile',
//     fileName: 'wealthwise_data.json',
//     notifyMode: 'modal' // 'toast' or 'modal'
// };

// const WealthwiseGoogle = {
//     tokenClient: null,
//     accessToken: null,

//     // ==========================================
//     // 1. DATA MANAGER (Easy to control what gets saved/loaded)
//     // ==========================================
    
//     getAppState() {
//         // Default is CLOSED (false) for auto-backup unless user enabled it
//         return {
//             settings: {
//                 autoBackup: localStorage.getItem('ww_auto_backup') === 'true',
//                 autoTime: localStorage.getItem('ww_auto_time') !== 'false',
//                 currency: localStorage.getItem('currency') || '$',
//                 initialBalance: parseFloat(localStorage.getItem('initialBalance')) || 0,
//                 theme: localStorage.getItem('theme') || 'system'
//             },
//             transactions: JSON.parse(localStorage.getItem('financeTransactions')) || []
//         };
//     },

//     applyAppState(data) {
//         if (!data) return false;
        
//         // Backward compatibility
//         let txs = Array.isArray(data) ? data : (data.transactions || []);
//         let sets = data.settings || {};

//         // 1. Restore Transactions
//         localStorage.setItem('financeTransactions', JSON.stringify(txs));
        
//         // 2. Restore Settings from JSON
//         if (sets.autoBackup !== undefined) localStorage.setItem('ww_auto_backup', sets.autoBackup);
//         if (sets.autoTime !== undefined) localStorage.setItem('ww_auto_time', sets.autoTime);
//         if (sets.currency !== undefined) localStorage.setItem('currency', sets.currency);
//         if (sets.initialBalance !== undefined) localStorage.setItem('initialBalance', sets.initialBalance);
//         if (sets.theme !== undefined) localStorage.setItem('theme', sets.theme);

//         return true;
//     },

//     // ==========================================
//     // 2. GOOGLE DRIVE API SYNC LOGIC
//     // ==========================================

//     async saveToDrive(isAutoSync = false) {
//         if (!this.accessToken) {
//             if (!isAutoSync) this.notify('warning', 'Sign In Required', 'Please connect Google Drive.', () => this.signIn());
//             return;
//         }
        
//         const appState = this.getAppState();
//         const fileContent = JSON.stringify(appState, null, 2);
        
//         // UI Loading State
//         const cloudIcons = document.querySelectorAll('.ph-cloud-arrow-up');
//         if (isAutoSync) cloudIcons.forEach(i => i.className = 'ph ph-spinner fa-spin');

//         try {
//             const s = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${GOOGLE_CONFIG.fileName}' and trashed=false`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
//             const sData = await s.json();
//             const existing = sData.files && sData.files[0];
            
//             const url = existing 
//                 ? `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart` 
//                 : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
//             const method = existing ? 'PATCH' : 'POST';
            
//             const boundary = 'wealthwise_boundary_sync';
//             const body = `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{"name":"${GOOGLE_CONFIG.fileName}","mimeType":"application/json"}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${fileContent}\r\n--${boundary}--`;
            
//             const res = await fetch(url, { method, headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': `multipart/related; boundary=${boundary}` }, body });
            
//             if (isAutoSync) cloudIcons.forEach(i => i.className = 'ph ph-cloud-arrow-up');
//             if (res.ok && !isAutoSync) this.notify('success', 'Cloud Synced', 'Your portfolio and settings are safely backed up! 🚀');
//             if (res.ok && isAutoSync) console.log("Silent Auto-Backup Complete 😎");
//         } catch (e) { 
//             if (isAutoSync) cloudIcons.forEach(i => i.className = 'ph ph-cloud-arrow-up');
//             if (!isAutoSync) this.notify('error', 'Sync Failed', 'Could not reach Google Drive. Check your connection.'); 
//         }
//     },

//     async loadFromDrive(isAutoConnect = false) {
//         if (!this.accessToken) {
//             if (!isAutoConnect) this.signIn();
//             return;
//         }

//         try {
//             const s = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${GOOGLE_CONFIG.fileName}' and trashed=false`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
//             const sData = await s.json();
            
//             if (!sData.files || sData.files.length === 0) {
//                 console.log("No existing cloud data found. Creating initial backup...");
//                 this.saveToDrive(true);
//                 if (!isAutoConnect) this.notify('info', 'No Backup Found', 'Created a fresh cloud backup for you.');
//                 return;
//             }
            
//             const res = await fetch(`https://www.googleapis.com/drive/v3/files/${sData.files[0].id}?alt=media`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
//             const cloudData = await res.json();
            
//             const success = this.applyAppState(cloudData);
            
//             if (success) {
//                 if (!isAutoConnect) {
//                     this.notify('success', 'Data Restored', 'Your data and settings were successfully restored.', () => window.location.reload());
//                 } else {
//                     console.log("Auto-Restore on Connect complete. Reloading UI...");
//                     window.location.reload(); 
//                 }
//             }
//         } catch (e) { 
//             if (!isAutoConnect) this.notify('error', 'Error', 'Failed to retrieve cloud backup.'); 
//         }
//     },

//     // ==========================================
//     // 3. AUTHENTICATION & UI
//     // ==========================================

//     setupClient() {
//         this.tokenClient = google.accounts.oauth2.initTokenClient({
//             client_id: GOOGLE_CONFIG.clientId,
//             scope: GOOGLE_CONFIG.scopes,
//             callback: async (res) => {
//                 if (res && res.access_token) {
//                     this.accessToken = res.access_token;
//                     sessionStorage.setItem('ww_g_token', this.accessToken);
//                     await this.fetchUser();
//                     this.updateUI();
                    
//                     // AUTO-RESTORE MAGIC ON LOGIN
//                     this.notify('info', 'Syncing Account...', 'Fetching your smart portfolio from the cloud...');
//                     await this.loadFromDrive(true);
//                 }
//             }
//         });
//     },

//     signIn() {
//         if (this.accessToken) return this.notify('info', 'Already Connected', 'Drive is already linked.');
//         if (!this.tokenClient) return this.notify('error', 'Not Ready', 'Google Auth initializing...');
//         this.tokenClient.requestAccessToken({ prompt: 'consent' });
//     },

//     signOut() {
//         if (this.accessToken) google.accounts.oauth2.revoke(this.accessToken);
//         this.accessToken = null;
//         sessionStorage.removeItem('ww_g_token');
//         localStorage.removeItem('ww_user_avatar');
//         localStorage.removeItem('ww_google_user');
//         localStorage.setItem('ww_auto_backup', 'false');
        
//         this.updateUI();
//         this.notify('info', 'Disconnected', 'Google Drive unlinked.', () => window.location.reload());
//     },

//     async fetchUser() {
//         try {
//             const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${this.accessToken}` } });
//             const info = await res.json();
//             if (info.picture) localStorage.setItem('ww_user_avatar', info.picture);
//             if (info.name) localStorage.setItem('ww_google_user', info.name);
//         } catch (e) { console.error('Profile fetch failed'); }
//     },

//     updateUI() {
//         const isConnected = !!this.accessToken;
//         const avatarUrl = localStorage.getItem('ww_user_avatar');
        
//         document.querySelectorAll('.user-avatar-target').forEach(el => {
//             if (avatarUrl) {
//                 if (el.id === 'mobileDriveBtn') el.style.borderColor = 'var(--border-color)';
//                 el.innerHTML = `<img src="${avatarUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
//             } else {
//                 if (el.id === 'mobileDriveBtn') { el.style.borderColor = 'transparent'; el.innerHTML = `<i class="ph ph-google-logo"></i>`; }
//                 else { el.innerHTML = `<i class="ph ph-user"></i>`; }
//             }
//         });

//         const syncBtn = document.getElementById('googleSyncBtn');
//         if (syncBtn) {
//             if (isConnected) {
//                 syncBtn.innerHTML = `<i class="ph-fill ph-check-circle" style="color:#10b981;"></i> Connected`;
//                 syncBtn.onclick = () => this.notify('info', 'Connected', 'Your drive is linked. Disable in settings to unlink.');
//             } else {
//                 syncBtn.innerHTML = `<i class="ph ph-google-logo"></i> Connect Drive`;
//                 syncBtn.onclick = () => this.signIn();
//             }
//         }

//         document.querySelectorAll('.drive-btn-state').forEach(b => {
//             if (isConnected) {
//                 b.innerHTML = `<i class="ph-fill ph-check-circle" style="color:#10b981;"></i> Unlink Account`;
//                 b.onclick = () => this.signOut();
//             } else {
//                 b.innerHTML = `<i class="ph ph-google-logo"></i> Connect Drive`;
//                 b.onclick = () => this.signIn();
//             }
//         });

//         // 🟢 Update Sidebar Connect Button (Turns Green + Says "Connected")
//         const sidebarGoogleBtn = document.getElementById('sidebarGoogleBtn');
//         if (sidebarGoogleBtn) {
//             if (isConnected) {
//                 sidebarGoogleBtn.innerHTML = `<i class="ph-fill ph-check-circle"></i> Connected`;
//                 sidebarGoogleBtn.style.color = '#10b981'; 
//                 sidebarGoogleBtn.onclick = () => this.notify('info', 'Connected', 'Your account is syncing to the cloud.');
//             } else {
//                 sidebarGoogleBtn.innerHTML = `Connect Drive`;
//                 sidebarGoogleBtn.style.color = 'var(--accent-blue)'; 
//                 sidebarGoogleBtn.onclick = () => this.signIn();
//             }
//         }
//     },

//     // ==========================================
//     // 4. ALERTS & MODALS ENGINE
//     // ==========================================

//     notify(type, title, message, onConfirm = null) {
//         if (GOOGLE_CONFIG.notifyMode === 'toast') this.showToast(type, title, message);
//         else this.showModal(type, title, message, onConfirm);
//     },

//     showToast(type, title, message) {
//         let toast = document.getElementById('wwGoogleToast');
//         if (!toast) {
//             toast = document.createElement('div');
//             toast.id = 'wwGoogleToast';
//             toast.className = 'st-google-toast';
//             document.body.appendChild(toast);
//         }
//         const icons = { success: 'ph-check-circle', warning: 'ph-warning-circle', error: 'ph-x-circle', info: 'ph-info' };
//         const colors = { success: '#10b981', warning: '#eab308', error: '#ef4444', info: '#0ea5e9' };
        
//         toast.innerHTML = `<i class="ph-fill ${icons[type]}" style="color: ${colors[type]}; font-size: 20px;"></i>
//             <div class="st-toast-content"><strong>${title}</strong><span>${message}</span></div>`;
        
//         toast.classList.add('visible');
//         clearTimeout(this._toastTimer);
//         this._toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
//     },

//     showModal(type, title, message, onConfirm = null) {
//         let overlay = document.getElementById('wwGoogleModalOverlay');
//         if (!overlay) {
//             overlay = document.createElement('div');
//             overlay.id = 'wwGoogleModalOverlay';
//             overlay.className = 'st-modal-overlay';
//             overlay.innerHTML = `
//                 <div class="st-modal-card">
//                     <div class="st-modal-icon-wrap" id="wwModalIconWrap"><i id="wwModalIcon"></i></div>
//                     <h3 id="wwModalTitle">Notice</h3><p id="wwModalMessage"></p>
//                     <br>
//                     <div class="st-modal-actions"><button type="button" id="wwModalCloseBtn" class="btn-primary" style="width: 100%; justify-content: center;">Got it</button></div>
//                 </div>`;
//             document.body.appendChild(overlay);
//         }
//         const icons = {
//             success: { icon: 'ph-check-circle', bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
//             error: { icon: 'ph-x-circle', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
//             info: { icon: 'ph-cloud-arrow-down', bg: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' },
//             warning: { icon: 'ph-warning-circle', bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }
//         };
//         const config = icons[type] || icons.info;
//         overlay.querySelector('#wwModalIconWrap').style.background = config.bg;
//         overlay.querySelector('#wwModalIconWrap').style.color = config.color;
//         overlay.querySelector('#wwModalIcon').className = `ph-fill ${config.icon}`;
//         overlay.querySelector('#wwModalTitle').textContent = title;
//         overlay.querySelector('#wwModalMessage').textContent = message;

//         const closeModal = () => { overlay.classList.remove('active'); if (onConfirm) onConfirm(); };
//         overlay.querySelector('#wwModalCloseBtn').onclick = closeModal;
//         overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
//         overlay.classList.add('active');
//     },

//     init() {
//         if (!document.getElementById('wwGoogleStyles')) {
//             const s = document.createElement('style');
//             s.id = 'wwGoogleStyles';
//             s.textContent = `.st-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;z-index:100000;opacity:0;visibility:hidden;transition:0.25s;} .st-modal-overlay.active{opacity:1;visibility:visible;} .st-modal-card{background:var(--bg-dashboard);border:1px solid var(--border-color);border-radius:24px;width:100%;max-width:360px;padding:28px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;transform:scale(0.92);transition:0.25s cubic-bezier(0.34,1.56,0.64,1);} .st-modal-overlay.active .st-modal-card{transform:scale(1);} .st-modal-icon-wrap{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:16px;} @keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .fa-spin { animation: fa-spin 1s linear infinite; }`;
//             document.head.appendChild(s);
//         }
//         this.accessToken = sessionStorage.getItem('ww_g_token');
//         this.updateUI();
//         if (typeof google !== 'undefined' && google.accounts) this.setupClient();
//         else window.addEventListener('load', () => { if (typeof google !== 'undefined') this.setupClient(); });
//     }
// };

// document.addEventListener('DOMContentLoaded', () => WealthwiseGoogle.init());

























// /**
//  * Wealthwise - Google Cloud Sync & Config Manager
//  * Coded for Easy Control & Smart Auto-Sync 😎
//  */

// // ==========================================
// // ⚙️ EASY CONFIGURATION (التحكم السريع في النصوص)
// // ==========================================
// const GOOGLE_CONFIG = {
//     clientId: '884057504637-lo16damkhhb55v1hmmmhrl9m2dm0p5rr.apps.googleusercontent.com', 
//     scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile',
//     fileName: 'wealthwise_data.json',
//     notifyMode: 'modal', 

//     // 👇 هنا تقدر تتحكم في كل كلمة بتظهر للمستخدم بسهولة 👇
//     texts: {
//         // --- 1. زراير الشريط الجانبي (Sidebar) ---
//         btnSidebarConnect: "Connect Drive",
//         btnSidebarConnected: "Connected",

//         // --- 2. زراير الهيدر العلوي (Desktop Header) ---
//         btnHeaderConnect: "Connect Drive",
//         btnHeaderConnected: "Connected",

//         // --- 3. زراير صفحة الإعدادات (Settings Page) ---
//         btnSettingsConnect: "Connect Drive",
//         btnSettingsDisconnect: "Unlink Account", // ده اللي بيفصل الحساب

//         // --- 4. قايمة الموبايل (Mobile Dropdown) ---
//         textMobileNotConnected: "Not Connected",
//         textMobileConnected: "Connected",
//         btnMobileConnect: "Connect",
//         btnMobileDisconnect: "Disconnect",       // ده اللي بيفصل الحساب

//         // --- 🔵 نافذة المعلومات (لما تدوس على زرار Connected في الـ Sidebar) ---
//         infoConnectedTitle: "Account Connected",
//         infoConnectedMessage: "Your Google Drive is securely linked. To disconnect, please go to the Settings page.",

//         // --- 🔴 نافذة تأكيد الفصل (Are you sure? Modal) ---
//         disconnectTitle: "Disconnect Drive?",
//         disconnectMessage: "Are you sure you want to disconnect? Your financial data will no longer sync to the cloud.",
//         btnCancel: "Cancel",
//         btnConfirmDisconnect: "Disconnect",

//         // --- ✨ نصوص التنبيهات (Success & Alerts) ---
//         connectSuccessTitle: "Connected",
//         connectSuccessMessage: "Google Drive linked successfully. Your portfolio is syncing!",
//         syncSuccessTitle: "Cloud Synced",
//         syncSuccessMessage: "Your portfolio and settings are safely backed up! 🚀",
//         restoreSuccessTitle: "Data Restored",
//         restoreSuccessMessage: "Your data and settings were successfully restored.",

//         // --- ⚠️ الأخطاء (Errors) ---
//         errorTitle: "Sync Error",
//         errorSyncMsg: "Could not reach Google Drive. Check your connection.",
//         errorRestoreMsg: "Failed to retrieve cloud backup."
//     }
// };

// const WealthwiseGoogle = {
//     tokenClient: null,
//     accessToken: null,

//     // ==========================================
//     // 1. DATA MANAGER
//     // ==========================================
    
//     getAppState() {
//         return {
//             settings: {
//                 autoBackup: localStorage.getItem('ww_auto_backup') === 'true',
//                 autoTime: localStorage.getItem('ww_auto_time') !== 'false',
//                 currency: localStorage.getItem('currency') || '$',
//                 initialBalance: parseFloat(localStorage.getItem('initialBalance')) || 0,
//                 theme: localStorage.getItem('theme') || 'system'
//             },
//             transactions: JSON.parse(localStorage.getItem('financeTransactions')) || []
//         };
//     },

//     applyAppState(data) {
//         if (!data) return false;
        
//         let txs = Array.isArray(data) ? data : (data.transactions || []);
//         let sets = data.settings || {};

//         localStorage.setItem('financeTransactions', JSON.stringify(txs));
        
//         if (sets.autoBackup !== undefined) localStorage.setItem('ww_auto_backup', sets.autoBackup);
//         if (sets.autoTime !== undefined) localStorage.setItem('ww_auto_time', sets.autoTime);
//         if (sets.currency !== undefined) localStorage.setItem('currency', sets.currency);
//         if (sets.initialBalance !== undefined) localStorage.setItem('initialBalance', sets.initialBalance);
//         if (sets.theme !== undefined) localStorage.setItem('theme', sets.theme);

//         return true;
//     },

//     // ==========================================
//     // 2. GOOGLE DRIVE API SYNC LOGIC
//     // ==========================================

//     async saveToDrive(isAutoSync = false) {
//         if (!this.accessToken) {
//             if (!isAutoSync) this.notify('warning', 'Sign In Required', 'Please connect Google Drive.', () => this.signIn());
//             return;
//         }
        
//         const appState = this.getAppState();
//         const fileContent = JSON.stringify(appState, null, 2);
        
//         const cloudIcons = document.querySelectorAll('.ph-cloud-arrow-up');
//         if (isAutoSync) cloudIcons.forEach(i => i.className = 'ph ph-spinner fa-spin');

//         try {
//             const s = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${GOOGLE_CONFIG.fileName}' and trashed=false`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
//             const sData = await s.json();
//             const existing = sData.files && sData.files[0];
            
//             const url = existing 
//                 ? `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart` 
//                 : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
//             const method = existing ? 'PATCH' : 'POST';
            
//             const boundary = 'wealthwise_boundary_sync';
//             const body = `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{"name":"${GOOGLE_CONFIG.fileName}","mimeType":"application/json"}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${fileContent}\r\n--${boundary}--`;
            
//             const res = await fetch(url, { method, headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': `multipart/related; boundary=${boundary}` }, body });
            
//             if (isAutoSync) cloudIcons.forEach(i => i.className = 'ph ph-cloud-arrow-up');
//             if (res.ok && !isAutoSync) this.notify('success', GOOGLE_CONFIG.texts.syncSuccessTitle, GOOGLE_CONFIG.texts.syncSuccessMessage);
//             if (res.ok && isAutoSync) console.log("Silent Auto-Backup Complete 😎");
//         } catch (e) { 
//             if (isAutoSync) cloudIcons.forEach(i => i.className = 'ph ph-cloud-arrow-up');
//             if (!isAutoSync) this.notify('error', GOOGLE_CONFIG.texts.errorTitle, GOOGLE_CONFIG.texts.errorSyncMsg); 
//         }
//     },

//     async loadFromDrive(isAutoConnect = false) {
//         if (!this.accessToken) {
//             if (!isAutoConnect) this.signIn();
//             return;
//         }

//         try {
//             const s = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${GOOGLE_CONFIG.fileName}' and trashed=false`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
//             const sData = await s.json();
            
//             if (!sData.files || sData.files.length === 0) {
//                 console.log("No existing cloud data found. Creating initial backup...");
//                 this.saveToDrive(true);
//                 if (!isAutoConnect) this.notify('info', 'No Backup Found', 'Created a fresh cloud backup for you.');
//                 return;
//             }
            
//             const res = await fetch(`https://www.googleapis.com/drive/v3/files/${sData.files[0].id}?alt=media`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
//             const cloudData = await res.json();
            
//             const success = this.applyAppState(cloudData);
            
//             if (success) {
//                 if (!isAutoConnect) {
//                     this.notify('success', GOOGLE_CONFIG.texts.restoreSuccessTitle, GOOGLE_CONFIG.texts.restoreSuccessMessage, () => window.location.reload());
//                 } else {
//                     console.log("Auto-Restore on Connect complete. Reloading UI...");
//                     window.location.reload(); 
//                 }
//             }
//         } catch (e) { 
//             if (!isAutoConnect) this.notify('error', GOOGLE_CONFIG.texts.errorTitle, GOOGLE_CONFIG.texts.errorRestoreMsg); 
//         }
//     },

//     // ==========================================
//     // 3. AUTHENTICATION & UI
//     // ==========================================

//     setupClient() {
//         this.tokenClient = google.accounts.oauth2.initTokenClient({
//             client_id: GOOGLE_CONFIG.clientId,
//             scope: GOOGLE_CONFIG.scopes,
//             callback: async (res) => {
//                 if (res && res.access_token) {
//                     this.accessToken = res.access_token;
//                     sessionStorage.setItem('ww_g_token', this.accessToken);
//                     await this.fetchUser();
//                     this.updateUI();
                    
//                     this.notify('success', GOOGLE_CONFIG.texts.connectSuccessTitle, GOOGLE_CONFIG.texts.connectSuccessMessage);
//                     await this.loadFromDrive(true);
//                 }
//             }
//         });
//     },

//     signIn() {
//         if (this.accessToken) return this.notify('info', GOOGLE_CONFIG.texts.infoConnectedTitle, GOOGLE_CONFIG.texts.infoConnectedMessage);
//         if (!this.tokenClient) return this.notify('error', 'Not Ready', 'Google Auth initializing...');
//         this.tokenClient.requestAccessToken({ prompt: 'consent' });
//     },

//     // 🔴 بيفتح رسالة التنبيه إنك متأكد عايز تفصل الحساب
//     signOut() {
//         this.showConfirmModal(
//             GOOGLE_CONFIG.texts.disconnectTitle,
//             GOOGLE_CONFIG.texts.disconnectMessage,
//             () => this._executeSignOut()
//         );
//     },

//     _executeSignOut() {
//         if (this.accessToken) google.accounts.oauth2.revoke(this.accessToken);
//         this.accessToken = null;
//         sessionStorage.removeItem('ww_g_token');
//         localStorage.removeItem('ww_user_avatar');
//         localStorage.removeItem('ww_google_user');
//         localStorage.setItem('ww_auto_backup', 'false'); 
        
//         this.updateUI();
//         this.notify('info', 'Disconnected', 'Google Drive unlinked successfully.', () => window.location.reload());
//     },

//     async fetchUser() {
//         try {
//             const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${this.accessToken}` } });
//             const info = await res.json();
//             if (info.picture) localStorage.setItem('ww_user_avatar', info.picture);
//             if (info.name) localStorage.setItem('ww_google_user', info.name);
//         } catch (e) { console.error('Profile fetch failed'); }
//     },

//     updateUI() {
//         const isConnected = !!this.accessToken;
//         const avatarUrl = localStorage.getItem('ww_user_avatar');
        
//         document.querySelectorAll('.user-avatar-target').forEach(el => {
//             if (avatarUrl) {
//                 if (el.id === 'mobileDriveBtn') el.style.borderColor = 'var(--border-color)';
//                 el.innerHTML = `<img src="${avatarUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
//             } else {
//                 if (el.id === 'mobileDriveBtn') { el.style.borderColor = 'transparent'; el.innerHTML = `<i class="ph ph-google-logo"></i>`; }
//                 else { el.innerHTML = `<i class="ph ph-user"></i>`; }
//             }
//         });

//         // 🟢 1. Update Desktop Top Sync Button (Header)
//         const syncBtn = document.getElementById('googleSyncBtn');
//         if (syncBtn) {
//             if (isConnected) {
//                 syncBtn.innerHTML = `<i class="ph-fill ph-check-circle" style="color:#10b981;"></i> ${GOOGLE_CONFIG.texts.btnHeaderConnected}`;
//                 // 🔵 بيعرض رسالة معلومات (مش بيفصل الحساب)
//                 syncBtn.onclick = () => this.notify('info', GOOGLE_CONFIG.texts.infoConnectedTitle, GOOGLE_CONFIG.texts.infoConnectedMessage); 
//             } else {
//                 syncBtn.innerHTML = `<i class="ph ph-google-logo"></i> ${GOOGLE_CONFIG.texts.btnHeaderConnect}`;
//                 syncBtn.onclick = () => this.signIn();
//             }
//         }

//         // 🟢 2. Update Sidebar Connect Button
//         const sidebarGoogleBtn = document.getElementById('sidebarGoogleBtn');
//         if (sidebarGoogleBtn) {
//             if (isConnected) {
//                 sidebarGoogleBtn.innerHTML = `<i class="ph-fill ph-check-circle"></i> ${GOOGLE_CONFIG.texts.btnSidebarConnected}`;
//                 sidebarGoogleBtn.style.color = '#10b981'; 
//                 // 🔵 بيعرض رسالة معلومات (مش بيفصل الحساب)
//                 sidebarGoogleBtn.onclick = () => this.notify('info', GOOGLE_CONFIG.texts.infoConnectedTitle, GOOGLE_CONFIG.texts.infoConnectedMessage); 
//             } else {
//                 sidebarGoogleBtn.innerHTML = `${GOOGLE_CONFIG.texts.btnSidebarConnect}`;
//                 sidebarGoogleBtn.style.color = 'var(--accent-blue)'; 
//                 sidebarGoogleBtn.onclick = () => this.signIn();
//             }
//         }

//         // 🔴 3. Update Settings Connected Profile Button (زرار الإعدادات)
//         document.querySelectorAll('.drive-btn-state').forEach(b => {
//             if (isConnected) {
//                 b.innerHTML = `<i class="ph-fill ph-check-circle" style="color:#10b981;"></i> ${GOOGLE_CONFIG.texts.btnSettingsDisconnect}`;
//                 // 🔴 ده اللي بيفصل الحساب وبيجيب رسالة التأكيد
//                 b.onclick = () => this.signOut();
//             } else {
//                 b.innerHTML = `<i class="ph ph-google-logo"></i> ${GOOGLE_CONFIG.texts.btnSettingsConnect}`;
//                 b.onclick = () => this.signIn();
//             }
//         });

//         // 🔴 4. Update Mobile Dropdown Header (قايمة الموبايل)
//         const mobileDriveAuthBtn = document.getElementById('mobileDriveAuthBtn');
//         const mobileDriveStatus = document.getElementById('mobileDriveStatus');
//         if (mobileDriveAuthBtn && mobileDriveStatus) {
//             if (isConnected) {
//                 mobileDriveStatus.innerHTML = `<i class="ph-fill ph-check-circle" style="color: #10b981;"></i> ${GOOGLE_CONFIG.texts.textMobileConnected}`;
//                 mobileDriveAuthBtn.innerHTML = `<i class="ph ph-link-break"></i> ${GOOGLE_CONFIG.texts.btnMobileDisconnect}`;
//                 // 🔴 ده اللي بيفصل الحساب وبيجيب رسالة التأكيد
//                 mobileDriveAuthBtn.onclick = (e) => { e.preventDefault(); this.signOut(); };
//             } else {
//                 mobileDriveStatus.innerHTML = `<i class="ph ph-warning-circle" style="color: #eab308;"></i> ${GOOGLE_CONFIG.texts.textMobileNotConnected}`;
//                 mobileDriveAuthBtn.innerHTML = `<i class="ph ph-link"></i> ${GOOGLE_CONFIG.texts.btnMobileConnect}`;
//                 mobileDriveAuthBtn.onclick = (e) => { e.preventDefault(); this.signIn(); };
//             }
//         }
//     },

//     // ==========================================
//     // 4. ALERTS & MODALS ENGINE
//     // ==========================================

//     notify(type, title, message, onConfirm = null) {
//         if (GOOGLE_CONFIG.notifyMode === 'toast') this.showToast(type, title, message);
//         else this.showModal(type, title, message, onConfirm);
//     },

//     showToast(type, title, message) {
//         let toast = document.getElementById('wwGoogleToast');
//         if (!toast) {
//             toast = document.createElement('div');
//             toast.id = 'wwGoogleToast';
//             toast.className = 'st-google-toast';
//             document.body.appendChild(toast);
//         }
//         const icons = { success: 'ph-check-circle', warning: 'ph-warning-circle', error: 'ph-x-circle', info: 'ph-info' };
//         const colors = { success: '#10b981', warning: '#eab308', error: '#ef4444', info: '#0ea5e9' };
        
//         toast.innerHTML = `<i class="ph-fill ${icons[type]}" style="color: ${colors[type]}; font-size: 20px;"></i>
//             <div class="st-toast-content"><strong>${title}</strong><span>${message}</span></div>`;
        
//         toast.classList.add('visible');
//         clearTimeout(this._toastTimer);
//         this._toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
//     },

//     showModal(type, title, message, onConfirm = null) {
//         let overlay = document.getElementById('wwGoogleModalOverlay');
//         if (!overlay) {
//             overlay = document.createElement('div');
//             overlay.id = 'wwGoogleModalOverlay';
//             overlay.className = 'st-modal-overlay';
//             overlay.innerHTML = `
//                 <div class="st-modal-card">
//                     <div class="st-modal-icon-wrap" id="wwModalIconWrap"><i id="wwModalIcon"></i></div>
//                     <h3 id="wwModalTitle">Notice</h3><p id="wwModalMessage"></p>
//                     <br>
//                     <div class="st-modal-actions" style="width: 100%;"><button type="button" id="wwModalCloseBtn" class="btn-primary" style="width: 100%; justify-content: center;">Got it</button></div>
//                 </div>`;
//             document.body.appendChild(overlay);
//         }
//         const icons = {
//             success: { icon: 'ph-check-circle', bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
//             error: { icon: 'ph-x-circle', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
//             info: { icon: 'ph-cloud-arrow-down', bg: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' },
//             warning: { icon: 'ph-warning-circle', bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }
//         };
//         const config = icons[type] || icons.info;
//         overlay.querySelector('#wwModalIconWrap').style.background = config.bg;
//         overlay.querySelector('#wwModalIconWrap').style.color = config.color;
//         overlay.querySelector('#wwModalIcon').className = `ph-fill ${config.icon}`;
//         overlay.querySelector('#wwModalTitle').textContent = title;
//         overlay.querySelector('#wwModalMessage').textContent = message;

//         const closeModal = () => { overlay.classList.remove('active'); if (onConfirm) onConfirm(); };
//         overlay.querySelector('#wwModalCloseBtn').onclick = closeModal;
//         overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
//         overlay.classList.add('active');
//     },

//     // 🔴 نافذة التأكيد (Disconnect Modal)
//     showConfirmModal(title, message, onConfirm) {
//         let overlay = document.getElementById('wwGoogleConfirmOverlay');
//         if (!overlay) {
//             overlay = document.createElement('div');
//             overlay.id = 'wwGoogleConfirmOverlay';
//             overlay.className = 'st-modal-overlay';
//             overlay.innerHTML = `
//                 <div class="st-modal-card" style="padding: 32px 24px;">
//                     <div class="st-modal-icon-wrap" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 16px;">
//                         <i class="ph-fill ph-warning-circle"></i>
//                     </div>
//                     <h3 id="wwConfirmTitle" style="font-size: 20px; font-weight: 700; margin-bottom: 8px;"></h3>
//                     <p id="wwConfirmMessage" style="color: var(--text-muted); font-size: 14px; line-height: 1.5; margin-bottom: 24px;"></p>
//                     <div style="display: flex; gap: 12px; width: 100%;">
//                         <button type="button" id="wwConfirmCancelBtn" class="btn-outline" style="flex: 1; justify-content: center; padding: 12px;"></button>
//                         <button type="button" id="wwConfirmProceedBtn" class="btn-primary" style="flex: 1; justify-content: center; padding: 12px; background: #ef4444; color: #ffffff; border: none;"></button>
//                     </div>
//                 </div>`;
//             document.body.appendChild(overlay);
//         }
        
//         overlay.querySelector('#wwConfirmTitle').textContent = title;
//         overlay.querySelector('#wwConfirmMessage').textContent = message;

//         // Apply Button Texts from CONFIG
//         overlay.querySelector('#wwConfirmCancelBtn').textContent = GOOGLE_CONFIG.texts.btnCancel;
//         overlay.querySelector('#wwConfirmProceedBtn').textContent = GOOGLE_CONFIG.texts.btnConfirmDisconnect;

//         const closeConfirm = () => { overlay.classList.remove('active'); };
        
//         overlay.querySelector('#wwConfirmCancelBtn').onclick = closeConfirm;
//         overlay.querySelector('#wwConfirmProceedBtn').onclick = () => {
//             closeConfirm();
//             if (onConfirm) onConfirm();
//         };
//         overlay.onclick = (e) => { if (e.target === overlay) closeConfirm(); };
        
//         setTimeout(() => overlay.classList.add('active'), 10);
//     },

//     init() {
//         if (!document.getElementById('wwGoogleStyles')) {
//             const s = document.createElement('style');
//             s.id = 'wwGoogleStyles';
//             s.textContent = `.st-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;z-index:100000;opacity:0;visibility:hidden;transition:0.25s;} .st-modal-overlay.active{opacity:1;visibility:visible;} .st-modal-card{background:var(--bg-dashboard);border:1px solid var(--border-color);border-radius:24px;width:100%;max-width:360px;padding:28px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;transform:scale(0.92);transition:0.25s cubic-bezier(0.34,1.56,0.64,1);} .st-modal-overlay.active .st-modal-card{transform:scale(1);} .st-modal-icon-wrap{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:16px;} @keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .fa-spin { animation: fa-spin 1s linear infinite; }`;
//             document.head.appendChild(s);
//         }
//         this.accessToken = sessionStorage.getItem('ww_g_token');
//         this.updateUI();
//         if (typeof google !== 'undefined' && google.accounts) this.setupClient();
//         else window.addEventListener('load', () => { if (typeof google !== 'undefined') this.setupClient(); });
//     }
// };

// document.addEventListener('DOMContentLoaded', () => WealthwiseGoogle.init());





















/**
 * Wealthwise - Google Cloud Sync & Config Manager
 * Manual Sync Edition (Auto-Restore & Auto-Backup Disabled)
 */

const GOOGLE_CONFIG = {
    clientId: '884057504637-lo16damkhhb55v1hmmmhrl9m2dm0p5rr.apps.googleusercontent.com', 
    scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile',
    fileName: 'wealthwise_data.json',
    notifyMode: 'modal', 

    texts: {
        btnSidebarConnect: "Connect Drive",
        btnSidebarConnected: "Connected",
        btnHeaderConnect: "Connect Drive",
        btnHeaderConnected: "Connected",
        btnSettingsConnect: "Connect Drive",
        btnSettingsDisconnect: "Unlink Account",
        textMobileNotConnected: "Not Connected",
        textMobileConnected: "Connected",
        btnMobileConnect: "Connect",
        btnMobileDisconnect: "Disconnect",
        infoConnectedTitle: "Account Connected",
        infoConnectedMessage: "Your Google Drive is linked. Use the Backup or Restore buttons anytime to sync manually.",
        disconnectTitle: "Disconnect Drive?",
        disconnectMessage: "Are you sure you want to disconnect your Google Drive account?",
        btnCancel: "Cancel",
        btnConfirmDisconnect: "Disconnect",
        connectSuccessTitle: "Connected",
        connectSuccessMessage: "Google Drive linked! Auto-restore is disabled; use Backup/Restore buttons manually.",
        syncSuccessTitle: "Cloud Synced",
        syncSuccessMessage: "Your portfolio and settings are safely backed up! 🚀",
        restoreSuccessTitle: "Data Restored",
        restoreSuccessMessage: "Your data and settings were successfully restored.",
        errorTitle: "Sync Error",
        errorSyncMsg: "Could not reach Google Drive. Check your connection.",
        errorRestoreMsg: "Failed to retrieve cloud backup."
    }
};

const WealthwiseGoogle = {
    tokenClient: null,
    accessToken: null,

    getAppState() {
        return {
            settings: {
                // autoBackup disabled by default
                autoBackup: false,
                autoTime: localStorage.getItem('ww_auto_time') !== 'false',
                currency: localStorage.getItem('currency') || '$',
                initialBalance: parseFloat(localStorage.getItem('initialBalance')) || 0,
                monthlyBudget: parseFloat(localStorage.getItem('monthlyBudget')) || 0,
                theme: localStorage.getItem('theme') || 'system'
            },
            transactions: JSON.parse(localStorage.getItem('financeTransactions')) || []
        };
    },

    applyAppState(data) {
        if (!data) return false;
        
        let txs = Array.isArray(data) ? data : (data.transactions || []);
        let sets = data.settings || {};

        localStorage.setItem('financeTransactions', JSON.stringify(txs));
        
        if (sets.autoTime !== undefined) localStorage.setItem('ww_auto_time', sets.autoTime);
        if (sets.currency !== undefined) localStorage.setItem('currency', sets.currency);
        if (sets.initialBalance !== undefined) localStorage.setItem('initialBalance', sets.initialBalance);
        if (sets.monthlyBudget !== undefined) localStorage.setItem('monthlyBudget', sets.monthlyBudget);
        if (sets.theme !== undefined) localStorage.setItem('theme', sets.theme);

        return true;
    },

    async saveToDrive(isAutoSync = false) {
        // AUTO-BACKUP DISABLED: Ignore silent background calls
        if (isAutoSync) {
            // console.log("Auto-backup is disabled.");
            return;
        }

        if (!this.accessToken) {
            this.notify('warning', 'Sign In Required', 'Please connect Google Drive first.', () => this.signIn());
            return;
        }
        
        const appState = this.getAppState();
        const fileContent = JSON.stringify(appState, null, 2);
        
        const cloudIcons = document.querySelectorAll('.ph-cloud-arrow-up');
        cloudIcons.forEach(i => i.className = 'ph ph-spinner fa-spin');

        try {
            const s = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${GOOGLE_CONFIG.fileName}' and trashed=false`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
            const sData = await s.json();
            const existing = sData.files && sData.files[0];
            
            const url = existing 
                ? `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart` 
                : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
            const method = existing ? 'PATCH' : 'POST';
            
            const boundary = 'wealthwise_boundary_sync';
            const body = `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{"name":"${GOOGLE_CONFIG.fileName}","mimeType":"application/json"}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${fileContent}\r\n--${boundary}--`;
            
            const res = await fetch(url, { method, headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': `multipart/related; boundary=${boundary}` }, body });
            
            cloudIcons.forEach(i => i.className = 'ph ph-cloud-arrow-up');
            if (res.ok) this.notify('success', GOOGLE_CONFIG.texts.syncSuccessTitle, GOOGLE_CONFIG.texts.syncSuccessMessage);
        } catch (e) { 
            cloudIcons.forEach(i => i.className = 'ph ph-cloud-arrow-up');
            this.notify('error', GOOGLE_CONFIG.texts.errorTitle, GOOGLE_CONFIG.texts.errorSyncMsg); 
        }
    },

    async loadFromDrive(isAutoConnect = false) {
        // AUTO-RESTORE DISABLED: Only run when user explicitly clicks Restore
        if (isAutoConnect) {
            // console.log("Auto-restore on connect is disabled.");
            return;
        }

        if (!this.accessToken) {
            this.notify('warning', 'Sign In Required', 'Please connect Google Drive first.', () => this.signIn());
            return;
        }

        try {
            const s = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${GOOGLE_CONFIG.fileName}' and trashed=false`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
            const sData = await s.json();
            
            if (!sData.files || sData.files.length === 0) {
                this.notify('info', 'No Backup Found', 'No backup file was found on your Google Drive.');
                return;
            }
            
            const res = await fetch(`https://www.googleapis.com/drive/v3/files/${sData.files[0].id}?alt=media`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
            const cloudData = await res.json();
            
            const success = this.applyAppState(cloudData);
            if (success) {
                this.notify('success', GOOGLE_CONFIG.texts.restoreSuccessTitle, GOOGLE_CONFIG.texts.restoreSuccessMessage, () => window.location.reload());
            }
        } catch (e) { 
            this.notify('error', GOOGLE_CONFIG.texts.errorTitle, GOOGLE_CONFIG.texts.errorRestoreMsg); 
        }
    },

    setupClient() {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CONFIG.clientId,
            scope: GOOGLE_CONFIG.scopes,
            callback: async (res) => {
                if (res && res.access_token) {
                    this.accessToken = res.access_token;
                    sessionStorage.setItem('ww_g_token', this.accessToken);
                    await this.fetchUser();
                    this.updateUI();
                    
                    this.notify('success', GOOGLE_CONFIG.texts.connectSuccessTitle, GOOGLE_CONFIG.texts.connectSuccessMessage);
                    // AUTO-RESTORE & AUTO-BACKUP DISABLED ON LOGIN:
                    // await this.loadFromDrive(true);
                }
            }
        });
    },

    signIn() {
        if (this.accessToken) return this.notify('info', GOOGLE_CONFIG.texts.infoConnectedTitle, GOOGLE_CONFIG.texts.infoConnectedMessage);
        if (!this.tokenClient) return this.notify('error', 'Not Ready', 'Google Auth initializing...');
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
    },

    signOut() {
        this.showConfirmModal(
            GOOGLE_CONFIG.texts.disconnectTitle,
            GOOGLE_CONFIG.texts.disconnectMessage,
            () => this._executeSignOut()
        );
    },

    _executeSignOut() {
        if (this.accessToken) google.accounts.oauth2.revoke(this.accessToken);
        this.accessToken = null;
        sessionStorage.removeItem('ww_g_token');
        localStorage.removeItem('ww_user_avatar');
        localStorage.removeItem('ww_google_user');
        localStorage.setItem('ww_auto_backup', 'false'); 
        
        this.updateUI();
        this.notify('info', 'Disconnected', 'Google Drive unlinked successfully.', () => window.location.reload());
    },

    async fetchUser() {
        try {
            const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${this.accessToken}` } });
            const info = await res.json();
            if (info.picture) localStorage.setItem('ww_user_avatar', info.picture);
            if (info.name) localStorage.setItem('ww_google_user', info.name);
        } catch (e) { console.error('Profile fetch failed'); }
    },

    updateUI() {
        const isConnected = !!this.accessToken;
        const avatarUrl = localStorage.getItem('ww_user_avatar');
        
        document.querySelectorAll('.user-avatar-target').forEach(el => {
            if (avatarUrl) {
                if (el.id === 'mobileDriveBtn') el.style.borderColor = 'var(--border-color)';
                el.innerHTML = `<img src="${avatarUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                if (el.id === 'mobileDriveBtn') { el.style.borderColor = 'transparent'; el.innerHTML = `<i class="ph ph-google-logo"></i>`; }
                else { el.innerHTML = `<i class="ph ph-user"></i>`; }
            }
        });

        const syncBtn = document.getElementById('googleSyncBtn');
        if (syncBtn) {
            if (isConnected) {
                syncBtn.innerHTML = `<i class="ph-fill ph-check-circle" style="color:#10b981;"></i> ${GOOGLE_CONFIG.texts.btnHeaderConnected}`;
                syncBtn.onclick = () => this.notify('info', GOOGLE_CONFIG.texts.infoConnectedTitle, GOOGLE_CONFIG.texts.infoConnectedMessage); 
            } else {
                syncBtn.innerHTML = `<i class="ph ph-google-logo"></i> ${GOOGLE_CONFIG.texts.btnHeaderConnect}`;
                syncBtn.onclick = () => this.signIn();
            }
        }

        const sidebarGoogleBtn = document.getElementById('sidebarGoogleBtn');
        if (sidebarGoogleBtn) {
            if (isConnected) {
                sidebarGoogleBtn.innerHTML = `<i class="ph-fill ph-check-circle"></i> ${GOOGLE_CONFIG.texts.btnSidebarConnected}`;
                sidebarGoogleBtn.style.color = '#10b981'; 
                sidebarGoogleBtn.onclick = () => this.notify('info', GOOGLE_CONFIG.texts.infoConnectedTitle, GOOGLE_CONFIG.texts.infoConnectedMessage); 
            } else {
                sidebarGoogleBtn.innerHTML = `${GOOGLE_CONFIG.texts.btnSidebarConnect}`;
                sidebarGoogleBtn.style.color = 'var(--accent-blue)'; 
                sidebarGoogleBtn.onclick = () => this.signIn();
            }
        }

        document.querySelectorAll('.drive-btn-state').forEach(b => {
            if (isConnected) {
                b.innerHTML = `<i class="ph-fill ph-check-circle" style="color:#10b981;"></i> ${GOOGLE_CONFIG.texts.btnSettingsDisconnect}`;
                b.onclick = () => this.signOut();
            } else {
                b.innerHTML = `<i class="ph ph-google-logo"></i> ${GOOGLE_CONFIG.texts.btnSettingsConnect}`;
                b.onclick = () => this.signIn();
            }
        });

        const mobileDriveAuthBtn = document.getElementById('mobileDriveAuthBtn');
        const mobileDriveStatus = document.getElementById('mobileDriveStatus');
        if (mobileDriveAuthBtn && mobileDriveStatus) {
            if (isConnected) {
                mobileDriveStatus.innerHTML = `<i class="ph-fill ph-check-circle" style="color: #10b981;"></i> ${GOOGLE_CONFIG.texts.textMobileConnected}`;
                mobileDriveAuthBtn.innerHTML = `<i class="ph ph-link-break"></i> ${GOOGLE_CONFIG.texts.btnMobileDisconnect}`;
                mobileDriveAuthBtn.onclick = (e) => { e.preventDefault(); this.signOut(); };
            } else {
                mobileDriveStatus.innerHTML = `<i class="ph ph-warning-circle" style="color: #eab308;"></i> ${GOOGLE_CONFIG.texts.textMobileNotConnected}`;
                mobileDriveAuthBtn.innerHTML = `<i class="ph ph-link"></i> ${GOOGLE_CONFIG.texts.btnMobileConnect}`;
                mobileDriveAuthBtn.onclick = (e) => { e.preventDefault(); this.signIn(); };
            }
        }
    },

    notify(type, title, message, onConfirm = null) {
        if (GOOGLE_CONFIG.notifyMode === 'toast') this.showToast(type, title, message);
        else this.showModal(type, title, message, onConfirm);
    },

    showToast(type, title, message) {
        let toast = document.getElementById('wwGoogleToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'wwGoogleToast';
            toast.className = 'st-google-toast';
            document.body.appendChild(toast);
        }
        const icons = { success: 'ph-check-circle', warning: 'ph-warning-circle', error: 'ph-x-circle', info: 'ph-info' };
        const colors = { success: '#10b981', warning: '#eab308', error: '#ef4444', info: '#0ea5e9' };
        
        toast.innerHTML = `<i class="ph-fill ${icons[type]}" style="color: ${colors[type]}; font-size: 20px;"></i>
            <div class="st-toast-content"><strong>${title}</strong><span>${message}</span></div>`;
        
        toast.classList.add('visible');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
    },

    showModal(type, title, message, onConfirm = null) {
        let overlay = document.getElementById('wwGoogleModalOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'wwGoogleModalOverlay';
            overlay.className = 'st-modal-overlay';
            overlay.innerHTML = `
                <div class="st-modal-card">
                    <div class="st-modal-icon-wrap" id="wwModalIconWrap"><i id="wwModalIcon"></i></div>
                    <h3 id="wwModalTitle">Notice</h3><p id="wwModalMessage"></p>
                    <br>
                    <div class="st-modal-actions" style="width: 100%;"><button type="button" id="wwModalCloseBtn" class="btn-primary" style="width: 100%; justify-content: center;">Got it</button></div>
                </div>`;
            document.body.appendChild(overlay);
        }
        const icons = {
            success: { icon: 'ph-check-circle', bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
            error: { icon: 'ph-x-circle', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
            info: { icon: 'ph-cloud-arrow-down', bg: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' },
            warning: { icon: 'ph-warning-circle', bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }
        };
        const config = icons[type] || icons.info;
        overlay.querySelector('#wwModalIconWrap').style.background = config.bg;
        overlay.querySelector('#wwModalIconWrap').style.color = config.color;
        overlay.querySelector('#wwModalIcon').className = `ph-fill ${config.icon}`;
        overlay.querySelector('#wwModalTitle').textContent = title;
        overlay.querySelector('#wwModalMessage').textContent = message;

        const closeModal = () => { overlay.classList.remove('active'); if (onConfirm) onConfirm(); };
        overlay.querySelector('#wwModalCloseBtn').onclick = closeModal;
        overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
        overlay.classList.add('active');
    },

    showConfirmModal(title, message, onConfirm) {
        let overlay = document.getElementById('wwGoogleConfirmOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'wwGoogleConfirmOverlay';
            overlay.className = 'st-modal-overlay';
            overlay.innerHTML = `
                <div class="st-modal-card" style="padding: 32px 24px;">
                    <div class="st-modal-icon-wrap" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 16px;">
                        <i class="ph-fill ph-warning-circle"></i>
                    </div>
                    <h3 id="wwConfirmTitle" style="font-size: 20px; font-weight: 700; margin-bottom: 8px;"></h3>
                    <p id="wwConfirmMessage" style="color: var(--text-muted); font-size: 14px; line-height: 1.5; margin-bottom: 24px;"></p>
                    <div style="display: flex; gap: 12px; width: 100%;">
                        <button type="button" id="wwConfirmCancelBtn" class="btn-outline" style="flex: 1; justify-content: center; padding: 12px;"></button>
                        <button type="button" id="wwConfirmProceedBtn" class="btn-primary" style="flex: 1; justify-content: center; padding: 12px; background: #ef4444; color: #ffffff; border: none;"></button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);
        }
        
        overlay.querySelector('#wwConfirmTitle').textContent = title;
        overlay.querySelector('#wwConfirmMessage').textContent = message;
        overlay.querySelector('#wwConfirmCancelBtn').textContent = GOOGLE_CONFIG.texts.btnCancel;
        overlay.querySelector('#wwConfirmProceedBtn').textContent = GOOGLE_CONFIG.texts.btnConfirmDisconnect;

        const closeConfirm = () => { overlay.classList.remove('active'); };
        overlay.querySelector('#wwConfirmCancelBtn').onclick = closeConfirm;
        overlay.querySelector('#wwConfirmProceedBtn').onclick = () => {
            closeConfirm();
            if (onConfirm) onConfirm();
        };
        overlay.onclick = (e) => { if (e.target === overlay) closeConfirm(); };
        setTimeout(() => overlay.classList.add('active'), 10);
    },

    init() {
        if (!document.getElementById('wwGoogleStyles')) {
            const s = document.createElement('style');
            s.id = 'wwGoogleStyles';
            s.textContent = `.st-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;z-index:100000;opacity:0;visibility:hidden;transition:0.25s;} .st-modal-overlay.active{opacity:1;visibility:visible;} .st-modal-card{background:var(--bg-dashboard);border:1px solid var(--border-color);border-radius:24px;width:100%;max-width:360px;padding:28px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;transform:scale(0.92);transition:0.25s cubic-bezier(0.34,1.56,0.64,1);} .st-modal-overlay.active .st-modal-card{transform:scale(1);} .st-modal-icon-wrap{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:16px;} @keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .fa-spin { animation: fa-spin 1s linear infinite; }`;
            document.head.appendChild(s);
        }
        this.accessToken = sessionStorage.getItem('ww_g_token');
        this.updateUI();
        if (typeof google !== 'undefined' && google.accounts) this.setupClient();
        else window.addEventListener('load', () => { if (typeof google !== 'undefined') this.setupClient(); });
    }
};

document.addEventListener('DOMContentLoaded', () => WealthwiseGoogle.init());