const svgToDataUri = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const DEFAULT_IMAGE = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="Grocery illustration">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f3f4f6" />
        <stop offset="100%" stop-color="#e5eefb" />
      </linearGradient>
    </defs>
    <rect width="240" height="240" rx="32" fill="url(#bg)" />
    <circle cx="72" cy="78" r="18" fill="#f59e0b" opacity="0.18" />
    <circle cx="170" cy="70" r="14" fill="#10b981" opacity="0.18" />
    <path d="M78 118h84l-9 46H88z" fill="#ffffff" stroke="#0f172a" stroke-width="6" stroke-linejoin="round" />
    <path d="M92 118c0-18 12-32 28-32s28 14 28 32" fill="none" stroke="#0f172a" stroke-width="6" stroke-linecap="round" />
    <circle cx="98" cy="176" r="10" fill="#0f172a" />
    <circle cx="148" cy="176" r="10" fill="#0f172a" />
    <path d="M98 130h34" stroke="#22c55e" stroke-width="8" stroke-linecap="round" />
    <path d="M115 113v34" stroke="#22c55e" stroke-width="8" stroke-linecap="round" />
  </svg>
`);

const makeStatImage = (accent, label, path) => svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${label}">
    <rect width="96" height="96" rx="24" fill="${accent}" opacity="0.12" />
    <circle cx="70" cy="26" r="7" fill="${accent}" opacity="0.16" />
    ${path}
  </svg>
`);

const chartIcon = (accent) => `
  <rect x="18" y="58" width="10" height="20" rx="4" fill="${accent}" />
  <rect x="34" y="46" width="10" height="32" rx="4" fill="${accent}" />
  <rect x="50" y="34" width="10" height="44" rx="4" fill="${accent}" />
  <path d="M18 26h52" stroke="${accent}" stroke-width="5" stroke-linecap="round" opacity="0.35" />
  <path d="M22 24l12 8 14-12 12 7 12-14" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
`;

const revenueIcon = (accent) => `
  <rect x="22" y="34" width="52" height="28" rx="12" fill="${accent}" />
  <path d="M30 48h36" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />
  <circle cx="48" cy="48" r="7" fill="#ffffff" opacity="0.9" />
  <path d="M38 72h20" stroke="${accent}" stroke-width="6" stroke-linecap="round" opacity="0.7" />
`;

const stockIcon = (accent) => `
  <path d="M26 34h44l-4 26H30z" fill="${accent}" opacity="0.92" />
  <path d="M34 34c0-7 6-12 14-12s14 5 14 12" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" />
  <path d="M34 42h28" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.9" />
  <circle cx="36" cy="66" r="5" fill="${accent}" />
  <circle cx="60" cy="66" r="5" fill="${accent}" />
`;

const storeIcon = (accent) => `
  <path d="M18 40h60l-6-14H24z" fill="${accent}" opacity="0.9" />
  <path d="M22 40v28h52V40" fill="none" stroke="${accent}" stroke-width="5" stroke-linejoin="round" />
  <path d="M28 68V50h12v18" fill="none" stroke="${accent}" stroke-width="5" stroke-linejoin="round" />
  <path d="M48 68V50h14v18" fill="none" stroke="${accent}" stroke-width="5" stroke-linejoin="round" />
  <path d="M18 40h60" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.9" />
`;

const CATEGORY_IMAGES = {
  'fruits & vegetables':
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=80',
  'dairy & eggs':
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
  bakery:
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
  beverages:
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
  snacks:
    'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=900&q=80',
  'grains & pulses':
    'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=900&q=80',
  'meat & seafood':
    'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=900&q=80',
  'personal care':
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=80',
  household:
    'https://images.unsplash.com/photo-1581579185169-2aebc360c2c7?auto=format&fit=crop&w=900&q=80',
  'frozen foods':
    'https://images.unsplash.com/photo-1604909052743-94e8387a7c67?auto=format&fit=crop&w=900&q=80',
};

