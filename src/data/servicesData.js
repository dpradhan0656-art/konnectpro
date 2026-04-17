/**
 * Central catalog definition for bulk sync (DeepakHQ → Developer Tools).
 * Edit this file, then run "Sync catalog" in admin — no manual DB entry for each row.
 *
 * Shape:
 * - categoryName: string (must match what you want in `services.category`)
 * - slug: optional URL slug; auto-generated from categoryName if omitted
 * - icon: emoji or image URL for `categories.icon`
 * - services[]: each item needs at least `name` and `basePrice` (number)
 *
 * Pricing notes (Jabalpur/MP market, Apr 2026):
 * - Rates are visiting/base charges. Spare parts, chemicals, and materials are
 *   charged extra where applicable (noted in the `note` field).
 * - Urban-Company style transparent pricing — customer sees final item total,
 *   then materials/parts get added in the partner's post-visit invoice.
 */

export const servicesData = [
  // ─────────────────────────────────────────────────────────────
  // 1. WATER & PURIFIER
  // ─────────────────────────────────────────────────────────────
  {
    categoryName: 'Water & Purifier',
    slug: 'water-purifier',
    icon: '💧',
    services: [
      {
        name: 'RO Installation (New Unit)',
        basePrice: 599,
        image_url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80',
        note: 'Wall-mount + pipe fitting included. Unit cost extra.',
      },
      {
        name: 'RO Service & AMC Visit',
        basePrice: 399,
        image_url: 'https://images.unsplash.com/photo-1603732135363-d3b5ab1f7e16?w=600&q=80',
        note: 'Full sanitisation + performance check. Filters extra.',
      },
      {
        name: 'RO Filter / Candle Replacement',
        basePrice: 299,
        image_url: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=600&q=80',
        note: 'Service charge only. Filter set: ₹450–₹1200 extra.',
      },
      {
        name: 'UV / UF Purifier Repair',
        basePrice: 349,
        image_url: 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=600&q=80',
        note: 'Diagnosis + minor repair. Major parts extra.',
      },
      {
        name: 'Overhead Water Tank Cleaning',
        basePrice: 699,
        image_url: 'https://images.unsplash.com/photo-1563208960-80cdb7b3ed62?w=600&q=80',
        note: 'Upto 1000L. Chemicals + disinfection included.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 2. COOLING & AC
  // ─────────────────────────────────────────────────────────────
  {
    categoryName: 'Cooling & AC',
    slug: 'cooling-ac',
    icon: '❄️',
    services: [
      {
        name: 'Split AC Deep Foam Cleaning',
        basePrice: 599,
        image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80',
        note: 'Jet-wash + anti-bacterial foam. Gas charging extra.',
      },
      {
        name: 'Window AC Deep Cleaning',
        basePrice: 499,
        image_url: 'https://images.unsplash.com/photo-1631545806609-078c5a5e5ab4?w=600&q=80',
        note: 'Full body wash + condenser clean. Gas extra.',
      },
      {
        name: 'AC Gas Refill (R32 / R410)',
        basePrice: 1499,
        image_url: 'https://images.unsplash.com/photo-1597490023020-34f3bed3d66b?w=600&q=80',
        note: 'Includes leak test. Copper brazing charged separately.',
      },
      {
        name: 'Split AC Installation',
        basePrice: 1499,
        image_url: 'https://images.unsplash.com/photo-1632759145351-1d76f2c3f53e?w=600&q=80',
        note: 'Upto 3 meters copper piping. Stand & drill extra.',
      },
      {
        name: 'AC Uninstallation & Shifting',
        basePrice: 499,
        image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
        note: 'Safe dismount + gas recovery.',
      },
      {
        name: 'AC General Repair Visit',
        basePrice: 349,
        image_url: 'https://images.unsplash.com/photo-1545259742-b4fd8fea67e4?w=600&q=80',
        note: 'Visit + diagnosis. Parts and major repair charged extra.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 3. ELECTRICAL
  // ─────────────────────────────────────────────────────────────
  {
    categoryName: 'Electrical',
    slug: 'electrical',
    icon: '⚡',
    services: [
      {
        name: 'Expert Electrician Visit',
        basePrice: 199,
        image_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80',
        note: 'Visiting charge. Final quote after inspection.',
      },
      {
        name: 'Switch / Socket / Board Fix',
        basePrice: 149,
        image_url: 'https://images.unsplash.com/photo-1581092918484-8313e9a61e1e?w=600&q=80',
        note: 'Per point. Switch/socket part extra.',
      },
      {
        name: 'Ceiling Fan Installation',
        basePrice: 299,
        image_url: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=600&q=80',
        note: 'Includes canopy + regulator connection.',
      },
      {
        name: 'MCB / Inverter Installation',
        basePrice: 499,
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        note: 'DB mount + wiring. Inverter & battery cost extra.',
      },
      {
        name: 'New Wiring (Per Point)',
        basePrice: 99,
        image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80',
        note: 'Copper wire + concealing extra. Min 5 points.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 4. PLUMBING
  // ─────────────────────────────────────────────────────────────
  {
    categoryName: 'Plumbing',
    slug: 'plumbing',
    icon: '🔧',
    services: [
      {
        name: 'Tap / Mixer Leakage Fix',
        basePrice: 249,
        image_url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80',
        note: 'Washer + gasket included. New tap extra.',
      },
      {
        name: 'Geyser Installation',
        basePrice: 599,
        image_url: 'https://images.unsplash.com/photo-1581579438747-104c53e5b23f?w=600&q=80',
        note: 'Wall mount + inlet/outlet piping. Unit extra.',
      },
      {
        name: 'Toilet / Flush Unblocking',
        basePrice: 349,
        image_url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&q=80',
        note: 'Machine de-clog + sanitisation.',
      },
      {
        name: 'Pipe Leakage & Concealed Fix',
        basePrice: 349,
        image_url: 'https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&q=80',
        note: 'Material cost extra. ₹99 visit fee if no work done.',
      },
      {
        name: 'Washbasin / Sink Installation',
        basePrice: 499,
        image_url: 'https://images.unsplash.com/photo-1616627561839-074385245ff6?w=600&q=80',
        note: 'Includes siphon + angle valve. Basin unit extra.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 5. SALON & GROOMING
  // ─────────────────────────────────────────────────────────────
  {
    categoryName: 'Salon & Grooming',
    slug: 'salon-grooming',
    icon: '✂️',
    services: [
      {
        name: "Men's Haircut at Home",
        basePrice: 299,
        image_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&q=80',
        note: 'Includes premium styling products + wash.',
      },
      {
        name: "Men's Haircut + Beard Styling",
        basePrice: 399,
        image_url: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=600&q=80',
        note: 'Haircut + beard trim + hot towel finish.',
      },
      {
        name: "Men's Head Massage & Wash",
        basePrice: 199,
        image_url: 'https://images.unsplash.com/photo-1532710093739-9470acff878f?w=600&q=80',
        note: 'Champi + herbal oil + rinse.',
      },
      {
        name: "Women's Haircut & Style",
        basePrice: 499,
        image_url: 'https://images.unsplash.com/photo-1522336572468-97b06e8ef143?w=600&q=80',
        note: 'Consult + cut + blow-dry.',
      },
      {
        name: "Women's Hair Colour (Global)",
        basePrice: 899,
        image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
        note: 'Branded ammonia-free colour included (upto 100g).',
      },
      {
        name: "Women's Gold Facial & Clean-up",
        basePrice: 799,
        image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
        note: 'VLCC / O3+ products. 45-minute session.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 6. SPA & WELLNESS
  // ─────────────────────────────────────────────────────────────
  {
    categoryName: 'Spa & Wellness',
    slug: 'spa-wellness',
    icon: '💆‍♀️',
    services: [
      {
        name: 'Full Body Spa (Men)',
        basePrice: 1299,
        image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
        note: '60-min session. Disposable sheets + premium oils.',
      },
      {
        name: 'Full Body Spa (Women)',
        basePrice: 1499,
        image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80',
        note: 'Female therapist only. Hygiene-first kit.',
      },
      {
        name: 'Head & Shoulder Massage',
        basePrice: 499,
        image_url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80',
        note: '30-min relaxing deep pressure massage.',
      },
      {
        name: 'Foot Reflexology & Pedicure',
        basePrice: 599,
        image_url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80',
        note: 'Soak + scrub + acupressure + polish.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 7. AUTOMOTIVE
  // ─────────────────────────────────────────────────────────────
  {
    categoryName: 'Automotive',
    slug: 'automotive',
    icon: '🚗',
    services: [
      {
        name: 'Car Deep Cleaning & Polish',
        basePrice: 799,
        image_url: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&q=80',
        note: 'Vacuum + foam wash + exterior polish.',
      },
      {
        name: 'Car Foam Wash (Express)',
        basePrice: 299,
        image_url: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&q=80',
        note: 'Exterior quick wash. 20-min service.',
      },
      {
        name: 'Car Interior Detailing',
        basePrice: 999,
        image_url: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&q=80',
        note: 'Seat + dashboard + carpet + AC vent clean.',
      },
      {
        name: 'Two-Wheeler General Service',
        basePrice: 499,
        image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80',
        note: 'Full check-up. Engine oil & parts extra.',
      },
      {
        name: 'Two-Wheeler Oil Change',
        basePrice: 249,
        image_url: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&q=80',
        note: 'Labour only. Oil grade (800ml–1L) extra.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 8. CARPENTRY & WOODWORK
  // ─────────────────────────────────────────────────────────────
  {
    categoryName: 'Carpentry & Woodwork',
    slug: 'carpentry-woodwork',
    icon: '🪚',
    services: [
      {
        name: 'Carpenter Visit & Quote',
        basePrice: 349,
        image_url: 'https://images.unsplash.com/photo-1622295023576-e41332a813d0?w=600&q=80',
        note: 'Inspection + measurement. Material extra.',
      },
      {
        name: 'Door Lock / Hinge Repair',
        basePrice: 299,
        image_url: 'https://images.unsplash.com/photo-1595844730298-b960ff98fee0?w=600&q=80',
        note: 'Per door. Lock/hinge hardware extra.',
      },
      {
        name: 'Flat-Pack Furniture Assembly',
        basePrice: 499,
        image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
        note: 'Bed / wardrobe / study table. Per unit.',
      },
      {
        name: 'Wood Polishing & Touch-up',
        basePrice: 699,
        image_url: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=600&q=80',
        note: 'Per item. Polish / varnish included.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 9. PAINTING
  // ─────────────────────────────────────────────────────────────
  {
    categoryName: 'Painting',
    slug: 'painting',
    icon: '🎨',
    services: [
      {
        name: 'Wall Painting (Per Room)',
        basePrice: 999,
        image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80',
        note: 'Upto 120 sq ft. Paint (Asian/Berger) charged extra.',
      },
      {
        name: 'Wall Putty & Sanding Work',
        basePrice: 899,
        image_url: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&q=80',
        note: 'Pre-paint surface prep. Putty material extra.',
      },
      {
        name: 'Textured / Designer Wall',
        basePrice: 1499,
        image_url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&q=80',
        note: 'Royale Play / stucco finish. Per 40 sq ft.',
      },
      {
        name: 'Waterproofing & Seepage Fix',
        basePrice: 1899,
        image_url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80',
        note: 'Dr. Fixit / similar. Per wall section.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 10. HOME CLEANING
  // ─────────────────────────────────────────────────────────────
  {
    categoryName: 'Home Cleaning',
    slug: 'home-cleaning',
    icon: '🧹',
    services: [
      {
        name: 'Full Home Deep Cleaning (2BHK)',
        basePrice: 2499,
        image_url: 'https://images.unsplash.com/photo-1581578731117-e0a820379b73?w=600&q=80',
        note: 'All rooms + kitchen + bathrooms. Chemicals included.',
      },
      {
        name: 'Kitchen Deep Cleaning',
        basePrice: 999,
        image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80',
        note: 'Cabinets + slab + appliances exterior + tiles.',
      },
      {
        name: 'Bathroom Deep Cleaning',
        basePrice: 499,
        image_url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
        note: 'Per bathroom. De-scaling + disinfection.',
      },
      {
        name: 'Sofa Shampoo Cleaning',
        basePrice: 599,
        image_url: 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?w=600&q=80',
        note: 'Per 3-seater. Fabric-safe shampoo + foam extraction.',
      },
      {
        name: 'Mattress Deep Cleaning',
        basePrice: 499,
        image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
        note: 'Per queen mattress. Vacuum + UV sanitisation.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 11. APPLIANCES
  // ─────────────────────────────────────────────────────────────
  {
    categoryName: 'Appliances',
    slug: 'appliances',
    icon: '📺',
    services: [
      {
        name: 'Washing Machine Repair',
        basePrice: 299,
        image_url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&q=80',
        note: 'Front-load / top-load. Parts extra.',
      },
      {
        name: 'Refrigerator Repair',
        basePrice: 349,
        image_url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&q=80',
        note: 'Single / double door. Gas & parts extra.',
      },
      {
        name: 'Microwave / OTG Repair',
        basePrice: 299,
        image_url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80',
        note: 'Diagnosis + minor repair. Magnetron extra.',
      },
      {
        name: 'TV / LED Installation & Repair',
        basePrice: 399,
        image_url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&q=80',
        note: 'Wall mount + calibration. Bracket extra.',
      },
      {
        name: 'Chimney Deep Cleaning',
        basePrice: 799,
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
        note: 'Full de-grease. Filter replacement extra.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 12. PEST CONTROL
  // ─────────────────────────────────────────────────────────────
  {
    categoryName: 'Pest Control',
    slug: 'pest-control',
    icon: '🐜',
    services: [
      {
        name: 'General Pest Control (1BHK)',
        basePrice: 899,
        image_url: 'https://images.unsplash.com/photo-1540655037529-dec9815f5ea2?w=600&q=80',
        note: 'Odourless, pet-safe chemicals. 3-month warranty.',
      },
      {
        name: 'Cockroach Gel Treatment',
        basePrice: 699,
        image_url: 'https://images.unsplash.com/photo-1574269910231-bc508bcb42c0?w=600&q=80',
        note: 'German gel application. 60-day warranty.',
      },
      {
        name: 'Anti-Termite Treatment',
        basePrice: 2499,
        image_url: 'https://images.unsplash.com/photo-1597773150796-e5c14ebecbf5?w=600&q=80',
        note: 'Drill & inject. 1-year warranty. Per 500 sq ft.',
      },
      {
        name: 'Bed Bug Treatment',
        basePrice: 1299,
        image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&q=80',
        note: 'Mattress + furniture spray. 2 free follow-ups.',
      },
    ],
  },
];
