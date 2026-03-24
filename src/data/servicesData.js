/**
 * Central catalog definition for bulk sync (DeepakHQ → Developer Tools).
 * Edit this file, then run "Sync catalog" in admin — no manual DB entry for each row.
 *
 * Shape:
 * - categoryName: string (must match what you want in `services.category`)
 * - slug: optional URL slug; auto-generated from categoryName if omitted
 * - icon: emoji or image URL for `categories.icon`
 * - services[]: each item needs at least `name` and `basePrice` (number)
 */

export const servicesData = [
  {
    categoryName: 'Water & Purifier',
    slug: 'water-purifier',
    icon: '💧',
    services: [
      {
        name: 'RO Installation & Repair',
        basePrice: 399,
        image_url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&q=80',
        note: 'Spare parts & filters cost extra.',
      },
    ],
  },
  {
    categoryName: 'Cooling & AC',
    slug: 'cooling-ac',
    icon: '❄️',
    services: [
      {
        name: 'AC Deep Foam Cleaning',
        basePrice: 599,
        image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80',
        note: 'Gas charging is not included.',
      },
    ],
  },
  {
    categoryName: 'Electrical',
    slug: 'electrical',
    icon: '⚡',
    services: [
      {
        name: 'Expert Electrician Visit',
        basePrice: 199,
        image_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80',
        note: 'Visiting charge. Final quote after inspection.',
      },
    ],
  },
  {
    categoryName: 'Plumbing',
    slug: 'plumbing',
    icon: '🔧',
    services: [
      {
        name: 'Plumbing Leakage Fix',
        basePrice: 249,
        image_url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80',
        note: 'Material cost extra. ₹99 visiting fee if no work done.',
      },
    ],
  },
  {
    categoryName: 'Salon & Grooming',
    slug: 'salon-grooming',
    icon: '✂️',
    services: [
      {
        name: "Men's Haircut & Grooming",
        basePrice: 299,
        image_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&q=80',
        note: 'Includes premium styling products.',
      },
      {
        name: "Women's Beauty & Styling",
        basePrice: 599,
        image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=80',
        note: 'Branded non-toxic products used.',
      },
    ],
  },
  {
    categoryName: 'Spa & Wellness',
    slug: 'spa-wellness',
    icon: '💆‍♀️',
    services: [
      {
        name: 'Relaxing Full Body Spa',
        basePrice: 1299,
        image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&q=80',
        note: 'Disposable sheets and premium oils included.',
      },
    ],
  },
  {
    categoryName: 'Automotive',
    slug: 'automotive',
    icon: '🚗',
    services: [
      {
        name: 'Car Deep Cleaning & Polish',
        basePrice: 799,
        image_url: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=500&q=80',
        note: 'Interior vacuuming + Exterior foam wash.',
      },
      {
        name: 'Two-Wheeler General Service',
        basePrice: 499,
        image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&q=80',
        note: 'Engine oil and parts cost extra.',
      },
    ],
  },
  {
    categoryName: 'Carpentry & Woodwork',
    slug: 'carpentry-woodwork',
    icon: '🪚',
    services: [
      {
        name: 'Woodwork & Carpentry',
        basePrice: 349,
        image_url: 'https://images.unsplash.com/photo-1622295023576-e41332a813d0?w=500&q=80',
        note: 'Wood, ply, and hardware cost extra.',
      },
    ],
  },
  {
    categoryName: 'Painting',
    slug: 'painting',
    icon: '🎨',
    services: [
      {
        name: 'Wall Painting & Putty',
        basePrice: 999,
        image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&q=80',
        note: 'Base price per room. Paint cost extra.',
      },
    ],
  },
  {
    categoryName: 'Home Cleaning',
    slug: 'home-cleaning',
    icon: '🧹',
    services: [
      {
        name: 'Full Home Deep Cleaning',
        basePrice: 2499,
        image_url: 'https://images.unsplash.com/photo-1581578731117-e0a820379b73?w=500&q=80',
        note: 'For standard 2BHK. Chemicals included.',
      },
    ],
  },
  {
    categoryName: 'Appliances',
    slug: 'appliances',
    icon: '📺',
    services: [
      {
        name: 'Appliance Repair & Service',
        basePrice: 299,
        image_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&q=80',
        note: 'Visiting charge. Parts extra.',
      },
    ],
  },
  {
    categoryName: 'Pest Control',
    slug: 'pest-control',
    icon: '🐜',
    services: [
      {
        name: 'Pest Control Service',
        basePrice: 899,
        image_url: 'https://images.unsplash.com/photo-1540655037529-dec9815f5ea2?w=500&q=80',
        note: 'Odourless, pet-friendly chemicals used.',
      },
    ],
  },
];
