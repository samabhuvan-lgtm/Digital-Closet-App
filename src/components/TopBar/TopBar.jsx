export function TopBar({ itemCount, savedCount }) {
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">Outfit Shuffle</p>
        <h2>Spin a look from your own rack</h2>
      </div>
      <div class="stats" aria-label="Closet stats">
        <span><strong>${itemCount}</strong> items</span>
        <span><strong>${savedCount}</strong> saved</span>
      </div>
    </header>
  `;
}
