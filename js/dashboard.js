document.addEventListener('DOMContentLoaded', () => {
    // Ensure this script only runs on the dashboard page
    if (document.querySelector('body[data-page="dashboard"]')) {
        // The userData object is currently in an inline script tag in dashboard.html
        // In a real production app, this would be fetched from an API.
        if (typeof userData !== 'undefined') {
            const dashboard = new Dashboard(userData);
            dashboard.init();
        } else {
            console.error('Dashboard user data not found. Please ensure userData is loaded before dashboard.js');
        }
    }
});

class Dashboard {
    constructor(data) {
        this.data = data;
        this.regionToneMap = {
            "BC": { tone: "Minimalist", color: "#38bdf8", buyers: "Cozy & Calm" },
            "AB": { tone: "Eco", color: "#4ade80", buyers: "Budget Seekers" },
            "ON": { tone: "Cozy", color: "#fdba74", buyers: "Impulse Buyers" },
            "QC": { tone: "Luxury", color: "#a5b4fc", buyers: "Trust-Seekers" },
            "ATL": { tone: "Handmade", color: "#bbf7d0", buyers: "Browsing & Research" }
        };
    }

    init() {
        try {
            this.populateWelcomeHeader();
            this.populateStats();
            this.startAiFeedbackRotation();
            this.startMotivationalQuoteRotation();
            this.setupMapInteraction();
            this.setupMilestoneModal();
            this.populateRhythmCalendar();
            this.populateRecentActivity();
            this.pricingTool(); // New
            this.backgroundRemover(); // New
            console.log('Dashboard initialized successfully.');
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            // Show user-friendly error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded shadow';
            errorDiv.textContent = 'Error loading dashboard. Please refresh the page.';
            document.body.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
        }
    }

    populateWelcomeHeader() {
        document.querySelector('[data-i18n="dashboard.welcome"]').textContent = `Welcome, ${this.data.name} 🌿`;
    }

    populateStats() {
        document.querySelector('.text-orange-500.text-lg.font-bold').textContent = this.data.stats[0].value;
        document.querySelector('.text-green-500.text-lg.font-bold').textContent = this.data.stats[1].value;
        document.querySelector('.text-blue-500.text-lg.font-bold').textContent = `${this.data.stats[2].value}%`;
    }

    startAiFeedbackRotation() {
        const feedbackEl = document.getElementById('aiFeedbackText');
        if (!feedbackEl || !this.data.aiFeedback.length) return;
        let feedbackIdx = 0;
        setInterval(() => {
            feedbackIdx = (feedbackIdx + 1) % this.data.aiFeedback.length;
            feedbackEl.textContent = this.data.aiFeedback[feedbackIdx];
        }, 6000);
    }

    startMotivationalQuoteRotation() {
        const motivationEl = document.getElementById('motivationText');
        if (!motivationEl || !this.data.motivationalQuotes.length) return;
        let quoteIdx = 0;
        motivationEl.textContent = this.data.motivationalQuotes[0];
        setInterval(() => {
            quoteIdx = (quoteIdx + 1) % this.data.motivationalQuotes.length;
            motivationEl.textContent = this.data.motivationalQuotes[quoteIdx];
        }, 8000);
    }

    setupMapInteraction() {
        const tooltip = document.getElementById('regionTooltip');
        Object.keys(this.regionToneMap).forEach(regionId => {
            const el = document.getElementById(`region-${regionId}`);
            if (!el) return;

            el.addEventListener('mouseenter', (e) => {
                const regionInfo = this.regionToneMap[regionId];
                tooltip.innerHTML = `<strong>${regionId}</strong>: <span style="color:${regionInfo.color}" class="font-bold">${regionInfo.tone}</span> <br><span class="text-xs">Buyers: ${regionInfo.buyers}</span>`;
                tooltip.classList.remove('hidden');
                
                const svgRect = e.target.getBoundingClientRect();
                const parentRect = e.target.ownerSVGElement.getBoundingClientRect();
                tooltip.style.left = `${svgRect.left - parentRect.left + svgRect.width / 2}px`;
                tooltip.style.top = `${svgRect.top - parentRect.top - tooltip.offsetHeight - 5}px`;
            });

            el.addEventListener('mouseleave', () => {
                tooltip.classList.add('hidden');
            });

            el.addEventListener('click', () => {
                // In a real app, this would trigger a filter action
                alert(`Filtering listings for ${regionId} (${this.regionToneMap[regionId].tone} buyers)...`);
            });
        });
    }

