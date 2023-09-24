import { json } from '@sveltejs/kit';
import data from '$lib/data.json';

export async function POST({ request }) {

  const { query, tags } = await request.json();

  if (query) {
    return json(data.filter(v => v.title.includes(query)));
  }

  return json({ success: true })
}