const PRODUCT_IMAGES = {
  'amul butter':
    'https://www.amul.com/files/products/amul_tablebutter.jpeg',
  'amul butter (500g)':
    'https://www.amul.com/files/products/amul_tablebutter.jpeg',
  'amul milk':
    'https://www.amul.com/files/products/amul-gold.png',
  'amul milk (1l)':
    'https://www.amul.com/files/products/amul-gold.png',
  'apples (1kg)':
    'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=900&q=80',
  'bananas (dozen)':
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80',
  'basmati rice (1kg)':
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80',
  'britannia bread':
    'https://upload.wikimedia.org/wikipedia/commons/a/a3/Loaf_of_bread..jpg',
  'chicken breast (1kg)':
    'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=900&q=80',
  'coca-cola (500ml)':
    'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=80',
  'colgate paste':
    'https://pxmshare.colgatepalmolive.com/JPEG_1500/9a9eXWnwNideZ9eOYnTZY.jpg',
  'colgate toothpaste (200g)':
    'https://pxmshare.colgatepalmolive.com/JPEG_1500/9a9eXWnwNideZ9eOYnTZY.jpg',
  'dove soap':
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
  'dove soap (75g)':
    'https://assets.unileversolutions.com/v1/122464224.png',
  'eggs (12 pcs)':
    'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?auto=format&fit=crop&w=900&q=80',
  'frozen peas (500g)':
    DEFAULT_IMAGE,
  "lay's classic chips":
    DEFAULT_IMAGE,
  'maggi noodles (280g)':
    'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=900&q=80',
  'mineral water (1l)':
    'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80',
  'nescafe classic (100g)':
    'https://www.nescafe.com/sites/default/files/styles/pdp_banner_image/public/2023-04/4091P_HeroGallery_ClassicOriginal_4_960x960.png.webp?itok=7DTpaE8Z',
  onions:
    DEFAULT_IMAGE,
  'parle-g biscuits':
    'https://upload.wikimedia.org/wikipedia/commons/a/a1/Parle-G_Biscuit.jpg',
  potatoes:
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80',
  'sunflower oil (1l)':
    DEFAULT_IMAGE,
  'surf excel':
    'https://surf-excel.com/wp-content/uploads/2025/11/1.11.png',
  'surf excel (1kg)':
    'https://surf-excel.com/wp-content/uploads/2025/11/1.11.png',
  'tata tea premium':
    'https://www.tataconsumer.com/sites/g/files/gfwrlq316/files/new_ttp-tetley-bangladesh_400gms_-11012017.jpg',
  'tata tea premium (250g)':
    'https://www.tataconsumer.com/sites/g/files/gfwrlq316/files/new_ttp-tetley-bangladesh_400gms_-11012017.jpg',
  'toor dal':
    DEFAULT_IMAGE,
  'toor dal (1kg)':
    DEFAULT_IMAGE,
  'whole wheat atta':
    'https://upload.wikimedia.org/wikipedia/commons/2/26/Atta_flour.jpg',
  'whole wheat atta (5kg)':
    'https://upload.wikimedia.org/wikipedia/commons/2/26/Atta_flour.jpg',
  tomato:
    'https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=900&q=80',
  tomatoes:
    'https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=900&q=80',
  apple:
    'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=900&q=80',
  bananas:
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80',
  milk:
    'https://images.unsplash.com/photo-1582719478185-2a6f5e0b8c05?auto=format&fit=crop&w=900&q=80',
  bread:
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
  rice:
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80',
  chips:
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=900&q=80',
  snack:
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=900&q=80',
  toothpaste:
    'https://images.unsplash.com/photo-1620916566391-5f8b2e9b1d5e?auto=format&fit=crop&w=900&q=80',
  soap:
    'https://images.unsplash.com/photo-1600854109160-7b31b4c8f2a9?auto=format&fit=crop&w=900&q=80',
  water:
    'https://images.unsplash.com/photo-1548839140-29a749e9f0e9?auto=format&fit=crop&w=900&q=80',
};

const STAT_IMAGES = {
  revenue: makeStatImage('#f97316', 'Revenue', revenueIcon('#f97316')),
  chart: makeStatImage('#2563eb', 'Sales chart', chartIcon('#2563eb')),
  stock: makeStatImage('#ea580c', 'Low stock', stockIcon('#ea580c')),
  store: makeStatImage('#7c3aed', 'Storefront', storeIcon('#7c3aed')),
};

const normalize = (value) => String(value || '').trim().toLowerCase();

export function getCategoryImage(name) {
  const key = normalize(name);
  return CATEGORY_IMAGES[key] || DEFAULT_IMAGE;
}

export function getProductImage(product = {}) {
  const direct = String(product.image_url || '').trim();
  if (direct) return direct;

  const name = normalize(product.name || product.product_name);
  const category = normalize(product.category_name);

  if (PRODUCT_IMAGES[name]) return PRODUCT_IMAGES[name];
  if (PRODUCT_IMAGES[category]) return PRODUCT_IMAGES[category];

  for (const [key, src] of Object.entries(PRODUCT_IMAGES)) {
    if (name.includes(key) || category.includes(key)) return src;
  }

  if (CATEGORY_IMAGES[category]) return CATEGORY_IMAGES[category];

  return DEFAULT_IMAGE;
}

export function getStatImage(key) {
  return STAT_IMAGES[key] || DEFAULT_IMAGE;
}

export const DEFAULT_VISUAL_IMAGE = DEFAULT_IMAGE;
