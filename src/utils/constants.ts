export interface Destination {
  id: string;
  name: string;
  region: string;
  image: string;
  description: string;
  price: string;
  rating: number;
  duration: string;
  difficulty: string;
  season: string;
  visaType: string;
  travelType: string;
}

export interface Package {
  id: string;
  title: string;
  destination: string;
  price: string;
  duration: string;
  rating: number;
  image: string;
  description: string;
}

export interface Review {
  id: string;
  author: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}



export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const DESTINATIONS: Destination[] = [
  {
    id: "iceland",
    name: "ICELAND",
    region: "NORDIC",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
    description: "Land of fire and ice, where silence speaks louder than words.",
    price: "₹5,299",
    rating: 4.9,
    duration: "5 DAYS",
    difficulty: "Moderate",
    season: "Summer",
    visaType: "E-Visa",
    travelType: "Adventure"
  },
  {
    id: "nepal",
    name: "NEPAL",
    region: "ASIA",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    description: "Ancient pathways and untouched wilderness await the prepared operator.",
    price: "₹4,899",
    rating: 4.8,
    duration: "7 DAYS",
    difficulty: "Challenging",
    season: "Spring",
    visaType: "E-Visa",
    travelType: "Adventure"
  },
  {
    id: "peru",
    name: "PERU",
    region: "SOUTH AMERICA",
    image: "https://images.unsplash.com/photo-1587595431973-160beaf913cb?w=800&q=80",
    description: "Lost cities reclaim the curious and the fearless.",
    price: "₹6,499",
    rating: 5.0,
    duration: "8 DAYS",
    difficulty: "Challenging",
    season: "Autumn",
    visaType: "Standard",
    travelType: "Cultural"
  },
  {
    id: "mongolia",
    name: "MONGOLIA",
    region: "ASIA",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    description: "Endless horizons and freedom across vast landscapes.",
    price: "₹3,999",
    rating: 4.7,
    duration: "6 DAYS",
    difficulty: "Expert",
    season: "Summer",
    visaType: "E-Visa",
    travelType: "Adventure"
  },
  {
    id: "atacama",
    name: "ATACAMA DESERT",
    region: "SOUTH AMERICA",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    description: "The driest place on Earth demands absolute commitment.",
    price: "₹5,699",
    rating: 4.9,
    duration: "6 DAYS",
    difficulty: "Expert",
    season: "Winter",
    visaType: "Standard",
    travelType: "Adventure"
  },
  {
    id: "patagonia",
    name: "PATAGONIA",
    region: "SOUTH AMERICA",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    description: "Granite peaks pierce the sky like monuments to solitude.",
    price: "₹5,299",
    rating: 4.8,
    duration: "7 DAYS",
    difficulty: "Expert",
    season: "Summer",
    visaType: "Standard",
    travelType: "Adventure"
  },
  {
    id: "greenland",
    name: "GREENLAND",
    region: "NORDIC",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    description: "Arctic darkness purifies the mind and hardens the spirit.",
    price: "₹6,199",
    rating: 4.9,
    duration: "8 DAYS",
    difficulty: "Challenging",
    season: "Winter",
    visaType: "E-Visa",
    travelType: "Adventure"
  },
  {
    id: "bhutan",
    name: "BHUTAN",
    region: "ASIA",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    description: "Where tradition meets the edge of the modern world.",
    price: "₹4,399",
    rating: 4.9,
    duration: "6 DAYS",
    difficulty: "Easy",
    season: "Spring",
    visaType: "Special Permit",
    travelType: "Cultural"
  }
];

