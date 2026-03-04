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
    // Initialize i18n
    loadLanguage();
    applyTranslations();

    setupNavigation();
    setupAuth();
    setupPanels();
    setupDownloads();
    setupLanguage();

    // Listen for cookies-loaded event from main process → destroy + recreate webview
    ipcRenderer.on('cookies-loaded', (event, accountName, partitionName) => {
        console.log('Cookies loaded, recreating webview for:', accountName, 'partition:', partitionName);
        recreateWebview(partitionName);
    });
}

function setupLanguage() {
    // Settings dropdown
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
            updateFlagActiveState();
        });
    }

    // Sidebar flag buttons
    const flagBtns = document.querySelectorAll('.lang-flag');
    flagBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
            updateFlagActiveState();
            // Also sync settings dropdown
            if (langSelect) langSelect.value = currentLang;
        });
    });

    updateFlagActiveState();
}

function updateFlagActiveState() {
    document.querySelectorAll('.lang-flag').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
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
 * Show a brief toast notification (auto-dismisses after delay)
 */
function showToast(message, type = 'info', delayMs = 3000) {
    const toastContainer = elements.downloadToasts;
    if (!toastContainer) return null;

    // Limit max toasts to 3
    while (toastContainer.children.length >= 3) {
        toastContainer.firstChild.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'download-toast';
    if (type !== 'info') toast.classList.add(type);
    toast.innerHTML = `
        <div class="toast-header">
            <span class="toast-status">${message}</span>
            <button class="toast-close" title="Kapat">✕</button>
        </div>
    `;

    toast.querySelector('.toast-close').addEventListener('click', (e) => {
        e.stopPropagation();
        dismissToast(toast);
    });

    toastContainer.appendChild(toast);

    // Auto-dismiss
    setTimeout(() => dismissToast(toast), delayMs);
    return toast;
}

function dismissToast(toast) {
    if (toast && toast.parentNode) {
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }
}

async function startDownload(url) {
    // Check if already downloading this URL
    if (state.downloadingUrls.has(url)) {
        showToast(t('toastAlreadyDownloading'), 'duplicate', 3000);
        return;
    }

    // Brief start notification
    showToast(t('toastDownloadStarted'), 'info', 3000);

    // Also add to downloads list for history
    const downloadsList = document.getElementById('downloads-list');
    const item = document.createElement('div');
    item.className = 'download-item';
    item.style.cursor = 'default';
    item.innerHTML = `
        <div class="status">${t('statusDownloading')}</div>
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
            const msg = `${t('toastDuplicate')} ${checkData.filename}`;
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
                item.title = t('clickToOpen');
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
            const msg = `${t('toastDuplicate')} ${data.filename}`;
            item.querySelector('.status').textContent = msg;
            item.querySelector('.status').style.color = '#ffa500';
            item.querySelector('.progress-fill').style.width = '100%';
            item.querySelector('.progress-fill').style.background = '#ffa500';
            showToast(msg, 'duplicate', 4000);

            if (data.filepath) {
                fullFilePath = data.filepath;
                item.style.cursor = 'pointer';
                item.title = t('clickToOpen');
                item.addEventListener('click', () => {
                    ipcRenderer.invoke('shell:open-file', fullFilePath);
                });
            }
            return;
        }

        if (data.status === 'started') {
            item.querySelector('.status').textContent = `${t('statusDownloading')} 0%`;

            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await fetch(`${API_BASE}/status/${data.task_id}`);
                    const statusData = await statusRes.json();

                    if (statusData.status === 'downloading') {
                        const pct = statusData.progress || 0;
                        item.querySelector('.status').textContent = `${t('statusDownloading')} ${pct}%`;
                        item.querySelector('.progress-fill').style.width = `${pct}%`;
                    } else if (statusData.status === 'completed') {
                        clearInterval(pollInterval);
                        state.downloadingUrls.delete(url);
                        const fname = statusData.filename || 'video.mp4';
                        item.querySelector('.status').textContent = `${t('toastCompleted')} ${t('statusCompleted')} ${fname}`;
                        item.querySelector('.status').style.color = '#00ba7c';
                        item.querySelector('.progress-fill').style.width = '100%';
                        item.querySelector('.progress-fill').style.background = '#00ba7c';
                        showToast(`✅ ${fname}`, 'completed', 4000);

                        if (statusData.filename) {
                            const downloadDir = data.download_dir;
                            fullFilePath = `${downloadDir}/${statusData.filename}`;
                            item.style.cursor = 'pointer';
                            item.title = t('clickToPlay');
                            item.addEventListener('click', () => {
                                if (fullFilePath) {
                                    ipcRenderer.invoke('shell:open-file', fullFilePath);
                                }
                            });
                        }
                    } else if (statusData.status === 'failed') {
                        clearInterval(pollInterval);
                        state.downloadingUrls.delete(url);
                        const errMsg = statusData.error || 'Bilinmeyen hata';
                        item.querySelector('.status').textContent = `${t('toastError')} ${errMsg}`;
                        item.querySelector('.status').style.color = '#f4212e';
                        item.querySelector('.progress-fill').style.background = '#f4212e';
                        showToast(`${t('toastError')} ${errMsg}`, 'failed', 5000);
                    }
                } catch (e) {
                    // Polling error, keep trying
                }
            }, 2000);
        } else {
            state.downloadingUrls.delete(url);
            item.querySelector('.status').textContent = `${t('toastError')} ${data.error}`;
            item.querySelector('.status').style.color = '#f4212e';
            showToast(`${t('toastError')} ${data.error}`, 'failed', 4000);
        }
    } catch (e) {
        state.downloadingUrls.delete(url);
        item.querySelector('.status').textContent = t('toastConnectionError');
        showToast(t('toastConnectionError'), 'failed', 4000);
    }
}

/**
 * Bulk download - extract all video URLs from a user's profile page
 */
async function startBulkDownload(profileUrl) {
    const webview = document.getElementById('x-webview');
    if (!webview) {
        showToast(t('toastError'), 'failed', 3000);
        return;
    }

    showToast(t('toastScanning'), 'info', 3000);

    try {
        // Inject JS into webview to find all tweet URLs that contain video
        const videoUrls = await webview.executeJavaScript(`
            (function() {
                const urls = new Set();
                // Find all tweet articles
                const articles = document.querySelectorAll('article[data-testid="tweet"]');
                articles.forEach(article => {
                    // Check if this tweet has video content
                    const hasVideo = article.querySelector('video') ||
                                     article.querySelector('[data-testid="videoPlayer"]') ||
                                     article.querySelector('[data-testid="videoComponent"]') ||
                                     article.querySelector('div[data-testid="tweetPhoto"] video');

                    if (hasVideo) {
                        // Find the tweet URL
                        const timeEl = article.querySelector('time');
                        if (timeEl) {
                            const link = timeEl.closest('a');
                            if (link && link.href.includes('/status/')) {
                                urls.add(link.href);
                            }
                        }
                        // Fallback: find any /status/ link
                        if (urls.size === 0 || !timeEl) {
                            const links = article.querySelectorAll('a');
                            links.forEach(a => {
                                if (a.href.includes('/status/') && !a.href.includes('/photo/') && !a.href.includes('/analytics')) {
                                    urls.add(a.href);
                                }
                            });
                        }
                    }
                });
                return Array.from(urls);
            })();
        `);

        if (videoUrls && videoUrls.length > 0) {
            showToast(`📦 ${videoUrls.length} ${t('toastVideosFound')}`, 'info', 4000);

            for (let i = 0; i < videoUrls.length; i++) {
                setTimeout(() => {
                    startDownload(videoUrls[i]);
                }, i * 1500);
            }
        } else {
            showToast(t('toastNoVideos'), 'failed', 5000);
        }
    } catch (e) {
        console.error('Bulk download error:', e);
        showToast(`${t('toastScanError')} ${e.message}`, 'failed', 4000);
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
    const titleKeys = {
        'home': 'headerTitle',
        'downloads': 'downloadsTitle',
        'settings': 'settingsTitle'
    };
    elements.pageTitle.textContent = t(titleKeys[viewName]);
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
                elements.importStatus.textContent = `⚠️ ${t('enterAccountName')}`;
                elements.importStatus.style.color = '#f4212e';
                return;
            }

            elements.importChromeBtn.disabled = true;
            elements.importStatus.style.color = '#71767b';

            try {
                const res = await fetch(`${API_BASE}/import-chrome-cookies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ account: accountName })
                });
                const data = await res.json();

                if (data.success) {
                    elements.importStatus.textContent = `✅ ${data.cookie_count} ${t('cookieSuccess')}`;
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
                    elements.importStatus.textContent = `${t('cookieFail')} ${data.error}`;
                    elements.importStatus.style.color = '#f4212e';
                }
            } catch (e) {
                elements.importStatus.textContent = `${t('toastConnectionError')}: ${e.message}`;
                elements.importStatus.style.color = '#f4212e';
            } finally {
                elements.importChromeBtn.disabled = false;
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
