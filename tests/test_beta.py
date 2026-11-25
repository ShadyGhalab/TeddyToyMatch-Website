"""Dependency-free static validation for the Android beta invitation page."""
from html.parser import HTMLParser
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
PORTAL = ROOT / "beta" / "index.html"

class Page(HTMLParser):
    def __init__(self, file):
        super().__init__()
        self.file = file
        self.tags = []
        self.feed(file.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

    def attrs(self, tag, attr):
        return [attrs[attr] for name, attrs in self.tags if name == tag and attr in attrs]

class BetaPortal(unittest.TestCase):
    def test_enrollment_targets(self):
        p = Page(PORTAL)
        links = p.attrs("a", "href")
        self.assertIn("https://groups.google.com/g/alpha-android-testers", links)
        self.assertIn("https://play.google.com/apps/testing/com.tendonlife.teddybear", links)
        self.assertIn("https://play.google.com/store/apps/details?id=com.tendonlife.teddybear", links)
        self.assertIn("mailto:Feedback@teddytoymatch.com", links)
        self.assertIn("https://teddytoymatch.com/beta/", links)
        self.assertNotIn("invisibleink", PORTAL.read_text().lower())
        self.assertNotIn("blinddraw.ink", PORTAL.read_text().lower())

    def test_local_assets_and_links(self):
        p = Page(PORTAL)
        for tag, attr in [("img", "src"), ("script", "src"), ("link", "href"), ("a", "href")]:
            for link in p.attrs(tag, attr):
                if ":" in link or link.startswith("#"):
                    continue
                path = PORTAL.parent / link
                self.assertTrue(path.exists(), f"Missing {link}")
                self.assertTrue(path.resolve().is_relative_to(ROOT))

    def test_onboarding_and_accessibility(self):
        p = Page(PORTAL)
        self.assertIn("main-content", p.attrs("main", "id"))
        self.assertIn("#main-content", p.attrs("a", "href"))
        self.assertEqual(len(p.attrs("h1", "id")), 1)
        self.assertIn("14 consecutive days", PORTAL.read_text())
        self.assertIn("same Google account", PORTAL.read_text())
        self.assertFalse(any(tag in ("form", "input") for tag, _ in p.tags))
        self.assertTrue(all("alt" in a for tag, a in p.tags if tag == "img"))
        self.assertIn("beta/", Page(ROOT / "index.html").attrs("a", "href"))

if __name__ == "__main__":
    unittest.main()
