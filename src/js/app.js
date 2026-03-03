const { ipcRenderer } = require('electron');

const API_BASE = 'http://127.0.0.1:5001/api';

const elements = {
    navItems: document.querySelectorAll('.nav-item'),
    views: document.querySelectorAll('.view'),
    pageTitle: document.getElementById('page-title'),
    headerDownloadBtn: document.getElementById('header-download-btn'),
    headerBulkBtn: document.getElementById('header-bulk-btn'),

    addAccountBtn: document.getElementById('add-account-btn'),
    importChromeBtn: document.getElementById('import-chrome-btn'),
    importAccountName: document.getElementById('import-account-name'),
    importStatus: document.getElementById('import-status'),
    sidebar: document.querySelector('.sidebar'),
    leftToggleBtn: document.getElementById('left-toggle-btn'),
    openFolderBtn: document.getElementById('open-downloads-folder-btn'),
    downloadToasts: document.getElementById('download-toasts')
};

// State
const state = {
    currentView: 'home',
    isAuthenticated: false,
    activeAccount: null,
    downloadingUrls: new Set()  // Track URLs currently being downloaded
};

function init() {
    setupNavigation();
    setupAuth();
    setupPanels();
    setupDownloads();

    // Listen for cookies-loaded event from main process → destroy + recreate webview
    ipcRenderer.on('cookies-loaded', (event, accountName, partitionName) => {
        console.log('Cookies loaded, recreating webview for:', accountName, 'partition:', partitionName);
        recreateWebview(partitionName);
    });
}

/**
 * Destroys the current <webview> and creates a new one with a fresh partition.
 */
function recreateWebview(partition) {
    const container = document.getElementById('home-view');
    if (!container) return;

    const setupWebviewEvents = (webview) => {
        webview.addEventListener('ipc-message', (event) => {
            if (event.channel === 'download-tweet') {
                startDownload(event.args[0]);
            }
        });
        webview.addEventListener('dom-ready', () => {
            checkDownloadButtonVisibility(webview.getURL());
        });
        webview.addEventListener('did-navigate', (e) => {
            checkDownloadButtonVisibility(e.url);
        });
        webview.addEventListener('did-navigate-in-page', (e) => {
            checkDownloadButtonVisibility(e.url);
        });
    };

    const old = document.getElementById('x-webview');
    if (old) old.remove();

    const wv = document.createElement('webview');
    wv.id = 'x-webview';
    wv.setAttribute('preload', './js/preload.js');
    wv.setAttribute('partition', partition || `twitter-${Date.now()}`);
    wv.setAttribute('allowpopups', '');
    wv.style.cssText = 'flex: 1; width: 100%; height: 100%; border: none; border-radius: 0;';
    wv.src = 'https://x.com/home';

    container.appendChild(wv);
    setupWebviewEvents(wv);
    console.log('New webview created with partition:', partition);
}

function setupPanels() {
    if (elements.leftToggleBtn && elements.sidebar) {
        elements.leftToggleBtn.addEventListener('click', () => {
            elements.sidebar.classList.toggle('collapsed');
            const isCollapsed = elements.sidebar.classList.contains('collapsed');
            elements.leftToggleBtn.innerHTML = isCollapsed
                ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>'
                : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
        });
    }
}

function setupNavigation() {
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            switchView(view);
        });
    });

    // Webview Event Listeners
    const webview = document.getElementById('x-webview');
    if (webview) {
        webview.addEventListener('ipc-message', (event) => {
            if (event.channel === 'download-tweet') {
                const url = event.args[0];
                startDownload(url);
            }
        });

        webview.addEventListener('dom-ready', () => {
            checkDownloadButtonVisibility(webview.getURL());
        });

        webview.addEventListener('did-navigate', (e) => {
            checkDownloadButtonVisibility(e.url);
        });

        webview.addEventListener('did-navigate-in-page', (e) => {
            checkDownloadButtonVisibility(e.url);
        });
    }

    // Header Download Button (single video)
    if (elements.headerDownloadBtn) {
        elements.headerDownloadBtn.addEventListener('click', () => {
            if (elements.headerDownloadBtn.style.display !== 'none') {
                const webview = document.getElementById('x-webview');
                if (webview) {
                    startDownload(webview.getURL());
                }
            }
        });
    }

    // Header Bulk Download Button
    if (elements.headerBulkBtn) {
        elements.headerBulkBtn.addEventListener('click', () => {
            const webview = document.getElementById('x-webview');
            if (webview) {
                startBulkDownload(webview.getURL());
            }
        });
    }
}

/**
 * Show a toast notification for download progress (doesn't switch views)
 */
