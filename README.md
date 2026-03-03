# Social Video Utility

A professional desktop application for viewing and managing social media video content. Built with Electron and Python.

## ⚠️ Legal Disclaimer / Yasal Uyarı

**English:**
This software is provided for educational and personal use only. The developer does not encourage or facilitate any activity that violates the Terms of Service of any social media platform. Users are solely responsible for compliance with platform policies and copyright laws regarding the content they access or download. This tool is provided "as is" without any warranty.

**Türkçe:**
Bu yazılım sadece eğitim ve kişisel kullanım amacıyla geliştirilmiştir. Sosyal medya platformlarının kullanım koşullarını ihlal eden eylemlerden geliştirici sorumlu tutulamaz. İçeriklerin telif hakları ve platform politikalarına uyum konusundaki tüm sorumluluk kullanıcıya aittir. Bu araç "olduğu gibi" sunulmaktadır ve herhangi bir garanti içermez.

## Features
- Seamless feed viewing using integrated webview
- Local video management with duplicate detection
- Bulk download support for profile/media pages
- Non-intrusive toast notifications for download progress
- Multi-account support with local cookie isolation
- Dark glassmorphism UI design

## Installation

### Linux (.deb)
```bash
sudo dpkg -i social-video-utility_1.1.0_amd64.deb
sudo apt-get install -f
```

### Linux (AppImage)
```bash
chmod +x "Social Video Utility-1.1.0.AppImage"
./"Social Video Utility-1.1.0.AppImage"
```

### Windows (Portable)
Download and run `SocialVideoUtility-1.1.0-portable.exe` directly — no installation required.

## What's New in v1.1.0
- 🗑️ Removed right panel for cleaner UI
- 🔍 Duplicate download detection (prevents re-downloading existing videos)
- 📦 Bulk download from user profile/media pages
- 🔔 Toast notifications — downloads run in background without switching tabs
- 🖥️ Windows portable app support
- 📦 AppImage support for Linux

## Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the application: `npm start`

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
