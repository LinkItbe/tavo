export interface CuisineDefinition {
  slug: string;
  label: string;
  aliases: string[];
  iconName: string;
  photo: string;
}

export const CUISINES: CuisineDefinition[] = [
  {
    slug: 'italian',
    label: 'Итальянская кухня',
    aliases: ['итальянская', 'итальянская кухня', 'italian', 'паста', 'пицца', 'остерия', 'ризотто'],
    iconName: 'Pizza',
    photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'japanese',
    label: 'Японская кухня',
    aliases: ['японская', 'японская кухня', 'japanese', 'азиатская', 'суши', 'роллы', 'сашими', 'рамен'],
    iconName: 'Fish',
    photo: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'belarusian',
    label: 'Белорусская кухня',
    aliases: ['белорусская', 'белорусская кухня', 'belarusian', 'драники', 'мачанка', 'славянская', 'национальная'],
    iconName: 'CookingPot',
    photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'european',
    label: 'Европейская кухня',
    aliases: ['европейская', 'европейская кухня', 'european', 'авторская', 'континентальная', 'современная'],
    iconName: 'UtensilsCrossed',
    photo: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'georgian',
    label: 'Грузинская кухня',
    aliases: ['грузинская', 'грузинская кухня', 'georgian', 'кавказская', 'хачапури', 'хинкали', 'шашлык'],
    iconName: 'Flame',
    photo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'panasian',
    label: 'Паназиатская кухня',
    aliases: ['паназиатская', 'паназиатская кухня', 'panasian', 'азиатская', 'паназия', 'вок', 'том ям'],
    iconName: 'Soup',
    photo: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'meat',
    label: 'Мясная & Стейки',
    aliases: ['мясная', 'мясная кухня', 'стейки', 'стейкхаус', 'гриль', 'bbq', 'бургеры'],
    iconName: 'Beef',
    photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'french',
    label: 'Французская кухня',
    aliases: ['французская', 'французская кухня', 'french', 'бистро', 'выпечка', 'круассаны'],
    iconName: 'ChefHat',
    photo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'mexican',
    label: 'Мексиканская кухня',
    aliases: ['мексиканская', 'мексиканская кухня', 'mexican', 'тако', 'начос', 'буррито'],
    iconName: 'Sparkles',
    photo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'seafood',
    label: 'Рыбная & Морепродукты',
    aliases: ['рыбная', 'рыбная кухня', 'морепродукты', 'seafood', 'устрицы', 'креветки'],
    iconName: 'Anchor',
    photo: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
  },
];

/**
 * Normalizes any string representation of cuisine (e.g., 'Итальянская', 'Italian', 'итальянская кухня')
 * to a standardized slug (e.g., 'italian'). Returns the normalized slug or original lowercase trimmed string.
 */
export function normalizeCuisine(value: string | undefined | null): string {
  if (!value) return '';
  const valNorm = value.trim().toLowerCase().replace(/ё/g, 'е');
  
  for (const c of CUISINES) {
    if (c.slug === valNorm) return c.slug;
    if (c.label.toLowerCase().replace(/ё/g, 'е') === valNorm) return c.slug;
    for (const alias of c.aliases) {
      if (alias.toLowerCase().replace(/ё/g, 'е') === valNorm) return c.slug;
    }
  }
  return valNorm;
}

/**
 * Given a restaurant/venue, returns an array of unique normalized cuisine slugs for that venue.
 */
export function getVenueCuisineSlugs(venue: { cuisine?: string[]; primaryCuisine?: string }): string[] {
  const set = new Set<string>();
  if (venue.primaryCuisine) {
    const norm = normalizeCuisine(venue.primaryCuisine);
    if (norm) set.add(norm);
  }
  if (Array.isArray(venue.cuisine)) {
    venue.cuisine.forEach(c => {
      const norm = normalizeCuisine(c);
      if (norm) set.add(norm);
    });
  }
  return Array.from(set);
}