function showDownloadToast(url) {
    const toastContainer = elements.downloadToasts;
    if (!toastContainer) return null;

    const toast = document.createElement('div');
    toast.className = 'download-toast';
    toast.innerHTML = `
        <div class="toast-header">
            <span class="toast-status">⬇️ Başlatılıyor...</span>
            <button class="toast-close" title="Kapat">✕</button>
        </div>
        <div class="toast-url">${url}</div>
        <div class="toast-progress">
            <div class="toast-progress-fill" style="width: 0%"></div>
        </div>
    `;

    toast.querySelector('.toast-close').addEventListener('click', (e) => {
        e.stopPropagation();
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    });

    toastContainer.appendChild(toast);
    return toast;
}

/**
 * Auto-dismiss a toast after a delay
 */
function autoDismissToast(toast, delayMs = 8000) {
    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, delayMs);
}

async function startDownload(url) {
    // Check if already downloading this URL
    if (state.downloadingUrls.has(url)) {
        const toast = showDownloadToast(url);
        if (toast) {
            toast.classList.add('duplicate');
            toast.querySelector('.toast-status').textContent = '⚠️ Bu video zaten indiriliyor';
            autoDismissToast(toast, 4000);
        }
        return;
    }

    // Show toast notification (don't switch view!)
    const toast = showDownloadToast(url);

    // Also add to downloads list for history
    const downloadsList = document.getElementById('downloads-list');
    const item = document.createElement('div');
    item.className = 'download-item';
    item.style.cursor = 'default';
    item.innerHTML = `
        <div class="status">Başlatılıyor...</div>
        <div class="url">${url}</div>
        <div class="progress-bar" style="width: 100%; height: 4px; background: rgba(255,255,255,0.06); border-radius: 4px; margin-top: 10px; overflow: hidden;">
            <div class="progress-fill" style="width: 0%; height: 100%; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 4px; transition: width 0.3s;"></div>
        </div>
    `;
    downloadsList.prepend(item);

    if (document.querySelector('.empty-state')) {
        document.querySelector('.empty-state').remove();
    }

    let fullFilePath = null;
    state.downloadingUrls.add(url);

    try {
        // First check for duplicates on server
        const checkRes = await fetch(`${API_BASE}/check-duplicate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        const checkData = await checkRes.json();

        if (checkData.duplicate) {
            state.downloadingUrls.delete(url);
            const msg = `⚠️ Zaten mevcut: ${checkData.filename}`;
            item.querySelector('.status').textContent = msg;
            item.querySelector('.status').style.color = '#ffa500';
            item.querySelector('.progress-fill').style.width = '100%';
            item.querySelector('.progress-fill').style.background = '#ffa500';

            if (toast) {
                toast.classList.add('duplicate');
                toast.querySelector('.toast-status').textContent = msg;
                toast.querySelector('.toast-progress-fill').style.width = '100%';
                autoDismissToast(toast, 6000);
            }

            // Make clickable to open existing file
            if (checkData.filepath) {
                fullFilePath = checkData.filepath;
                item.style.cursor = 'pointer';
                item.title = 'Mevcut videoyu açmak için tıkla';
                item.addEventListener('click', () => {
                    ipcRenderer.invoke('shell:open-file', fullFilePath);
                });
            }
            return;
        }

        const response = await fetch(`${API_BASE}/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url, account: state.activeAccount })
        });
        const data = await response.json();

        if (data.status === 'duplicate') {
            // Server-side duplicate detected
            state.downloadingUrls.delete(url);
            const msg = `⚠️ Zaten mevcut: ${data.filename}`;
            item.querySelector('.status').textContent = msg;
            item.querySelector('.status').style.color = '#ffa500';
            item.querySelector('.progress-fill').style.width = '100%';
            item.querySelector('.progress-fill').style.background = '#ffa500';

            if (toast) {
                toast.classList.add('duplicate');
                toast.querySelector('.toast-status').textContent = msg;
                toast.querySelector('.toast-progress-fill').style.width = '100%';
                autoDismissToast(toast, 6000);
            }

            if (data.filepath) {
                fullFilePath = data.filepath;
                item.style.cursor = 'pointer';
                item.title = 'Mevcut videoyu açmak için tıkla';
                item.addEventListener('click', () => {
                    ipcRenderer.invoke('shell:open-file', fullFilePath);
                });
            }
            return;
        }

        if (data.status === 'started') {
            item.querySelector('.status').textContent = 'İndiriliyor... 0%';
            if (toast) toast.querySelector('.toast-status').textContent = '⬇️ İndiriliyor... 0%';

            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await fetch(`${API_BASE}/status/${data.task_id}`);
                    const statusData = await statusRes.json();

                    if (statusData.status === 'downloading') {
                        const pct = statusData.progress || 0;
                        item.querySelector('.status').textContent = `İndiriliyor... ${pct}%`;
                        item.querySelector('.progress-fill').style.width = `${pct}%`;
                        if (toast) {
                            toast.querySelector('.toast-status').textContent = `⬇️ İndiriliyor... ${pct}%`;
                            toast.querySelector('.toast-progress-fill').style.width = `${pct}%`;
                        }
                    } else if (statusData.status === 'completed') {
                        clearInterval(pollInterval);
                        state.downloadingUrls.delete(url);
                        const fname = statusData.filename || 'video.mp4';
                        item.querySelector('.status').textContent = `✅ Tamamlandı: ${fname}`;
                        item.querySelector('.status').style.color = '#00ba7c';
                        item.querySelector('.progress-fill').style.width = '100%';
                        item.querySelector('.progress-fill').style.background = '#00ba7c';

                        if (toast) {
                            toast.classList.add('completed');
                            toast.querySelector('.toast-status').textContent = `✅ ${fname}`;
                            toast.querySelector('.toast-progress-fill').style.width = '100%';
                            autoDismissToast(toast, 8000);
                        }

                        if (statusData.filename) {
                            const downloadDir = data.download_dir;
                            fullFilePath = `${downloadDir}/${statusData.filename}`;
                            item.style.cursor = 'pointer';
                            item.title = 'Videoyu oynatmak için tıkla';
                            item.addEventListener('click', () => {
                                if (fullFilePath) {
                                    ipcRenderer.invoke('shell:open-file', fullFilePath);
                                }
                            });
                            if (toast) {
                                toast.addEventListener('click', () => {
                                    ipcRenderer.invoke('shell:open-file', fullFilePath);
                                });
                            }
                        }
                    } else if (statusData.status === 'failed') {
                        clearInterval(pollInterval);
                        state.downloadingUrls.delete(url);
                        const errMsg = statusData.error || 'Bilinmeyen hata';
                        item.querySelector('.status').textContent = `❌ Hata: ${errMsg}`;
                        item.querySelector('.status').style.color = '#f4212e';
                        item.querySelector('.progress-fill').style.background = '#f4212e';

                        if (toast) {
                            toast.classList.add('failed');
                            toast.querySelector('.toast-status').textContent = `❌ ${errMsg}`;
                            toast.querySelector('.toast-progress-fill').style.background = '#f4212e';
                            autoDismissToast(toast, 10000);
                        }
                    }
                } catch (e) {
                    // Polling error, keep trying
                }
            }, 2000);
        } else {
            state.downloadingUrls.delete(url);
            item.querySelector('.status').textContent = 'Hata: ' + data.error;
            item.querySelector('.status').style.color = '#f4212e';
            if (toast) {
                toast.classList.add('failed');
                toast.querySelector('.toast-status').textContent = `❌ ${data.error}`;
            }
        }
    } catch (e) {
        state.downloadingUrls.delete(url);
        item.querySelector('.status').textContent = 'Bağlantı Hatası';
        if (toast) {
            toast.classList.add('failed');
            toast.querySelector('.toast-status').textContent = '❌ Bağlantı Hatası';
        }
    }
}

