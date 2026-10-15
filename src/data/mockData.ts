/**
 * ============================================================================
 * PLACEHOLDER / MOCK DATA FOR TEGAGN MARKETPLACE FRONTEND
 * ============================================================================
 * NOTE: These are strictly placeholder mock datasets for frontend UI development,
 * layout prototyping, and responsive testing.
 * 
 * In production, these records will be loaded from the Python Django REST API 
 * backed by PostgreSQL (e.g. GET /api/v1/workers/, GET /api/v1/categories/).
 * No mock backend or fake database state is mutated here.
 * ============================================================================
 */

import { Category, WorkerProfile, Booking, Review, WorkerServiceItem } from '../types';

export const PLACEHOLDER_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    slug: 'plumber',
    name: 'Plumbing',
    iconName: 'Wrench',
    description: 'Pipe leaks, bathroom fittings, water heater installation & drain clearance',
    workerCount: 42,
    popularServices: ['Leak repair', 'Water heater service', 'Pipe installation', 'Clogged drains']
  },
  {
    id: 'cat-2',
    slug: 'electrician',
    name: 'Electrical Work',
    iconName: 'Zap',
    description: 'Wiring repair, circuit breaker installation, lighting & appliance setup',
    workerCount: 38,
    popularServices: ['Rewiring', 'Breaker replacement', 'Lighting installation', 'Short-circuit fix']
  },
  {
    id: 'cat-3',
    slug: 'construction',
    name: 'Construction',
    iconName: 'HardHat',
    description: 'Brickwork, concrete repairs, tile laying, home renovations & structural extensions',
    workerCount: 28,
    popularServices: ['Tile fixing', 'Wall plastering', 'Brick restoration', 'Foundation repair']
  },
  {
    id: 'cat-4',
    slug: 'painter',
    name: 'Painting',
    iconName: 'Paintbrush',
    description: 'Interior & exterior wall painting, waterproof coatings & wallpapering',
    workerCount: 35,
    popularServices: ['Interior painting', 'Exterior coating', 'Ceiling repairs', 'Texture finishing']
  },
  {
    id: 'cat-5',
    slug: 'carpenter',
    name: 'Carpentry',
    iconName: 'Hammer',
    description: 'Custom furniture, door & window repairs, cabinetry & woodwork',
    workerCount: 29,
    popularServices: ['Cabinet repair', 'Door framing', 'Custom shelving', 'Furniture restoration']
  },
  {
    id: 'cat-6',
    slug: 'cleaning',
    name: 'Cleaning',
    iconName: 'Sparkles',
    description: 'Deep house cleaning, post-renovation cleanup, carpet & upholstery care',
    workerCount: 31,
    popularServices: ['Post-repair cleanup', 'Deep home cleaning', 'Window washing', 'Upholstery sanitization']
  },
  {
    id: 'cat-7',
    slug: 'hvac',
    name: 'HVAC & AC Service',
    iconName: 'Fan',
    description: 'Air conditioner maintenance, heating system diagnostics & duct cleaning',
    workerCount: 19,
    popularServices: ['AC gas refill', 'Compressor fix', 'Seasonal tune-up', 'Duct sanitization']
  },
  {
    id: 'cat-8',
    slug: 'locksmith',
    name: 'Locksmith',
    iconName: 'Key',
    description: 'Emergency lockouts, deadbolt installation, smart locks & key duplication',
    workerCount: 15,
    popularServices: ['Emergency entry', 'Smart lock setup', 'Lock rekeying', 'Safe opening']
  },
  {
    id: 'cat-9',
    slug: 'roofer',
    name: 'Roofing Repairs',
    iconName: 'Home',
    description: 'Shingle replacement, gutter cleaning, roof leak detection & sealing',
    workerCount: 17,
    popularServices: ['Leak sealing', 'Gutter cleaning', 'Tile replacement', 'Waterproofing']
  }
];

