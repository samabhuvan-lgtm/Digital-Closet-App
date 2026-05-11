export function ClosetPanel({ filter }) {
  const active = (value) => (filter === value ? " active" : "");

  return `
    <aside class="closet-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Fit Vault</p>
          <h1>Your closet, remixed</h1>
        </div>
        <button class="icon-button" id="clearClosetBtn" type="button" title="Clear closet" aria-label="Clear closet">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="vibe-strip" aria-label="Closet mood tags">
        <span>fit check</span>
        <span>mix</span>
        <span>save</span>
      </div>

      <form class="upload-form" id="uploadForm">
        <label class="drop-zone" for="photoInput">
          <input id="photoInput" name="photo" type="file" accept="image/*" required />
          <span class="drop-title">Drop the piece</span>
          <span class="drop-meta">Photo from camera roll</span>
        </label>

        <div class="form-row">
          <label for="itemName">Nickname it</label>
          <input id="itemName" name="name" type="text" placeholder="Thrifted mesh top" maxlength="38" required />
        </div>

        <div class="form-row">
          <label for="categoryInput">Where it lives</label>
          <select id="categoryInput" name="category" required>
            <option value="tops">Top</option>
            <option value="bottoms">Bottom</option>
            <option value="shoes">Shoes</option>
            <option value="outerwear">Outerwear</option>
            <option value="accessories">Accessory</option>
          </select>
        </div>

        <button class="primary-button" type="submit">Add drip</button>
      </form>

      <div class="filter-bar" aria-label="Closet filters">
        <button class="filter-pill${active("all")}" type="button" data-filter="all">All</button>
        <button class="filter-pill${active("tops")}" type="button" data-filter="tops">Tops</button>
        <button class="filter-pill${active("bottoms")}" type="button" data-filter="bottoms">Bottoms</button>
        <button class="filter-pill${active("shoes")}" type="button" data-filter="shoes">Shoes</button>
        <button class="filter-pill${active("outerwear")}" type="button" data-filter="outerwear">Outerwear</button>
        <button class="filter-pill${active("accessories")}" type="button" data-filter="accessories">Accessories</button>
      </div>
    </aside>
  `;
}
