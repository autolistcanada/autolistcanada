console.log("AutoList Content Script Loaded");

const button = document.createElement('button');
button.innerText = "➤ Crosslist This";
button.className = "autolist-crosslist-button";
document.body.appendChild(button);
