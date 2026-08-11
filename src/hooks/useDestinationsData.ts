import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import { Destination } from '../types/database';

export const useDestinationsData = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'destinations'),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Destination));
        setDestinations(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to destinations:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { destinations, loading };
};
