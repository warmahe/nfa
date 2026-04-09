import { useState, useEffect } from 'react';
import { getCollectionData } from '../services/firebaseService';

export const useFirebaseData = <T>(collectionName: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getCollectionData(collectionName);
        setData(result as T[]);
      } catch (err) {
        console.error(`Error loading ${collectionName}:`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [collectionName]);

  return { data, loading };
};