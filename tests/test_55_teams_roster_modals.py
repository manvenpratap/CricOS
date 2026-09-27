"""
test_55_teams_roster_modals.py — Teams & Rosters Modals & Interactive Desks E2E Suite
Verifies that 3D Player Card, Join Team prompt, Expand Analytics drawer, and Create Team modal
open cleanly, are visible on screen with correct geometries, close via dismissal buttons,
trigger zero critical console errors, and persist local visual regression screenshots.
"""

import asyncio
import os
import pathlib
import pytest
from playwright.async_api import async_playwright, Page
from tests.helpers import save_screenshot_async, assert_no_critical_errors, catalog_screenshots

ROOT_DIR = pathlib.Path(__file__).parent.parent.resolve()
INDEX_HTML = (ROOT_DIR / "index.html").as_uri()


@pytest.mark.asyncio
async def test_teams_roster_modals_and_interactive_desks():
    """
    Verify all 4 Teams & Rosters interactive controls:
    1. 🃏 3D Player Card modal with Three.js holographic canvas
    2. ➕ Join Team custom in-app prompt dialog
    3. ↗ Expand Analytics slide-over drawer with 6-axis radar
    4. 🏆 Create New Team modal dialog
    """
    console_errors = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()

        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGE ERROR: {e}"))
        page._console_errors = console_errors

        await page.goto(INDEX_HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(300)

        # -------------------------------------------------------------
        # Navigate to Teams & Rosters tab
        # -------------------------------------------------------------
        tab = await page.query_selector('[data-tab="teams"]')
        assert tab is not None, "Teams & Rosters tab button must exist"
        await tab.click()
        await page.wait_for_timeout(300)

        # -------------------------------------------------------------
        # 1. Test 3D Player Card Modal
        # -------------------------------------------------------------
        btn_3d = await page.query_selector('button:has-text("3D Player Card")')
        assert btn_3d is not None, "3D Player Card button must exist"
        await btn_3d.click()
        await page.wait_for_timeout(400)

        modal_3d = await page.query_selector("#modal3DPlayerCard")
        assert modal_3d is not None, "#modal3DPlayerCard element must exist"
        assert await modal_3d.is_visible(), "#modal3DPlayerCard must become visible"
        box_3d = await modal_3d.bounding_box()
        assert box_3d and box_3d["width"] > 400, "3D Player Card modal must have non-zero geometry"

        await save_screenshot_async(page, "roster_3d_player_card.png")

        # Close 3D Player Card modal
        close_3d = await page.query_selector("#modal3DPlayerCard .modal-close-btn")
        assert close_3d is not None, "3D Player Card close button must exist"
        await close_3d.click()
        await page.wait_for_timeout(200)
        assert not (await modal_3d.is_visible()), "#modal3DPlayerCard must close upon clicking close button"

        # -------------------------------------------------------------
        # 2. Test Join Team In-App Prompt Dialog
        # -------------------------------------------------------------
        btn_join = await page.query_selector('button:has-text("Join Team")')
        assert btn_join is not None, "Join Team button must exist"
        await btn_join.click()
        await page.wait_for_timeout(300)

        modal_dialog = await page.query_selector("#modalAppDialog")
        assert modal_dialog is not None, "#modalAppDialog must exist"
        assert await modal_dialog.is_visible(), "#modalAppDialog must become visible"
        dialog_title = await page.text_content("#appDialogTitle")
        assert "Join a Team" in dialog_title, f"Expected Join a Team in title, got: {dialog_title}"
        assert await page.is_visible("#appDialogInput"), "#appDialogInput must be visible for prompt mode"

        await save_screenshot_async(page, "roster_join_team_dialog.png")

        # Cancel dialog
        cancel_btn = await page.query_selector("#appDialogCancelBtn")
        assert cancel_btn is not None, "#appDialogCancelBtn must exist"
        await cancel_btn.click()
        await page.wait_for_timeout(200)
        assert not (await modal_dialog.is_visible()), "#modalAppDialog must close upon cancel"

        # -------------------------------------------------------------
        # 3. Test Expand Analytics Slide-Over Drawer
        # -------------------------------------------------------------
        btn_expand = await page.query_selector("#btnOpenStatsDrawer")
        assert btn_expand is not None, "#btnOpenStatsDrawer must exist"
        await btn_expand.click()
        await page.wait_for_timeout(400)

        drawer = await page.query_selector("#modalPlayerStatsDrawer")
        assert drawer is not None, "#modalPlayerStatsDrawer must exist"
        assert await drawer.is_visible(), "#modalPlayerStatsDrawer must become visible"
        assert await page.is_visible("#drawerRadarContainer"), "#drawerRadarContainer must be visible"

        await save_screenshot_async(page, "roster_expand_analytics_drawer.png")

        # Close drawer
        close_drawer = await page.query_selector("#modalPlayerStatsDrawer .modal-close-btn")
        assert close_drawer is not None, "Drawer close button must exist"
        await close_drawer.click()
        await page.wait_for_timeout(200)
        assert not (await drawer.is_visible()), "#modalPlayerStatsDrawer must close upon close button click"

        # -------------------------------------------------------------
        # 4. Test Create New Team Modal
        # -------------------------------------------------------------
        btn_create = await page.query_selector('button:has-text("Create New Team")')
        assert btn_create is not None, "Create New Team button must exist"
        await btn_create.click()
        await page.wait_for_timeout(300)

        modal_create = await page.query_selector("#modalCreateTeam")
        assert modal_create is not None, "#modalCreateTeam must exist"
        assert await modal_create.is_visible(), "#modalCreateTeam must become visible"

        close_create = await page.query_selector("#modalCreateTeam .modal-close")
        if close_create:
            await close_create.click()
            await page.wait_for_timeout(200)
            assert not (await modal_create.is_visible()), "#modalCreateTeam must close"

        # -------------------------------------------------------------
        # 5. Rule 4 Invariant: Zero critical errors
        # -------------------------------------------------------------
        assert_no_critical_errors(page)

        catalog_screenshots()
        await browser.close()


if __name__ == "__main__":
    asyncio.run(test_teams_roster_modals_and_interactive_desks())
    print("✅ All Teams & Rosters modal and drawer checks passed successfully!")
