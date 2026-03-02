/**
 * Copy command modal — reusable across the assets site.
 * Any element with [data-copy-command-open] opens the modal with title, optional description, and command to copy.
 *
 * Trigger attributes:
 *   data-copy-command-title     — Modal title (required)
 *   data-copy-command-description — Short context line (optional; hidden if empty)
 *   data-copy-command            — Full command text (use this OR curl attributes)
 *   data-copy-command-curl-url   — Path or URL for curl (e.g. /mainnet/genesis.json)
 *   data-copy-command-curl-output — Output filename for curl (e.g. genesis.json)
 *
 * Page must include the modal markup with id="copy-command-modal" (see structure in README or index).
 */
(function () {
  'use strict';

  var modalId = 'copy-command-modal';
  var modal = document.getElementById(modalId);
  if (!modal) return;

  var titleEl = document.getElementById('copy-command-modal-title');
  var descriptionEl = document.getElementById('copy-command-modal-description');
  var preEl = document.getElementById('copy-command-modal-pre');
  var copyBtn = document.getElementById('copy-command-modal-copy-btn');
  var closeBtn = document.getElementById('copy-command-modal-close');

  function getBaseUrl() {
    var base = window.location.origin;
    return (base && (base.startsWith('http://') || base.startsWith('https://'))) ? base : '';
  }

  function buildCurlCommand(urlAttr, outputAttr) {
    var base = getBaseUrl();
    var url = base ? base + urlAttr : urlAttr;
    return 'curl -o ' + outputAttr + ' "' + url + '"';
  }

  function openModal(trigger) {
    var title = trigger.getAttribute('data-copy-command-title') || 'Copy command';
    var description = trigger.getAttribute('data-copy-command-description') || '';
    var command = trigger.getAttribute('data-copy-command');
    if (!command && trigger.getAttribute('data-copy-command-curl-url') && trigger.getAttribute('data-copy-command-curl-output')) {
      command = buildCurlCommand(
        trigger.getAttribute('data-copy-command-curl-url'),
        trigger.getAttribute('data-copy-command-curl-output')
      );
    }
    if (!command) command = '';

    if (titleEl) titleEl.textContent = title;
    if (descriptionEl) {
      descriptionEl.textContent = description;
      descriptionEl.style.display = description ? '' : 'none';
    }
    if (preEl) preEl.textContent = command;
    if (copyBtn) copyBtn.textContent = 'Copy';

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target && e.target.closest && e.target.closest('[data-copy-command-open]');
    if (trigger) openModal(trigger);
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  if (copyBtn && preEl) {
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(preEl.textContent).then(function () {
        copyBtn.textContent = 'Copied';
        setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1500);
      });
    });
  }
})();
