// Map configuration and coordinates for all destinations

export interface MapLocation {
  name: string;
  lat: number;
  lng: number;
  zoom: number;
}

export interface ItineraryRoute {
  day: number;
  location: string;
  lat: number;
  lng: number;
  description: string;
}

// Main destinations map markers
export const DESTINATION_LOCATIONS: Record<string, MapLocation> = {
  ICELAND: {
    name: "Iceland",
    lat: 64.963,
    lng: -19.02,
    zoom: 7,
  },
  NEPAL: {
    name: "Nepal",
    lat: 28.3949,
    lng: 84.124,
    zoom: 8,
  },
  PERU: {
    name: "Peru",
    lat: -12.0464,
    lng: -77.0428,
    zoom: 8,
  },
  MONGOLIA: {
    name: "Mongolia",
    lat: 46.8625,
    lng: 103.8467,
    zoom: 6,
  },
  ATACAMA: {
    name: "Atacama Desert",
    lat: -23.0,
    lng: -68.0,
    zoom: 7,
  },
  SWITZERLAND: {
    name: "Switzerland",
    lat: 46.8182,
    lng: 8.2275,
    zoom: 7,
  },
  JAPAN: {
    name: "Japan",
    lat: 36.2048,
    lng: 138.2529,
    zoom: 6,
  },
  NORWAY: {
    name: "Norway",
    lat: 60.472,
    lng: 8.4689,
    zoom: 7,
  },
  "NEW ZEALAND": {
    name: "New Zealand",
    lat: -40.9006,
    lng: 174.886,
    zoom: 6,
  },
  PATAGONIA: {
    name: "Patagonia",
    lat: -50.3454,
    lng: -72.1183,
    zoom: 8,
  },
  GREENLAND: {
    name: "Greenland",
    lat: 71.7069,
    lng: -42.6043,
    zoom: 5,
  },
  BHUTAN: {
    name: "Bhutan",
    lat: 27.5142,
    lng: 90.4336,
    zoom: 8,
  },
};

