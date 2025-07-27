// popup.js - AutoList Canada Crosslist Pro

const AIRTABLE_API_URL = 'https://api.airtable.com/v0/YOUR_BASE_ID/YOUR_TABLE_NAME'; // Replace with your Airtable endpoint
const AIRTABLE_API_KEY = 'YOUR_AIRTABLE_API_KEY'; // Store securely in production
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; // Store securely in production

function $(id) { return document.getElementById(id); }
const feedback = $("autolist-feedback");
let listings = [];
let selected = new Set();

function showFeedback(msg, type = "info") {
  feedback.innerHTML = `<div class="autolist-feedback-msg autolist-${type}">${msg}</div>`;
  setTimeout(() => { feedback.innerHTML = ""; }, 5000);
}

function renderListings(listingsArr) {
  const list = $("listing-list");
  if (!listingsArr.length) {
    $("listing-loading").textContent = "No listings found on this page.";
    list.style.display = "none";
    return;
  }
  list.innerHTML = `
    <div class="autolist-select-all-row">
      <input type="checkbox" id="select-all" />
      <label for="select-all"><strong>Select All</strong></label>
    </div>
    ${listingsArr.map((item, idx) => `
      <div class="autolist-listing-row" data-idx="${idx}">
        <input type="checkbox" class="listing-checkbox" id="listing-${idx}" data-idx="${idx}" />
        <img src="${item.image || 'assets/icon48.png'}" alt="" class="autolist-listing-img" />
        <div class="autolist-listing-info">
          <div class="autolist-listing-title">${item.title}</div>
          <div class="autolist-listing-meta">
            <span class="autolist-listing-price">${item.price}</span>
            <img src="assets/${platformIcon(item.platform)}" alt="${item.platform}" class="autolist-platform-icon" title="${item.platform}" />
          </div>
          <div class="autolist-listing-desc" id="desc-${idx}"></div>
        </div>
      </div>
    `).join("")}
  `;
  $("listing-loading").style.display = "none";
  list.style.display = "block";

  // Checkbox logic
  document.querySelectorAll(".listing-checkbox").forEach(cb => {
    cb.onchange = function () {
      const idx = parseInt(this.dataset.idx, 10);
      if (this.checked) selected.add(idx);
      else selected.delete(idx);
      $("select-all").checked = selected.size === listings.length;
    };
  });
  $("select-all").onchange = function () {
    const check = this.checked;
    document.querySelectorAll(".listing-checkbox").forEach(cb => {
      cb.checked = check;
      const idx = parseInt(cb.dataset.idx, 10);
      if (check) selected.add(idx);
      else selected.delete(idx);
    });
  };
}

// Platform icon file mapping (must match your /assets)
function platformIcon(platform) {
  const map = {
    "eBay": "ebay.svg",
    "Etsy": "etsy.svg",
    "Poshmark": "poshmark.svg",
    "Mercari": "mercari.svg",
    "Facebook Marketplace": "facebook.svg",
    "Grailed": "grailed.png",
    "Depop": "depop.svg",
    "Shopify": "shopify.svg",
    "Bonanza": "bonanza.svg",
    "Amazon": "amazon.webp",
    "VarageSale": "varagesale.png",
    "Kijiji": "kijiji.png"
  };
  return map[platform] || "icon48.png";
}

// --- OpenAI Integration ---
async function generateAIContent(listing) {
  const prompt = `Rewrite this product title and description to be more appealing for resale marketplaces:\nTitle: ${listing.title}\nPrice: ${listing.price}\nPlatform: ${listing.platform}`;
  const body = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 256,
    temperature: 0.7
  };
  const resp = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!resp.ok) throw new Error("OpenAI error: " + resp.status);
  const data = await resp.json();
  const aiText = data.choices?.[0]?.message?.content || "";
  let [aiTitle, ...aiDesc] = aiText.split("\n");
  aiTitle = aiTitle.replace(/^Title:\s*/i, "").trim();
  aiDesc = aiDesc.join("\n").replace(/^Description:\s*/i, "").trim();
  return { title: aiTitle || aiText, description: aiDesc || "" };
}

// --- Airtable Integration ---
async function syncToAirtable(listing) {
  const record = {
    fields: {
      Title: listing.title,
      Price: listing.price,
      Platform: listing.platform,
      Image: listing.image || "",
      URL: listing.url || ""
    }
  };
  const resp = await fetch(AIRTABLE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(record)
  });
  if (!resp.ok) throw new Error("Airtable error: " + resp.status);
  return await resp.json();
}

// --- Crosslist Logic (stub: open dashboard or show message) ---
function crosslistSelected() {
  showFeedback("Launching dashboard for crosslisting...", "teal");
  chrome.tabs.create({ url: "dashboard.html" });
}

// --- Main Logic ---
document.addEventListener("DOMContentLoaded", () => {
  // Request listings from content.js
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs[0]) return showFeedback("No active tab found", "error");
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "GET_LISTINGS" },
      response => {
        listings = (response && response.listings) ? response.listings : [];
        selected = new Set(listings.map((_, i) => i)); // Select all by default
        renderListings(listings);
        document.querySelectorAll(".listing-checkbox").forEach(cb => cb.checked = true);
        if ($("select-all")) $("select-all").checked = true;
      }
    );
  });

  // AI Button
  $("ai-btn").onclick = async () => {
    if (!selected.size) return showFeedback("Select at least one listing.", "error");
    $("ai-btn").disabled = true;
    showFeedback("Generating AI content...", "info");
    for (const idx of selected) {
      const listing = listings[idx];
      try {
        const ai = await generateAIContent(listing);
        listings[idx].title = ai.title || listing.title;
        document.querySelector(`.autolist-listing-row[data-idx="${idx}"] .autolist-listing-title`).textContent = listings[idx].title;
        document.getElementById(`desc-${idx}`).textContent = ai.description || '';
      } catch (e) {
        showFeedback("OpenAI error: " + e.message, "error");
      }
    }
    $("ai-btn").disabled = false;
    showFeedback("AI content generated!", "success");
  };

  // Airtable Button
  $("airtable-btn").onclick = async () => {
    if (!selected.size) return showFeedback("Select at least one listing.", "error");
    $("airtable-btn").disabled = true;
    showFeedback("Syncing to Airtable...", "info");
    let success = 0;
    for (const idx of selected) {
      const listing = listings[idx];
      try {
        await syncToAirtable(listing);
        success++;
      } catch (e) {
        showFeedback("Airtable error: " + e.message, "error");
      }
    }
    $("airtable-btn").disabled = false;
    showFeedback(`${success} listing(s) synced to Airtable!`, "success");
  };

  // Crosslist Button
  $("crosslist-btn").onclick = () => {
    if (!selected.size) return showFeedback("Select at least one listing.", "error");
    crosslistSelected();
  };
});