/**
 * Bulk download - extract all video URLs from a user's profile page
 */
async function startBulkDownload(profileUrl) {
    const toast = showDownloadToast(profileUrl);
    if (toast) {
        toast.querySelector('.toast-status').textContent = '🔍 Videolar taranıyor...';
    }

    try {
        const response = await fetch(`${API_BASE}/bulk-extract`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: profileUrl, account: state.activeAccount })
        });
        const data = await response.json();

        if (data.urls && data.urls.length > 0) {
            if (toast) {
                toast.querySelector('.toast-status').textContent = `📦 ${data.urls.length} video bulundu, indirme başlıyor...`;
                autoDismissToast(toast, 5000);
            }

            // Start downloads with slight delay between each
            for (let i = 0; i < data.urls.length; i++) {
                setTimeout(() => {
                    startDownload(data.urls[i]);
                }, i * 1500);  // 1.5 second delay between each
            }
        } else {
            if (toast) {
                toast.classList.add('failed');
                toast.querySelector('.toast-status').textContent = `❌ ${data.error || 'Bu sayfada video bulunamadı'}`;
                autoDismissToast(toast, 6000);
            }
        }
    } catch (e) {
        if (toast) {
            toast.classList.add('failed');
            toast.querySelector('.toast-status').textContent = '❌ Bağlantı Hatası';
            autoDismissToast(toast, 6000);
        }
    }
}


