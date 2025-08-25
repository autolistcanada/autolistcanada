(() => {
    console.log("AutoList Content Script Loaded");

    const getMarketplaceConfig = () => {
        const host = window.location.hostname;
        if (host.includes('ebay.ca')) {
            return {
                name: 'eBay',
                injectionSelector: '.x-buy-box__buttons',
                capture: () => ({
                    title: document.querySelector('.x-item-title__main-title .ux-textspans')?.innerText || '',
                    price: document.querySelector('.x-price-primary .ux-textspans')?.innerText || '',
                    image: document.querySelector('.ux-image-carousel-item.active img')?.src || ''
                })
            };
        }
        if (host.includes('etsy.com')) {
            return {
                name: 'Etsy',
                injectionSelector: '[data-buy-box-container] > div',
                capture: () => ({
                    title: document.querySelector('[data-buy-box-listing-title]')?.innerText || '',
                    price: document.querySelector('[data-buy-box] .wt-display-flex-xs p')?.innerText || '',
                    image: document.querySelector('.wt-max-width-full.wt-height-full img')?.src || ''
                })
            };
        }
        if (host.includes('poshmark.ca') || host.includes('poshmark.com')) {
            return {
                name: 'Poshmark',
                injectionSelector: '.listing__actions__container',
                capture: () => ({
                    title: document.querySelector('.listing__title')?.innerText || '',
                    price: document.querySelector('.p-price')?.innerText || '',
                    image: document.querySelector('.gallery-image img')?.src || ''
                })
            };
        }
        return null;
    };

    const config = getMarketplaceConfig();
    if (!config) return;

    const injectButton = (injectionPoint) => {
        if (document.getElementById('autolist-crosslist-btn')) return;

        const button = document.createElement('button');
        button.id = 'autolist-crosslist-btn';
        button.textContent = 'Crosslist with AutoList';
        Object.assign(button.style, {
            backgroundColor: '#164734', // pineGreen
            color: 'white',
            padding: '12px 20px',
            border: 'none',
            borderRadius: '8px',
            fontFamily: 'inherit',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '10px',
            width: '100%',
            textAlign: 'center',
            transition: 'background-color 0.2s ease',
        });

        button.addEventListener('mouseover', () => button.style.backgroundColor = '#2C5E4A'); // spruce
        button.addEventListener('mouseout', () => button.style.backgroundColor = '#164734'); // pineGreen

        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const listingData = config.capture();
            listingData.marketplace = config.name;
            listingData.url = window.location.href;
            
            chrome.runtime.sendMessage({ type: 'CAPTURE_LISTING', payload: listingData });

            button.textContent = 'Captured!';
            button.style.backgroundColor = '#A77E58'; // cedar
            setTimeout(() => {
                button.textContent = 'Crosslist with AutoList';
                button.style.backgroundColor = '#164734';
            }, 2500);
        });

        injectionPoint.prepend(button);
    };

    const observer = new MutationObserver((mutations, obs) => {
        const injectionPoint = document.querySelector(config.injectionSelector);
        if (injectionPoint) {
            injectButton(injectionPoint);
            obs.disconnect();
        }
    });

    // Start observing
    const targetNode = document.body;
    if (targetNode) {
        observer.observe(targetNode, { childList: true, subtree: true });
    } else {
        window.addEventListener('DOMContentLoaded', () => {
             observer.observe(document.body, { childList: true, subtree: true });
        });
    }
})();
