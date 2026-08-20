import type { ReactNode } from 'react';
import { VaultTag } from 'beefy-v2';

// VaultTag is a block-level div — the app always places it in a flex row,
// so the previews wrap it the same way rather than letting it span the card.
const Row = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
);

export const Default = () => (
  <Row>
    <VaultTag text="CLM" />
  </Row>
);

export const Tags = () => (
  <Row>
    <VaultTag text="CLM" />
    <VaultTag text="Boosted" />
    <VaultTag text="Points" />
    <VaultTag text="Retired" />
  </Row>
);

export const WithIcon = () => (
  <Row>
    <VaultTag icon={<span aria-hidden>🔥</span>} text="Boosted" />
    <VaultTag order="text-icon" icon={<span aria-hidden>⚡</span>} text="Zappable" />
  </Row>
);
