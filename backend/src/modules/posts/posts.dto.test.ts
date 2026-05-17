import { listPostsSchema } from './posts.dto';

describe('listPostsSchema', () => {
  it('applies sensible defaults', () => {
    const parsed = listPostsSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(10);
    expect(parsed.tag).toBeUndefined();
  });

  it('parses a single tag from query string', () => {
    const parsed = listPostsSchema.parse({ tag: 'manager' });
    expect(parsed.tag).toEqual(['manager']);
  });

  it('parses comma-separated tags', () => {
    const parsed = listPostsSchema.parse({ tag: 'manager, average , portfolio' });
    expect(parsed.tag).toEqual(['manager', 'average', 'portfolio']);
  });

  it('accepts array of tags', () => {
    const parsed = listPostsSchema.parse({ tag: ['a', 'b'] });
    expect(parsed.tag).toEqual(['a', 'b']);
  });

  it('coerces numeric pagination', () => {
    const parsed = listPostsSchema.parse({ page: '3', pageSize: '20' });
    expect(parsed.page).toBe(3);
    expect(parsed.pageSize).toBe(20);
  });

  it('rejects pageSize above the maximum', () => {
    expect(() => listPostsSchema.parse({ pageSize: 9999 })).toThrow();
  });
});
