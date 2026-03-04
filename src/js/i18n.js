/**
 * Internationalization (i18n) module for Social Video Utility
 * Supported languages: EN, ES, IT, ZH, DE, AR, TR
 */

const translations = {
    en: {
        // Sidebar
        home: 'Home',
        downloads: 'Downloads',
        settings: 'Settings / Login',
        login: 'Login',

        // Header
        headerTitle: 'Home',
        downloadBtn: 'Download Video',
        bulkBtn: 'Download All',

        // Downloads view
        downloadsTitle: 'Downloads',
        openFolder: 'Open Folder',
        noDownloads: 'No downloads yet. Browse and click the download button on any video.',

        // Settings view
        settingsTitle: 'Settings',
        accountManagement: 'Account Management',
        accountDesc: 'Login to your social media account in your browser, then import cookies from here.',
        accountName: 'Account name (e.g. main_account)',
        importChrome: 'Import from Chrome',
        webviewLogin: 'Webview Login',
        webviewLoginDesc: 'Alternatively, you can login within the app (may not work with some accounts).',
        webviewLoginBtn: 'Login with Webview',
        legalWarning: 'Legal Warning',
        legalText: 'This application is for personal use and educational purposes only. The user is solely responsible for compliance with social media platform terms of service and copyright of downloaded content. The developer cannot be held responsible for any misuse of the application.',
        languageTitle: 'Language',
        languageDesc: 'Select your preferred language',

        // Toast messages
        toastDownloadStarted: '⬇️ Download started',
        toastAlreadyDownloading: '⚠️ This video is already being downloaded',
        toastCompleted: '✅',
        toastDuplicate: '⚠️ Already exists:',
        toastScanning: '🔍 Scanning videos on the page...',
        toastVideosFound: '📦 videos found, starting download...',
        toastNoVideos: '❌ No posts with video found on this page. Scroll down to load more posts.',
        toastScanError: '❌ Could not scan page:',
        toastConnectionError: '❌ Connection Error',
        toastError: '❌ Error:',

        // Download status
        statusDownloading: 'Downloading...',
        statusCompleted: 'Completed:',
        statusFailed: 'Error:',
        statusDuplicate: 'Already exists:',
        clickToOpen: 'Click to open the existing video',
        clickToPlay: 'Click to play the video',

        // Cookie import
        cookieSuccess: 'cookies loaded. Redirecting to home page...',
        cookieFail: 'Cookie import failed:',
        enterAccountName: 'Please enter an account name',
    },

    tr: {
        home: 'Anasayfa',
        downloads: 'İndirilenler',
        settings: 'Ayarlar / Giriş',
        login: 'Giriş Yap',
        headerTitle: 'Anasayfa',
        downloadBtn: 'Videoyu İndir',
        bulkBtn: 'Tümünü İndir',
        downloadsTitle: 'İndirilenler',
        openFolder: 'Klasörü Aç',
        noDownloads: 'Henüz indirme yok. Gezinin ve herhangi bir videodaki indirme butonuna tıklayın.',
        settingsTitle: 'Ayarlar',
        accountManagement: 'Hesap Yönetimi',
        accountDesc: 'Tarayıcınızda sosyal medya hesabınıza giriş yapın, ardından buradan çerezleri içe aktarın.',
        accountName: 'Hesap adı (ör: ana_hesap)',
        importChrome: 'Chrome\'dan İçe Aktar',
        webviewLogin: 'Webview Girişi',
        webviewLoginDesc: 'Alternatif olarak uygulama içinden de giriş yapabilirsiniz (bazı hesaplarda çalışmayabilir).',
        webviewLoginBtn: 'Webview ile Giriş Yap',
        legalWarning: 'Yasal Uyarı',
        legalText: 'Bu uygulama sadece kişisel kullanım ve eğitim amaçlıdır. Sosyal medya platformlarının kullanım koşullarını ihlal eden işlemlerden ve indirilen içeriklerin telif haklarından tamamen kullanıcı sorumludur. Geliştirici, uygulamanın yanlış kullanımından doğacak hiçbir sorundan mesul tutulamaz.',
        languageTitle: 'Dil',
        languageDesc: 'Tercih ettiğiniz dili seçin',
        toastDownloadStarted: '⬇️ İndirme başladı',
        toastAlreadyDownloading: '⚠️ Bu video zaten indiriliyor',
        toastCompleted: '✅',
        toastDuplicate: '⚠️ Zaten mevcut:',
        toastScanning: '🔍 Sayfadaki videolar taranıyor...',
        toastVideosFound: '📦 video bulundu, indirme başlıyor...',
        toastNoVideos: '❌ Bu sayfada video içeren gönderi bulunamadı. Aşağı kaydırarak daha fazla gönderi yükleyin.',
        toastScanError: '❌ Sayfa taranamadı:',
        toastConnectionError: '❌ Bağlantı Hatası',
        toastError: '❌ Hata:',
        statusDownloading: 'İndiriliyor...',
        statusCompleted: 'Tamamlandı:',
        statusFailed: 'Hata:',
        statusDuplicate: 'Zaten mevcut:',
        clickToOpen: 'Mevcut videoyu açmak için tıkla',
        clickToPlay: 'Videoyu oynatmak için tıkla',
        cookieSuccess: 'çerez yüklendi. Anasayfaya yönlendiriliyorsunuz...',
        cookieFail: 'Çerez içe aktarma başarısız:',
        enterAccountName: 'Lütfen bir hesap adı girin',
    },

    es: {
        home: 'Inicio',
        downloads: 'Descargas',
        settings: 'Ajustes / Iniciar sesión',
        login: 'Iniciar sesión',
        headerTitle: 'Inicio',
        downloadBtn: 'Descargar vídeo',
        bulkBtn: 'Descargar todo',
        downloadsTitle: 'Descargas',
        openFolder: 'Abrir carpeta',
        noDownloads: 'Sin descargas aún. Navega y haz clic en el botón de descarga de cualquier vídeo.',
        settingsTitle: 'Ajustes',
        accountManagement: 'Gestión de cuentas',
        accountDesc: 'Inicia sesión en tu cuenta de redes sociales en tu navegador y luego importa las cookies desde aquí.',
        accountName: 'Nombre de cuenta (ej: cuenta_principal)',
        importChrome: 'Importar desde Chrome',
        webviewLogin: 'Inicio de sesión Webview',
        webviewLoginDesc: 'Alternativamente, puedes iniciar sesión dentro de la aplicación (puede no funcionar con algunas cuentas).',
        webviewLoginBtn: 'Iniciar sesión con Webview',
        legalWarning: 'Aviso legal',
        legalText: 'Esta aplicación es solo para uso personal y educativo. El usuario es el único responsable del cumplimiento de los términos de servicio de las plataformas de redes sociales y los derechos de autor del contenido descargado. El desarrollador no se hace responsable del uso indebido de la aplicación.',
        languageTitle: 'Idioma',
        languageDesc: 'Selecciona tu idioma preferido',
        toastDownloadStarted: '⬇️ Descarga iniciada',
        toastAlreadyDownloading: '⚠️ Este vídeo ya se está descargando',
        toastCompleted: '✅',
        toastDuplicate: '⚠️ Ya existe:',
        toastScanning: '🔍 Buscando vídeos en la página...',
        toastVideosFound: '📦 vídeos encontrados, iniciando descarga...',
        toastNoVideos: '❌ No se encontraron publicaciones con vídeo. Desplázate hacia abajo para cargar más.',
        toastScanError: '❌ No se pudo escanear la página:',
        toastConnectionError: '❌ Error de conexión',
        toastError: '❌ Error:',
        statusDownloading: 'Descargando...',
        statusCompleted: 'Completado:',
        statusFailed: 'Error:',
        statusDuplicate: 'Ya existe:',
        clickToOpen: 'Clic para abrir el vídeo existente',
        clickToPlay: 'Clic para reproducir el vídeo',
        cookieSuccess: 'cookies cargadas. Redirigiendo a la página de inicio...',
        cookieFail: 'Error al importar cookies:',
        enterAccountName: 'Por favor, introduce un nombre de cuenta',
    },

    it: {
        home: 'Home',
        downloads: 'Download',
        settings: 'Impostazioni / Accedi',
        login: 'Accedi',
        headerTitle: 'Home',
        downloadBtn: 'Scarica video',
        bulkBtn: 'Scarica tutto',
        downloadsTitle: 'Download',
        openFolder: 'Apri cartella',
        noDownloads: 'Nessun download ancora. Naviga e clicca sul pulsante di download su qualsiasi video.',
        settingsTitle: 'Impostazioni',
        accountManagement: 'Gestione account',
        accountDesc: 'Accedi al tuo account social media nel browser, poi importa i cookie da qui.',
        accountName: 'Nome account (es: account_principale)',
        importChrome: 'Importa da Chrome',
        webviewLogin: 'Accesso Webview',
        webviewLoginDesc: 'In alternativa, puoi accedere dall\'interno dell\'app (potrebbe non funzionare con alcuni account).',
        webviewLoginBtn: 'Accedi con Webview',
        legalWarning: 'Avviso legale',
        legalText: 'Questa applicazione è solo per uso personale e didattico. L\'utente è l\'unico responsabile del rispetto dei termini di servizio delle piattaforme social e dei diritti d\'autore dei contenuti scaricati. Lo sviluppatore non può essere ritenuto responsabile per qualsiasi uso improprio dell\'applicazione.',
        languageTitle: 'Lingua',
        languageDesc: 'Seleziona la tua lingua preferita',
        toastDownloadStarted: '⬇️ Download avviato',
        toastAlreadyDownloading: '⚠️ Questo video è già in fase di download',
        toastCompleted: '✅',
        toastDuplicate: '⚠️ Già esistente:',
        toastScanning: '🔍 Ricerca video nella pagina...',
        toastVideosFound: '📦 video trovati, avvio download...',
        toastNoVideos: '❌ Nessun post con video trovato. Scorri verso il basso per caricare più post.',
        toastScanError: '❌ Impossibile scansionare la pagina:',
        toastConnectionError: '❌ Errore di connessione',
        toastError: '❌ Errore:',
        statusDownloading: 'Download in corso...',
        statusCompleted: 'Completato:',
        statusFailed: 'Errore:',
        statusDuplicate: 'Già esistente:',
        clickToOpen: 'Clicca per aprire il video esistente',
        clickToPlay: 'Clicca per riprodurre il video',
        cookieSuccess: 'cookie caricati. Reindirizzamento alla home page...',
        cookieFail: 'Importazione cookie fallita:',
        enterAccountName: 'Inserisci un nome account',
    },

    zh: {
        home: '首页',
        downloads: '下载',
        settings: '设置 / 登录',
        login: '登录',
        headerTitle: '首页',
        downloadBtn: '下载视频',
        bulkBtn: '全部下载',
        downloadsTitle: '下载',
        openFolder: '打开文件夹',
        noDownloads: '暂无下载。浏览并点击任意视频上的下载按钮。',
        settingsTitle: '设置',
        accountManagement: '账户管理',
        accountDesc: '在浏览器中登录您的社交媒体账户，然后从此处导入Cookie。',
        accountName: '账户名称（例如：主账户）',
        importChrome: '从Chrome导入',
        webviewLogin: 'Webview登录',
        webviewLoginDesc: '或者，您可以在应用内登录（某些账户可能无法使用）。',
        webviewLoginBtn: '使用Webview登录',
        legalWarning: '法律声明',
        legalText: '本应用仅供个人使用和教育目的。用户应自行遵守社交媒体平台的服务条款和下载内容的版权。开发者不对应用的任何不当使用承担责任。',
        languageTitle: '语言',
        languageDesc: '选择您的首选语言',
        toastDownloadStarted: '⬇️ 开始下载',
        toastAlreadyDownloading: '⚠️ 该视频已在下载中',
        toastCompleted: '✅',
        toastDuplicate: '⚠️ 已存在：',
        toastScanning: '🔍 正在扫描页面上的视频...',
        toastVideosFound: '📦 个视频已找到，开始下载...',
        toastNoVideos: '❌ 此页面未找到包含视频的帖子。向下滚动以加载更多帖子。',
        toastScanError: '❌ 无法扫描页面：',
        toastConnectionError: '❌ 连接错误',
        toastError: '❌ 错误：',
        statusDownloading: '下载中...',
        statusCompleted: '已完成：',
        statusFailed: '错误：',
        statusDuplicate: '已存在：',
        clickToOpen: '点击打开已有视频',
        clickToPlay: '点击播放视频',
        cookieSuccess: '个Cookie已加载。正在跳转到首页...',
        cookieFail: 'Cookie导入失败：',
        enterAccountName: '请输入账户名称',
    },

    de: {
        home: 'Startseite',
        downloads: 'Downloads',
        settings: 'Einstellungen / Anmelden',
        login: 'Anmelden',
        headerTitle: 'Startseite',
        downloadBtn: 'Video herunterladen',
        bulkBtn: 'Alle herunterladen',
        downloadsTitle: 'Downloads',
        openFolder: 'Ordner öffnen',
        noDownloads: 'Noch keine Downloads. Stöbern Sie und klicken Sie auf den Download-Button bei einem Video.',
        settingsTitle: 'Einstellungen',
        accountManagement: 'Kontoverwaltung',
        accountDesc: 'Melden Sie sich in Ihrem Browser bei Ihrem Social-Media-Konto an und importieren Sie dann die Cookies von hier.',
        accountName: 'Kontoname (z.B. haupt_konto)',
        importChrome: 'Aus Chrome importieren',
        webviewLogin: 'Webview-Anmeldung',
        webviewLoginDesc: 'Alternativ können Sie sich innerhalb der App anmelden (funktioniert möglicherweise nicht bei allen Konten).',
        webviewLoginBtn: 'Mit Webview anmelden',
        legalWarning: 'Rechtlicher Hinweis',
        legalText: 'Diese Anwendung ist nur für den persönlichen Gebrauch und Bildungszwecke bestimmt. Der Benutzer ist allein verantwortlich für die Einhaltung der Nutzungsbedingungen der Social-Media-Plattformen und der Urheberrechte heruntergeladener Inhalte. Der Entwickler kann nicht für den Missbrauch der Anwendung verantwortlich gemacht werden.',
        languageTitle: 'Sprache',
        languageDesc: 'Wählen Sie Ihre bevorzugte Sprache',
        toastDownloadStarted: '⬇️ Download gestartet',
        toastAlreadyDownloading: '⚠️ Dieses Video wird bereits heruntergeladen',
        toastCompleted: '✅',
        toastDuplicate: '⚠️ Bereits vorhanden:',
        toastScanning: '🔍 Videos auf der Seite werden gesucht...',
        toastVideosFound: '📦 Videos gefunden, Download wird gestartet...',
        toastNoVideos: '❌ Keine Beiträge mit Video auf dieser Seite gefunden. Scrollen Sie nach unten, um mehr zu laden.',
        toastScanError: '❌ Seite konnte nicht gescannt werden:',
        toastConnectionError: '❌ Verbindungsfehler',
        toastError: '❌ Fehler:',
        statusDownloading: 'Herunterladen...',
        statusCompleted: 'Abgeschlossen:',
        statusFailed: 'Fehler:',
        statusDuplicate: 'Bereits vorhanden:',
        clickToOpen: 'Klicken, um das vorhandene Video zu öffnen',
        clickToPlay: 'Klicken, um das Video abzuspielen',
        cookieSuccess: 'Cookies geladen. Weiterleitung zur Startseite...',
        cookieFail: 'Cookie-Import fehlgeschlagen:',
        enterAccountName: 'Bitte geben Sie einen Kontonamen ein',
    },

    ar: {
        home: 'الرئيسية',
        downloads: 'التنزيلات',
        settings: 'الإعدادات / تسجيل الدخول',
        login: 'تسجيل الدخول',
        headerTitle: 'الرئيسية',
        downloadBtn: 'تنزيل الفيديو',
        bulkBtn: 'تنزيل الكل',
        downloadsTitle: 'التنزيلات',
        openFolder: 'فتح المجلد',
        noDownloads: 'لا توجد تنزيلات بعد. تصفح وانقر على زر التنزيل في أي فيديو.',
        settingsTitle: 'الإعدادات',
        accountManagement: 'إدارة الحساب',
        accountDesc: 'سجل الدخول إلى حسابك على وسائل التواصل الاجتماعي في متصفحك، ثم قم باستيراد ملفات تعريف الارتباط من هنا.',
        accountName: 'اسم الحساب (مثال: الحساب_الرئيسي)',
        importChrome: 'استيراد من Chrome',
        webviewLogin: 'تسجيل دخول Webview',
        webviewLoginDesc: 'بدلاً من ذلك، يمكنك تسجيل الدخول من داخل التطبيق (قد لا يعمل مع بعض الحسابات).',
        webviewLoginBtn: 'تسجيل الدخول عبر Webview',
        legalWarning: 'تحذير قانوني',
        legalText: 'هذا التطبيق مخصص للاستخدام الشخصي والتعليمي فقط. المستخدم هو المسؤول الوحيد عن الامتثال لشروط خدمة منصات التواصل الاجتماعي وحقوق النشر للمحتوى المُنزَّل. لا يمكن تحميل المطور مسؤولية أي استخدام غير مشروع للتطبيق.',
        languageTitle: 'اللغة',
        languageDesc: 'اختر لغتك المفضلة',
        toastDownloadStarted: '⬇️ بدأ التنزيل',
        toastAlreadyDownloading: '⚠️ هذا الفيديو قيد التنزيل بالفعل',
        toastCompleted: '✅',
        toastDuplicate: '⚠️ موجود بالفعل:',
        toastScanning: '🔍 جاري البحث عن فيديوهات في الصفحة...',
        toastVideosFound: '📦 فيديوهات تم العثور عليها، بدء التنزيل...',
        toastNoVideos: '❌ لم يتم العثور على منشورات تحتوي على فيديو. قم بالتمرير لأسفل لتحميل المزيد.',
        toastScanError: '❌ تعذر مسح الصفحة:',
        toastConnectionError: '❌ خطأ في الاتصال',
        toastError: '❌ خطأ:',
        statusDownloading: 'جاري التنزيل...',
        statusCompleted: 'اكتمل:',
        statusFailed: 'خطأ:',
        statusDuplicate: 'موجود بالفعل:',
        clickToOpen: 'انقر لفتح الفيديو الموجود',
        clickToPlay: 'انقر لتشغيل الفيديو',
        cookieSuccess: 'تم تحميل ملفات تعريف الارتباط. جاري إعادة التوجيه...',
        cookieFail: 'فشل استيراد ملفات تعريف الارتباط:',
        enterAccountName: 'الرجاء إدخال اسم الحساب',
    }
};

const languageNames = {
    en: '🇬🇧 English',
    tr: '🇹🇷 Türkçe',
    es: '🇪🇸 Español',
    it: '🇮🇹 Italiano',
    zh: '🇨🇳 中文',
    de: '🇩🇪 Deutsch',
    ar: '🇸🇦 العربية',
};

let currentLang = 'tr';

function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) ||
        translations.en[key] || key;
}

function setLanguage(lang) {
    if (translations[lang]) {
        currentLang = lang;
        localStorage.setItem('svu-language', lang);
        applyTranslations();
    }
}

function loadLanguage() {
    const saved = localStorage.getItem('svu-language');
    if (saved && translations[saved]) {
        currentLang = saved;
    }
}

function applyTranslations() {
    // Sidebar
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    // Placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });

    // Title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.title = t(key);
    });

    // Update language selector
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        langSelect.value = currentLang;
    }

    // Handle RTL for Arabic
    document.body.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
}
