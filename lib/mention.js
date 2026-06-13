/**
 * Mention utilities for the YouTube-style reply system (Web / JS version).
 *
 * Mentions are linked by userId (not display name) so that notifications
 * can be dispatched reliably.
 */

/**
 * Build the display-text prefix for a mention, e.g. "@John Doe ".
 * @param {string} displayName
 * @returns {string}
 */
export function buildMentionText(displayName) {
  return `@${displayName} `;
}

/**
 * Insert a mention into existing reply text.
 * Prevents duplicates.
 * @param {string} currentText
 * @param {string} displayName
 * @returns {string}
 */
export function insertMention(currentText, displayName) {
  const mention = buildMentionText(displayName);
  if (currentText.includes(mention)) return currentText;
  return mention + currentText;
}

/**
 * Clean duplicate / stacked mentions from the beginning of the text.
 * @param {string} rawText
 * @param {{ userId: number, displayName: string } | null} activeTarget
 * @returns {{ text: string, mentionedUserId: number | null }}
 */
export function cleanMentions(rawText, activeTarget) {
  if (!activeTarget) {
    const cleaned = rawText.replace(/^(@\S[\S ]*?\s)+/, '').trimStart();
    return { text: cleaned || rawText, mentionedUserId: null };
  }

  const mention = buildMentionText(activeTarget.displayName);
  let body = rawText;
  while (/^@/.test(body)) {
    const match = body.match(/^@[^\n]+?\s/);
    if (match) {
      body = body.slice(match[0].length);
    } else {
      break;
    }
  }

  const text = mention + body;
  return { text, mentionedUserId: activeTarget.userId };
}

/**
 * Prepare submission payload.
 * @param {string} rawText
 * @param {{ userId: number, displayName: string } | null} mentionTarget
 * @returns {{ comment: string, mentioned_user_id: number | null }}
 */
export function prepareReplyPayload(rawText, mentionTarget) {
  const trimmed = (rawText || '').trim();
  if (!trimmed) return { comment: '', mentioned_user_id: null };

  if (!mentionTarget) {
    return { comment: trimmed, mentioned_user_id: null };
  }

  return { comment: trimmed, mentioned_user_id: mentionTarget.userId };
}
