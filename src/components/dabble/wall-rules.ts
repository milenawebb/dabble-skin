export const WALLS = [
  { id: 'gallery', label: 'Gallery gray' },
  { id: 'white', label: 'White' },
  { id: 'charcoal', label: 'Charcoal' },
  { id: 'blue', label: 'Deep blue' },
  { id: 'coral', label: 'Coral' },
] as const;
export type Wall = typeof WALLS[number]['id'];
export const WALL_STORAGE_KEY = 'dabble-demo-wall';
export function readWall(value: string | null): Wall {
  return WALLS.find(wall => wall.id === value)?.id ?? 'gallery';
}