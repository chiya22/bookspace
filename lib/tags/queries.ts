import { createSupabaseServerClient } from '@/lib/supabase/server';

export type TagRow = { id: string; name: string };

export async function getAllTags(): Promise<TagRow[]> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from('tags').select('id, name').order('name');
  return (data ?? []) as TagRow[];
}

export async function getTagsPaginated(
  page: number,
  pageSize: number
): Promise<{ tags: TagRow[]; totalCount: number }> {
  const supabase = createSupabaseServerClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await supabase
    .from('tags')
    .select('id, name', { count: 'exact' })
    .order('name')
    .range(from, to);
  return {
    tags: (data ?? []) as TagRow[],
    totalCount: count ?? 0,
  };
}

/** 指定タグIDごとに、そのタグが付与されている書籍件数を返す。 */
export async function getBookCountByTagIds(tagIds: string[]): Promise<Map<string, number>> {
  const countByTagId = new Map<string, number>();
  if (tagIds.length === 0) return countByTagId;
  for (const id of tagIds) countByTagId.set(id, 0);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('book_tags')
    .select('tag_id')
    .in('tag_id', tagIds);
  for (const row of (data ?? []) as { tag_id: string }[]) {
    countByTagId.set(row.tag_id, (countByTagId.get(row.tag_id) ?? 0) + 1);
  }
  return countByTagId;
}

export async function getTagById(id: string): Promise<TagRow | null> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from('tags').select('id, name').eq('id', id).maybeSingle();
  return data as TagRow | null;
}

export async function getTagIdsByBookId(bookId: string): Promise<string[]> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('book_tags')
    .select('tag_id')
    .eq('book_id', bookId);
  return (data ?? []).map((r) => (r as { tag_id: string }).tag_id);
}

/**
 * 複数書籍に付与されたタグを一括取得。book_id -> TagRow[] の Map を返す。
 */
export async function getTagsByBookIds(bookIds: string[]): Promise<Map<string, TagRow[]>> {
  const map = new Map<string, TagRow[]>();
  if (bookIds.length === 0) return map;
  const supabase = createSupabaseServerClient();
  const { data: bookTags } = await supabase
    .from('book_tags')
    .select('book_id, tag_id')
    .in('book_id', bookIds);
  const rows = (bookTags ?? []) as { book_id: string; tag_id: string }[];
  const tagIds = [...new Set(rows.map((r) => r.tag_id))];
  if (tagIds.length === 0) return map;
  const { data: tagsData } = await supabase
    .from('tags')
    .select('id, name')
    .in('id', tagIds);
  const tagsById = new Map<string, TagRow>();
  for (const t of (tagsData ?? []) as TagRow[]) {
    tagsById.set(t.id, t);
  }
  for (const r of rows) {
    const tag = tagsById.get(r.tag_id);
    if (!tag) continue;
    const list = map.get(r.book_id) ?? [];
    list.push(tag);
    map.set(r.book_id, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return map;
}

/** 書籍に付与されたタグ一覧（表示用）。 */
export async function getTagsByBookId(bookId: string): Promise<TagRow[]> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('book_tags')
    .select('tag_id')
    .eq('book_id', bookId);
  const tagIds = (data ?? []).map((r) => (r as { tag_id: string }).tag_id);
  if (tagIds.length === 0) return [];
  const { data: tagsData } = await supabase
    .from('tags')
    .select('id, name')
    .in('id', tagIds)
    .order('name');
  return (tagsData ?? []) as TagRow[];
}

export async function setBookTags(bookId: string, tagIds: string[]): Promise<void> {
  const supabase = createSupabaseServerClient();
  await supabase.from('book_tags').delete().eq('book_id', bookId);
  if (tagIds.length > 0) {
    await supabase.from('book_tags').insert(
      tagIds.map((tag_id) => ({ book_id: bookId, tag_id })) as never
    );
  }
}

/** 名前でタグを検索（大文字小文字無視）。なければ作成して id を返す。 */
export async function findOrCreateTagByName(name: string): Promise<string> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Tag name is required');
  const supabase = createSupabaseServerClient();
  const { data: existing } = await supabase
    .from('tags')
    .select('id')
    .ilike('name', trimmed)
    .limit(1)
    .maybeSingle();
  if (existing) return (existing as { id: string }).id;
  const { data: inserted, error } = await supabase
    .from('tags')
    .insert({ name: trimmed } as never)
    .select('id')
    .single();
  if (error) {
    if (error.code === '23505') {
      const { data: again } = await supabase
        .from('tags')
        .select('id')
        .ilike('name', trimmed)
        .limit(1)
        .maybeSingle();
      if (again) return (again as { id: string }).id;
    }
    throw new Error('Failed to create tag');
  }
  return (inserted as { id: string }).id;
}
