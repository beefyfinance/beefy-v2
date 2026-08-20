import { ActionButton } from 'beefy-v2';

const noop = () => {};

export const Default = () => <ActionButton onClick={noop}>$</ActionButton>;

export const LinkStyle = () => <ActionButton link onClick={noop}>Buy BIFI</ActionButton>;

export const Row = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <ActionButton onClick={noop}>$</ActionButton>
    <ActionButton onClick={noop}>%</ActionButton>
    <ActionButton link onClick={noop}>Buy BIFI</ActionButton>
  </div>
);
