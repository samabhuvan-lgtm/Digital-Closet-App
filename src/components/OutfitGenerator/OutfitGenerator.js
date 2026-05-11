import { escapeHtml } from "../../utils/html.js";

export function OutfitGenerator({ outfit, categories }) {
  return `
    <div class="outfit-stage" aria-live="polite">
      <div class="outfit-toolbar">
        <button class="primary-button" id="generateBtn" type="button">Roll a fit</button>
        <button class="secondary-button" id="saveOutfitBtn" type="button" ${outfit.length ? "" : "disabled"}>Lock look</button>
      </div>
      <div class="outfit-slots">
        ${
          outfit.length
            ? outfit.map((item) => outfitSlot(item, categories)).join("")
            : `<div class="empty-state">Roll a fit when your closet has something to play with.</div>`
        }
      </div>
    </div>
  `;
}

function outfitSlot(item, categories) {
  return `
    <article class="slot">
      <img src="${item.image}" alt="${escapeHtml(item.name)}">
      <div class="slot-caption">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${categories[item.category]}</span>
      </div>
    </article>
  `;
}