// Itinerary routes for each destination
export const ITINERARY_ROUTES: Record<string, ItineraryRoute[]> = {
  ICELAND: [
    {
      day: 1,
      location: "Reykjavik (Arrival)",
      lat: 64.1466,
      lng: -21.9426,
      description: "Arrival at Keflavík International Airport",
    },
    {
      day: 2,
      location: "Golden Circle",
      lat: 64.35,
      lng: -18.89,
      description:
        "Explore Þingvellir, Geysir, and Gullfoss waterfall",
    },
    {
      day: 3,
      location: "South Coast",
      lat: 64.0,
      lng: -19.0,
      description: "Seljalandsfoss and Skógafoss waterfalls",
    },
    {
      day: 4,
      location: "Vatnajökull Glacier",
      lat: 64.02,
      lng: -16.8,
      description: "Jökulsárlón glacier lagoon and ice caves",
    },
    {
      day: 5,
      location: "Reykjavik (Departure)",
      lat: 64.1466,
      lng: -21.9426,
      description: "Return to Reykjavik",
    },
  ],
  NEPAL: [
    {
      day: 1,
      location: "Kathmandu (Arrival)",
      lat: 27.7172,
      lng: 85.324,
      description: "Arrival at Tribhuvan International Airport",
    },
    {
      day: 2,
      location: "Namche Bazaar",
      lat: 27.8047,
      lng: 86.7095,
      description:
        "Trek to Namche Bazaar - gateway to Everest region",
    },
    {
      day: 3,
      location: "Tyangboche",
      lat: 27.8427,
      lng: 86.7467,
      description:
        "Trek to Tyangboche with monastery views",
    },
    {
      day: 4,
      location: "Everest Base Camp",
      lat: 28.0086,
      lng: 86.8623,
      description: "Reach Everest Base Camp at 5,364m",
    },
    {
      day: 5,
      location: "Kathmandu (Departure)",
      lat: 27.7172,
      lng: 85.324,
      description: "Return to Kathmandu",
    },
  ],
  PERU: [
    {
      day: 1,
      location: "Lima (Arrival)",
      lat: -12.0464,
      lng: -77.0428,
      description: "Arrival at Jorge Chávez International Airport",
    },
    {
      day: 2,
      location: "Cusco",
      lat: -13.5316,
      lng: -71.9877,
      description: "Historic capital of the Inca Empire",
    },
    {
      day: 3,
      location: "Sacred Valley",
      lat: -13.26,
      lng: -72.14,
      description: "Explore ancient Inca sites and markets",
    },
    {
      day: 4,
      location: "Machu Picchu",
      lat: -13.1631,
      lng: -72.5496,
      description: "Visit the iconic Machu Picchu ruins",
    },
    {
      day: 5,
      location: "Lima (Departure)",
      lat: -12.0464,
      lng: -77.0428,
      description: "Return to Lima",
    },
  ],
  SWITZERLAND: [
    {
      day: 1,
      location: "Zurich (Arrival)",
      lat: 47.3769,
      lng: 8.5417,
      description: "Arrival at Zurich Airport",
    },
    {
      day: 2,
      location: "Interlaken",
      lat: 46.6863,
      lng: 8.1638,
      description:
        "Adventure hub between Eiger and Jungfrau mountains",
    },
    {
      day: 3,
      location: "Jungfrau",
      lat: 46.5441,
      lng: 8.1506,
      description:
        "Take the scenic train to Jungfraujoch",
    },
    {
      day: 4,
      location: "Zermatt",
      lat: 46.0207,
      lng: 7.7491,
      description: "Mountain resort near Matterhorn",
    },
    {
      day: 5,
      location: "Zurich (Departure)",
      lat: 47.3769,
      lng: 8.5417,
      description: "Return to Zurich",
    },
  ],
  JAPAN: [
    {
      day: 1,
      location: "Tokyo (Arrival)",
      lat: 35.6762,
      lng: 139.6503,
      description: "Arrival at Narita or Haneda Airport",
    },
    {
      day: 2,
      location: "Tokyo",
      lat: 35.6762,
      lng: 139.6503,
      description: "Explore vibrant Tokyo neighborhoods",
    },
    {
      day: 3,
      location: "Kyoto",
      lat: 35.0116,
      lng: 135.7681,
      description: "Ancient capital with temples and gardens",
    },
    {
      day: 4,
      location: "Mount Fuji",
      lat: 35.3606,
      lng: 138.7274,
      description: "Day trip to iconic Mount Fuji",
    },
    {
      day: 5,
      location: "Tokyo (Departure)",
      lat: 35.6762,
      lng: 139.6503,
      description: "Depart from Tokyo",
    },
  ],
  NORWAY: [
    {
      day: 1,
      location: "Oslo (Arrival)",
      lat: 59.9139,
      lng: 10.7522,
      description: "Arrival at Oslo Gardermoen Airport",
    },
    {
      day: 2,
      location: "Bergen",
      lat: 60.3913,
      lng: 5.3221,
      description: "Historic port city with colorful buildings",
    },
    {
      day: 3,
      location: "Geirangerfjord",
      lat: 62.1234,
      lng: 7.2347,
      description:
        "Scenic fjord with waterfalls and steep cliffs",
    },
    {
      day: 4,
      location: "Lofoten Islands",
      lat: 68.1487,
      lng: 13.5986,
      description: "Remote islands with dramatic peaks",
    },
    {
      day: 5,
      location: "Oslo (Departure)",
      lat: 59.9139,
      lng: 10.7522,
      description: "Return to Oslo",
    },
  ],
  "NEW ZEALAND": [
    {
      day: 1,
      location: "Auckland (Arrival)",
      lat: -37.7749,
      lng: 175.2711,
      description: "Arrival at Auckland International Airport",
    },
    {
      day: 2,
      location: "Rotorua",
      lat: -38.1368,
      lng: 176.249,
      description: "Geothermal wonders and Maori culture",
    },
    {
      day: 3,
      location: "Tongariro National Park",
      lat: -38.7649,
      lng: 175.5108,
      description: "Alpine hiking in volcanic landscape",
    },
    {
      day: 4,
      location: "Milford Sound",
      lat: -44.6719,
      lng: 167.926,
      description: "UNESCO-listed fjord with stunning vistas",
    },
    {
      day: 5,
      location: "Auckland (Departure)",
      lat: -37.7749,
      lng: 175.2711,
      description: "Depart from Auckland",
    },
  ],
  PATAGONIA: [
    {
      day: 1,
      location: "El Calafate (Arrival)",
      lat: -50.3454,
      lng: -72.2545,
      description: "Arrival at El Calafate International Airport",
    },
    {
      day: 2,
      location: "Perito Moreno Glacier",
      lat: -50.4915,
      lng: -73.2145,
      description: "Walk on the front of the glacier",
    },
    {
      day: 3,
      location: "El Chaltén",
      lat: -49.3319,
      lng: -72.8865,
      description: "Hiking capital with Mount Fitz Roy",
    },
    {
      day: 4,
      location: "Laguna de los Tres Picos",
      lat: -49.3267,
      lng: -72.9158,
      description: "Panoramic hiking trail with glacial views",
    },
    {
      day: 5,
      location: "El Calafate (Departure)",
      lat: -50.3454,
      lng: -72.2545,
      description: "Depart from El Calafate",
    },
  ],
  MONGOLIA: [
    {
      day: 1,
      location: "Ulaanbaatar (Arrival)",
      lat: 47.9,
      lng: 106.88,
      description: "Arrival at Chinggis Khaan International Airport",
    },
    {
      day: 2,
      location: "Gorkhi-Terelj National Park",
      lat: 47.9,
      lng: 107.3,
      description: "Vast steppes and nomadic camps",
    },
    {
      day: 3,
      location: "Khorgo Volcano",
      lat: 48.78,
      lng: 101.3,
      description: "Ancient volcanic landscape and lava fields",
    },
    {
      day: 4,
      location: "Tsagaan Suvarga",
      lat: 45.1,
      lng: 101.5,
      description: "Stunning white limestone cliffs",
    },
    {
      day: 5,
      location: "Ulaanbaatar (Departure)",
      lat: 47.9,
      lng: 106.88,
      description: "Return to Ulaanbaatar",
    },
  ],
  ATACAMA: [
    {
      day: 1,
      location: "San Pedro de Atacama (Arrival)",
      lat: -22.9068,
      lng: -68.1957,
      description: "Arrival in the driest desert on Earth",
    },
    {
      day: 2,
      location: "Valle de la Luna",
      lat: -22.7,
      lng: -68.25,
      description: "Otherworldly rock formations and canyons",
    },
    {
      day: 3,
      location: "Licancabur Volcano",
      lat: -22.842,
      lng: -68.197,
      description: "Sunrise hike with panoramic desert views",
    },
    {
      day: 4,
      location: "Laguna Cejar",
      lat: -23.21,
      lng: -68.25,
      description: "Salt lagoon for hiking and swimming",
    },
    {
      day: 5,
      location: "San Pedro de Atacama (Departure)",
      lat: -22.9068,
      lng: -68.1957,
      description: "Depart from San Pedro",
    },
  ],
  GREENLAND: [
    {
      day: 1,
      location: "Nuuk (Arrival)",
      lat: 64.1814,
      lng: -51.6941,
      description: "Arrival in the world's largest island",
    },
    {
      day: 2,
      location: "Illulissat",
      lat: 69.22,
      lng: -51.1,
      description: "Icefjord with massive calving glaciers",
    },
    {
      day: 3,
      location: "Disko Island",
      lat: 69.25,
      lng: -53.55,
      description: "Arctic wilderness and polar wildlife",
    },
    {
      day: 4,
      location: "Northern Lights Safari",
      lat: 68.5,
      lng: -53.0,
      description: "Aurora hunting in Arctic darkness",
    },
    {
      day: 5,
      location: "Nuuk (Departure)",
      lat: 64.1814,
      lng: -51.6941,
      description: "Return to Nuuk",
    },
  ],
  BHUTAN: [
    {
      day: 1,
      location: "Paro (Arrival)",
      lat: 27.4142,
      lng: 89.4167,
      description: "Arrival at Paro International Airport",
    },
    {
      day: 2,
      location: "Thimphu",
      lat: 27.5142,
      lng: 89.6411,
      description: "Capital city with monasteries and dzongs",
    },
    {
      day: 3,
      location: "Tiger's Nest Monastery",
      lat: 27.3255,
      lng: 89.3829,
      description: "Sacred monastery perched on cliff",
    },
    {
      day: 4,
      location: "Punakha Dzong",
      lat: 27.5994,
      lng: 89.8581,
      description: "Stunning fortress at river confluence",
    },
    {
      day: 5,
      location: "Paro (Departure)",
      lat: 27.4142,
      lng: 89.4167,
      description: "Depart from Paro",
    },
  ],
};

// Map provider configuration
export const MAP_CONFIG = {
  tileLayer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  defaultZoom: 6,
  minZoom: 2,
  maxZoom: 18,
};
