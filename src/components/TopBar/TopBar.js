import { escapeHtml } from "../../utils/html.js";

export function TopBar({ itemCount, savedCount, user }) {
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">Outfit Shuffle</p>
        <h2>Spin a look from your own rack</h2>
      </div>
      <div class="topbar-actions">
        <div class="stats" aria-label="Closet stats">
          <span><strong>${itemCount}</strong> items</span>
          <span><strong>${savedCount}</strong> saved</span>
        </div>
        ${user ? `<div class="signed-in">Signed in as ${escapeHtml(user.email)}</div><button id="logoutBtn" class="secondary-button" type="button">Sign out</button>` : ""}
      </div>
    </header>
  `;
}
