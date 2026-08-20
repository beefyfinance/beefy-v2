import { Button, Section } from 'beefy-v2';

export const WithTitle = () => (
  <Section title="Your positions" subTitle="Vaults you currently hold a balance in.">
    <div style={{ opacity: 0.7 }}>3 vaults · $12,480.22 deposited</div>
  </Section>
);

export const TitleOnly = () => (
  <Section title="Boosted vaults">
    <div style={{ opacity: 0.7 }}>Earn extra rewards on top of the base APY.</div>
  </Section>
);

export const WithActions = () => (
  <Section title="Bridge BIFI" subTitle="Move BIFI between supported chains.">
    <div style={{ display: 'flex', gap: 12 }}>
      <Button variant="cta">Bridge</Button>
      <Button variant="transparent">View history</Button>
    </div>
  </Section>
);
