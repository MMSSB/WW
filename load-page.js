// load-page.js
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = document.querySelector('.dashboard-wrapper');
    if (!dashboard) return;
    dashboard.style.position = 'relative';

    const style = document.createElement('style');
    style.textContent = `
        .st-loader-overlay {
            position: absolute; inset: 0; z-index: 999;
            background: var(--bg-dashboard);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            border-radius: var(--radius-dashboard, 28px);
            transition: opacity 0.6s cubic-bezier(0.32, 0.72, 0, 1), visibility 0.6s, transform 0.6s cubic-bezier(0.32, 0.72, 0, 1);
        }
        @media (max-width: 768px) {
            .st-loader-overlay { position: fixed; border-radius: 0; z-index: 99999; background: var(--bg-canvas); }
        }
        .st-loader-overlay.hidden { opacity: 0; visibility: hidden; transform: scale(0.98); }
        .st-loader-content { display: flex; flex-direction: column; align-items: center; gap: 20px; animation: st-fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .st-loader-logo {
            width: 68px; height: 68px; background: var(--primary); color: var(--primary-invert);
            border-radius: 20px; display: flex; align-items: center; justify-content: center;
            font-size: 32px; box-shadow: var(--shadow-float); position: relative;
        }
        .st-loader-logo::after {
            content: ''; position: absolute; inset: -4px; border-radius: 24px;
            border: 2px solid var(--primary); opacity: 0;
            animation: st-ripple 1.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .st-loader-brand { font-size: 18px; font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 6px; letter-spacing: -0.3px; }
        .st-loader-dots { display: flex; gap: 4px; margin-top: 4px; }
        .st-loader-dots span { width: 4px; height: 4px; background: var(--primary); border-radius: 50%; animation: st-bounce 1.4s infinite ease-in-out both; }
        .st-loader-dots span:nth-child(1) { animation-delay: -0.32s; }
        .st-loader-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes st-fade-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes st-ripple { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.4); opacity: 0; } }
        @keyframes st-bounce { 0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'st-loader-overlay';
    overlay.innerHTML = `
        <div class="st-loader-content">
            <div class="st-loader-logo"><i class="ph ph-wallet"></i></div>
            <div class="st-loader-brand">Wealthwise<div class="st-loader-dots"><span></span><span></span><span></span></div></div>
        </div>
    `;
    dashboard.prepend(overlay);

    const hideLoader = () => {
        overlay.classList.add('hidden');
        setTimeout(() => overlay.remove(), 600);
    };

    const startTime = Date.now();
    window.addEventListener('load', () => {
        setTimeout(hideLoader, Math.max(0, 1000 - (Date.now() - startTime)));
    });
    setTimeout(hideLoader, 4000);
});