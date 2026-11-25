// Progressive enhancement; the visible URL always works without JavaScript.
const button = document.getElementById('copy-link');
const url = document.getElementById('share-url');
const status = document.getElementById('copy-status');
if (button && url && status && navigator.clipboard?.writeText) {
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(url.href);
      status.textContent = 'Invitation link copied!';
    } catch {
      status.textContent = 'Please copy the visible link manually.';
    }
  });
}
