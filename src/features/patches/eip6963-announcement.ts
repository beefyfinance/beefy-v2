import {
  cleanEip6963ProviderDetail,
  isEip6963AnnounceProviderEvent,
} from '../../helpers/eip6963.ts';

if (typeof window !== 'undefined') {
  const safeAnnouncedEvents = new WeakSet<Event>();
  /** @web3-onboard unconditionally trusts content of these announcements */
  window.addEventListener(
    'eip6963:announceProvider',
    (event: Event) => {
      // allow events we created to pass unchanged
      if (safeAnnouncedEvents.has(event)) {
        return;
      }

      // stop this event going through as is
      event.stopImmediatePropagation();

      // malformed
      if (!isEip6963AnnounceProviderEvent(event)) {
        console.warn('eip6963: dropped malformed eip6963:announceProvider event', event);
        return;
      }

      // create safe event
      const safe = new CustomEvent('eip6963:announceProvider', {
        detail: cleanEip6963ProviderDetail(event.detail),
      });

      // tag so we don't get stuck in loop editing->emitting same event
      safeAnnouncedEvents.add(safe);

      // dispatch our cleaned event
      window.dispatchEvent(safe);
    },
    true // capture + registered first: runs before others
  );
}
