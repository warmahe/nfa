// Declare Vite env variables
declare global {
  interface ImportMetaEnv {
    VITE_FIREBASE_API_KEY: string;
    VITE_FIREBASE_AUTH_DOMAIN: string;
    VITE_FIREBASE_PROJECT_ID: string;
    VITE_FIREBASE_STORAGE_BUCKET: string;
    VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    VITE_FIREBASE_APP_ID: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  CollectionReference,
  Query,
  Timestamp,
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  Auth,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Firebase Configuration - Replace with your project credentials
// Get these from Firebase Console: Project Settings > serviceAccounts > Web
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(firebaseApp);

// Initialize Authentication
export const auth = getAuth(firebaseApp);

// Initialize Storage
export const storage = getStorage(firebaseApp);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

export const createUserAccount = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      firstName: displayName.split(' ')[0],
      lastName: displayName.split(' ').slice(1).join(' '),
      email: user.email,
      status: 'active',
      emailVerified: false,
      totalBookings: 0,
      totalSpent: 0,
      currency: 'INR',
      language: 'en',
      newsletter: true,
      marketingEmails: true,
      authProvider: 'email',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
    });

    return user;
  } catch (error: any) {
    console.error('Error creating user account:', error.message);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last login
    await updateDoc(doc(db, 'users', user.uid), {
      lastLogin: Timestamp.now(),
    });

    return user;
  } catch (error: any) {
    console.error('Error logging in:', error.message);
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user document exists, if not create it
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        firstName: user.displayName?.split(' ')[0] || 'User',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        profilePicture: user.photoURL,
        status: 'active',
        emailVerified: true,
        totalBookings: 0,
        totalSpent: 0,
        currency: 'INR',
        language: 'en',
        newsletter: true,
        marketingEmails: true,
        authProvider: 'google',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
      });
    } else {
      // Update last login
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: Timestamp.now(),
      });
    }

    return user;
  } catch (error: any) {
    console.error('Error logging in with Google:', error.message);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error logging out:', error.message);
    throw error;
  }
};

export const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ============================================================================
// COLLECTION REFERENCES
// ============================================================================

export const packagesCollection = collection(db, 'packages');
export const destinationsCollection = collection(db, 'destinations');
export const bookingsCollection = collection(db, 'bookings');
export const usersCollection = collection(db, 'users');
export const blogsCollection = collection(db, 'blogs');

// ============================================================================
// FIRESTORE QUERY HELPERS
// ============================================================================

// Get single document by ID
export const getDocumentById = async <T>(collectionName: string, docId: string): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return (docSnap.exists() ? docSnap.data() as T : null);
  } catch (error: any) {
    console.error(`Error fetching document from ${collectionName}:`, error.message);
    throw error;
  }
};

// Get all documents from a collection
export const getCollectionData = async <T>(collectionName: string): Promise<T[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data: T[] = [];
    querySnapshot.forEach((doc) => {
      data.push(doc.data() as T);
    });
    return data;
  } catch (error: any) {
    console.error(`Error fetching collection ${collectionName}:`, error.message);
    throw error;
  }
};

// Get documents with where condition
export const getDocumentsWithCondition = async <T>(
  collectionName: string,
  fieldPath: string,
  operator: any,
  value: any
): Promise<T[]> => {
  try {
    const q = query(collection(db, collectionName), where(fieldPath, operator, value));
    const querySnapshot = await getDocs(q);
    const data: T[] = [];
    querySnapshot.forEach((doc) => {
      data.push(doc.data() as T);
    });
    return data;
  } catch (error: any) {
    console.error(`Error fetching documents with condition:`, error.message);
    throw error;
  }
};

// Get documents with multiple conditions
export const getDocumentsWithMultipleConditions = async <T>(
  collectionName: string,
  conditions: Array<{ field: string; operator: any; value: any }>
): Promise<T[]> => {
  try {
    const constraints = conditions.map((cond) => where(cond.field, cond.operator, cond.value));
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    const data: T[] = [];
    querySnapshot.forEach((doc) => {
      data.push(doc.data() as T);
    });
    return data;
  } catch (error: any) {
    console.error(`Error fetching documents with multiple conditions:`, error.message);
    throw error;
  }
};

