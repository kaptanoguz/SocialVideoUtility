import os
import sys
import threading
import uuid
import json
import glob
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp

app = Flask(__name__)
CORS(app)

# Configuration
CONFIG_DIR = os.path.join(os.path.expanduser('~'), '.social-video-utility')
COOKIES_FILE = os.path.join(CONFIG_DIR, 'cookies.txt')
DOWNLOAD_DIR = os.path.join(os.path.expanduser('~'), 'Downloads', 'SocialVideoUtility')

os.makedirs(CONFIG_DIR, exist_ok=True)
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# State
download_tasks = {}
currently_downloading_urls = set()  # Track URLs currently being downloaded


def get_cookie_opts(account=None):
    """Get yt-dlp cookie options for given account."""
    opts = {}
    if account:
        account_cookie = os.path.join(CONFIG_DIR, f'cookies_{account}.txt')
        if os.path.exists(account_cookie):
            opts['cookiefile'] = account_cookie
            return opts
    # Try Chrome first
    opts['cookiesfrombrowser'] = ('chrome',)
    return opts


def check_file_exists_for_url(url):
    """Check if we already have a downloaded file for this URL."""
    try:
        # Extract video ID from the URL (works for x.com/twitter.com status URLs)
        match = re.search(r'/status/(\d+)', url)
        if match:
            video_id = match.group(1)
            # Check if any file in download dir contains this video ID
            for f in os.listdir(DOWNLOAD_DIR):
                if video_id in f:
                    filepath = os.path.join(DOWNLOAD_DIR, f)
                    return {'duplicate': True, 'filename': f, 'filepath': filepath}

        # Also check if this URL is currently being downloaded
        if url in currently_downloading_urls:
            return {'duplicate': True, 'filename': '(indirme devam ediyor)', 'filepath': None}

    except Exception as e:
        print(f"Duplicate check warning: {e}")

    return {'duplicate': False}


def dl_worker(task_id, url, account=None):
    try:
        download_tasks[task_id]['status'] = 'downloading'
        download_tasks[task_id]['progress'] = 0

        def progress_hook(d):
            if d['status'] == 'downloading':
                total = d.get('total_bytes') or d.get('total_bytes_estimate') or 0
                downloaded = d.get('downloaded_bytes', 0)
                if total > 0:
                    download_tasks[task_id]['progress'] = int((downloaded / total) * 100)
                download_tasks[task_id]['filename'] = os.path.basename(d.get('filename', ''))
            elif d['status'] == 'finished':
                download_tasks[task_id]['progress'] = 100
                download_tasks[task_id]['filename'] = os.path.basename(d.get('filename', ''))

        ydl_opts = {
            'outtmpl': os.path.join(DOWNLOAD_DIR, '%(uploader)s_%(id)s.%(ext)s'),
            'quiet': True,
            'no_warnings': True,
            'format': 'best[ext=mp4]/best',
            'merge_output_format': 'mp4',
            'progress_hooks': [progress_hook],
        }

        # Determine cookie source
        cookie_opts = get_cookie_opts(account)
        ydl_opts.update(cookie_opts)

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
        except Exception as e:
            if 'cookiesfrombrowser' in ydl_opts and ('cookie' in str(e).lower() or 'browser' in str(e).lower()):
                print(f"Chrome cookies failed ({e}), trying cookies.txt fallback...")
                ydl_opts.pop('cookiesfrombrowser', None)
                if os.path.exists(COOKIES_FILE):
                    ydl_opts['cookiefile'] = COOKIES_FILE
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    ydl.download([url])
            else:
                raise

        download_tasks[task_id]['status'] = 'completed'
        download_tasks[task_id]['progress'] = 100

    except Exception as e:
        download_tasks[task_id]['status'] = 'failed'
        download_tasks[task_id]['error'] = str(e)
        print(f"Download failed: {e}")
    finally:
        currently_downloading_urls.discard(url)


@app.route('/api/check-duplicate', methods=['POST'])
def check_duplicate():
    """Check if a video URL has already been downloaded."""
    data = request.json
    if not data or 'url' not in data:
        return jsonify({'duplicate': False})

    result = check_file_exists_for_url(data['url'])
    return jsonify(result)


