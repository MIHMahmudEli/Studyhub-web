import { buildMentionText, insertMention, cleanMentions, prepareReplyPayload } from './mention';

describe('buildMentionText', () => {
  it('wraps a display name as a mention prefix', () => {
    expect(buildMentionText('John Doe')).toBe('@John Doe ');
  });
});

describe('insertMention', () => {
  it('prepends a mention to existing text', () => {
    expect(insertMention('hello', 'John')).toBe('@John hello');
  });

  it('does not duplicate an existing mention', () => {
    const once = insertMention('hi', 'John');
    expect(insertMention(once, 'John')).toBe(once);
  });
});

describe('cleanMentions', () => {
  it('keeps a single active mention at the front', () => {
    const res = cleanMentions('@John hi there', { userId: 5, displayName: 'John' });
    expect(res.text).toBe('@John hi there');
    expect(res.mentionedUserId).toBe(5);
  });

  it('strips leading mentions when there is no active target', () => {
    const res = cleanMentions('@John hello world', null);
    expect(res.mentionedUserId).toBeNull();
    expect(res.text).toBe('hello world');
  });
});

describe('prepareReplyPayload', () => {
  it('returns an empty payload for blank input', () => {
    expect(prepareReplyPayload('   ', null)).toEqual({ comment: '', mentioned_user_id: null });
  });

  it('trims text and includes the mentioned user id when targeted', () => {
    expect(prepareReplyPayload('  hey  ', { userId: 9, displayName: 'A' })).toEqual({
      comment: 'hey',
      mentioned_user_id: 9,
    });
  });
});
