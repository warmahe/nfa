import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebaseService";
import { Package } from "../types/database";
import { normalizeItinerary } from "../utils/itineraryNormalizer";

export const useDestinations = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  // States as per PRD
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("ALL");
  const [region, setRegion] = useState("ALL"); // filterRegion equivalent
  const [difficulty, setDifficulty] = useState("ALL");
  const [sortBy, setSortBy] = useState("featured"); // e.g., 'price_asc', 'price_desc', 'duration'
  const [minBudget, setMinBudget] = useState<number | "">("");
  const [maxBudget, setMaxBudget] = useState<number | "">("");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "packages"),
      (snapshot) => {
        const data = snapshot.docs.map(d => normalizeItinerary({ id: d.id, ...d.data() } as Package));
        setPackages(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching packages in realtime:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDestination("ALL");
    setRegion("ALL");
    setDifficulty("ALL");
    setSortBy("featured");
    setMinBudget("");
    setMaxBudget("");
  };

  const filtered = useMemo(() => {
    let result = packages.filter(pkg => {
      // 1. Region
      const regionMatch = region === "ALL" || 
        pkg.destinations?.some(d => d.toUpperCase() === region.toUpperCase()) || 
        (pkg as any).region?.toUpperCase() === region.toUpperCase();

      // 2. Difficulty
      const diffMatch = difficulty === "ALL" || 
        pkg.difficulty?.toUpperCase() === difficulty.toUpperCase();
      
      // 3. Search Term
      const searchMatch = searchTerm === "" || 
        pkg.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        pkg.overview?.toLowerCase().includes(searchTerm.toLowerCase());

      // 4. Budget
      const isPricingEnabled = Boolean(pkg.pricing?.showPricing || (pkg as any).showPricing);
      const basePrice = isPricingEnabled ? (pkg.pricing?.basePrice || 0) : 0;
      const minBudgetMatch = minBudget === "" || (isPricingEnabled && basePrice >= Number(minBudget));
      const maxBudgetMatch = maxBudget === "" || (isPricingEnabled ? basePrice <= Number(maxBudget) : true);

      // 5. Selected Destination (Specific city/country match instead of broad region)
      const destMatch = selectedDestination === "ALL" || 
        pkg.destinations?.some(d => d.toUpperCase() === selectedDestination.toUpperCase());

      return regionMatch && diffMatch && searchMatch && minBudgetMatch && maxBudgetMatch && destMatch;
    });

    // Handle Sorting
    result.sort((a, b) => {
      const isPricingEnabledA = Boolean(a.pricing?.showPricing || (a as any).showPricing);
      const isPricingEnabledB = Boolean(b.pricing?.showPricing || (b as any).showPricing);
      const priceA = isPricingEnabledA ? (a.pricing?.basePrice || 0) : 0;
      const priceB = isPricingEnabledB ? (b.pricing?.basePrice || 0) : 0;

      if (sortBy === "price_asc") return priceA - priceB;
      if (sortBy === "price_desc") return priceB - priceA;
      if (sortBy === "duration") {
        const durA = parseInt(a.duration) || 0;
        const durB = parseInt(b.duration) || 0;
        return durA - durB;
      }
      return 0; // Default/featured
    });

    return result;
  }, [packages, region, difficulty, searchTerm, minBudget, maxBudget, selectedDestination, sortBy]);

  return { 
    filtered, 
    loading,
    
    // States and Setters
    searchTerm, setSearchTerm,
    selectedDestination, setSelectedDestination,
    region, setRegion,
    difficulty, setDifficulty,
    sortBy, setSortBy,
    minBudget, setMinBudget,
    maxBudget, setMaxBudget,
    viewMode, setViewMode,

    // Actions
    clearFilters
  };
};