export const PLACEHOLDER_WORKERS: WorkerProfile[] = [
  {
    id: 'worker-101',
    userId: 'user-101',
    user: {
      id: 'user-101',
      email: 'abebe.tadesse@example.com',
      username: 'abebet',
      firstName: 'Abebe',
      lastName: 'Tadesse',
      role: 'worker',
      phoneNumber: '+251 91 123 4567',
      avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400',
      dateJoined: '2023-04-12'
    },
    trade: 'plumber',
    tradeTitle: 'Master Plumber & Pipe Specialist',
    hourlyRate: 35,
    experienceYears: 8,
    bio: 'Licensed plumbing specialist with over 8 years of experience in residential and commercial plumbing. Expert in rapid emergency leak fixes, complete bathroom piping, and solar water heater installations.',
    city: 'Addis Ababa (Bole & Kazanchis)',
    serviceAreas: ['Bole', 'Kazanchis', 'Sarbet', 'CMC'],
    skills: ['Copper & PPR Piping', 'Drain Snaking', 'Water Heater Setup', 'Pressure Valve Calibration', 'Emergency Repair'],
    rating: 4.9,
    reviewsCount: 84,
    isVerified: true,
    isAvailable: true,
    completedJobs: 132,
    certifications: ['Certified Master Plumber Level IV', 'Occupational Safety Certificate'],
    portfolio: [
      {
        id: 'port-1',
        title: 'Modern Bathroom Copper Pipe Overhaul',
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600',
        description: 'Complete replacement of corroded iron pipes with durable copper lines.'
      },
      {
        id: 'port-2',
        title: 'Commercial Kitchen Drain Installation',
        imageUrl: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=600',
        description: 'High-flow grease trap and commercial grade stainless drain line.'
      }
    ]
  },
  {
    id: 'worker-102',
    userId: 'user-102',
    user: {
      id: 'user-102',
      email: 'marta.bekele@example.com',
      username: 'martab',
      firstName: 'Marta',
      lastName: 'Bekele',
      role: 'worker',
      phoneNumber: '+251 92 987 6543',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      dateJoined: '2022-11-05'
    },
    trade: 'electrician',
    tradeTitle: 'Certified Residential & Industrial Electrician',
    hourlyRate: 40,
    experienceYears: 6,
    bio: 'Dedicated electrical technician focused on safety, compliance, and energy-saving lighting systems. Experienced with panel upgrades, backup generators, and residential wiring diagnostics.',
    city: 'Addis Ababa (Kirkos & Nifas Silk)',
    serviceAreas: ['Kirkos', 'Gotera', 'Sarbet', 'Mexico'],
    skills: ['Panel Upgrades', 'Short Circuit Troubleshooting', 'LED Ambient Lighting', 'Generator Transfer Switch'],
    rating: 4.95,
    reviewsCount: 67,
    isVerified: true,
    isAvailable: true,
    completedJobs: 98,
    certifications: ['National Electrical Safety Board Certified', 'Solar PV Installation'],
    portfolio: [
      {
        id: 'port-3',
        title: 'Main Distribution Board Replacement',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600',
        description: 'Updated obsolete fuse box with surge-protected miniature circuit breakers.'
      }
    ]
  },
  {
    id: 'worker-103',
    userId: 'user-103',
    user: {
      id: 'user-103',
      email: 'dawit.alemayehu@example.com',
      username: 'dawita',
      firstName: 'Dawit',
      lastName: 'Alemayehu',
      role: 'worker',
      phoneNumber: '+251 93 456 7890',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      dateJoined: '2023-01-18'
    },
    trade: 'carpenter',
    tradeTitle: 'Custom Furniture & Interior Woodworker',
    hourlyRate: 30,
    experienceYears: 10,
    bio: 'Passionate wood artisan creating custom cabinetry, bespoke hardwood doors, and repairing worn wooden structures. Precision joints, quality wood selection, and long-lasting durability.',
    city: 'Addis Ababa (Yeka & Megenagna)',
    serviceAreas: ['Yeka', 'Megenagna', 'Gurd Shola', 'Bole'],
    skills: ['Kitchen Cabinetry', 'Hardwood Flooring', 'Door Hanging & Lock Fitting', 'Custom Wardrobes'],
    rating: 4.85,
    reviewsCount: 52,
    isVerified: true,
    isAvailable: false,
    completedJobs: 110,
    certifications: ['Guild of Master Craftsmen Certificate'],
    portfolio: [
      {
        id: 'port-4',
        title: 'Walnut Finish Modular Kitchen',
        imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600',
        description: 'Custom soft-close drawers and moisture-resistant laminated cabinets.'
      }
    ]
  },
  {
    id: 'worker-104',
    userId: 'user-104',
    user: {
      id: 'user-104',
      email: 'helen.girma@example.com',
      username: 'heleng',
      firstName: 'Helen',
      lastName: 'Girma',
      role: 'worker',
      phoneNumber: '+251 94 321 0987',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
      dateJoined: '2023-07-22'
    },
    trade: 'painter',
    tradeTitle: 'Decorative & Protective Surface Painter',
    hourlyRate: 25,
    experienceYears: 5,
    bio: 'Professional painter specializing in neat, odor-free interior wall repaints, weather-resistant exterior coats, and textured accents. Clean work guarantee with floor and furniture masking.',
    city: 'Addis Ababa (Arada & Piazza)',
    serviceAreas: ['Piazza', 'Arada', 'Gulele', 'Sidist Kilo'],
    skills: ['Interior Spray Painting', 'Exterior Waterproofing', 'Drywall Patching', 'Color Consultation'],
    rating: 4.8,
    reviewsCount: 41,
    isVerified: true,
    isAvailable: true,
    completedJobs: 64,
    certifications: ['Decorative Painting & Wall Preparation Diploma'],
    portfolio: [
      {
        id: 'port-5',
        title: 'Modern Minimalist Living Room Paint',
        imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600',
        description: 'Two-tone neutral accent wall with washable satin enamel finish.'
      }
    ]
  },
  {
    id: 'worker-105',
    userId: 'user-105',
    user: {
      id: 'user-105',
      email: 'yohannes.k@example.com',
      username: 'yohannesk',
      firstName: 'Yohannes',
      lastName: 'Kassa',
      role: 'worker',
      phoneNumber: '+251 91 888 7766',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      dateJoined: '2021-09-14'
    },
    trade: 'construction',
    tradeTitle: 'General Mason & Renovation Contractor',
    hourlyRate: 45,
    experienceYears: 12,
    bio: 'Expert mason and general repair builder handling tile fixing, structural wall modifications, plastering, and waterproofing. Honest estimates and dependable craftsmanship.',
    city: 'Addis Ababa (Akaki Kality & Lebu)',
    serviceAreas: ['Lebu', 'Jomo', 'Akaki', 'Lafto'],
    skills: ['Porcelain Tile Setting', 'Structural Masonry', 'Concrete Patching', 'Damp Proofing'],
    rating: 4.9,
    reviewsCount: 95,
    isVerified: true,
    isAvailable: true,
    completedJobs: 178,
    certifications: ['Building Contractor Class 5 License'],
    portfolio: [
      {
        id: 'port-6',
        title: 'Porcelain Floor & Wall Tiling',
        imageUrl: 'https://images.unsplash.com/photo-1502005229762-ee152da7c5d6?auto=format&fit=crop&q=80&w=600',
        description: 'Level laser-guided 60x120cm marble pattern porcelain installation.'
      }
    ]
  },
  {
    id: 'worker-106',
    userId: 'user-106',
    user: {
      id: 'user-106',
      email: 'solomon.negash@example.com',
      username: 'solomonn',
      firstName: 'Solomon',
      lastName: 'Negash',
      role: 'worker',
      phoneNumber: '+251 92 333 4455',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400',
      dateJoined: '2023-09-01'
    },
    trade: 'hvac',
    tradeTitle: 'HVAC & Refrigeration Technician',
    hourlyRate: 35,
    experienceYears: 7,
    bio: 'Certified heating, air conditioning, and commercial refrigeration specialist. Fast leak checks, capacitor replacements, and clean duct inspections.',
    city: 'Addis Ababa (Bole)',
    serviceAreas: ['Bole', 'Olympia', 'Meskel Flower', 'Gerji'],
    skills: ['Inverter AC Repair', 'Freon Leak Detection', 'Thermostat Calibration', 'Filter & Coil Servicing'],
    rating: 4.75,
    reviewsCount: 30,
    isVerified: false,
    isAvailable: true,
    completedJobs: 45,
    certifications: ['Refrigeration & Environmental Safety Cert'],
    portfolio: []
  },
  {
    id: 'worker-107',
    userId: 'user-107',
    user: {
      id: 'user-107',
      email: 'meron.haile@example.com',
      username: 'meronh',
      firstName: 'Meron',
      lastName: 'Haile',
      role: 'worker',
      phoneNumber: '+251 91 777 8899',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      dateJoined: '2023-08-10'
    },
    trade: 'cleaning',
    tradeTitle: 'Post-Repair & Deep Sanitation Specialist',
    hourlyRate: 22,
    experienceYears: 6,
    bio: 'Professional residential and commercial deep cleaning specialist. Focused on thorough post-renovation dust removal, floor sanitization, and move-in preparation.',
    city: 'Addis Ababa (Bole & CMC)',
    serviceAreas: ['Bole', 'CMC', 'Ayat', 'Kazanchis'],
    skills: ['Post-Construction Cleanup', 'Deep Carpet Extraction', 'Kitchen Degreasing', 'Disinfection'],
    rating: 4.88,
    reviewsCount: 54,
    isVerified: true,
    isAvailable: true,
    completedJobs: 89,
    certifications: ['Commercial Sanitation & Hygiene Certificate'],
    portfolio: []
  }
];