    setupMilestoneModal() {
        const modal = document.getElementById('milestoneModal');
        const openBtn = document.querySelector('[onclick="openModal()"]');
        const closeBtn = document.querySelector('#milestoneModal button[onclick="closeModal()"]');
        const closeBtn2 = document.querySelector('#milestoneModal button.w-full');

        if(openBtn) openBtn.onclick = () => modal.classList.remove('hidden');
        if(closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
        if(closeBtn2) closeBtn2.onclick = () => modal.classList.add('hidden');
        
        // Populate modal data
        document.getElementById('revenue').textContent = `$${this.data.milestone.revenue.toLocaleString()} / $${this.data.milestone.revenueGoal.toLocaleString()}`;
        document.getElementById('crosslisted').textContent = `${this.data.milestone.crosslisted} / ${this.data.milestone.totalListings}`;
        const progressBar = document.querySelector('.h-4.bg-orange-400');
        if(progressBar) {
            const progress = (this.data.milestone.revenue / this.data.milestone.revenueGoal) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    populateRhythmCalendar() {
        const container = document.querySelector('.grid.grid-cols-7.gap-2.w-full');
        const template = document.getElementById('calendarDayTemplate');
        if (!container || !template) return;
        
        // Clear existing static days
        container.innerHTML = ''; 

        this.data.calendarRhythm.forEach(dayData => {
            const clone = template.content.cloneNode(true);
            const dayDiv = clone.querySelector('div');
            clone.querySelector('.day-label').textContent = dayData.day;
            clone.querySelector('.rhythm-label').textContent = dayData.rhythm;
            clone.querySelector('.tip-label').textContent = dayData.tip;
            if (dayData.tip.includes('Best for')) {
                dayDiv.classList.add('bg-orange-50', 'shadow-inner');
                clone.querySelector('.rhythm-label').classList.add('font-bold', 'text-[#ea7113]');
            }
            container.appendChild(clone);
        });
    }

    populateRecentActivity() {
        const activityList = document.querySelector('.text-xs.text-[#64748b].space-y-1');
        if (!activityList) return;
        activityList.innerHTML = ''; // Clear static content
        this.data.recentActivity.forEach(activity => {
            const li = document.createElement('li');
            li.textContent = activity;
            activityList.appendChild(li);
        });
    }

    // New: Background Remover (List Perfectly replication)
    backgroundRemover() {
        // Integrate PhotoRoom for background removal
        this.setupBackgroundRemover();
    }

    setupBackgroundRemover() {
        // Add background remover to AI Tools section
        const aiToolsSection = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-4.gap-4.mb-2');
        if (!aiToolsSection) return;

        const bgCard = document.createElement('div');
        bgCard.className = 'glass-card layered p-4 flex flex-col items-center cursor-pointer transition group hover:scale-105 hover:border-teal-400/50';
        bgCard.innerHTML = `
            <div class="bg-teal-500/10 rounded-full w-10 h-10 flex items-center justify-center text-accent-teal text-2xl mb-2 shadow-lg">🖼️</div>
            <span class="font-semibold text-text-primary text-center text-sm">Background Remover</span>
            <span class="text-[10px] text-text-secondary mt-1">Remove backgrounds</span>
        `;
        bgCard.addEventListener('click', () => {
            this.openBgRemoverModal();
        });
        aiToolsSection.appendChild(bgCard);
    }

    openBgRemoverModal() {
        // Mock modal for background removal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="glass-card p-8 w-[95vw] max-w-lg relative">
                <button class="absolute top-4 right-5 text-2xl text-gray-400 hover:text-white transition-colors">&times;</button>
                <h2 class="text-xl font-semibold mb-3 text-accent-teal">Background Remover</h2>
                <input type="file" id="bg-input" accept="image/*" class="input-field-glass w-full mb-4">
                <button id="remove-bg-btn" class="btn-primary-glow w-full">Remove Background</button>
                <div id="bg-result" class="mt-4 text-sm"></div>
            </div>
        `;
        modal.querySelector('button').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        document.body.appendChild(modal);

        // Mock removal
        modal.querySelector('#remove-bg-btn').onclick = () => {
            modal.querySelector('#bg-result').innerHTML = `
                <p>PhotoRoom: Background removed successfully!</p>
                <p>Processed image ready for listing.</p>
            `;
        };
    }
}