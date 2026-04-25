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

// THE MASTER DEMO PACKAGE (STATIC REFERENCE)
export const PACKAGES: any[] = [
  {
    id: "iceland-drift",
    slug: "iceland-drift",
    title: "THE ICELANDIC DRIFT",
    description: "This is not a vacation; it's an expedition. We leave the tourist traps behind and dive into the raw, unfiltered reality of the Arctic North. Expect zero reception, volcanic grit, and the silence of the void.",
    duration: "7 DAYS",
    difficulty: "Challenging",
    maxTravelers: 6,
    pricing: {
      basePrice: 5299,
      currency: "INR"
    },
    media: {
      thumbnail: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1000&q=80",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80"
      ]
    },
    destinations: ["Iceland"],
    status: "active",
    rating: { average: 5.0, totalReviews: 12 },
    itineraryDays: [
      { day: 1, title: "INSERTION: REYKJAVIK", description: "Arrive at coordinates. Gear check. First deployment into the volcanic rift." },
      { day: 2, title: "THE SILVER SILENCE", description: "Trek across the Vatnajökull glacier. Total isolation achieved." },
      { day: 3, title: "BASALT PROTOCOL", description: "Navigate the black sands of Vik. Extreme weather drills." },
      { day: 4, title: "GEOTHERMAL EXTRACTION", description: "Recover in hidden thermal vents. Review field data." },
      { day: 5, title: "THE NORTHERN WATCH", description: "Camp under the Aurora Borealis. Night navigation training." },
      { day: 6, title: "RIVER CROSSING", description: "Fording glacial rivers in modified 4x4 units." },
      { day: 7, title: "EXFILTRATION", description: "Final debrief. Return to base." }
    ]
  }
];

export const DESTINATIONS: any[] = [];
export const REVIEWS: any[] = [];
export const ADD_ONS: any[] = [];
export const GALLERY_IMAGES: any[] = [];
export const BLOG_POSTS: any[] = [];
export const FAQ_DATA: any[] = [];


