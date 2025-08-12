// content/toolbar.js - AutoList Canada Extension
// Floating dock implementation for marketplace pages

// Inject CSS for the floating dock
function injectDockCSS() {
  // Create style element
  const style = document.createElement('style');
  style.id = 'autolist-dock-styles';
  
  // Define CSS
  style.textContent = `
    #autolist-floating-dock {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 220px;
      background-color: rgba(255, 255, 255, 0.92);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      overflow: hidden;
      transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      background-image: url('${chrome.runtime.getURL('assets/ui/bg-lowpoly.svg')}');
      background-size: cover;
      background-position: center;
      border: 1px solid rgba(255, 255, 255, 0.4);
    }
    
    #autolist-dock-header {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      cursor: move;
      user-select: none;
      background-color: rgba(69, 139, 197, 0.15);
      border-bottom: 1px solid rgba(69, 139, 197, 0.25);
      position: relative;
      overflow: hidden;
    }
    
    #autolist-dock-header::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url('${chrome.runtime.getURL('assets/ui/vein-geo-overlay.svg')}');
      background-size: cover;
      opacity: 0.15;
      pointer-events: none;
    }
    
    #autolist-dock-brand {
      width: 22px;
      height: 22px;
      margin-right: 8px;
      background-image: url('${chrome.runtime.getURL('assets/ui/leaf-faceted-vibrant.svg')}');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }
    
    #autolist-dock-title {
      flex-grow: 1;
      font-weight: 600;
      font-size: 13px;
      background: linear-gradient(135deg, #3a7cbc, #52a6c3);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-fill-color: transparent;
    }
    
    #autolist-dock-toggle {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 18px;
      color: #458bc5;
      border: none;
      background: none;
      padding: 0;
      transition: transform 0.2s ease;
    }
    
    #autolist-dock-toggle:hover {
      transform: scale(1.1);
    }
    
    #autolist-dock-actions {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      position: relative;
    }
    
    #autolist-dock-actions::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url('${chrome.runtime.getURL('assets/ui/vein-geo-overlay.svg')}');
      background-size: cover;
      opacity: 0.05;
      pointer-events: none;
      z-index: -1;
    }
    
    .autolist-dock-action {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #EAF2F7;
      font-size: 12px;
      font-weight: 500;
    }
    
    .autolist-dock-action:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }
    
    .autolist-dock-action i {
      display: block;
      font-size: 16px;
      margin-bottom: 4px;
    }
    
    .autolist-dock-status {
      margin-top: 16px;
      padding: 8px;
      background: rgba(0, 194, 168, 0.1);
      border-radius: 8px;
      font-size: 12px;
      color: #00C2A8;
      text-align: center;
    }
    
    .autolist-dock.collapsed .autolist-dock-status {
      display: none;
    }
  `;
  
  document.head.appendChild(style);
}

// Create the floating dock element
function createFloatingDock() {
  // Remove existing dock if present
  const existingDock = document.getElementById('autolist-dock');
  if (existingDock) existingDock.remove();
  
  // Create dock container
  const dock = document.createElement('div');
  dock.id = 'autolist-dock';
  dock.className = 'autolist-dock';
  
  // Create dock content
  dock.innerHTML = `
    <div class="autolist-dock-header">
      <div class="autolist-dock-brand">
        <div class="autolist-dock-glyph">AL</div>
        <h3 class="autolist-dock-title">AutoList Canada</h3>
      </div>
      <button class="autolist-dock-toggle" id="autolist-dock-toggle">≡</button>
    </div>
    
    <div class="autolist-dock-actions">
      <div class="autolist-dock-action" data-action="bulk-crosslist">
        <span>⇄</span>
        <span>Bulk Crosslist</span>
      </div>
      <div class="autolist-dock-action" data-action="delist-relist">
        <span>↻</span>
        <span>Delist/Relist</span>
      </div>
      <div class="autolist-dock-action" data-action="sync-visualizer">
        <span>⇄</span>
        <span>Sync Visualizer</span>
      </div>
      <div class="autolist-dock-action" data-action="ai-title">
        <span>AI</span>
        <span>AI Title</span>
      </div>
      <div class="autolist-dock-action" data-action="ai-description">
        <span>AI</span>
        <span>AI Description</span>
      </div>
      <div class="autolist-dock-action" data-action="ai-tags">
        <span>AI</span>
        <span>AI Tags</span>
      </div>
      <div class="autolist-dock-action" data-action="price-suggest">
        <span>$</span>
        <span>Price Suggest</span>
      </div>
      <div class="autolist-dock-action" data-action="settings">
        <span>⚙</span>
        <span>Settings</span>
      </div>
    </div>
    
    <div class="autolist-dock-status">
      Ready for crosslisting
    </div>
  `;
  
  // Add to document
  document.body.appendChild(dock);
  
  // Add event listeners
  addDockEventListeners(dock);
  
  return dock;
}

