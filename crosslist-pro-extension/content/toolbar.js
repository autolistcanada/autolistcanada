// content/toolbar.js - AutoList Canada Extension
// Floating dock implementation for marketplace pages

// Inject CSS for the floating dock
function injectDockCSS() {
  // Check if CSS is already injected
  if (document.getElementById('autolist-dock-css')) return;
  
  const style = document.createElement('style');
  style.id = 'autolist-dock-css';
  style.textContent = `
    .autolist-dock {
      position: fixed;
      top: 50%;
      right: 20px;
      transform: translateY(-50%);
      z-index: 2147483647;
      background: rgba(11, 15, 18, 0.9);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 16px;
      width: 280px;
      transition: all 0.3s ease;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .autolist-dock.collapsed {
      width: 60px;
      height: 60px;
      padding: 10px;
      overflow: hidden;
    }
    
    .autolist-dock-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      cursor: move;
    }
    
    .autolist-dock.collapsed .autolist-dock-header {
      margin-bottom: 0;
    }
    
    .autolist-dock-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .autolist-dock-glyph {
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #FF6B00, #00C2A8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      font-size: 12px;
    }
    
    .autolist-dock-title {
      font-size: 16px;
      font-weight: 600;
      color: #EAF2F7;
      margin: 0;
    }
    
    .autolist-dock.collapsed .autolist-dock-title,
    .autolist-dock.collapsed .autolist-dock-actions {
      display: none;
    }
    
    .autolist-dock-toggle {
      background: none;
      border: none;
      color: #EAF2F7;
      font-size: 18px;
      cursor: pointer;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s ease;
    }
    
    .autolist-dock-toggle:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .autolist-dock-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    
    .autolist-dock-action {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 12px;
      text-align: center;
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
      <div class="autolist-dock-action" data-action="crosslist">
        <span>⇄</span>
        <span>Crosslist</span>
      </div>
      <div class="autolist-dock-action" data-action="relist">
        <span>↻</span>
        <span>Relist</span>
      </div>
      <div class="autolist-dock-action" data-action="sync">
        <span>⇄</span>
        <span>Sync</span>
      </div>
      <div class="autolist-dock-action" data-action="ai">
        <span>AI</span>
        <span>AI Tools</span>
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
  console.log(`AutoList dock action: ${actionType}`);
  
  // Send message to background script
  chrome.runtime.sendMessage({
    type: 'DOCK_ACTION',
    action: actionType,
    url: window.location.href
  });
}

// Initialize the floating dock
function initFloatingDock() {
  // Inject required CSS
  injectDockCSS();
  
  // Create dock after a short delay to ensure page is loaded
  setTimeout(() => {
    createFloatingDock();
  }, 1000);
}

// Export function
window.initFloatingDock = initFloatingDock;
