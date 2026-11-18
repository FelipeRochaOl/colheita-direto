import { pickDemoPhoto } from './restore-demo-photos';

const DEMO_PHOTOS = ['alface-a.jpg', 'pimentao-a.jpg', 'pimentao-d.jpg', 'tomate-a.jpg', 'tomate-b.jpg'];

describe('pickDemoPhoto', () => {
  it('prefere cultura e nota, ignorando acento', () => {
    expect(pickDemoPhoto(DEMO_PHOTOS, 'Pimentão', 'D')).toBe('pimentao-d.jpg');
  });
  it('cai para a mesma cultura quando a nota não tem foto', () => {
    expect(pickDemoPhoto(DEMO_PHOTOS, 'tomate', 'C')).toBe('tomate-a.jpg');
  });
  it('usa qualquer foto quando a cultura não existe', () => {
    expect(pickDemoPhoto(DEMO_PHOTOS, 'jiló', null)).toBe('alface-a.jpg');
  });
});
