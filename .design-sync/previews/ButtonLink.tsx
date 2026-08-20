import { ButtonLink } from 'beefy-v2';

const noop = () => {};

export const Default = () => <ButtonLink onClick={noop}>Learn more</ButtonLink>;

export const InSentence = () => (
  <div style={{ maxWidth: 480 }}>
    Vault fees changed on 1 August. <ButtonLink onClick={noop}>Review the breakdown</ButtonLink> to
    see what applies to your position.
  </div>
);