// Add event listeners to dock elements
function addDockEventListeners(dock) {
  // Toggle collapse/expand
  const toggleBtn = dock.querySelector('#autolist-dock-toggle');
  toggleBtn.addEventListener('click', () => {
    dock.classList.toggle('collapsed');
    toggleBtn.textContent = dock.classList.contains('collapsed') ? '≡' : '×';
    
    // Save collapsed state to chrome.storage.local
    const domain = window.location.hostname;
    chrome.storage.local.get(['alcToolbarCollapsed'], function(result) {
      const states = result.alcToolbarCollapsed || {};
      states[domain] = dock.classList.contains('collapsed');
      chrome.storage.local.set({ alcToolbarCollapsed: states });
    });
  });
  
  // Drag functionality
  const header = dock.querySelector('.autolist-dock-header');
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;
  
  header.addEventListener('mousedown', dragStart);
  
  function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    
    if (e.target === header) {
      isDragging = true;
    }
  }
  
  document.addEventListener('mouseup', dragEnd);
  document.addEventListener('mousemove', drag);
  
  function dragEnd() {
    initialX = currentX;
    initialY = currentY;
    
    isDragging = false;
    
    // Save position to chrome.storage.local
    const domain = window.location.hostname;
    chrome.storage.local.get(['alcToolbarPos'], function(result) {
      const positions = result.alcToolbarPos || {};
      positions[domain] = { x: currentX, y: currentY };
      chrome.storage.local.set({ alcToolbarPos: positions });
    });
  }
  
  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      
      xOffset = currentX;
      yOffset = currentY;
      
      setTranslate(currentX, currentY, dock);
    }
  }
  
  function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  }
  
  // Action buttons
  const actions = dock.querySelectorAll('.autolist-dock-action');
  actions.forEach(action => {
    action.addEventListener('click', () => {
      const actionType = action.dataset.action;
      handleDockAction(actionType);
    });
  });
}

// Handle dock action clicks
function handleDockAction(actionType) {
  console.log(`[ALC] Action: ${actionType}`);
  
  // Send message via window.postMessage
  window.postMessage({
    type: 'ALC_ACTION',
    action: actionType
  }, '*');
}

// Initialize the floating dock
async function initFloatingDock() {
  // Inject required CSS
  injectDockCSS();
  
  // Load saved position and collapsed state
  const domain = window.location.hostname;
  const result = await chrome.storage.local.get(['alcToolbarPos', 'alcToolbarCollapsed']);
  
  // Create dock after a short delay to ensure page is loaded
  setTimeout(() => {
    const dock = createFloatingDock();
    
    // Apply saved position
    if (result.alcToolbarPos && result.alcToolbarPos[domain]) {
      const { x, y } = result.alcToolbarPos[domain];
      dock.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
    
    // Apply saved collapsed state
    if (result.alcToolbarCollapsed && result.alcToolbarCollapsed[domain]) {
      dock.classList.add('collapsed');
      const toggleBtn = dock.querySelector('#autolist-dock-toggle');
      if (toggleBtn) toggleBtn.textContent = '≡';
    }
    
    console.log('[ALC] Dock injected');
  }, 1000);
}

// Export function
window.initFloatingDock = initFloatingDock;
