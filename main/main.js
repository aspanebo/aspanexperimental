// ========== LANGUAGE SYSTEM ========== //
const LanguageManager = {
    currentLang: 'en',
    supportedLangs: ['en', 'ru', 'kk', 'zh'],
    
    // Маппинг URL параметров к кодам языков
    urlToLang: { 'en': 'en', 'ru': 'ru', 'kz': 'kk', 'cn': 'zh' },
    langToUrl: { 'en': 'en', 'ru': 'ru', 'kk': 'kz', 'zh': 'cn' },
    
    init() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        const storedLang = localStorage.getItem('aspan_language');
        
        if (urlLang && this.urlToLang[urlLang]) {
            this.currentLang = this.urlToLang[urlLang];
            localStorage.setItem('aspan_language', this.currentLang);
        } else if (storedLang && this.supportedLangs.includes(storedLang)) {
            this.currentLang = storedLang;
        }
        
        this.applyTranslations();
        this.updateActiveButton();
        this.setupListeners();
    },
    
    setupListeners() {
        document.querySelectorAll('footer nav ul li a[href*="lang="]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const url = new URL(link.href, window.location.origin);
                const urlLang = url.searchParams.get('lang');
                const actualLang = this.urlToLang[urlLang];
                
                if (actualLang && this.supportedLangs.includes(actualLang)) {
                    this.setLanguage(actualLang);
                }
            });
        });
    },
    
    setLanguage(lang) {
        if (!this.supportedLangs.includes(lang)) return;
        
        this.currentLang = lang;
        localStorage.setItem('aspan_language', lang);
        
        this.applyTranslations();
        this.updateActiveButton();
        
        // Update URL without reload
        const url = new URL(window.location);
        url.searchParams.set('lang', this.langToUrl[lang]);
        window.history.replaceState({}, '', url);
    },
    
    updateActiveButton() {
        const currentUrlParam = this.langToUrl[this.currentLang];
        
        document.querySelectorAll('footer nav ul li a[href*="lang="]').forEach(link => {
            link.classList.remove('active-lang');
            if (link.href.includes(`lang=${currentUrlParam}`)) {
                link.classList.add('active-lang');
            }
        });
    },
    
    getTranslation(key) {
        if (typeof translations === 'undefined') return key;
        const langData = translations[this.currentLang] || translations['en'];
        return langData[key] || translations['en'][key] || key;
    },
    
    applyTranslations() {
        if (typeof translations === 'undefined') return;
        
        // Translate elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            const translation = this.getTranslation(key);
            
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } else {
                el.textContent = translation;
            }
        });
        
        // Translate elements with data-translate-html (for HTML content with line breaks)
        document.querySelectorAll('[data-translate-html]').forEach(el => {
            const key = el.getAttribute('data-translate-html');
            const translation = this.getTranslation(key);
            el.innerHTML = translation.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
        });
        
        // Update html lang attribute
        document.documentElement.lang = this.currentLang === 'kk' ? 'kk' : 
                                        this.currentLang === 'zh' ? 'zh' : 
                                        this.currentLang === 'ru' ? 'ru' : 'en';
    }
};

// ========== SCROLL BEHAVIOR ========== //
window.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    let lastY = window.scrollY;

    window.addEventListener("scroll", () => {
        const currentY = window.scrollY;

        if (currentY > lastY && currentY > 50) {
            // скролл вниз — спрятать шапку, показать футер
            header.classList.add("hidden");
            footer.classList.remove("hidden");
        } else {
            // скролл вверх — показать шапку, спрятать футер
            header.classList.remove("hidden");
            footer.classList.add("hidden");
        }

        lastY = currentY;

        // Проверяем, находимся ли мы в красной секции
        const redSection = document.querySelector(".work-experience");
        if (redSection) {
            const rect = redSection.getBoundingClientRect();
            const isInRedSection = rect.top < window.innerHeight && rect.bottom > 0;

            if (isInRedSection) {
                header.classList.add("on-red-section");
                footer.classList.add("on-red-section");
            } else {
                header.classList.remove("on-red-section");
                footer.classList.remove("on-red-section");
            }
        }
    });

    // ========== LOADER ========== //
    function createLoader() {
        if (document.getElementById('page-loader')) return;
        const loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.innerHTML = '<div class="loader-spinner"></div>';
        document.body.appendChild(loader);
    }

    function showLoader() {
        createLoader();
        document.getElementById('page-loader').classList.add('active');
    }

    function hideLoader() {
        const loader = document.getElementById('page-loader');
        if (loader) loader.classList.remove('active');
    }

    // Показать loader при переходе по ссылкам
    document.querySelectorAll('a[href]:not([href^="#"]):not([target="_blank"])').forEach(link => {
        link.addEventListener('click', function(e) {
            // Только если не mailto/tel
            if (this.href.startsWith('mailto:') || this.href.startsWith('tel:')) return;
            if (this.href.includes('lang=')) return; // Не показывать лоадер при смене языка
            showLoader();
        });
    });

    // Скрыть loader после загрузки страницы
    hideLoader();
    
    // ========== INIT LANGUAGE SYSTEM ========== //
    LanguageManager.init();
});

