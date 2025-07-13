// crosslist-pro-extension/popup.js

const platforms = ["ebay", "poshmark", "etsy", "depop", "facebook", "mercari"];

function renderPlatformCheckboxes(selected = []) {
  const container = document.getElementById('platform-checkboxes');
  container.innerHTML = '';
  platforms.forEach(platform => {
    const label = document.createElement('label');
    label.innerHTML = `
      <input type="checkbox" value="${platform}" ${selected.includes(platform) ? 'checked' : ''}>
      <img src="assets/${platform}.svg" style="width:18px;vertical-align:middle;"> ${platform}
    `;
    container.appendChild(label);
  });
}

function renderListingHistory(history) {
  const ul = document.getElementById('listing-history');
  ul.innerHTML = '';
  (history || []).forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.platforms?.join(", ")} — ${item.title || "(No Title)"}`;
    ul.appendChild(li);
  });
}

function updateAuthStatus(token) {
  document.getElementById('auth-status').textContent = token ? "Logged In" : "Not Logged In";
  document.getElementById('auth-status').style.color = token ? "green" : "red";
  document.getElementById('token-view').textContent = token ? `Token: ${token}` : "";
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (settings) => {
    renderPlatformCheckboxes(settings.crosslist_settings?.defaultPlatforms || []);
    updateAuthStatus(settings.authToken);
  });

  document.getElementById('login-btn').onclick = () => {
    chrome.runtime.sendMessage({ type: "MOCK_AUTH" }, (res) => {
      updateAuthStatus(res.token);
    });
  };

  document.getElementById('platform-checkboxes').onchange = () => {
    const checked = Array.from(document.querySelectorAll('#platform-checkboxes input:checked')).map(cb => cb.value);
    chrome.runtime.sendMessage({ type: "SET_SETTINGS", data: { defaultPlatforms: checked } });
  };

  document.getElementById('open-float-panel').onclick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: "SHOW_FLOAT_PANEL" });
      window.close();
    });
  };

  chrome.storage.local.get(["listingHistory"], (result) => {
    renderListingHistory(result.listingHistory);
  });
});