export const PACKAGES: Package[] = [
  {
    id: "iceland-drift",
    title: "THE ICELANDIC DRIFT",
    destination: "ICELAND",
    price: "₹5,299",
    duration: "5 DAYS",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
    description: "Experience the raw power of Iceland's untamed landscapes."
  },
  {
    id: "nepal-void",
    title: "HIMALAYAN HEIGHTS",
    destination: "NEPAL",
    price: "₹4,899",
    duration: "7 DAYS",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    description: "Trek through ancient valleys and hidden mountain sanctuaries."
  },
  {
    id: "peru-expedition",
    title: "LOST CITY EXPEDITION",
    destination: "PERU",
    price: "₹6,499",
    duration: "8 DAYS",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1587595431973-160beaf913cb?w=800&q=80",
    description: "Unearth secrets in the heart of the Andes."
  },
  {
    id: "mongolia-silence",
    title: "STEPPES SOJOURN",
    destination: "MONGOLIA",
    price: "₹3,999",
    duration: "6 DAYS",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    description: "Complete disconnection in the heart of Central Asia."
  },
  {
    id: "atacama-descent",
    title: "ATACAMA DESCENT",
    destination: "ATACAMA DESERT",
    price: "₹5,699",
    duration: "6 DAYS",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    description: "Survive the world's driest desert and emerge transformed."
  },
  {
    id: "patagonia-wild",
    title: "PATAGONIA: UNTAMED",
    destination: "PATAGONIA",
    price: "₹5,299",
    duration: "7 DAYS",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    description: "Where granite peaks meet endless wilderness."
  },
  {
    id: "greenland-arctic",
    title: "ARCTIC WILDERNESS",
    destination: "GREENLAND",
    price: "₹6,199",
    duration: "8 DAYS",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    description: "Arctic darkness purifies the mind and hardens the spirit."
  },
  {
    id: "bhutan-mystique",
    title: "BHUTAN'S MYSTIQUE",
    destination: "BHUTAN",
    price: "₹4,399",
    duration: "6 DAYS",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    description: "Where tradition meets the edge of the modern world."
  }
];

export const REVIEWS: Review[] = [
  {
    id: "1",
    author: "Sarah Chen",
    role: "CEO, Tech Company",
    content: "Disappeared for three weeks in the Gobi Desert. Complete disconnection from the world. Transformative experience.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"
  },
  {
    id: "2",
    author: "Marcus Jefferson",
    role: "Photographer & Artist",
    content: "The planning was impeccable. From our meeting in Reykjavik to the helicopter ride through the blizzard, every moment was perfection.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
  },
  {
    id: "3",
    author: "Alex Rivera",
    role: "Tech Entrepreneur",
    content: "This isn't a vacation. It's a life-changing adventure. You challenge yourself and return transformed.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80"
  },
  {
    id: "4",
    author: "Emma Westbrook",
    role: "Designer & Artist",
    content: "Every detail was handled with care. The team understood my vision before I even explained it. Truly premium.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c006ae0f?w=400&q=80"
  },
  {
    id: "5",
    author: "James Mitchell",
    role: "Investment Banker",
    content: "Finally, a travel company that respects your time and delivers on promises. I'm booking my next expedition immediately.",
    rating: 4,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80"
  },
  {
    id: "6",
    author: "Isabella Santos",
    role: "Luxury Brand Executive",
    content: "The attention to detail is unmatched. From accommodation to guides to logistics—everything exceeded expectations.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
  },
  {
    id: "7",
    author: "David Chen",
    role: "Mountaineer & Author",
    content: "A masterclass in expedition planning and execution. This is how adventure travel should be done.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80"
  }
];



