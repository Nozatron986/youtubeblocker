const STYLE_ID = "yt-home-blocker-style";
const STORAGE_KEY = "blockEnabled";
const WATCH_NOTICE_ID = "ythb-watch-notice";
let blockEnabledState = true;

function ensureStyleElement() {
  let style = document.getElementById(STYLE_ID);
  if (style) {
    return style;
  }

  style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    html.ythb-blocked ytd-browse[page-subtype="home"] #contents,
    html.ythb-blocked ytd-browse[page-subtype="home"] ytd-rich-grid-renderer,
    html.ythb-blocked ytd-browse[page-subtype="home"] ytd-rich-section-renderer,
    html.ythb-blocked ytd-browse[page-subtype="home"] ytd-item-section-renderer {
      display: none !important;
    }

    html.ythb-blocked ytd-browse[page-subtype="home"]::before {
      content: "YouTube Home is blocked. Open the extension and hold the unlock button for 60 seconds to show videos again.";
      display: block;
      margin: 48px auto;
      max-width: 680px;
      padding: 16px 20px;
      text-align: center;
      font-size: 18px;
      line-height: 1.4;
      color: #fff;
      background: #202020;
      border: 1px solid #3d3d3d;
      border-radius: 12px;
    }

    html.ythb-blocked ytd-watch-flexy #related,
    html.ythb-blocked ytd-watch-next-secondary-results-renderer,
    html.ythb-blocked #items.ytd-watch-next-secondary-results-renderer,
    html.ythb-blocked ytd-watch-flexy #secondary-inner > *:not(#ythb-watch-notice) {
      display: none !important;
    }

    html.ythb-blocked #ythb-watch-notice {
      display: block;
      margin: 12px 0;
      padding: 12px 14px;
      text-align: center;
      font-size: 14px;
      line-height: 1.4;
      color: #fff;
      background: #202020;
      border: 1px solid #3d3d3d;
      border-radius: 10px;
    }
  `;

  document.documentElement.appendChild(style);
  return style;
}

function isYouTubeHome() {
  return window.location.hostname === "www.youtube.com" && window.location.pathname === "/";
}

function isYouTubeWatchPage() {
  return window.location.hostname === "www.youtube.com" && window.location.pathname === "/watch";
}

function applyBlockState(enabled) {
  ensureStyleElement();
  blockEnabledState = enabled;

  if (enabled && (isYouTubeHome() || isYouTubeWatchPage())) {
    document.documentElement.classList.add("ythb-blocked");
    if (isYouTubeWatchPage()) {
      forceHideWatchRecommendations();
    }
  } else {
    document.documentElement.classList.remove("ythb-blocked");
    clearForcedWatchHides();
  }
}

function forceHideWatchRecommendations() {
  ensureWatchNotice();

  const selectors = [
    "ytd-watch-flexy #secondary-inner > *:not(#ythb-watch-notice)",
    "ytd-watch-flexy #related",
    "ytd-watch-next-secondary-results-renderer",
    "#items.ytd-watch-next-secondary-results-renderer"
  ];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.style.setProperty("display", "none", "important");
      el.setAttribute("data-ythb-hidden", "1");
    });
  });
}

function ensureWatchNotice() {
  const secondaryInner = document.querySelector("ytd-watch-flexy #secondary-inner");
  if (!secondaryInner) {
    return;
  }

  let notice = document.getElementById(WATCH_NOTICE_ID);
  if (!notice) {
    notice = document.createElement("div");
    notice.id = WATCH_NOTICE_ID;
    notice.textContent = "Recommended videos are blocked while this extension is active.";
    secondaryInner.prepend(notice);
  }
}

function clearForcedWatchHides() {
  document.querySelectorAll("[data-ythb-hidden='1']").forEach((el) => {
    el.style.removeProperty("display");
    el.removeAttribute("data-ythb-hidden");
  });
  const notice = document.getElementById(WATCH_NOTICE_ID);
  if (notice) {
    notice.remove();
  }
}

function refreshFromStorage() {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const enabled = result[STORAGE_KEY] !== false;
    applyBlockState(enabled);
  });
}

function watchNavigation() {
  let currentHref = window.location.href;
  setInterval(() => {
    if (blockEnabledState && isYouTubeWatchPage()) {
      forceHideWatchRecommendations();
    }
    if (window.location.href !== currentHref) {
      currentHref = window.location.href;
      refreshFromStorage();
    }
  }, 500);
}

const observer = new MutationObserver(() => {
  if (blockEnabledState && isYouTubeWatchPage()) {
    forceHideWatchRecommendations();
  }
});

observer.observe(document.documentElement, { childList: true, subtree: true });

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes[STORAGE_KEY]) {
    return;
  }
  applyBlockState(changes[STORAGE_KEY].newValue !== false);
});

refreshFromStorage();
watchNavigation();
