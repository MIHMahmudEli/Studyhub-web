import { expandShortForm } from './searchUtils';

describe('expandShortForm', () => {
  it('returns null for queries shorter than two characters', () => {
    expect(expandShortForm('')).toBeNull();
    expect(expandShortForm('a')).toBeNull();
  });

  it('expands a known acronym to its primary course title', () => {
    expect(expandShortForm('os')).toBe('OPERATING SYSTEM');
    expect(expandShortForm('ml')).toBe('MACHINE LEARNING');
  });

  it('returns null for an unknown short form', () => {
    expect(expandShortForm('zzzz')).toBeNull();
  });
});