export const ADD_ONS: AddOn[] = [
  {
    id: "1",
    name: "Professional Photography",
    description: "Personal expedition photographer capturing your adventure",
    price: "₹8,999",
    category: "Experience"
  },
  {
    id: "2",
    name: "Advanced First Aid Certification",
    description: "Earn WildernessFirst Responder certification during expedition",
    price: "₹4,499",
    category: "Training"
  },
  {
    id: "3",
    name: "Premium Accommodation Upgrade",
    description: "Upgrade to luxury lodges for all nights",
    price: "₹12,999",
    category: "Accommodation"
  },
  {
    id: "4",
    name: "Drone Footage Package",
    description: "Cinematic aerial footage of your expedition",
    price: "₹6,999",
    category: "Experience"
  },
  {
    id: "5",
    name: "Private Guide",
    description: "Exclusive 1-on-1 guide for entire expedition",
    price: "₹19,999",
    category: "Services"
  },
  {
    id: "6",
    name: "Meal Customization",
    description: "Custom meal planning for dietary preferences",
    price: "₹2,999",
    category: "Services"
  },
  {
    id: "7",
    name: "Equipment Package",
    description: "Premium gear rental (sleeping bag, tent, etc.)",
    price: "₹5,499",
    category: "Equipment"
  },
  {
    id: "8",
    name: "Pre-Expedition Training",
    description: "3-week online conditioning and skill-building program",
    price: "₹3,999",
    category: "Training"
  }
];

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  destination: string;
  category: string;
  photographer?: string;
  location?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  category: string;
  date: string;
  image: string;
  readTime?: number;
  featured?: boolean;
}

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1000&q=80",
    title: "Northern Lights Dance",
    destination: "ICELAND",
    category: "Landscape",
    photographer: "Emma Wilson",
    location: "Jökulsárlón Glacier Lagoon"
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80",
    title: "Mountain Summit Victory",
    destination: "NEPAL",
    category: "Adventure",
    photographer: "James Chen",
    location: "Everest Base Camp"
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1587595431973-160beaf913cb?w=1000&q=80",
    title: "Lost City Majesty",
    destination: "PERU",
    category: "Culture",
    photographer: "Sofia Rodriguez",
    location: "Machu Picchu"
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1000&q=80",
    title: "Glacial Ice Formations",
    destination: "ICELAND",
    category: "Landscape",
    photographer: "Marcus Jefferson",
    location: "Vatnajökull National Park"
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1000&q=80",
    title: "Alpine Wilderness",
    destination: "NEPAL",
    category: "Adventure",
    photographer: "David Chen",
    location: "Annapurna Region"
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80",
    title: "Desert Sunset Soul",
    destination: "ATACAMA DESERT",
    category: "Landscape",
    photographer: "Sofia Rodriguez",
    location: "Valle de la Luna"
  },
  {
    id: "7",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80",
    title: "Patagonian Giants",
    destination: "PATAGONIA",
    category: "Adventure",
    photographer: "Alex Rivera",
    location: "Torres del Paine"
  },
  {
    id: "8",
    url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1000&q=80",
    title: "Arctic Polar Beauty",
    destination: "GREENLAND",
    category: "Wildlife",
    photographer: "Emma Wilson",
    location: "Ilulissat Icefjord"
  },
  {
    id: "9",
    url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1000&q=80",
    title: "Steppes Horizon Freedom",
    destination: "MONGOLIA",
    category: "Landscape",
    photographer: "James Chen",
    location: "Gobi Desert"
  },
  {
    id: "10",
    url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1000&q=80",
    title: "Bhutanese Spiritual Monastery",
    destination: "BHUTAN",
    category: "Culture",
    photographer: "Carlos Mendez",
    location: "Tiger's Nest Monastery"
  },
  {
    id: "11",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80",
    title: "Puffin Colony Encounter",
    destination: "ICELAND",
    category: "Wildlife",
    photographer: "Emma Wilson",
    location: "Heimaey Island"
  },
  {
    id: "12",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80",
    title: "Cultural Tapestry Woven",
    destination: "NEPAL",
    category: "Culture",
    photographer: "Sarah Bennett",
    location: "Kathmandu Market"
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "ultimate-guide-iceland-winter",
    title: "Ultimate Guide to Iceland in Winter",
    excerpt: "Discover the best practices for experiencing Iceland's magical Northern Lights season safely and sustainably.",
    author: "Emma Wilson",
    category: "TRAVEL TIPS",
    date: "Mar 15, 2026",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1000&q=80",
    readTime: 8,
    featured: true,
    content: "Iceland in winter is a magical experience that attracts thousands of travelers each year. The Northern Lights dance across the sky, painting the darkness with emerald and violet hues. This comprehensive guide will help you plan the perfect winter adventure.\n\n## Best Time to Visit\nDecember through February offers the longest nights, maximizing your chances of seeing the Aurora Borealis. The winter months bring shorter daylight hours but also some of the most spectacular natural phenomena on Earth.\n\n## What to Pack\nTemperatures range from -10 to 0°C. Essential items include thermal underlayers, insulated jackets, waterproof boots, and wool accessories. Never underestimate the power of Icelandic weather.\n\n## Safety Considerations\nWinter roads can be treacherous. Rent a 4x4 vehicle and consider hiring a professional guide. The weather changes rapidly, so always check forecasts and inform someone of your travel plans.\n\n## Aurora Hunting Tips\nGet away from city lights, bundle up, and be patient. The lights typically appear after 10 PM and can last for hours."
  },
  {
    id: "2",
    slug: "hidden-gems-nepal-beyond-busiest-trails",
    title: "Hidden Gems of Nepal: Beyond the Busiest Trails",
    excerpt: "Explore lesser-known valleys and villages that offer authentic Himalayan culture and stunning natural beauty.",
    author: "James Chen",
    category: "DESTINATION",
    date: "Mar 10, 2026",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80",
    readTime: 10,
    content: "While the Everest Base Camp trek and Annapurna Circuit attract hundreds of trekkers daily, Nepal offers countless hidden trails that provide equally stunning views with far fewer crowds.\n\n## Langtang Valley Trek\nThis underrated trek offers incredible mountain views and passes through traditional Sherpa villages. The trek typically takes 5-7 days and is less crowded than the major routes.\n\n## Panch Pokhari Trek\nSecluded alpine lakes surrounded by rhododendron forests. This sacred pilgrimage site remains relatively untouched by mainstream tourism.\n\n## Manaslu Circuit Trek\nOne of the most remote major treks, offering pristine wilderness and encounters with genuine mountain culture.\n\n## Local Experiences\nStay in family-run teahouses, eat traditional dal bhat, and engage with locals who welcome respectful visitors."
  },
  {
    id: "3",
    slug: "trekking-atacama-desert-challenges-rewards",
    title: "Trekking the Atacama Desert: Challenges and Rewards",
    excerpt: "A detailed account of one of the world's most extreme desert treks and how to prepare.",
    author: "Sofia Rodriguez",
    category: "ADVENTURE",
    date: "Mar 5, 2026",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80",
    readTime: 12,
    content: "The Atacama Desert is one of the driest places on Earth. Trekking here is not for the faint-hearted, but for those who can endure, the rewards are extraordinary.\n\n## Extreme Conditions\nWith virtually no water and extreme temperature swings from 40°C during the day to near freezing at night, the Atacama tests every ounce of your physical and mental resilience.\n\n## Essential Preparation\n- Extensive cardiovascular training\n- Desert survival skills\n- Mental fortitude and determination\n- Professional guide is essential\n\n## Highlights\nSalt flats, flamingo lakes, and otherworldly geological formations create a landscape unlike anywhere else on Earth.\n\n## Physical and Mental Journey\nThis trek is as much an internal journey as an external adventure. Expect to discover reserves of strength you didn't know you possessed."
  }
];