@app.route('/api/bulk-extract', methods=['POST'])
def bulk_extract():
    """Extract all video URLs from a user's profile/media page."""
    data = request.json
    if not data or 'url' not in data:
        return jsonify({'error': 'URL required', 'urls': []}), 400

    profile_url = data['url']
    account = data.get('account')

    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': 'in_playlist',
            'simulate': True,
            'skip_download': True,
            'playlistend': 50,  # Limit to 50 videos max
        }

        cookie_opts = get_cookie_opts(account)
        ydl_opts.update(cookie_opts)

        # If not already a /media URL, try /media first for videos
        if '/media' not in profile_url:
            media_url = profile_url.rstrip('/') + '/media'
        else:
            media_url = profile_url

        urls = []

        def try_extract(target_url):
            extracted = []
            try:
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    result = ydl.extract_info(target_url, download=False)
                    if result:
                        if 'entries' in result:
                            for entry in result['entries']:
                                if entry and entry.get('url'):
                                    extracted.append(entry['url'])
                                elif entry and entry.get('webpage_url'):
                                    extracted.append(entry['webpage_url'])
                        elif result.get('webpage_url'):
                            extracted.append(result['webpage_url'])
            except Exception as e:
                print(f"Bulk extract from {target_url}: {e}")
            return extracted

        # Try media URL first
        urls = try_extract(media_url)

        # If no results, try the original profile URL
        if not urls and media_url != profile_url:
            urls = try_extract(profile_url)

        if urls:
            return jsonify({'urls': urls, 'count': len(urls)})
        else:
            return jsonify({'error': 'Bu sayfada indirilebilir video bulunamadı', 'urls': []})

    except Exception as e:
        return jsonify({'error': str(e), 'urls': []}), 500


@app.route('/api/download', methods=['POST'])
def download():
    data = request.json
    if not data or 'url' not in data:
        return jsonify({'error': 'URL required'}), 400

    url = data['url']
    account = data.get('account')

    # Server-side duplicate check
    dup = check_file_exists_for_url(url)
    if dup['duplicate']:
        return jsonify({
            'status': 'duplicate',
            'filename': dup['filename'],
            'filepath': dup.get('filepath'),
            'download_dir': DOWNLOAD_DIR
        })

    task_id = str(uuid.uuid4())
    currently_downloading_urls.add(url)

    download_tasks[task_id] = {
        'status': 'pending',
        'url': url,
        'progress': 0,
        'filename': '',
        'account': account or 'chrome'
    }

    thread = threading.Thread(target=dl_worker, args=(task_id, url, account))
    thread.daemon = True
    thread.start()

    return jsonify({
        'task_id': task_id,
        'status': 'started',
        'download_dir': DOWNLOAD_DIR
    })

@app.route('/api/status/<task_id>', methods=['GET'])
def get_status(task_id):
    task = download_tasks.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify(task)

@app.route('/api/import-chrome-cookies', methods=['POST'])
def import_chrome_cookies():
    """Extract cookies from Chrome and save them for a named account."""
    data = request.json or {}
    account_name = data.get('account', 'default')

    try:
        ydl_opts = {
            'quiet': True,
            'cookiesfrombrowser': ('chrome',),
            'simulate': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            jar = ydl.cookiejar
            x_cookies = [c for c in jar if 'x.com' in c.domain or 'twitter.com' in c.domain]

            if not x_cookies:
                return jsonify({'error': 'Chrome\'da X.com çerezleri bulunamadı. Lütfen Chrome\'da X.com\'a giriş yapın.'}), 400

            cookie_file = os.path.join(CONFIG_DIR, f'cookies_{account_name}.txt')
            cookie_string = '# Netscape HTTP Cookie File\n# Generated by Social Video Utility\n\n'
            for c in jar:
                domain = c.domain if c.domain.startswith('.') else '.' + c.domain
                secure = 'TRUE' if c.secure else 'FALSE'
                expires = str(c.expires) if c.expires else '0'
                cookie_string += f'{domain}\tTRUE\t{c.path}\t{secure}\t{expires}\t{c.name}\t{c.value}\n'

            with open(cookie_file, 'w') as f:
                f.write(cookie_string)

            with open(COOKIES_FILE, 'w') as f:
                f.write(cookie_string)

            username = None
            for c in x_cookies:
                if c.name == 'twid':
                    username = c.value
                    break

            return jsonify({
                'success': True,
                'account': account_name,
                'cookie_count': len(x_cookies),
                'total_cookies': len(list(jar)),
                'username_hint': username,
                'cookie_file': cookie_file
            })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/cookies', methods=['POST'])
def upload_cookies():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file:
        file.save(COOKIES_FILE)
        return jsonify({'success': True})
    return jsonify({'error': 'No file'}), 400

@app.route('/api/accounts', methods=['GET'])
def list_accounts():
    """List saved account cookie files."""
    accounts = []
    for f in os.listdir(CONFIG_DIR):
        if f.startswith('cookies_') and f.endswith('.txt'):
            name = f[8:-4]
            filepath = os.path.join(CONFIG_DIR, f)
            accounts.append({
                'name': name,
                'file': filepath,
                'size': os.path.getsize(filepath),
                'modified': os.path.getmtime(filepath)
            })
    return jsonify({'accounts': accounts})

@app.route('/api/feed', methods=['GET'])
def get_feed():
    return jsonify({'error': 'Use webview interface'}), 404

if __name__ == '__main__':
    print("Starting Social Video Utility Backend...")
    print(f"Downloads will be saved to: {DOWNLOAD_DIR}")
    print(f"Config directory: {CONFIG_DIR}")
    print("Using browser cookies for authentication")
    app.run(port=5001)
