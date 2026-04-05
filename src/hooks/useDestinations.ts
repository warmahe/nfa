import { useMemo, useState } from "react";
import { DESTINATIONS } from "../utils/constants";

export const useDestinations = () => {
  const [region, setRegion] = useState("ALL");
  const [difficulty, setDifficulty] = useState("ALL");

  const filtered = useMemo(() => {
    return DESTINATIONS.filter(dest => {
      const regionMatch = region === "ALL" || dest.region === region;
      const diffMatch = difficulty === "ALL" || dest.difficulty.toUpperCase() === difficulty;
      return regionMatch && diffMatch;
    });
  }, [region, difficulty]);

  return { filtered, region, setRegion, difficulty, setDifficulty };
};