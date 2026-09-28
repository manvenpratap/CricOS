"""
test_59_zero_contrast_violations_all_themes.py — E2E Playwright Suite for Universal WCAG 2.1 AA/AAA Contrast Invariants
Verifies:
1. Zero WCAG 2.1 AA contrast violations (>= 4.5:1 for normal text, >= 3.0:1 for large text >= 18.66px or >= 14px bold)
   across Stadium Night ('stadium'), Swiss Minimalist ('swiss'), and Nordic Editorial ('nordic').
2. Full Desktop console coverage across all 7 primary navigation tabs ('scoring', 'tournaments', 'teams', 'marketplace',
   'analytics', 'incidents', 'admin') and all 4 flagship studio modals.
3. Full Mobile Standalone App coverage across all 3 themes and all 5 navigation screens ('MATCHES', 'TEAMS',
   'TOURNAMENTS', 'MARKETPLACE', 'PROFILE').
4. Zero critical console errors (assert_no_critical_errors(page)) per Rule 4.
"""

import pathlib
import pytest
from playwright.async_api import async_playwright
from tests.helpers import save_screenshot_async, assert_no_critical_errors, catalog_screenshots

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
INDEX_HTML = (ROOT_DIR / "index.html").as_uri()
MOBILE_HTML = (ROOT_DIR / "dist" / "mobile.html").as_uri()

WCAG_CONTRAST_AUDIT_JS = """
() => {
  function parseColor(str) {
    if (!str || str === 'transparent' || str === 'rgba(0, 0, 0, 0)') return [0, 0, 0, 0];
    const open = str.indexOf('(');
    const close = str.indexOf(')');
    if (open === -1 || close === -1) return [0, 0, 0, 0];
    const parts = str.slice(open + 1, close).split(',');
    if (parts.length < 3) return [0, 0, 0, 0];
    return [
      parseFloat(parts[0]) || 0,
      parseFloat(parts[1]) || 0,
      parseFloat(parts[2]) || 0,
      parts.length >= 4 ? parseFloat(parts[3]) : 1.0
    ];
  }

  function blend(fg, bg) {
    const a = fg[3] + bg[3] * (1 - fg[3]);
    if (a === 0) return [0, 0, 0, 0];
    return [
      (fg[0] * fg[3] + bg[0] * bg[3] * (1 - fg[3])) / a,
      (fg[1] * fg[3] + bg[1] * bg[3] * (1 - fg[3])) / a,
      (fg[2] * fg[3] + bg[2] * bg[3] * (1 - fg[3])) / a,
      a
    ];
  }

  function isElementVisible(el) {
    let cur = el;
    while (cur && cur.nodeType === 1) {
      const style = window.getComputedStyle(cur);
      if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) < 0.15) {
        return false;
      }
      if (cur.classList && cur.classList.contains('modal-backdrop') && !cur.classList.contains('open') && !cur.classList.contains('active')) {
        return false;
      }
      if (cur.id === 'notificationsDrawer' && !cur.classList.contains('open')) {
        return false;
      }
      cur = cur.parentElement;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    if (rect.right < 0 || rect.left > window.innerWidth) return false;
    return true;
  }

  function getEffectiveBg(el) {
    const chain = [];
    let cur = el;
    while (cur && cur.nodeType === 1) {
      const style = window.getComputedStyle(cur);
      const bg = parseColor(style.backgroundColor);
      if (bg[3] > 0) {
        chain.push(bg);
        if (bg[3] >= 0.99) break;
      }
      cur = cur.parentElement;
    }
    const theme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'stadium';
    const rootBg = theme === 'swiss' ? [248, 249, 250, 1] : (theme === 'nordic' ? [245, 240, 232, 1] : [4, 7, 13, 1]);
    let acc = rootBg;
    for (let i = chain.length - 1; i >= 0; i--) {
      acc = blend(chain[i], acc);
    }
    return acc;
  }

  function lum(rgb) {
    const conv = (c) => {
      const v = c / 255.0;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * conv(rgb[0]) + 0.7152 * conv(rgb[1]) + 0.0722 * conv(rgb[2]);
  }

  function contrast(c1, c2) {
    const l1 = lum(c1);
    const l2 = lum(c2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  const issues = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    const text = node.nodeValue.trim();
    if (!text) continue;
    const el = node.parentElement;
    if (!el) continue;
    const tag = el.tagName.toUpperCase();
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TITLE') continue;
    if (el.disabled || el.closest('[disabled]')) continue;
    if (!isElementVisible(el)) continue;

    const style = window.getComputedStyle(el);
    const bg = getEffectiveBg(el);
    const fgRaw = parseColor(style.color);
    const fg = blend(fgRaw, bg);
    const ratio = contrast(fg, bg);

    const fontSize = parseFloat(style.fontSize) || 14;
    const fontWeight = parseInt(style.fontWeight, 10) || 400;
    const isLarge = fontSize >= 18.66 || (fontSize >= 14 && fontWeight >= 700);
    const minRatio = isLarge ? 3.0 : 4.5;

    if (ratio < minRatio) {
      issues.push({
        text: text.slice(0, 40),
        tag,
        id: el.id || '',
        cls: typeof el.className === 'string' ? el.className.slice(0, 40) : '',
        fg: `rgb(${Math.round(fg[0])},${Math.round(fg[1])},${Math.round(fg[2])})`,
        bg: `rgb(${Math.round(bg[0])},${Math.round(bg[1])},${Math.round(bg[2])})`,
        ratio: Number(ratio.toFixed(2)),
        minRatio
      });
    }
  }
  return issues;
}
"""


