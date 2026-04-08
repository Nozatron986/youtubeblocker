const STORAGE_KEY = "blockEnabled";
const HOLD_MS = 60000;
const HOLD_CLICK_GUARD_MS = 1200;

const wrap = document.querySelector(".wrap");
const statusText = document.getElementById("statusText");
const helpText = document.getElementById("helpText");
const toggleBtn = document.getElementById("toggleBtn");
const progressBar = document.getElementById("progressBar");

let blockEnabled = true;
let holdStartTime = null;
let holdTimer = null;
let clickGuardUntil = 0;

function setBlockState(enabled) {
  chrome.storage.local.set({ [STORAGE_KEY]: enabled });
}

function updateUI() {
  toggleBtn.classList.remove("block-on", "block-off", "holding");

  if (blockEnabled) {
    wrap.classList.remove("off-mode");
    statusText.textContent = "Blocking is ON. YouTube home videos are hidden.";
    toggleBtn.textContent = "Hold 60s to Turn OFF";
    toggleBtn.classList.add("block-off");
    helpText.textContent = "To disable blocking, press and hold the button continuously for 60 seconds.";
  } else {
    wrap.classList.add("off-mode");
    statusText.textContent = "Blocking is OFF. YouTube home is visible.";
    toggleBtn.textContent = "Turn ON Blocking";
    toggleBtn.classList.add("block-on");
    helpText.textContent = "Click once to enable blocking immediately.";
    resetHoldVisuals();
  }
}

function resetHoldVisuals() {
  if (holdTimer) {
    clearInterval(holdTimer);
    holdTimer = null;
  }
  holdStartTime = null;
  progressBar.style.width = "0%";
  toggleBtn.classList.remove("holding");
}

function beginHoldToDisable() {
  if (!blockEnabled || holdTimer) {
    return;
  }

  holdStartTime = Date.now();
  toggleBtn.classList.remove("block-off");
  toggleBtn.classList.add("holding");

  holdTimer = setInterval(() => {
    const elapsed = Date.now() - holdStartTime;
    const pct = Math.min((elapsed / HOLD_MS) * 100, 100);
    progressBar.style.width = `${pct}%`;
    helpText.textContent = `Keep holding... ${Math.ceil((HOLD_MS - elapsed) / 1000)}s left`;

    if (elapsed >= HOLD_MS) {
      setBlockState(false);
      blockEnabled = false;
      clickGuardUntil = Date.now() + HOLD_CLICK_GUARD_MS;
      resetHoldVisuals();
      updateUI();
    }
  }, 100);
}

function endHoldToDisable() {
  if (!blockEnabled) {
    return;
  }
  if (holdTimer) {
    helpText.textContent = "Hold canceled. You must hold for a full 60 seconds.";
  }
  resetHoldVisuals();
  updateUI();
}

function setupEvents() {
  toggleBtn.addEventListener("click", () => {
    if (Date.now() < clickGuardUntil) {
      return;
    }
    if (!blockEnabled) {
      blockEnabled = true;
      setBlockState(true);
      updateUI();
    }
  });

  toggleBtn.addEventListener("mousedown", beginHoldToDisable);
  toggleBtn.addEventListener("touchstart", beginHoldToDisable);

  ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((eventName) => {
    toggleBtn.addEventListener(eventName, endHoldToDisable);
  });
}

function init() {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    blockEnabled = result[STORAGE_KEY] !== false;
    updateUI();
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[STORAGE_KEY]) {
      return;
    }
    blockEnabled = changes[STORAGE_KEY].newValue !== false;
    if (!blockEnabled) {
      resetHoldVisuals();
    }
    updateUI();
  });

  setupEvents();
}

init();
