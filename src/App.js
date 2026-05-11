import { ClosetPanel } from "./components/ClosetPanel/ClosetPanel.js";
import { ClosetFeed } from "./components/ClosetFeed/ClosetFeed.js";
import { OutfitGenerator } from "./components/OutfitGenerator/OutfitGenerator.js";
import { SavedLooks } from "./components/SavedLooks/SavedLooks.js";
import { TopBar } from "./components/TopBar/TopBar.js";
import { escapeHtml } from "./utils/html.js";

const CATEGORIES = {
  tops: "Top",
  bottoms: "Bottom",
  shoes: "Shoes",
  outerwear: "Outerwear",
  accessories: "Accessory",
};

const REQUIRED_OUTFIT = ["tops", "bottoms", "shoes", "outerwear", "accessories"];
const closetKeyBase = "digital-closet-items";
const outfitKeyBase = "digital-closet-saved-outfits";

const authRoute = {
  LOADING: "loading",
  SIGN_IN: "sign-in",
  SIGN_UP: "sign-up",
  CLOSET: "closet",
};

const state = {
  items: [],
  saved: [],
  filter: "all",
  currentOutfit: null,
  previewImage: null,
  auth: {
    route: authRoute.LOADING,
    mode: authRoute.SIGN_IN,
    user: null,
    error: null,
  },
};

let rootElement;

export function mountApp(root) {
  rootElement = root;
  render();
  checkAuth();
}

function App() {
  if (state.auth.route === authRoute.LOADING) {
    return loadingPage();
  }

  if (state.auth.route !== authRoute.CLOSET) {
    return authPage();
  }

  return closetPage();
}

function loadingPage() {
  return `
    <section class="auth-shell">
      <div class="auth-card">
        <p class="auth-loading">Checking your session…</p>
      </div>
    </section>
  `;
}

function authPage() {
  const isSignIn = state.auth.mode === authRoute.SIGN_IN;
  return `
    <section class="auth-shell">
      <div class="auth-card">
        <div class="auth-header">
          <p class="eyebrow">${isSignIn ? "Welcome back" : "Start your closet"}</p>
          <h1>${isSignIn ? "Sign in" : "Create account"}</h1>
          <p class="auth-copy">${isSignIn ? "Use your email to unlock your digital closet." : "Create an account to save your outfits and uploads."}</p>
          ${state.auth.error ? `<p class="auth-error">${escapeHtml(state.auth.error)}</p>` : ""}
        </div>
        <form id="authForm" class="auth-form">
          <label for="emailInput">Email</label>
          <input id="emailInput" name="email" type="email" autocomplete="email" required />

          <label for="passwordInput">Password</label>
          <input id="passwordInput" name="password" type="password" autocomplete="current-password" minlength="6" required />

          ${isSignIn ? "" : `
            <label for="confirmPasswordInput">Confirm password</label>
            <input id="confirmPasswordInput" name="confirmPassword" type="password" autocomplete="new-password" minlength="6" required />
          `}

          <button type="submit" class="primary-button">${isSignIn ? "Sign in" : "Sign up"}</button>
        </form>
        <button id="authToggleBtn" type="button" class="secondary-button">
          ${isSignIn ? "Need an account?" : "Already have an account?"}
        </button>
      </div>
    </section>
  `;
}

function closetPage() {
  return `
    <section class="app-shell">
      <section class="workspace" aria-label="Digital closet">
        ${ClosetPanel({ filter: state.filter, previewImage: state.previewImage })}
        <section class="main-panel">
          ${TopBar({ itemCount: state.items.length, savedCount: state.saved.length, user: state.auth.user })}
          <section class="generator-grid">
            ${OutfitGenerator({ outfit: state.currentOutfit || [], categories: CATEGORIES })}
            ${ClosetFeed({
              categories: CATEGORIES,
              filter: state.filter,
              items: getVisibleItems(),
              hasItems: state.items.length > 0,
            })}
          </section>
          ${SavedLooks({ saved: state.saved })}
        </section>
      </section>
    </section>
  `;
}

function render() {
  rootElement.innerHTML = App();
  bindEvents();
}

