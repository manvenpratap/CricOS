function formatMinor(amountMinor) {
    return '₹' + (amountMinor / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
/**
 * Renders physical commerce product card (P1-002).
 */
export function renderProductCardHtml(product) {
    const isOutOfStock = product.stock_quantity <= 0;
    const stockBadge = isOutOfStock
        ? `<span class="badge badge-rose" data-tooltip="Currently out of stock">OUT OF STOCK</span>`
        : `<span class="badge badge-emerald" data-tooltip="${product.stock_quantity} units available">${product.stock_quantity} in stock</span>`;
    const variantsHtml = (product.variants || []).map(v => `
    <div style="margin-top: 0.5rem; font-size: 0.75rem; color: #8E9BAE;">
      <span>${v.name}:</span>
      <div style="display: flex; gap: 4px; margin-top: 2px;">
        ${v.options.map(opt => `<span style="padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); font-size: 0.7rem; color: #fff;">${opt}</span>`).join('')}
      </div>
    </div>
  `).join('');
    return `
    <div class="product-card glass-panel" id="product-${product.id}" style="padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(10, 16, 28, 0.75); display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <span class="badge badge-purple" style="font-size: 0.7rem;">${product.category}</span>
          ${stockBadge}
        </div>
        <h4 style="margin: 0.75rem 0 0.35rem; font-family: var(--font-display); font-size: 1.05rem; color: #fff;">${product.title}</h4>
        <p style="font-size: 0.8rem; color: #CBD5E1; line-height: 1.35; margin-bottom: 0.5rem;">${product.description}</p>
        ${variantsHtml}
      </div>

      <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-family: var(--font-mono); font-size: 1.2rem; font-weight: 700; color: var(--turf-emerald);">${formatMinor(product.price_minor)}</div>
          <div style="font-size: 0.7rem; color: #8E9BAE;">Free venue delivery</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="addProductToBasket('${product.id}')" ${isOutOfStock ? 'disabled' : ''} data-tooltip="Add item to match event basket">
          🛒 Add to Basket
        </button>
      </div>
    </div>
  `;
}
//# sourceMappingURL=commerce-catalog.js.map