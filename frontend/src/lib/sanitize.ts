import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'p', 'br', 'ol', 'ul', 'li', 'a', 'code', 'pre', 'blockquote'];
const ALLOWED_ATTR = ['href', 'target', 'rel'];

export function sanitizePostHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
  });
}