function bindEvents() {
  if (state.auth.route !== authRoute.CLOSET) {
    const authForm = rootElement.querySelector("#authForm");
    const toggleButton = rootElement.querySelector("#authToggleBtn");

    authForm?.addEventListener("submit", handleAuthSubmit);
    toggleButton?.addEventListener("click", () => {
      state.auth.mode = state.auth.mode === authRoute.SIGN_IN ? authRoute.SIGN_UP : authRoute.SIGN_IN;
      state.auth.error = null;
      render();
    });

    return;
  }

  const uploadForm = rootElement.querySelector("#uploadForm");
  const categoryInput = rootElement.querySelector("#categoryInput");
  const generateBtn = rootElement.querySelector("#generateBtn");
  const saveOutfitBtn = rootElement.querySelector("#saveOutfitBtn");
  const clearClosetBtn = rootElement.querySelector("#clearClosetBtn");
  const photoInput = rootElement.querySelector("#photoInput");
  const logoutBtn = rootElement.querySelector("#logoutBtn");

  uploadForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = photoInput.files[0];
    const itemName = rootElement.querySelector("#itemName").value.trim();
    if (!file || !itemName) return;

    state.items.unshift({
      id: crypto.randomUUID(),
      name: itemName,
      category: categoryInput.value,
      image: await readFile(file),
      addedAt: Date.now(),
    });

    state.previewImage = null;
    persistCloset();
    render();
  });

  photoInput?.addEventListener("change", async () => {
    const file = photoInput.files[0];
    if (file) {
      state.previewImage = await readFile(file);
    } else {
      state.previewImage = null;
    }
    render();
  });

  rootElement.querySelectorAll(".filter-pill").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      render();
    });
  });

  rootElement.querySelectorAll(".delete-item").forEach((button) => {
    button.addEventListener("click", () => deleteItem(button.dataset.itemId));
  });

  generateBtn?.addEventListener("click", () => {
    state.currentOutfit = buildRandomOutfit();
    render();
  });

  saveOutfitBtn?.addEventListener("click", () => {
    if (!state.currentOutfit?.length) return;

    state.saved.unshift({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      items: state.currentOutfit,
    });
    persistSaved();
    render();
  });

  clearClosetBtn?.addEventListener("click", () => {
    if (!state.items.length && !state.saved.length) return;
    if (!window.confirm("Clear all closet items and saved outfits?")) return;

    state.items = [];
    state.saved = [];
    state.currentOutfit = null;
    removeStoredState();
    render();
  });

  logoutBtn?.addEventListener("click", async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    state.auth.user = null;
    state.auth.route = authRoute.SIGN_IN;
    state.auth.mode = authRoute.SIGN_IN;
    state.auth.error = null;
    state.items = [];
    state.saved = [];
    state.currentOutfit = null;
    state.previewImage = null;
    render();
  });
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const email = formData.get("email")?.trim();
  const password = formData.get("password")?.trim();

  if (!email || !password) {
    state.auth.error = "Email and password are required.";
    render();
    return;
  }

  if (state.auth.mode === authRoute.SIGN_IN) {
    await signIn(email, password);
    return;
  }

  const confirmPassword = formData.get("confirmPassword")?.trim();
  if (password !== confirmPassword) {
    state.auth.error = "Passwords must match.";
    render();
    return;
  }

  await signUp(email, password);
}

async function signIn(email, password) {
  const response = await fetch("/api/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    state.auth.error = payload.error || "Invalid credentials.";
    render();
    return;
  }

  const { user } = await response.json();
  state.auth.user = user;
  state.auth.route = authRoute.CLOSET;
  state.auth.error = null;
  loadStateForUser();
  render();
}

async function signUp(email, password) {
  const response = await fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    state.auth.error = payload.error || "Unable to register.";
    render();
    return;
  }

  const { user } = await response.json();
  state.auth.user = user;
  state.auth.route = authRoute.CLOSET;
  state.auth.error = null;
  loadStateForUser();
  render();
}

async function checkAuth() {
  const response = await fetch("/api/me", {
    credentials: "include",
  });

  if (!response.ok) {
    state.auth.route = authRoute.SIGN_IN;
    state.auth.user = null;
    state.auth.error = null;
    render();
    return;
  }

  const { user } = await response.json();
  state.auth.user = user;
  state.auth.route = authRoute.CLOSET;
  state.auth.error = null;
  loadStateForUser();
  render();
}

function loadStateForUser() {
  if (!state.auth.user) return;
  state.items = load(getClosetKey(state.auth.user.id), []);
  state.saved = load(getOutfitKey(state.auth.user.id), []);
  state.currentOutfit = null;
  state.previewImage = null;
}

function getClosetKey(userId) {
  return `${closetKeyBase}-${userId}`;
}

function getOutfitKey(userId) {
  return `${outfitKeyBase}-${userId}`;
}

function removeStoredState() {
  if (!state.auth.user) return;
  localStorage.removeItem(getClosetKey(state.auth.user.id));
  localStorage.removeItem(getOutfitKey(state.auth.user.id));
}

function getVisibleItems() {
  return state.filter === "all" ? state.items : state.items.filter((item) => item.category === state.filter);
}

function buildRandomOutfit() {
  return REQUIRED_OUTFIT.map((category) => {
    const choices = state.items.filter((item) => item.category === category);
    return choices.length ? choices[Math.floor(Math.random() * choices.length)] : null;
  }).filter(Boolean);
}

function deleteItem(id) {
  state.items = state.items.filter((item) => item.id !== id);
  state.saved = state.saved
    .map((outfit) => ({ ...outfit, items: outfit.items.filter((item) => item.id !== id) }))
    .filter((outfit) => outfit.items.length);
  state.currentOutfit = state.currentOutfit?.filter((item) => item.id !== id) || null;
  persistCloset();
  persistSaved();
  render();
}

function persistCloset() {
  if (!state.auth.user) return;
  localStorage.setItem(getClosetKey(state.auth.user.id), JSON.stringify(state.items));
}

function persistSaved() {
  if (!state.auth.user) return;
  localStorage.setItem(getOutfitKey(state.auth.user.id), JSON.stringify(state.saved));
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}
