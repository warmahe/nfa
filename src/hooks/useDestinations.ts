import { useMemo, useState } from "react";
import { DESTINATIONS } from '../utils/constants';

export const useDestinations = (initialRegion = "ALL") => {
  const [filterRegion, setFilterRegion] = useState(initialRegion);
  const [sortBy, setSortBy] = useState("POPULAR");

  const filtered = useMemo(() => {
    let result = filterRegion === "ALL" 
      ? DESTINATIONS 
      : DESTINATIONS.filter(d => d.region === filterRegion);

    if (sortBy === "PRICE_LOW") result.sort((a, b) => parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, '')));
    if (sortBy === "RATING") result.sort((a, b) => b.rating - a.rating);
    
    return result;
  }, [filterRegion, sortBy]);

  return { filtered, filterRegion, setFilterRegion, sortBy, setSortBy };
};