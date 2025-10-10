document.addEventListener('DOMContentLoaded', () => {
    const aiTools = new AITools();
    aiTools.init();
});

class AITools {
    constructor() {
        this.tools = {
            'title-generator': { id: 'title-generator', title: 'AI Title Generator', icon: '📝', description: 'Generate compelling, keyword-rich titles to attract buyers.', fields: [{ name: 'keywords', placeholder: 'e.g., vintage, denim jacket, 90s' }] },
            'price-tool': { id: 'price-tool', title: 'AI Pricing Tool', icon: '💲', description: 'Analyze market data to find the optimal price for your item.', fields: [{ name: 'item_description', placeholder: 'e.g., Handmade ceramic mug, blue glaze' }] },
            'tag-optimizer': { id: 'tag-optimizer', title: 'AI Tag Optimizer', icon: '🏷️', description: 'Discover the most effective tags to improve visibility.', fields: [{ name: 'item_title', placeholder: 'e.g., Vintage 90s Denim Jacket' }] },
            'tone-analyzer': { id: 'tone-analyzer', title: 'AI Tone Analyzer', icon: '🎭', description: 'Adjust your listing’s tone (e.g., Cozy, Luxury) to match buyer psychology.', fields: [{ name: 'description', type: 'textarea', placeholder: 'Enter your item description...' }] },
            'sales-predictor': { id: 'sales-predictor', title: 'AI Sales Predictor', icon: '🔮', description: 'Forecast sales potential based on category, price, and season.', fields: [{ name: 'category', placeholder: 'e.g., Apparel > Jackets' }, { name: 'price', placeholder: 'e.g., 75.00' }] },
            'fusion-composer': { id: 'fusion-composer', title: 'Fusion Composer', icon: '🧬', description: 'Blend your best-performing titles and tags into a new, powerful combination.', fields: [] },
            'listing-timer': { id: 'listing-timer', title: 'Listing Timer', icon: '⏱️', description: 'Determine the absolute best time of day to post your listing for maximum views.', fields: [{ name: 'category', placeholder: 'e.g., Home Goods > Kitchen' }] },
            'pattern-predictor': { id: 'pattern-predictor', title: 'Pattern Predictor', icon: '📈', description: 'Identify emerging market trends and predict the next hot items.', fields: [] },
            'platform-sync': { id: 'platform-sync', title: 'Platform Sync', icon: '🔗', description: 'Ensure your listings are perfectly harmonized across all connected platforms.', fields: [] },
            'inventory-helper': { id: 'inventory-helper', title: 'Inventory Helper', icon: '📦', description: 'Get smart alerts for low stock and suggestions for what to restock next.', fields: [] },
            'trust-builder': { id: 'trust-builder', title: 'Trust Builder', icon: '🔐', description: 'Analyze your listings for trust signals and get suggestions for improvement.', fields: [{ name: 'listing_url', placeholder: 'Enter a listing URL to analyze' }] },
            'photo-enhancer': { id: 'photo-enhancer', title: 'Photo Enhancer', icon: '🖼️', description: 'Get AI-powered suggestions to improve your product photos.', fields: [{ name: 'image_url', placeholder: 'Enter an image URL to analyze' }] },
            'bulk-lister': { id: 'bulk-lister', title: 'Bulk Lister', icon: '🗂️', description: 'Create multiple listings from a simple template or spreadsheet.', fields: [{ name: 'csv_upload', type: 'file' }] },
            'inventory-health': { id: 'inventory-health', title: 'Inventory Health', icon: '🩺', description: 'Get a report on your overall inventory performance and identify slow-moving items.', fields: [] },
            'ai-notes': { id: 'ai-notes', title: 'AI Notes', icon: '💬', description: 'Let AI generate insightful, private notes for your listings.', fields: [{ name: 'listing_title', placeholder: 'Enter listing title to add a note' }] },
            'description-builder': { id: 'description-builder', title: 'AI Description Builder', icon: '✍️', description: 'Automatically generate a professional, persuasive description.', fields: [{ name: 'title', placeholder: 'e.g., Retro Wool Sweater' }, { name: 'features', placeholder: 'e.g., 100% merino, made in Canada' }] },
            'buyer-persona': { id: 'buyer-persona', title: 'Buyer Persona Creator', icon: '🧑‍🎨', description: 'Generate a detailed persona of your ideal buyer to tailor your marketing.', fields: [{ name: 'item_title', placeholder: 'e.g., Handmade Ceramic Mug' }] },
            'seo-optimizer': { id: 'seo-optimizer', title: 'SEO Optimizer', icon: '🔍', description: 'Optimize your entire listing for search engines on all platforms.', fields: [{ name: 'listing_url', placeholder: 'Enter a listing URL to optimize' }] },
            'crosspost-advisor': { id: 'crosspost-advisor', title: 'Crosspost Advisor', icon: '🗺️', description: 'Get advice on which platforms are best suited for your specific item.', fields: [{ name: 'item_title', placeholder: 'e.g., Vintage 90s Denim Jacket' }] },
            'performance-analyzer': { id: 'performance-analyzer', title: 'Performance Analyzer', icon: '📊', description: 'Get a deep-dive analysis of a specific listing’s performance.', fields: [{ name: 'listing_url', placeholder: 'Enter a listing URL to analyze' }] }
        };
        this.modalContainer = null;
    }