// Get documents ordered by field
export const getDocumentsOrdered = async <T>(
  collectionName: string,
  orderByField: string,
  direction: 'asc' | 'desc' = 'asc',
  limitCount?: number
): Promise<T[]> => {
  try {
    const constraints: any[] = [orderBy(orderByField, direction === 'desc' ? 'desc' : 'asc')];
    if (limitCount) {
      constraints.push(limit(limitCount));
    }
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    const data: T[] = [];
    querySnapshot.forEach((doc) => {
      data.push(doc.data() as T);
    });
    return data;
  } catch (error: any) {
    console.error(`Error fetching ordered documents:`, error.message);
    throw error;
  }
};

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

// Create/Set document
export const setDocument = async <T>(collectionName: string, docId: string, data: T, merge = false) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge });
    return docRef;
  } catch (error: any) {
    console.error(`Error setting document in ${collectionName}:`, error.message);
    throw error;
  }
};

// Update document
export const updateDocument = async <T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: Partial<T>
) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return docRef;
  } catch (error: any) {
    console.error(`Error updating document in ${collectionName}:`, error.message);
    throw error;
  }
};

// Delete document
export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.error(`Error deleting document from ${collectionName}:`, error.message);
    throw error;
  }
};

// ============================================================================
// FILE UPLOAD HELPERS
// ============================================================================

// Upload image to Firebase Storage
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const fileRef = ref(storage, `${path}/${file.name}-${Date.now()}`);
    const uploadResult = await uploadBytes(fileRef, file);
    return await getDownloadURL(uploadResult.ref);
  } catch (error: any) {
    console.error('Error uploading image:', error.message);
    throw error;
  }
};

// Delete image from Firebase Storage
export const deleteImage = async (url: string) => {
  if (!url || !url.includes('firebasestorage')) return;
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (err) {
    console.error("Cleanup failed:", err);
  }
};
// ============================================================================
// SUBCOLLECTION HELPERS
// ============================================================================

// Get subcollection data
export const getSubcollectionData = async <T>(
  collectionName: string,
  docId: string,
  subcollectionName: string
): Promise<T[]> => {
  try {
    const subcollectionRef = collection(db, collectionName, docId, subcollectionName);
    const querySnapshot = await getDocs(subcollectionRef);
    const data: T[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as T);
    });
    return data;
  } catch (error: any) {
    console.error(`Error fetching subcollection ${subcollectionName}:`, error.message);
    throw error;
  }
};

// Set subcollection document
export const setSubcollectionDocument = async <T>(
  collectionName: string,
  docId: string,
  subcollectionName: string,
  subDocId: string,
  data: T
) => {
  try {
    const subDocRef = doc(db, collectionName, docId, subcollectionName, subDocId);
    await setDoc(subDocRef, data);
    return subDocRef;
  } catch (error: any) {
    console.error(`Error setting subcollection document:`, error.message);
    throw error;
  }
};

// Update subcollection document
export const updateSubcollectionDocument = async <T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  subcollectionName: string,
  subDocId: string,
  data: Partial<T>
) => {
  try {
    const subDocRef = doc(db, collectionName, docId, subcollectionName, subDocId);
    await updateDoc(subDocRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return subDocRef;
  } catch (error: any) {
    console.error(`Error updating subcollection document:`, error.message);
    throw error;
  }
};

// Delete subcollection document
export const deleteSubcollectionDocument = async (
  collectionName: string,
  docId: string,
  subcollectionName: string,
  subDocId: string
) => {
  try {
    const subDocRef = doc(db, collectionName, docId, subcollectionName, subDocId);
    await deleteDoc(subDocRef);
  } catch (error: any) {
    console.error(`Error deleting subcollection document:`, error.message);
    throw error;
  }
};

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

// Batch get multiple documents
export const batchGetDocuments = async <T>(
  collectionName: string,
  docIds: string[]
): Promise<Map<string, T | null>> => {
  try {
    const results = new Map<string, T | null>();
    for (const docId of docIds) {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      results.set(docId, docSnap.exists() ? (docSnap.data() as T) : null);
    }
    return results;
  } catch (error: any) {
    console.error(`Error batch fetching documents:`, error.message);
    throw error;
  }
};
