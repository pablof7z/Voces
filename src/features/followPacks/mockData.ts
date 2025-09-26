// Mock follow pack data for testing
// Generate more packs for testing lazy loading
const generateExtraPacks = (start: number, count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `pack${start + i}`,
    title: `Community Pack ${start + i}`,
    description: `A curated list of interesting accounts in the ${['Tech', 'Art', 'Music', 'Sports', 'Gaming', 'Finance', 'Science', 'Food'][i % 8]} space`,
    image: i % 3 === 0 ? `https://picsum.photos/500/300?random=${start + i}` : undefined,
    pubkeys: Array.from({length: 5 + (i % 10)}, (_, j) => `npub${start + i}xxx${j+1}`),
    encode: () => `nevent1pack${start + i}`
  }));
};

export const mockFollowPacks = [
  {
    id: 'pack1',
    title: 'BBO',
    description: 'Gent de la comunitat de Barcelona Bitcoin Only que viu a prop de Barcelona, que participa a la...',
    image: 'https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?w=500&h=300&fit=crop',
    pubkeys: [
      'npub1xxx1', 'npub1xxx2', 'npub1xxx3', 'npub1xxx4', 'npub1xxx5',
      'npub1xxx6', 'npub1xxx7', 'npub1xxx8', 'npub1xxx9', 'npub1xxx10',
      'npub1xxx11', 'npub1xxx12', 'npub1xxx13', 'npub1xxx14', 'npub1xxx15',
      'npub1xxx16', 'npub1xxx17', 'npub1xxx18', 'npub1xxx19', 'npub1xxx20',
      'npub1xxx21', 'npub1xxx22', 'npub1xxx23', 'npub1xxx24', 'npub1xxx25',
      'npub1xxx26', 'npub1xxx27', 'npub1xxx28', 'npub1xxx29', 'npub1xxx30',
      'npub1xxx31', 'npub1xxx32', 'npub1xxx33', 'npub1xxx34', 'npub1xxx35',
      'npub1xxx36', 'npub1xxx37', 'npub1xxx38', 'npub1xxx39', 'npub1xxx40',
      'npub1xxx41', 'npub1xxx42', 'npub1xxx43', 'npub1xxx44', 'npub1xxx45',
      'npub1xxx46', 'npub1xxx47', 'npub1xxx48', 'npub1xxx49', 'npub1xxx50',
      'npub1xxx51', 'npub1xxx52', 'npub1xxx53', 'npub1xxx54', 'npub1xxx55',
      'npub1xxx56', 'npub1xxx57', 'npub1xxx58', 'npub1xxx59', 'npub1xxx60',
      'npub1xxx61'
    ],
    encode: () => 'nevent1pack1'
  },
  {
    id: 'pack2',
    title: 'Orange Pill Perú',
    description: 'Community of Bitcoin enthusiasts from Peru',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500&h=300&fit=crop',
    pubkeys: ['npub2xxx1', 'npub2xxx2', 'npub2xxx3', 'npub2xxx4', 'npub2xxx5', 'npub2xxx6', 'npub2xxx7', 'npub2xxx8', 'npub2xxx9'],
    encode: () => 'nevent1pack2'
  },
  {
    id: 'pack3',
    title: 'Spicy Girls 🔥',
    description: 'Spicy Girls 🔥 (not naked) ~ NSFW',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&h=300&fit=crop',
    pubkeys: ['npub3xxx1', 'npub3xxx2', 'npub3xxx3', 'npub3xxx4', 'npub3xxx5', 'npub3xxx6', 'npub3xxx7', 'npub3xxx8', 'npub3xxx9', 'npub3xxx10', 'npub3xxx11'],
    encode: () => 'nevent1pack3'
  },
  {
    id: 'pack4',
    title: 'Cloudbusting Chemtrail Psychopaths',
    description: 'Just look up.',
    pubkeys: Array.from({length: 21}, (_, i) => `npub4xxx${i+1}`),
    encode: () => 'nevent1pack4'
  },
  {
    id: 'pack5',
    title: 'High Council of Bitcoin Bens',
    description: 'The elite Bitcoin council',
    image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=500&h=300&fit=crop',
    pubkeys: Array.from({length: 18}, (_, i) => `npub5xxx${i+1}`),
    encode: () => 'nevent1pack5'
  },
  {
    id: 'pack6',
    title: 'Carnivores 🥩',
    description: 'Just eat meat.',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=500&h=300&fit=crop',
    pubkeys: Array.from({length: 15}, (_, i) => `npub6xxx${i+1}`),
    encode: () => 'nevent1pack6'
  },
  {
    id: 'pack7',
    title: 'Globe Disrespectors',
    description: "WHERE'S THE CURVE, LEBOWSKI?",
    pubkeys: Array.from({length: 9}, (_, i) => `npub7xxx${i+1}`),
    encode: () => 'nevent1pack7'
  },
  {
    id: 'pack8',
    title: 'jimmy Dale Flannagan',
    description: 'Personal follow list',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=300&fit=crop',
    pubkeys: ['npub8xxx1'],
    encode: () => 'nevent1pack8'
  },
  {
    id: 'pack9',
    title: 'Mexiko en NOSTR',
    description: 'Mexicanos usando NOSTR',
    image: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=500&h=300&fit=crop',
    pubkeys: Array.from({length: 6}, (_, i) => `npub9xxx${i+1}`),
    encode: () => 'nevent1pack9'
  },
  // Add more packs for testing lazy loading
  ...generateExtraPacks(10, 30)
];