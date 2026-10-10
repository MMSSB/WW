// google.js
const GOOGLE_CONFIG = {
    clientId: '884057504637-lo16damkhhb55v1hmmmhrl9m2dm0p5rr.apps.googleusercontent.com', 
    scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile',
    notifyMode: 'modal'
};

const WealthwiseGoogle = {
    tokenClient: null,
    accessToken: null,
    userProfile: null,

    notify(type, title, message, onConfirm = null) {
        if (GOOGLE_CONFIG.notifyMode === 'toast') this.showToast(type, title, message);
        else this.showModal(type, title, message, onConfirm);
    },

    showToast(type, title, message) {
        let toast = document.getElementById('wwGoogleToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'wwGoogleToast';
            toast.className = 'st-google-toast'; // Using the exact CSS classes you provided
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
                    <div class="st-modal-actions"><button type="button" id="wwModalCloseBtn" class="btn-primary" style="width: 100%; justify-content: center;">OK</button></div>
                </div>`;
            document.body.appendChild(overlay);
        }
        const icons = {
            success: { icon: 'ph-check-circle', bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
            error: { icon: 'ph-x-circle', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
            info: { icon: 'ph-google-logo', bg: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }
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

    init() {
        if (!document.getElementById('wwGoogleStyles')) {
            const s = document.createElement('style');
            s.id = 'wwGoogleStyles';
            s.textContent = `.st-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;z-index:100000;opacity:0;visibility:hidden;transition:0.25s;} .st-modal-overlay.active{opacity:1;visibility:visible;} .st-modal-card{background:var(--bg-dashboard);border:1px solid var(--border-color);border-radius:24px;width:100%;max-width:360px;padding:28px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;transform:scale(0.92);transition:0.25s cubic-bezier(0.34,1.56,0.64,1);} .st-modal-overlay.active .st-modal-card{transform:scale(1);} .st-modal-icon-wrap{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:16px;}`;
            document.head.appendChild(s);
        }
        this.accessToken = sessionStorage.getItem('ww_g_token');
        this.updateUI();
        if (typeof google !== 'undefined' && google.accounts) this.setupClient();
        else window.addEventListener('load', () => { if (typeof google !== 'undefined') this.setupClient(); });
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
                    this.notify('success', 'Connected', 'Google Drive linked successfully.');
                }
            }
        });
    },

    signIn() {
        if (this.accessToken) return this.notify('info', 'Already Connected', 'Drive is already linked.');
        if (!this.tokenClient) return this.notify('error', 'Not Ready', 'Google Auth initializing...');
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
    },

    signOut() {
        if (this.accessToken) google.accounts.oauth2.revoke(this.accessToken);
        this.accessToken = null;
        sessionStorage.removeItem('ww_g_token');
        localStorage.removeItem('ww_user_avatar');
        localStorage.removeItem('ww_google_user');
        this.updateUI();
        this.notify('info', 'Disconnected', 'Google Drive unlinked.');
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
        const btns = document.querySelectorAll('.drive-btn-state');
        btns.forEach(b => {
            if (isConnected) {
                b.innerHTML = `<i class="ph-fill ph-check-circle" style="color:#10b981;"></i> Connected`;
                b.onclick = () => this.signOut();
            } else {
                b.innerHTML = `<i class="ph ph-google-logo"></i> Connect Drive`;
                b.onclick = () => this.signIn();
            }
        });
    },

    async saveToDrive(auto = false) {
        if (!this.accessToken) return auto ? null : this.signIn();
        const data = localStorage.getItem('financeTransactions') || '[]';
        const fileContent = JSON.stringify(JSON.parse(data), null, 2);
        try {
            const s = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='wealthwise_data.json' and trashed=false`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
            const sData = await s.json();
            const existing = sData.files && sData.files[0];
            const url = existing ? `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart` : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
            const method = existing ? 'PATCH' : 'POST';
            
            const boundary = 'foo_bar_baz';
            const body = `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{"name":"wealthwise_data.json","mimeType":"application/json"}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${fileContent}\r\n--${boundary}--`;
            
            const res = await fetch(url, { method, headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': `multipart/related; boundary=${boundary}` }, body });
            if (res.ok && !auto) this.notify('success', 'Backup Successful', 'Transactions saved to Drive.');
        } catch (e) { if (!auto) this.notify('error', 'Error', 'Backup failed.'); }
    },

    async loadFromDrive() {
        if (!this.accessToken) return this.signIn();
        try {
            const s = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='wealthwise_data.json' and trashed=false`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
            const sData = await s.json();
            if (!sData.files || sData.files.length === 0) return this.notify('info', 'No Backup', 'No Wealthwise backup found on Drive.');
            
            const res = await fetch(`https://www.googleapis.com/drive/v3/files/${sData.files[0].id}?alt=media`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
            const data = await res.json();
            if (Array.isArray(data)) {
                localStorage.setItem('financeTransactions', JSON.stringify(data));
                this.notify('success', 'Restored', 'Transactions restored.', () => window.location.reload());
            }
        } catch (e) { this.notify('error', 'Error', 'Failed to restore backup.'); }
    }
};

document.addEventListener('DOMContentLoaded', () => WealthwiseGoogle.init());