@pytest.mark.asyncio
async def test_59_desktop_and_mobile_zero_contrast_violations_all_themes():
    """Verify 0 WCAG 2.1 AA contrast violations across stadium, swiss, and nordic themes on Desktop and Mobile."""
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(INDEX_HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(150)

        for theme in ["stadium", "swiss", "nordic"]:
            await page.evaluate(f"window.setDesignTheme('{theme}', false)")
            await page.wait_for_timeout(80)

            for tab in ["scoring", "tournaments", "teams", "marketplace", "analytics", "incidents", "admin"]:
                await page.evaluate(f"window.switchTab('{tab}')")
                await page.wait_for_timeout(50)
                issues = await page.evaluate(WCAG_CONTRAST_AUDIT_JS)
                assert len(issues) == 0, f"Desktop contrast violation in theme={theme}, tab={tab}: {issues[:5]}"

            for modal_fn in [
                "openFieldPlannerModal()",
                "openPitchMapSimulatorModal()",
                "openPlayerAuctionModal()",
                "openCommandPalette()",
            ]:
                await page.evaluate(modal_fn)
                await page.wait_for_timeout(50)
                issues = await page.evaluate(WCAG_CONTRAST_AUDIT_JS)
                assert len(issues) == 0, f"Desktop modal contrast violation in theme={theme}, modal={modal_fn}: {issues[:5]}"
                await page.evaluate(
                    "document.querySelectorAll('.modal-backdrop.open, .modal-backdrop.active').forEach(m => m.classList.remove('open', 'active'))"
                )

            await save_screenshot_async(page, f"test_59_desktop_contrast_{theme}")

        assert_no_critical_errors(page)

        # Verify Mobile Standalone App across all 3 themes and all 5 primary screens
        await page.set_viewport_size({"width": 430, "height": 932})
        await page.goto(MOBILE_HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(150)

        for theme in ["stadium", "swiss", "nordic"]:
            await page.evaluate(f"window.cricosMobileApp.setTheme('{theme}')")
            await page.wait_for_timeout(80)
            for screen in ["MATCHES", "TEAMS", "TOURNAMENTS", "MARKETPLACE", "PROFILE"]:
                await page.evaluate(f"window.cricosMobileApp.navigateTo('{screen}')")
                await page.wait_for_timeout(50)
                issues = await page.evaluate(WCAG_CONTRAST_AUDIT_JS)
                assert len(issues) == 0, f"Mobile contrast violation in theme={theme}, screen={screen}: {issues[:5]}"

            await save_screenshot_async(page, f"test_59_mobile_contrast_{theme}")

        assert_no_critical_errors(page)
        await browser.close()

    catalog_screenshots()
