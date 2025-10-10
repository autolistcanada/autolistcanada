const userData = {
  name: "Sage",
  listingsSynced: 42,
  aiCredits: 17,
  confidenceScore: 88,
  stats: [
    { label: "Listings Synced", value: 42, icon: "🔁" },
    { label: "AI Credits Left", value: 17, icon: "💡" },
    { label: "Confidence Score", value: 88, icon: "🎯" }
  ],
  aiFeedback: [
    "🔥 Cozy listings had 2x clicks this week",
    "✨ Luxury tone earned 3 new followers",
    "🧊 Minimalist tags trended in ON region"
  ],
  motivationalQuotes: [
    "You’re selling calm today — and buyers need calm.",
    "Your trust score is rising — keep up your unique style.",
    "Every listing is a story. Make it feel true."
  ],
  milestone: {
    totalListings: 42,
    crosslisted: 36,
    revenue: 2100,
    revenueGoal: 3000,
    drafts: 4,
    bestPlatform: 'Etsy',
    topTone: 'Cozy'
  },
  calendarRhythm: [
    { day: "Mon", rhythm: "Browsing", tip: "Suggest Calm tone" },
    { day: "Tue", rhythm: "Budget", tip: "Suggest Value tone" },
    { day: "Wed", rhythm: "Impulse", tip: "Suggest Bold tone" },
    { day: "Thu", rhythm: "Impulse", tip: "🔥 Best for quick sales" },
    { day: "Fri", rhythm: "Luxury", tip: "Suggest Premium tone" },
    { day: "Sat", rhythm: "Browsing", tip: "High traffic" },
    { day: "Sun", rhythm: "Budget", tip: "Suggest Soft tone" }
  ],
  recentActivity: [
    "Yesterday: 2 prices updated, 1 listing boosted, 4 viewed by Cozy buyers",
    "Today: 1 draft published, 2 listings crosslisted"
  ]
};

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

class App {
    constructor() {
        this.lang = localStorage.getItem('lang') || 'en';
        this.langData = {};
        this.platforms = [];
        this.auth = new Auth(this); // Create Auth instance
    }

    async init() {
        await this.loadSidebar();
        await this.loadTranslations();
        this.updateContent();
        this.initLangToggle();
        await this.loadPlatforms();
        this.renderPlatforms();
        this.highlightActiveNav();
        this.initPlatformConnectors(); // New method for handling clicks

        if (document.body.id === 'landing-page') {
            this.initLandingPage();
        }
    }

    async loadSidebar() {
        const sidebarContainer = document.getElementById('sidebar-container');
        if (sidebarContainer) {
            try {
                const response = await fetch('sidebar.html');
                if (!response.ok) throw new Error('Sidebar not found');
                const sidebarHTML = await response.text();
                sidebarContainer.innerHTML = sidebarHTML;
            } catch (error) {
                console.error('Error loading sidebar:', error);
                if(sidebarContainer) sidebarContainer.innerHTML = '<p class="text-red-500">Error loading sidebar.</p>';
            }
        }
    }

    async loadTranslations() {
        try {
            const response = await fetch(`./data/${this.lang}.json`);
            if (!response.ok) throw new Error(`Translation file for ${this.lang} not found`);
            this.langData = await response.json();
        } catch (error) {
            console.error('Error loading translation data:', error);
        }
    }

    updateContent() {
        document.documentElement.lang = this.lang;
        const elements = document.querySelectorAll('[data-lang-key]');
        elements.forEach(el => {
            const key = el.dataset.langKey;
            if (this.langData[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.placeholder) el.placeholder = this.langData[key];
                } else {
                    el.textContent = this.langData[key];
                }
            }
        });
        
        const enBtns = document.querySelectorAll('#lang-en, #lang-en-mobile');
        const frBtns = document.querySelectorAll('#lang-fr, #lang-fr-mobile');
        
        enBtns.forEach(btn => btn.classList.toggle('active', this.lang === 'en'));
        frBtns.forEach(btn => btn.classList.toggle('active', this.lang === 'fr'));
    }

    initLangToggle() {
        document.body.addEventListener('click', async (e) => {
            const target = e.target.closest('#lang-en, #lang-fr');
            if (target) {
                this.lang = target.id.split('-')[1];
                localStorage.setItem('lang', this.lang);
                await this.loadTranslations();
                this.updateContent();
            }
        });
    }

    async loadPlatforms() {
        try {
            const response = await fetch('./data/platforms.json');
            if (!response.ok) throw new Error('Platforms data not found');
            const basePlatforms = await response.json();
            const storedPlatforms = JSON.parse(localStorage.getItem('autolist_platforms'));

            if (storedPlatforms) {
                // Merge stored data with base data to preserve connections
                this.platforms = basePlatforms.map(p => {
                    const stored = storedPlatforms.find(sp => sp.id === p.id);
                    return stored ? { ...p, connected: stored.connected } : p;
                });
            } else {
                this.platforms = basePlatforms;
            }
            this.savePlatformState(); // Save initial state if not present
        } catch (error) {
            console.error('Error loading platforms:', error);
        }
    }

    renderPlatforms() {
        const listContainer = document.getElementById('platform-connector-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';
        this.platforms.forEach(platform => {
            const statusClass = platform.connected ? 'connected' : 'not-connected';
            const statusKey = platform.connected ? 'connected' : 'not_connected';
            const platformEl = document.createElement('div');
            platformEl.className = `connector-item ${statusClass}`;
            platformEl.dataset.platformId = platform.id;
            platformEl.innerHTML = `
                <img src="${platform.logo}" alt="${platform.name} Logo" class="connector-logo">
                <span class="connector-name">${platform.name}</span>
                <span class="connector-status" data-lang-key="${statusKey}"></span>
            `;
            listContainer.appendChild(platformEl);
        });
        this.updateContent();
    }

    savePlatformState() {
        localStorage.setItem('autolist_platforms', JSON.stringify(this.platforms));
    }

    togglePlatformConnection(platformId) {
        const platform = this.platforms.find(p => p.id === platformId);
        if (platform) {
            platform.connected = !platform.connected;
            this.savePlatformState();
            this.renderPlatforms();
        }
    }
    
    highlightActiveNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.main-nav .nav-link');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    initPlatformConnectors() {
        document.body.addEventListener('click', (e) => {
            const connectorItem = e.target.closest('.connector-item');
            if (connectorItem) {
                const platformId = connectorItem.dataset.platformId;
                this.auth.showModal(platformId);
            }
        });
    }

    initLandingPage() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const loginButtons = document.querySelectorAll('#login-btn-main, #login-btn-mobile, #start-free-btn');

        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        loginButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.auth.showModal();
            });
        });

        // Extend lang toggle to mobile
        document.body.addEventListener('click', async (e) => {
            const target = e.target.closest('#lang-en-mobile, #lang-fr-mobile');
            if (target) {
                this.lang = target.id.split('-')[1];
                localStorage.setItem('lang', this.lang);
                await this.loadTranslations();
                this.updateContent();
            }
        });
    }
}