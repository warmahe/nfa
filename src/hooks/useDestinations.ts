import { useMemo, useState } from "react";
import { PACKAGES } from "../utils/constants";

export const useDestinations = () => {
  const [region, setRegion] = useState("ALL");
  const [difficulty, setDifficulty] = useState("ALL");
  const [loading] = useState(false);

  const filtered = useMemo(() => {
    return PACKAGES.filter(pkg => {
      const regionMatch = region === "ALL" || (pkg.destinations && pkg.destinations.includes(region));
      const diffMatch = difficulty === "ALL" || pkg.difficulty?.toUpperCase() === difficulty;
      return regionMatch && diffMatch;
    });
  }, [region, difficulty]);

  return { filtered, region, setRegion, difficulty, setDifficulty, loading };
};
