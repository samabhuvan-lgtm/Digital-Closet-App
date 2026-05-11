import { escapeHtml } from "../../utils/html.js";

export function ClosetFeed({ categories, filter, items, hasItems }) {
  return `
    <div class="closet-board">
      <div class="section-title">
        <h3>Closet feed</h3>
        <span>${filter === "all" ? "All items" : categories[filter]}</span>
      </div>
      <div class="item-grid">
        ${
          items.length
            ? items.map((item) => itemCard(item, categories)).join("")
            : `<div class="empty-state">${hasItems ? "This lane is empty right now." : "Add a few pieces and the outfit shuffle wakes up."}</div>`
        }
      </div>
    </div>
  `;
}

function itemCard(item, categories) {
  return `
    <article class="item-card">
      <button class="delete-item" type="button" title="Delete item" aria-label="Delete item" data-item-id="${item.id}">&times;</button>
      <img src="${item.image}" alt="${escapeHtml(item.name)}" />
      <div class="item-info">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${categories[item.category]}</span>
      </div>
    </article>
  `;
}