export const FAQ_DATA: FAQ[] = [
  {
    id: "1",
    question: "What is the minimum fitness level required?",
    answer: "We cater to various fitness levels. Most expeditions require moderate to high fitness. We provide a pre-expedition assessment and training recommendations to ensure you're prepared.",
    category: "Fitness"
  },
  {
    id: "2",
    question: "Are these expeditions suitable for beginners?",
    answer: "Yes! We have beginner-friendly packages. All expeditions are guided by professionals who ensure your safety and provide comprehensive support throughout the journey.",
    category: "Experience"
  },
  {
    id: "3",
    question: "What's included in the expedition price?",
    answer: "Typically includes accommodation, meals (most), expert guides, local transport, permits, and equipment. See the Included/Excluded section for specific details.",
    category: "Pricing"
  },
  {
    id: "4",
    question: "Can I bring my own equipment?",
    answer: "Yes, you're welcome to bring your own gear. We recommend checking our equipment checklist first. We can also provide rental equipment for an additional fee.",
    category: "Equipment"
  },
  {
    id: "5",
    question: "What medical facilities are available during the expedition?",
    answer: "All guides are trained in wilderness first aid. We maintain regular communication for emergency situations and evacuation protocols are in place if needed.",
    category: "Safety"
  },
  {
    id: "6",
    question: "Is travel insurance mandatory?",
    answer: "Yes, comprehensive travel insurance including evacuation coverage is mandatory for all expeditions. We can provide recommendations for suitable insurers.",
    category: "Insurance"
  },

  {
    id: "8",
    question: "Can I join as a solo traveler?",
    answer: "Absolutely! Solo travelers are welcome. We organize group expeditions where you'll meet fellow adventurers. Group sizes range from 4-10 participants depending on the expedition.",
    category: "Experience"
  },
  {
    id: "9",
    question: "What is the payment schedule?",
    answer: "Typically: 30% deposit to confirm booking, 70% remaining due 60 days before departure. Early bird discounts available for bookings made 6+ months in advance.",
    category: "Pricing"
  },
  {
    id: "10",
    question: "Can I customize my expedition itinerary?",
    answer: "Yes! We offer customized expeditions for groups of 4+. Contact our team to discuss specific requirements and preferences for a tailor-made adventure.",
    category: "Customization"
  }
];
