class Auth {
    constructor(app) {
        this.app = app;
    }

    showModal(platformId) {
        const platform = this.app.platforms.find(p => p.id === platformId);
        if (!platform) return;

        this.removeExistingModal();

        const isConnecting = !platform.connected;
        const titleKey = isConnecting ? "connect_to_platform" : "disconnect_from_platform";
        const titleText = isConnecting ? `Connect to ${platform.name}` : `Disconnect from ${platform.name}`;
        const bodyKey = isConnecting ? "connect_modal_text" : "disconnect_modal_text";
        const bodyText = isConnecting 
            ? `You are about to connect your ${platform.name} account to AutoList Canada. This will allow us to sync your listings.`
            : `Are you sure you want to disconnect your ${platform.name} account? This will stop syncing listings.`;
        const buttonKey = isConnecting ? "connect_now" : "confirm_disconnect";
        const buttonText = isConnecting ? "Connect Now" : "Yes, Disconnect";
        const buttonClass = isConnecting ? "btn-primary" : "btn-danger";

        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-content glass-dark" data-animate="zoom-in">
                    <button class="modal-close-btn">&times;</button>
                    <div class="modal-header">
                        <img src="${platform.logo}" alt="${platform.name} Logo" class="modal-logo">
                        <h2 data-lang-key="${titleKey}">${titleText}</h2>
                    </div>
                    <div class="modal-body">
                        <p data-lang-key="${bodyKey}">${bodyText}</p>
                        <button id="confirm-action-btn" class="btn ${buttonClass}" data-lang-key="${buttonKey}">${buttonText}</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.app.updateContent(); // Apply translations to the new modal

        const modal = document.querySelector('.modal-overlay');
        setTimeout(() => modal.querySelector('[data-animate]').classList.add('animated'), 10);

        modal.querySelector('.modal-close-btn').addEventListener('click', () => this.closeModal());
        modal.querySelector('#confirm-action-btn').addEventListener('click', () => this.handleConnectionToggle(platformId));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    }

    handleConnectionToggle(platformId) {
        this.app.togglePlatformConnection(platformId);
        this.closeModal();
    }

    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.querySelector('[data-animate]').classList.remove('animated');
            setTimeout(() => this.removeExistingModal(), 300);
        }
    }

    removeExistingModal() {
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) existingModal.remove();
    }
}
