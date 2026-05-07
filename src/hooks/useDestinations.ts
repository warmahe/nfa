import { useState, useEffect, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseService";
import { Package } from "../types/database";

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
    const fetchPackages = async () => {
      try {
        const querySnap = await getDocs(collection(db, "packages"));
        const data = querySnap.docs.map(d => ({ id: d.id, ...d.data() } as Package));
        setPackages(data);
      } catch (err) {
        console.error("Error fetching destinations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
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
      const basePrice = pkg.pricing?.basePrice || 0;
      const minBudgetMatch = minBudget === "" || basePrice >= Number(minBudget);
      const maxBudgetMatch = maxBudget === "" || basePrice <= Number(maxBudget);

      // 5. Selected Destination (Specific city/country match instead of broad region)
      const destMatch = selectedDestination === "ALL" || 
        pkg.destinations?.some(d => d.toUpperCase() === selectedDestination.toUpperCase());

      return regionMatch && diffMatch && searchMatch && minBudgetMatch && maxBudgetMatch && destMatch;
    });

    // Handle Sorting
    result.sort((a, b) => {
      const priceA = a.pricing?.basePrice || 0;
      const priceB = b.pricing?.basePrice || 0;

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


