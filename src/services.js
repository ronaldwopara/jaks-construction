export const SERVICES = [
  {
    id: 'I',
    title: 'Driveways',
    slug: 'driveways',
    thumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=900&auto=format&fit=crop',
    images: Array.from({ length: 15 }).map(
      (_, i) =>
        `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop&sig=${i + 1}`,
    ),
  },
  {
    id: 'II',
    title: 'Garage Pads',
    slug: 'garage-pads',
    thumb: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=900&auto=format&fit=crop',
    images: Array.from({ length: 15 }).map(
      (_, i) =>
        `https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop&sig=${i + 1}`,
    ),
  },
  {
    id: 'III',
    title: 'Patios',
    slug: 'patios',
    thumb: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?q=80&w=900&auto=format&fit=crop',
    images: Array.from({ length: 15 }).map(
      (_, i) =>
        `https://images.unsplash.com/photo-1600607688969-a5bfcd646154?q=80&w=1200&auto=format&fit=crop&sig=${i + 1}`,
    ),
  },
  {
    id: 'IV',
    title: 'Structural Steps',
    slug: 'structural-steps',
    thumb: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?q=80&w=900&auto=format&fit=crop',
    images: Array.from({ length: 15 }).map(
      (_, i) =>
        `https://images.unsplash.com/photo-1555636222-cae831e670b3?q=80&w=1200&auto=format&fit=crop&sig=${i + 1}`,
    ),
  },
  {
    id: 'V',
    title: 'Exposed Aggregate',
    slug: 'exposed-aggregate',
    thumb: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=900&auto=format&fit=crop',
    images: Array.from({ length: 15 }).map(
      (_, i) =>
        `https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop&sig=${i + 1}`,
    ),
  },
  {
    id: 'VI',
    title: 'Stamped Finishes',
    slug: 'stamped-finishes',
    thumb: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?q=80&w=900&auto=format&fit=crop',
    images: Array.from({ length: 15 }).map(
      (_, i) =>
        `https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?q=80&w=1200&auto=format&fit=crop&sig=${i + 1}`,
    ),
  },
]

export function getServiceBySlug(slug) {
  return SERVICES.find((s) => s.slug === slug) ?? null
}