export const PLACEHOLDER_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    workerId: 'worker-101',
    customerName: 'Selamawit D.',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    comment: 'Abebe arrived within 40 minutes of booking. He quickly found the concealed leak behind the shower wall and repaired it without unnecessary tile damage. Highly recommended!',
    createdAt: '2024-09-12',
    jobType: 'Concealed Pipe Leak Repair'
  },
  {
    id: 'rev-2',
    workerId: 'worker-101',
    customerName: 'Tewodros H.',
    customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    comment: 'Very professional, clean work, and transparent with parts cost. Fitted our new 80-liter water boiler perfectly.',
    createdAt: '2024-08-28',
    jobType: 'Water Heater Replacement'
  },
  {
    id: 'rev-3',
    workerId: 'worker-102',
    customerName: 'Eden M.',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    comment: 'Marta fixed a recurring short circuit that two previous technicians could not identify. Very methodical and safety-conscious.',
    createdAt: '2024-09-20',
    jobType: 'Panel Troubleshooting'
  }
];

export const PLACEHOLDER_CUSTOMER_BOOKINGS: Booking[] = [
  {
    id: 'bk-201',
    customerId: 'cust-1',
    customerName: 'Bethlehem Assefa',
    workerId: 'worker-101',
    workerName: 'Abebe Tadesse',
    workerTrade: 'Plumbing',
    serviceDescription: 'Repair dripping sink faucet and inspect low pressure in main bath',
    scheduledDate: '2026-10-18',
    scheduledTime: '10:00 AM',
    location: 'Bole Atlas, House #402, Addis Ababa',
    status: 'accepted',
    estimatedCost: 70,
    createdAt: '2026-10-14'
  },
  {
    id: 'bk-202',
    customerId: 'cust-1',
    customerName: 'Bethlehem Assefa',
    workerId: 'worker-102',
    workerName: 'Marta Bekele',
    workerTrade: 'Electrical',
    serviceDescription: 'Install 6 new recessed ceiling downlights and dual dimmer switch',
    scheduledDate: '2026-10-22',
    scheduledTime: '02:00 PM',
    location: 'Bole Atlas, House #402, Addis Ababa',
    status: 'pending',
    estimatedCost: 120,
    createdAt: '2026-10-15'
  },
  {
    id: 'bk-203',
    customerId: 'cust-1',
    customerName: 'Bethlehem Assefa',
    workerId: 'worker-104',
    workerName: 'Helen Girma',
    workerTrade: 'Painting',
    serviceDescription: 'Living room and hallway interior coat repainting',
    scheduledDate: '2026-09-10',
    scheduledTime: '09:00 AM',
    location: 'Bole Atlas, House #402, Addis Ababa',
    status: 'completed',
    estimatedCost: 180,
    createdAt: '2026-09-05'
  }
];

