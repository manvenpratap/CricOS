import asyncio
import os
import sys
import pathlib
import pytest
from playwright.async_api import async_playwright

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from tests.helpers import assert_no_critical_errors, save_screenshot_async


@pytest.mark.asyncio
async def test_hero_human_redesign_and_entrance_choreography():
    """Human-touch hero redesign: authored copy, entrance choreography,
    hand-drawn marker underline, daylight headline exclusion, and a
    Stage-2 login gateway that renders with real geometry."""
    console_errors = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        hero_url = f"file://{os.path.abspath('index.html')}?hero=1"
        await page.goto(hero_url, wait_until="domcontentloaded")
        await page.wait_for_timeout(2400)

        # ---------------------------------------------------------------
        # 1. Hero opens with the human-written headline & eyebrow copy
        # ---------------------------------------------------------------
        overlay = await page.query_selector("#cricosHeroAuthOverlay")
        assert overlay is not None and await overlay.is_visible(), "Hero overlay must be visible with ?hero=1"

        headline = await page.inner_text("#heroKineticHeadline")
        assert "Match day" in headline, f"Hero headline must carry the human opening line, got: {headline!r}"
        assert "paperwork" in headline, "Hero headline must land on 'paperwork'"
        assert "Every Tactic" not in headline, "Old AI-slop triplet headline must be gone"

        eyebrow = await page.inner_text("#heroQuickPersonaLaunchBar")
        assert "no sign-up" in eyebrow, "Demo persona bar must state no sign-up in plain words"

        ribbon = await page.inner_text("#heroLiveBroadcastRibbon")
        assert "balanced to the paisa" in ribbon, "Ribbon must use the human ledger line"

        # ---------------------------------------------------------------
        # 2. Entrance choreography + hand-drawn marker underline
        # ---------------------------------------------------------------
        state = await page.evaluate("""() => {
            const landing = document.getElementById('heroStageLanding');
            const line = document.querySelector('#heroKineticHeadline .hero-line');
            const path = document.querySelector('.hero-hand-underline path');
            return {
                animPlay: landing ? landing.classList.contains('hero-anim-play') : false,
                lineAnim: line ? getComputedStyle(line).animationName : null,
                lineDelay: line ? parseFloat(getComputedStyle(line).animationDelay) : null,
                pathLen: path ? path.getAttribute('pathLength') : null,
                dash: path ? getComputedStyle(path).strokeDashoffset : null
            };
        }""")
        assert state["animPlay"], "Hero entrance choreography must be armed (#heroStageLanding.hero-anim-play)"
        assert state["lineAnim"] == "heroLineReveal", f"Headline must reveal line-by-line, got: {state['lineAnim']}"
        assert state["lineDelay"] is not None and state["lineDelay"] > 0, "Headline lines must stagger in with a delay"
        assert state["pathLen"] == "1", "Marker underline path must be pathLength-normalized for stroke drawing"
        assert float(state["dash"].replace("px", "")) < 1.0, "Marker underline must be fully drawn after the entrance"

        # ---------------------------------------------------------------
        # 3. Daylight themes must never bleach the hero headline
        #    (guards the body[data-theme=swiss] h1 #0F172A !important regression)
        # ---------------------------------------------------------------
        color = await page.evaluate("""() => getComputedStyle(document.getElementById('heroKineticHeadline')).color""")
        channels = [int(v) for v in color.replace("rgba(", "").replace("rgb(", "").rstrip(")").split(",")[:3]]
        assert sum(channels) > 600, f"Hero headline must stay bright on the dark stage, got {color}"

        # ---------------------------------------------------------------
        # 4. Stage-2 login gateway renders with real geometry
        #    (guards the dropped </section> nesting regression)
        # ---------------------------------------------------------------
        await page.click("#btnHeroProceedToLogin")
        await page.wait_for_timeout(500)
        login = await page.evaluate("""() => {
            const s = document.getElementById('heroStageLogin');
            const r = s.getBoundingClientRect();
            const h2 = s.querySelector('h2');
            return {
                display: getComputedStyle(s).display,
                insideLanding: Boolean(s.closest('#heroStageLanding')),
                w: Math.round(r.width), h: Math.round(r.height),
                h2: h2 ? h2.innerText.trim() : null,
                badge: document.getElementById('heroStageBadge').textContent
            };
        }""")
        assert login["display"] == "flex", "Login stage must be displayed when Sign In is pressed"
        assert not login["insideLanding"], "Login stage must be a sibling of the landing section, not nested inside it"
        assert login["w"] > 500 and login["h"] > 300, f"Login stage must render with real geometry, got {login['w']}x{login['h']}"
        assert login["h2"] and "Sign In" in login["h2"], f"Login stage must show its sign-in heading, got {login['h2']!r}"
        assert login["badge"].strip() == "SIGN IN", f"Stage badge must switch to SIGN IN, got {login['badge']!r}"
        await save_screenshot_async(page, "test_80_hero_login_stage")

        # ---------------------------------------------------------------
        # 5. Round-trip back to hero and 1-click persona sign-in
        # ---------------------------------------------------------------
        await page.click("#btnLoginBackToHero")
        await page.wait_for_timeout(400)
        back = await page.evaluate("""() => ({
            landing: getComputedStyle(document.getElementById('heroStageLanding')).display,
            login: getComputedStyle(document.getElementById('heroStageLogin')).display,
            badge: document.getElementById('heroStageBadge').textContent
        })""")
        assert back["landing"] == "flex" and back["login"] == "none", "Back button must restore the hero stage"
        assert back["badge"].strip() == "WELCOME", "Stage badge must return to WELCOME"

        await page.evaluate("loginWithHeroAccount('CAPTAIN_PLAYER')")
        await page.wait_for_timeout(400)
        closed = await page.evaluate("""() => getComputedStyle(document.getElementById('cricosHeroAuthOverlay')).display""")
        assert closed == "none", "Quick persona login must close the hero overlay"

        await save_screenshot_async(page, "test_80_hero_landing")
        assert_no_critical_errors(page)
        await browser.close()


@pytest.mark.asyncio
async def test_hero_respects_reduced_motion():
    """Under prefers-reduced-motion the hero must be fully visible statically,
    with the marker underline drawn and no animation applied."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        page = await ctx.new_page()
        page._console_errors = []

        hero_url = f"file://{os.path.abspath('index.html')}?hero=1"
        await page.goto(hero_url, wait_until="domcontentloaded")
        await page.wait_for_timeout(1200)

        state = await page.evaluate("""() => {
            const line = document.querySelector('#heroKineticHeadline .hero-line');
            const path = document.querySelector('.hero-hand-underline path');
            return {
                lineOpacity: line ? getComputedStyle(line).opacity : null,
                lineAnim: line ? getComputedStyle(line).animationName : null,
                dash: path ? getComputedStyle(path).strokeDashoffset : null
            };
        }""")
        assert state["lineOpacity"] == "1", "Headline must be fully opaque without animation"
        assert state["lineAnim"] == "none", f"Reduced motion must disable entrance animation, got {state['lineAnim']}"
        assert float(state["dash"].replace("px", "")) < 1.0, "Marker underline must render statically under reduced motion"
        await browser.close()
