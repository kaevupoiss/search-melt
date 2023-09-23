import { json } from '@sveltejs/kit';

const data = [
  'hello',
  'world',
  'test'
]

export async function GET(event) {  
  const keyword = event.url.searchParams.get('keyword');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (keyword) {
    return json(data.filter(v => v.includes(keyword)))
  }

  return json(data)
}