export const PLACEHOLDER_WORKER_REQUESTS: Booking[] = [
  {
    id: 'bk-301',
    customerId: 'cust-10',
    customerName: 'Kaleb Getachew',
    customerPhone: '+251 91 222 3344',
    workerId: 'worker-101',
    workerName: 'Abebe Tadesse',
    workerTrade: 'Plumbing',
    serviceDescription: 'Urgent main supply line valve replacement before water tank fill',
    scheduledDate: '2026-10-16',
    scheduledTime: '09:30 AM',
    location: 'Kazanchis, Near ECA Building',
    status: 'pending',
    estimatedCost: 85,
    createdAt: '2026-10-15',
    notes: 'Access key available at security gate. Please call upon arrival.'
  },
  {
    id: 'bk-302',
    customerId: 'cust-12',
    customerName: 'Liya Wolde',
    customerPhone: '+251 92 555 6677',
    workerId: 'worker-101',
    workerName: 'Abebe Tadesse',
    workerTrade: 'Plumbing',
    serviceDescription: 'Bathroom remodeling plumbing inspection and waste line rough-in',
    scheduledDate: '2026-10-19',
    scheduledTime: '11:00 AM',
    location: 'Sarbet, Behind Canadian Embassy',
    status: 'accepted',
    estimatedCost: 140,
    createdAt: '2026-10-14'
  }
];

