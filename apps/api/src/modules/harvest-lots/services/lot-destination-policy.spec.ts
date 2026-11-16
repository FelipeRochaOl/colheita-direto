import { LotDestinationPolicy } from './lot-destination-policy';

describe('LotDestinationPolicy', () => {
  const policy = new LotDestinationPolicy();

  it.each([
    ['A', 'MARKETPLACE'],
    ['B', 'DISCOUNT_MARKETPLACE'],
    ['C', 'INDUSTRY'],
    ['D', 'DONATION'],
  ] as const)('classe %s recomenda %s', (grade, destination) => {
    expect(policy.recommendDestination(grade)).toBe(destination);
  });

  it('nunca permite vender lote D no marketplace', () => {
    expect(policy.allowedDestinations('D')).not.toContain('MARKETPLACE');
    expect(policy.allowedDestinations('D')).not.toContain('DISCOUNT_MARKETPLACE');
  });
});
