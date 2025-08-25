/**
 * AutoList Canada - Import Flow Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const jsonInput = document.getElementById('json-input');
    const previewButton = document.getElementById('preview-button');
    const clearButton = document.getElementById('clear-button');
    const saveButton = document.getElementById('save-button');
    const previewArea = document.getElementById('preview-area');

    let normalizedListings = [];

    // --- Event Listeners ---
    previewButton.addEventListener('click', handlePreview);
    clearButton.addEventListener('click', handleClear);
    saveButton.addEventListener('click', handleSave);

    /**
     * Parses input, normalizes data, and displays a preview.
     */
    function handlePreview() {
        const rawText = jsonInput.value.trim();
        if (!rawText) {
            showToast('Please paste some JSON data first.', 'error');
            return;
        }

        try {
            const data = JSON.parse(rawText);
            if (!Array.isArray(data)) {
                showToast('Input must be a JSON array of listings.', 'error');
                return;
            }

            normalizedListings = data.map(item => window.AutoListNormalizer.normalize(item));
            renderPreview(normalizedListings);
            saveButton.disabled = false;
            showToast(`Preview generated for ${normalizedListings.length} listings.`, 'success');

        } catch (error) {
            console.error('JSON Parsing Error:', error);
            showToast('Invalid JSON format. Please check your data.', 'error');
            previewArea.innerHTML = `<p class="text-red-400">Error: ${error.message}</p>`;
            saveButton.disabled = true;
        }
    }

    /**
     * Saves the normalized listings to the store.
     */
    function handleSave() {
        if (normalizedListings.length === 0) {
            showToast('Nothing to save.', 'error');
            return;
        }

        try {
            normalizedListings.forEach(listing => window.AutoListStore.add(listing));
            showToast(`Successfully saved ${normalizedListings.length} listings!`, 'success');
            handleClear(); // Clear the form after saving
        } catch (error) {
            console.error('Store Saving Error:', error);
            showToast('Could not save listings to the store.', 'error');
        }
    }

    /**
     * Clears the input, preview, and resets state.
     */
    function handleClear() {
        jsonInput.value = '';
        previewArea.innerHTML = '<p class="text-slate-400">Preview of normalized listings will appear here.</p>';
        saveButton.disabled = true;
        normalizedListings = [];
    }

    /**
     * Renders the preview of normalized listings.
     * @param {Array<Object>} listings - The array of normalized listings.
     */
    function renderPreview(listings) {
        if (listings.length === 0) {
            previewArea.innerHTML = '<p class="text-slate-400">No listings to preview.</p>';
            return;
        }

        previewArea.innerHTML = listings.map(listing => `
            <div class="preview-item">
                <h3>${listing.title}</h3>
                <p>Price: ${listing.price} | Status: ${listing.status}</p>
            </div>
        `).join('');
    }

    /**
     * Displays a toast notification.
     * @param {string} message - The message to display.
     * @param {'success' | 'error'} type - The type of toast.
     */
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.add('visible');
        }, 10);

        // Animate out and remove
        setTimeout(() => {
            toast.classList.remove('visible');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }
});
