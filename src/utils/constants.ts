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

// THE MASTER DEMO PACKAGE (STATIC REFERENCE REMOVED)
export const PACKAGES: any[] = [];

export const DESTINATIONS: any[] = [];
export const REVIEWS: any[] = [];
export const ADD_ONS: any[] = [];
export const GALLERY_IMAGES: any[] = [];
export const BLOG_POSTS: any[] = [];
export const FAQ_DATA: any[] = [];


