# Teddy Toy Match Website

Official static website for Teddy Toy Match, a cozy teddy bear puzzle adventure for iPhone and iPad.

Domain: https://teddytoymatch.com

App Store: https://apps.apple.com/us/app/teddy-toy-match/id6774041961

## Contact

- Support@teddytoymatch.com
- Feedback@teddytoymatch.com

## Android beta testing

Share https://teddytoymatch.com/beta/ for the Teddy Dreams Android test (package `com.tendonlife.teddybear`). The page uses the same general Google Group, `alpha-android-testers@googlegroups.com`, as other Android games, but only includes Teddy Dreams enrollment and installation links. No email addresses are collected by the site.

Before promoting the page, confirm the exact group and testing URL in the game's Google Play Console closed testing track, preserve existing tester eligibility, and verify enrollment with a non-owner account. The site's existing static hosting configuration serves `beta/index.html` at `/beta/`; verify public deployment after merging. Run `node --test tests/beta-portal.test.mjs` to check the HTML links, local assets, and enrollment instructions.

### Localized beta invitations

The beta landing page has 8 language editions matching the game's supported locales. The default `/beta/` page selects a supported browser language; explicit language routes such as `/beta/de/` are stable shareable links and never auto-redirect. Arabic uses RTL layout. Static English and all translated enrollment links work without JavaScript. Update `scripts/beta-content.mjs`, then run `node scripts/generate-beta.mjs` to regenerate the checked-in HTML; `node scripts/generate-beta.mjs --check` verifies freshness. Run `node --test tests/beta-portal.test.mjs` to verify language coverage, links, artwork and game isolation. Translation copy is provided in full, but native-speaker review and real-device checks are still recommended.

### Invitation experience

The beta page links directly to Google Groups, Google Play opt-in and installation in separate tabs/apps, and returning group members can go straight to the opt-in page. The self-reported enrollment checklist and manually selected language are stored in browser local storage only; they are never sent to a server and do not verify Google Play status. The checklist is optional, resettable and independent of language. A static QR code encodes the canonical `https://teddytoymatch.com/beta/` URL; native sharing, copy and WhatsApp/Telegram links are user-triggered. No external QR service or analytics is used. All translations are in `scripts/beta-content.mjs` and `scripts/beta-invitation.mjs`. Regenerate and check pages with `node scripts/generate-beta.mjs` and `node scripts/generate-beta.mjs --check`. Run `node --test tests/beta-portal.test.mjs tests/beta-interaction.test.mjs` to check the static output and interaction behavior. Actual tester access remains dependent on Google Play Console permissions and release status.

### Enrollment-first beta invitation

The hero and first three actions lead to the Google Group, Play opt-in and installation. The next-action button changes only on user-confirmed checklist state. Store artwork is below enrollment, and all new instructions are localized. The page explains that unpublished releases, account mismatch and an existing internal test may prevent closed-test access. A personal .ics reminder uses the tester's actual opt-in date (14 calendar days later); it does not verify Google's eligibility or automatically enroll anyone. The feedback mailto link opens a prefilled, editable bug-report template. No remote analytics, account data, auto-enrollment, or fabricated tester/release counts are introduced. Owner must confirm closed-test release and group configuration in Play Console.

Artwork provenance is in `scripts/beta-funnel.mjs`. Teddy's full-resolution Google Play phone screenshots were too large for the connector; the three existing optimized App Store web screenshots are reused without modification. The Play feature graphic is copied directly from the game repository. Store imagery may differ from the test build and may be English. Source blobs are checksum-checked by the portal tests. `node scripts/generate-beta.mjs --check` verifies all localized static pages.

### Complete store gallery

All ten existing optimized store-derived phone screenshots are displayed in their original numbered order. The original Google Play feature graphic remains above the enrollment area. The gallery is keyboard-focusable, horizontally scrollable, lazy-loaded, and supports opening the full existing web image. It appears below enrollment steps on every localized invitation route. The larger original Google Play phone PNGs could not be imported through the available connector; the gallery uses the existing web-ready store screenshots without modification. Existing screenshot language and test-build content may differ from the page locale. Asset paths and Git blob checksums are recorded in `scripts/beta-funnel.mjs`.
