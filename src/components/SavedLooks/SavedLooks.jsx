import { escapeHtml } from "../../utils/html.js";

export function SavedLooks({ saved }) {
  return `
    <section class="saved-section">
      <div class="section-title">
        <h3>Locked looks</h3>
        <span>Fits worth repeating</span>
      </div>
      <div class="saved-grid">
        ${
          saved.length
            ? saved.map(savedLook).join("")
            : `<div class="empty-state">Locked looks land here.</div>`
        }
      </div>
    </section>
  `;
}

function savedLook(outfit) {
  const names = outfit.items.map((item) => item.name).join(", ");

  return `
    <article class="saved-outfit">
      <div class="saved-preview">
        ${outfit.items.map((item) => `<img src="${item.image}" alt="${escapeHtml(item.name)}">`).join("")}
      </div>
      <div class="saved-copy">${escapeHtml(names)}</div>
    </article>
  `;
}