export const PLACEHOLDER_SERVICES: WorkerServiceItem[] = [
  {
    id: 'srv-101',
    workerId: 'worker-101',
    title: 'Emergency Concealed Pipe Leak Repair',
    category: 'plumber',
    description: 'Acoustic leak detection and copper/PPR pipe repair behind drywall or under tile without unnecessary demolition.',
    priceType: 'starting_at',
    price: 65,
    durationEstimate: '1 - 3 hours',
    isActive: true,
  },
  {
    id: 'srv-102',
    workerId: 'worker-101',
    title: 'Electric Water Heater Installation / Replacement',
    category: 'plumber',
    description: 'Mounting, electrical safety disconnection, pressure valve calibration, and inlet/outlet plumbing hookup (50L-100L boilers).',
    priceType: 'fixed',
    price: 110,
    durationEstimate: '2 - 4 hours',
    isActive: true,
  },
  {
    id: 'srv-103',
    workerId: 'worker-101',
    title: 'Motorized Drain Snake & Clog Clearance',
    category: 'plumber',
    description: 'Heavy-duty motorized snake auger clearing severe clogs in kitchen sinks, main soil lines, and floor traps.',
    priceType: 'fixed',
    price: 50,
    durationEstimate: '1 - 2 hours',
    isActive: true,
  },
  {
    id: 'srv-104',
    workerId: 'worker-101',
    title: 'Bathroom Faucet, Mixer & Trap Overhaul',
    category: 'plumber',
    description: 'Removal of corroded sink mixers, angle valves, braided flexible hoses, and installation of new hardware.',
    priceType: 'fixed',
    price: 40,
    durationEstimate: '1 hour',
    isActive: true,
  },
  {
    id: 'srv-105',
    workerId: 'worker-101',
    title: 'Comprehensive Home Plumbing System Inspection',
    category: 'plumber',
    description: 'Full audit of water supply pressure, booster pump status, sewer ventilation, and valve integrity for new homeowners.',
    priceType: 'hourly',
    price: 35,
    durationEstimate: '2 - 3 hours',
    isActive: false,
  }
];
