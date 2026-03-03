const { ipcRenderer } = require('electron');

console.log('X Downloader Preload Loaded');

// Wait for DOM
window.addEventListener('DOMContentLoaded', () => {
    observeFeed();
    checkProfile();
    // Check profile periodically
    setInterval(checkProfile, 10000);
});

let lastProfile = null;

function checkProfile() {
    // Try to find the account switcher button in sidebar which contains user info
    const accountButton = document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]');
    if (accountButton) {
        try {
            // Scrape info
            // User handle is usually in a span starting with @
            const handleEl = Array.from(accountButton.querySelectorAll('span')).find(el => el.textContent.startsWith('@'));
            const username = handleEl ? handleEl.textContent.substring(1) : null;

            // Display name is usually the first text node or bold text
            // Let's assume the text before username is display name
            // But checking other elements is safer.
            // Image is easy
            const img = accountButton.querySelector('img');
            const avatarUrl = img ? img.src : null;

            // Name
            const nameEl = accountButton.querySelector('div.r-1wbh5a2 > span'); // This class is fragile
            // Better: Find the container with text, name is first line, handle is second
            const textContainer = accountButton.querySelector('div[class*="r-16y2uox"]');
            let displayName = 'Unknown';
            if (textContainer) {
                const spans = textContainer.querySelectorAll('span');
                if (spans.length > 0) displayName = spans[0].textContent;
            }

            if (username && (lastProfile?.username !== username)) {
                const profile = { username, displayName, avatarUrl };
                console.log('Detected Profile:', profile);
                lastProfile = profile;
                ipcRenderer.invoke('auth:update-profile', profile);
            }
        } catch (e) {
            console.error('Error scraping profile:', e);
        }
    }
}

function observeFeed() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element
                        // Process the added node and its children
                        processTweets(node);
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial scan
    processTweets(document.body);
}

function processTweets(rootNode) {
    // Find all articles (tweets)
    const articles = rootNode.querySelectorAll('article[data-testid="tweet"]');
    articles.forEach(article => {
        injectDownloadButton(article);
    });

    // Also check if rootNode itself is a tweet (less likely but possible)
    if (rootNode.matches && rootNode.matches('article[data-testid="tweet"]')) {
        injectDownloadButton(rootNode);
    }
}

function injectDownloadButton(article) {
    if (article.dataset.xDownloaderProcessed) return;

    // Find the action bar (Reply, Retweet, Like, Share...)
    const actionBar = article.querySelector('div[role="group"]');
    if (!actionBar) {
        // console.log('No action bar found for article');
        return;
    }

    article.dataset.xDownloaderProcessed = 'true';

    const downloadBtn = document.createElement('div');
    downloadBtn.className = 'css-1dbjc4n r-18u37iz r-1h0z5md'; // Mimic X styling classes if possible, or use custom
    downloadBtn.style.cssText = 'display: flex; align-items: center; justify-content: center; cursor: pointer; margin-left: 10px; color: #1d9bf0; transition: color 0.2s;';
    downloadBtn.title = 'Download Media';
    downloadBtn.innerHTML = `
        <div dir="ltr" style="display: flex; align-items: center;">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
        </div>
    `;

    downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Finding the link to the tweet/status is critical
        // Usually there is a time element that links to the status
        const timeElement = article.querySelector('time');
        if (timeElement) {
            const link = timeElement.closest('a');
            if (link) {
                const tweetUrl = link.href;
                console.log('Download requested for:', tweetUrl);

                // Visual feedback
                downloadBtn.style.color = '#00ba7c'; // Green
                setTimeout(() => { downloadBtn.style.color = '#1d9bf0'; }, 2000);

                ipcRenderer.sendToHost('download-tweet', tweetUrl);
            } else {
                console.error('Could not find link in time element parent');
            }
        } else {
            // Fallback: try to find any link that contains /status/
            const links = Array.from(article.querySelectorAll('a'));
            const statusLink = links.find(a => a.href.includes('/status/'));
            if (statusLink) {
                const tweetUrl = statusLink.href;
                console.log('Download requested for (fallback):', tweetUrl);
                downloadBtn.style.color = '#00ba7c';
                setTimeout(() => { downloadBtn.style.color = '#1d9bf0'; }, 2000);
                ipcRenderer.sendToHost('download-tweet', tweetUrl);
            } else {
                console.error('Could not determine tweet URL');
            }
        }
    });

    actionBar.appendChild(downloadBtn);
    // console.log('Injected download button');
}
