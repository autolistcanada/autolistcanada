// crosslist-pro-extension/content.js

function createFloatPanel() {
  if (document.getElementById('crosslist-float-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'crosslist-float-panel';
  panel.innerHTML = `
    <div id="crosslist-float-header">
      Crosslist Pro
      <button id="crosslist-float-min">−</button>
    </div>
    <div id="crosslist-float-body">
      <div class="crosslist-section">
        <label class="crosslist-label">Title</label>
        <input class="crosslist-input" id="title" placeholder="Enter title" />
        <label class="crosslist-label">Description</label>
        <textarea class="crosslist-textarea" id="description"></textarea>
      </div>
      <div class="crosslist-section">
        <label class="crosslist-label">Select Platforms</label>
        <div class="crosslist-platforms" id="platforms"></div>
      </div>
      <button class="crosslist-btn" id="save-listing">Save Listing</button>
    </div>
  `;
  document.body.appendChild(panel);

  document.getElementById('crosslist-float-min').onclick = () => {
    panel.style.display = 'none';
  };

  renderPlatforms();
  document.getElementById('save-listing').onclick = () => {
    const data = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      platforms: Array.from(document.querySelectorAll('.crosslist-platform.selected')).map(el => el.dataset.platform)
    };
    chrome.runtime.sendMessage({ type: "SAVE_LISTING", data });
    alert("Saved!");
  };
}

function renderPlatforms() {
  const platforms = ["ebay", "poshmark", "etsy", "depop", "facebook", "mercari"];
  const container = document.getElementById('platforms');
  platforms.forEach(p => {
    const el = document.createElement('div');
    el.className = 'crosslist-platform';
    el.dataset.platform = p;
    el.innerHTML = `<img src="assets/${p}.svg" alt="${p}">${p}`;
    el.onclick = () => el.classList.toggle('selected');
    container.appendChild(el);
  });
}

chrome.runtime.onMessage.addListener((req) => {
  if (req.type === "SHOW_FLOAT_PANEL") createFloatPanel();
});
