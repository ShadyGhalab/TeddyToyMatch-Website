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
