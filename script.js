// Cookie Management
// Cookie preferences helpers
const COOKIE_KEY = 'cookiePreferences';

function getCookiePreferences() {
    try {
        const raw = localStorage.getItem(COOKIE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function saveCookiePreferences(prefs) {
    localStorage.setItem(COOKIE_KEY, JSON.stringify(prefs));
}

function acceptAllCookies() {
    const prefs = { necessary: true, analytics: true, marketing: true };
    saveCookiePreferences(prefs);
    applyCookiePreferences();
    hideCookieBanner();
}

function openCookieSettings() {
    const modal = document.getElementById('cookieSettingsModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    // populate current prefs
    const prefs = getCookiePreferences();
    if (prefs) {
        const elA = document.getElementById('cookieAnalytics');
        const elM = document.getElementById('cookieMarketing');
        if (elA) elA.checked = !!prefs.analytics;
        if (elM) elM.checked = !!prefs.marketing;
    }
}

// Privacy modal functions
function openPrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
}

function closePrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
}

// Close privacy modal when clicking outside panel or pressing Escape
function initPrivacyModalInteractions() {
    const modal = document.getElementById('privacyModal');
    if (!modal) return;
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closePrivacyModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePrivacyModal();
    });
}

function closeCookieSettings() {
    const modal = document.getElementById('cookieSettingsModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
}

function hideCookieBanner() {
    const cookieConsent = document.getElementById('cookieConsent');
    if (cookieConsent) cookieConsent.classList.add('hidden');
}

// legacy compatibility: some buttons still called acceptCookies()
function acceptCookies() {
    acceptAllCookies();
}

function applyCookiePreferences() {
    const prefs = getCookiePreferences();
    // If nothing selected, do minimal behavior: show banner
    if (!prefs) return;

    // hide banner when any choice saved
    hideCookieBanner();

    // No inline contact form on this site — contact details are always visible.
    // Marketing: nothing to enable (map removed); left for future use
}

// Intersection Observer for animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all elements with slide-up class
    document.querySelectorAll('.slide-up').forEach(el => {
        observer.observe(el);
    });
}

// Navbar scroll effect
function initNavbarScroll() {
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
}

// Keep a CSS variable in sync with the navbar height so CSS can adapt spacing
function updateHeaderHeightCSSVar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const h = navbar.offsetHeight || 0;
    // set both desktop and mobile vars (CSS falls back if not used)
    document.documentElement.style.setProperty('--header-height', h + 'px');
    document.documentElement.style.setProperty('--header-height-mobile', Math.max(56, Math.round(h * 0.7)) + 'px');
}

// small debounce helper
function debounce(fn, wait = 100) {
    let t;
    return function () {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, arguments), wait);
    };
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            // Don't scroll if it's just "#"
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                // update CSS var in case header changed size and compute offset
                updateHeaderHeightCSSVar();
                const navbar = document.querySelector('.navbar');
                const headerHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
}

// Initialize all functions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set header height CSS var immediately so initial layout uses correct spacing
    updateHeaderHeightCSSVar();
    // Wire cookie buttons
    const btnAccept = document.getElementById('acceptAll');
    const btnOpenSettings = document.getElementById('openCookieSettings');
    const btnSave = document.getElementById('saveCookieSettings');
    const btnCancel = document.getElementById('cancelCookieSettings');

    if (btnAccept) btnAccept.addEventListener('click', acceptAllCookies);
    if (btnOpenSettings) btnOpenSettings.addEventListener('click', openCookieSettings);
    // banner learn more
    const learn = document.getElementById('learnCookies');
    if (learn) learn.addEventListener('click', (e) => { e.preventDefault(); openCookieSettings(); });
    // footer settings link
    const footerSettings = document.getElementById('openCookieSettingsFooter');
    if (footerSettings) footerSettings.addEventListener('click', (e) => { e.preventDefault(); openCookieSettings(); });
    // privacy modal open (footer link)
    const openPrivacy = document.getElementById('openPrivacy') || document.querySelector('a[href="#privacy"]');
    const openPrivacyFooter = document.getElementById('openPrivacy') || document.getElementById('openPrivacySettings');
    const footerPrivacyLink = document.querySelector('a[href="#privacy"]') || document.getElementById('openPrivacy');
    const privacyFooter = document.getElementById('openCookieSettingsFooter');
    const privacyLink = document.querySelector('a[href="#privacy"]');
    const footerLinkById = document.getElementById('openPrivacy') || document.getElementById('openPrivacyFooter');
    // Specifically wire the 'Polityka prywatności' link we added (has href="#privacy")
    const privacyAnchor = document.querySelector('a[href="#privacy"]');
    if (privacyAnchor) {
        privacyAnchor.addEventListener('click', (e) => { e.preventDefault(); openPrivacyModal(); });
    }
    // Wire close button
    const closePrivacyBtn = document.getElementById('closePrivacyBtn');
    if (closePrivacyBtn) closePrivacyBtn.addEventListener('click', closePrivacyModal);
    initPrivacyModalInteractions();
    if (btnCancel) btnCancel.addEventListener('click', closeCookieSettings);
    if (btnSave) btnSave.addEventListener('click', () => {
        const analytics = !!document.getElementById('cookieAnalytics')?.checked;
        const marketing = !!document.getElementById('cookieMarketing')?.checked;
        const prefs = { necessary: true, analytics, marketing };
        saveCookiePreferences(prefs);
        applyCookiePreferences();
        closeCookieSettings();
    });

    // Apply saved preferences (if any)
    const prefs = getCookiePreferences();
    if (prefs) {
        applyCookiePreferences();
    }

    initScrollAnimations();
    initNavbarScroll();
    // ensure CSS spacing matches actual header size before binding smooth scroll
    updateHeaderHeightCSSVar();
    initSmoothScroll();
    window.addEventListener('resize', () => {
        // update on resize to keep CSS vars correct
        updateHeaderHeightCSSVar();
    });
    // also update after full load (images may change header size)
    window.addEventListener('load', () => {
        updateHeaderHeightCSSVar();
    });

    // watch logo/image load and the navbar size to keep the CSS var accurate
    const logoImg = document.querySelector('.logo-img');
    if (logoImg) {
        if (logoImg.complete) {
            // image already loaded
            updateHeaderHeightCSSVar();
        } else {
            logoImg.addEventListener('load', () => updateHeaderHeightCSSVar());
        }
    }

    // Use ResizeObserver where available to react to dynamic header resizes
    if (window.ResizeObserver) {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const ro = new ResizeObserver(debounce(() => updateHeaderHeightCSSVar(), 80));
            ro.observe(navbar);
        }
    }
    // privacy modal interactions ready
    initPrivacyModalInteractions();
});
