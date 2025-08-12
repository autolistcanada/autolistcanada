/**
 * AutoList Canada Language Switching Module
 * Handles loading the appropriate language file and applying translations
 */
class I18nManager {
  constructor() {
    this.currentLanguage = 'en';
    this.translations = {};
    this.initialized = false;
  }

  /**
   * Initialize the language manager
   */
  async init() {
    // Check for stored language preference
    const storedLang = localStorage.getItem('autolist_language');
    
    if (storedLang && (storedLang === 'en' || storedLang === 'fr')) {
      this.currentLanguage = storedLang;
    } else {
      // Default to browser language if available and supported
      const browserLang = navigator.language.substring(0, 2);
      if (browserLang === 'fr') {
        this.currentLanguage = 'fr';
      }
    }
    
    // Load the translations
    await this.loadTranslations();
    
    // Apply translations to the page
    this.applyTranslations();
    
    // Set up language toggle
    this.setupLanguageToggle();
    
    this.initialized = true;
    
    // Dispatch an event to notify that translations are ready
    document.dispatchEvent(new CustomEvent('i18n:ready', { detail: { language: this.currentLanguage } }));
  }

  /**
   * Load translations from the appropriate JSON file
   */
  async loadTranslations() {
    try {
      const response = await fetch(`/i18n/${this.currentLanguage}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${this.currentLanguage}`);
      }
      this.translations = await response.json();
      console.log(`Loaded translations for ${this.currentLanguage}`);
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to English if translation file can't be loaded
      if (this.currentLanguage !== 'en') {
        this.currentLanguage = 'en';
        return this.loadTranslations();
      }
    }
  }

  /**
   * Apply translations to elements with data-i18n attributes
   */
  applyTranslations() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.getTranslation(key);
      
      if (translation) {
        if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search')) {
          if (element.placeholder) {
            element.placeholder = translation;
          } else {
            element.value = translation;
          }
        } else if (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit')) {
          element.value = translation;
        } else {
          element.textContent = translation;
        }
      }
    });
    
    // Update title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = this.getTranslation(key);
      
      if (translation) {
        element.title = translation;
      }
    });
    
    // Update placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = this.getTranslation(key);
      
      if (translation) {
        element.placeholder = translation;
      }
    });

    // Update language toggle button text
    const langToggle = document.getElementById('language-toggle');
    if (langToggle) {
      langToggle.textContent = this.currentLanguage === 'en' ? 'FR' : 'EN';
    }

    // Update html lang attribute
    document.documentElement.lang = this.currentLanguage;
  }

  /**
   * Get a translation by key
   * Supports nested keys using dot notation (e.g., 'navigation.home')
   */
  getTranslation(key) {
    if (!key) return '';
    
    const keys = key.split('.');
    let value = this.translations;
    
    for (const k of keys) {
      if (!value[k]) {
        console.warn(`Missing translation key: ${key}`);
        return key; // Return the key as fallback
      }
      value = value[k];
    }
    
    return value;
  }

  /**
   * Set up the language toggle button
   */
  setupLanguageToggle() {
    const langToggle = document.getElementById('language-toggle');
    
    if (langToggle) {
      // Update toggle button text
      langToggle.textContent = this.currentLanguage === 'en' ? 'FR' : 'EN';
      
      langToggle.addEventListener('click', async (event) => {
        event.preventDefault();
        
        // Toggle language
        this.currentLanguage = this.currentLanguage === 'en' ? 'fr' : 'en';
        
        // Save preference
        localStorage.setItem('autolist_language', this.currentLanguage);
        
        // Reload translations
        await this.loadTranslations();
        
        // Apply to page
        this.applyTranslations();
        
        // Dispatch language change event
        document.dispatchEvent(new CustomEvent('i18n:changed', { 
          detail: { language: this.currentLanguage } 
        }));
      });
    } else {
      console.warn('Language toggle button not found');
    }
  }

  /**
   * Helper method to get the current language code
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Helper method to check if a specific language is active
   */
  isLanguage(lang) {
    return this.currentLanguage === lang;
  }

  /**
   * Manually change the language
   */
  async changeLanguage(lang) {
    if (lang !== 'en' && lang !== 'fr') {
      console.error('Unsupported language:', lang);
      return;
    }
    
    if (lang === this.currentLanguage) {
      return; // Already using this language
    }
    
    this.currentLanguage = lang;
    localStorage.setItem('autolist_language', lang);
    
    await this.loadTranslations();
    this.applyTranslations();
    
    document.dispatchEvent(new CustomEvent('i18n:changed', { 
      detail: { language: this.currentLanguage } 
    }));
  }
}

// Create global instance
const i18n = new I18nManager();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  i18n.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}
