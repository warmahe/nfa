import { useState, useEffect, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseService";
import { Package } from "../types/database";

export const useDestinations = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [region, setRegion] = useState("ALL");
  const [difficulty, setDifficulty] = useState("ALL");
  const [loading, setLoading] = useState(true);

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

  const filtered = useMemo(() => {
    return packages.filter(pkg => {
      // Logic for filtering by region (destinations array) and difficulty
      const regionMatch = region === "ALL" || 
        pkg.destinations?.some(d => d.toUpperCase() === region.toUpperCase());
      const diffMatch = difficulty === "ALL" || 
        pkg.difficulty?.toUpperCase() === difficulty.toUpperCase();
      return regionMatch && diffMatch;
    });
  }, [packages, region, difficulty]);

  return { filtered, region, setRegion, difficulty, setDifficulty, loading };
};