function checkDownloadButtonVisibility(url) {
    // Show single download button for tweet/status URLs
    const isStatusUrl = /\/(?:x|twitter)\.com\/[^\/]+\/status\/\d+/.test(url);

    // Known non-profile paths to exclude from bulk download
    const nonProfilePaths = ['home', 'explore', 'notifications', 'messages', 'search',
        'settings', 'login', 'i', 'compose', 'lists', 'bookmarks', 'communities',
        'premium', 'verified-followers', 'hashtag', 'tos', 'privacy', 'about'];

    // Show bulk download button for user profile pages (but not system pages)
    let isProfileUrl = false;
    const profileMatch = url.match(/\/(?:x|twitter)\.com\/([^\/\?#]+)\/?$/);
    const mediaMatch = url.match(/\/(?:x|twitter)\.com\/([^\/\?#]+)\/media/);
    const matchedName = (profileMatch && profileMatch[1]) || (mediaMatch && mediaMatch[1]);
    if (matchedName && !nonProfilePaths.includes(matchedName.toLowerCase())) {
        isProfileUrl = true;
    }

    if (elements.headerDownloadBtn) {
        elements.headerDownloadBtn.style.display = isStatusUrl ? 'flex' : 'none';
    }
    if (elements.headerBulkBtn) {
        elements.headerBulkBtn.style.display = isProfileUrl ? 'flex' : 'none';
    }
}

function switchView(viewName) {
    // Update Nav
    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Update View
    elements.views.forEach(view => {
        view.classList.toggle('active', view.id === `${viewName}-view`);
    });

    // Update Title
    const titles = {
        'home': 'Anasayfa',
        'downloads': 'İndirilenler',
        'settings': 'Ayarlar'
    };
    elements.pageTitle.textContent = titles[viewName];
    state.currentView = viewName;
}


function setupAuth() {
    const webview = document.getElementById('x-webview');

    const loginBtn = document.getElementById('auth-status-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            switchView('home');
            if (webview) {
                webview.setAttribute('src', 'https://x.com/login');
            }
        });
    }

    // Chrome Cookie Import Button
    if (elements.importChromeBtn) {
        elements.importChromeBtn.addEventListener('click', async () => {
            const accountName = (elements.importAccountName.value || '').trim();
            if (!accountName) {
                elements.importStatus.textContent = '⚠️ Lütfen bir hesap adı girin.';
                elements.importStatus.style.color = '#f4212e';
                return;
            }

            elements.importChromeBtn.disabled = true;
            elements.importChromeBtn.textContent = '⏳ İçe aktarılıyor...';
            elements.importStatus.textContent = 'Chrome\'dan çerezler okunuyor...';
            elements.importStatus.style.color = '#71767b';

            try {
                const res = await fetch(`${API_BASE}/import-chrome-cookies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ account: accountName })
                });
                const data = await res.json();

                if (data.success) {
                    elements.importStatus.textContent = `✅ Başarılı! ${data.cookie_count} X.com çerezi yüklendi. Anasayfaya yönlendiriliyorsunuz...`;
                    elements.importStatus.style.color = '#00ba7c';
                    state.activeAccount = accountName;
                    elements.importAccountName.value = '';

                    try {
                        await ipcRenderer.invoke('auth:load-cookies-to-session', accountName);
                    } catch (err) {
                        console.error('Failed to load cookies to session:', err);
                    }

                    setTimeout(() => switchView('home'), 1500);
                } else {
                    elements.importStatus.textContent = `❌ Hata: ${data.error}`;
                    elements.importStatus.style.color = '#f4212e';
                }
            } catch (e) {
                elements.importStatus.textContent = `❌ Bağlantı hatası: ${e.message}`;
                elements.importStatus.style.color = '#f4212e';
            } finally {
                elements.importChromeBtn.disabled = false;
                elements.importChromeBtn.textContent = '🔗 Chrome\'dan İçe Aktar';
            }
        });
    }

    // Webview Login (fallback)
    if (elements.addAccountBtn) {
        elements.addAccountBtn.addEventListener('click', async () => {
            await ipcRenderer.invoke('auth:logout');
            switchView('home');
            if (webview) webview.setAttribute('src', 'https://x.com/login');
        });
    }
}

function setupDownloads() {
    if (elements.openFolderBtn) {
        elements.openFolderBtn.addEventListener('click', () => {
            const homePath = ipcRenderer.sendSync('get-home-path');
            const downloadDir = `${homePath}/Downloads/SocialVideoUtility`;
            ipcRenderer.invoke('shell:open-folder', downloadDir);
        });
    }
}


document.addEventListener('DOMContentLoaded', init);