    init() {
        this.injectModalContainer();
        this.attachEventListeners();
        console.log('AI Tools initialized.');
    }

    injectModalContainer() {
        if (!document.getElementById('ai-modal-container')) {
            this.modalContainer = document.createElement('div');
            this.modalContainer.id = 'ai-modal-container';
            document.body.appendChild(this.modalContainer);
        }
    }

    attachEventListeners() {
        document.body.addEventListener('click', (e) => {
            const launchButton = e.target.closest('[data-tool-id]');
            if (launchButton) {
                const toolId = launchButton.dataset.toolId;
                this.showModal(toolId);
            }
        });
    }

    showModal(toolId) {
        const tool = this.tools[toolId];
        if (!tool) {
            console.error(`AI tool with ID '${toolId}' not found.`);
            return;
        }

        const modalHTML = `
            <div id="ai-tool-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm" style="display: flex;">
                <div class="bg-white rounded-2xl p-8 w-[95vw] max-w-lg shadow-2xl relative transform transition-all scale-95 opacity-0 animate-fade-in-scale">
                    <button class="absolute top-3 right-4 text-2xl text-neutral-400 hover:text-orange-400">&times;</button>
                    <div class="flex items-center mb-4">
                        <div class="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center text-2xl mr-4">${tool.icon}</div>
                        <div>
                            <h2 class="text-xl font-bold text-neutral-800">${tool.title}</h2>
                            <p class="text-sm text-neutral-500">${tool.description}</p>
                        </div>
                    </div>
                    <div class="space-y-4">${this.generateFields(tool.fields)}</div>
                    <div class="flex justify-end gap-3 mt-6">
                        <button class="px-5 py-2 rounded-lg bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200 transition">Cancel</button>
                        <button class="px-5 py-2 rounded-lg bg-orange-500 text-white font-medium shadow hover:bg-orange-600 transition">Generate</button>
                    </div>
                </div>
            </div>
        `;
        
        this.modalContainer.innerHTML = modalHTML;

        const modal = this.modalContainer.querySelector('#ai-tool-modal');
        const closeButton = modal.querySelector('button.absolute');
        const cancelButton = modal.querySelector('button.bg-neutral-100');

        const closeModal = () => {
            modal.querySelector('div > div').classList.remove('animate-fade-in-scale');
            modal.querySelector('div > div').classList.add('animate-fade-out-scale');
            setTimeout(() => {
                this.modalContainer.innerHTML = '';
            }, 200);
        };

        closeButton.onclick = closeModal;
        cancelButton.onclick = closeModal;
    }

    generateFields(fields) {
        if (!fields || fields.length === 0) {
            return '<p class="text-center text-neutral-500 py-4">No configuration needed. Ready to generate.</p>';
        }
        return fields.map(field => {
            if (field.type === 'textarea') {
                return `<textarea name="${field.name}" class="w-full p-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition" placeholder="${field.placeholder}" rows="4"></textarea>`;
            }
            if (field.type === 'file') {
                return `<input type="file" name="${field.name}" class="w-full p-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100">`;
            }
            return `<input type="text" name="${field.name}" class="w-full p-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition" placeholder="${field.placeholder}">`;
        }).join('');
    }
}

// Add modal animation keyframes to the stylesheet
const style = document.createElement('style');
style.textContent = `
    @keyframes fade-in-scale {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in-scale { animation: fade-in-scale 0.2s ease-out forwards; }

    @keyframes fade-out-scale {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.95); }
    }
    .animate-fade-out-scale { animation: fade-out-scale 0.2s ease-in forwards; }
`;
document.head.appendChild(style);