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

import React from 'react';
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
  onSnapshot,
  addDoc,
  increment,
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

export const loginAdmin = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
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
export const enquiriesCollection = collection(db, 'Enquiries');
export const customersCollection = collection(db, 'customers');
export const customerStoriesCollection = collection(db, 'customerStories');

// ============================================================================
// CUSTOMER HELPERS (C3)
// ============================================================================
import { EnquiryDocument, CustomerDocument } from '../types/database';
import { InternalNote, EnquiryActivity } from '../types/database';

/**
 * Upserts a Customer profile document when an authenticated user submits an enquiry.
 */
export const upsertCustomerFromEnquiry = async (
  enquiryData: Omit<EnquiryDocument, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string | undefined> => {
  const userId = enquiryData.traveller?.userId;
  if (!userId) return undefined;

  try {
    const customerRef = doc(db, 'customers', userId);
    const existingSnap = await getDoc(customerRef);

    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as CustomerDocument;
      await updateDoc(customerRef, {
        name: enquiryData.traveller?.name || existingData.name,
        phone: enquiryData.traveller?.phone || existingData.phone,
        address: enquiryData.traveller?.address || existingData.address,
        totalEnquiries: increment(1),
        lastEnquiryAt: Timestamp.now(),
        marketingConsent: enquiryData.marketingConsent ?? existingData.marketingConsent ?? false,
        updatedAt: Timestamp.now(),
      });
      return userId;
    } else {
      const newRefCode = `NFA-C-${Math.floor(10000 + Math.random() * 90000)}`;
      await setDoc(customerRef, {
        customerId: userId,
        customerReference: newRefCode,
        userId: userId,
        name: enquiryData.traveller?.name || 'Explorer',
        email: enquiryData.traveller?.email || '',
        phone: enquiryData.traveller?.phone || '',
        address: enquiryData.traveller?.address || '',
        preferences: {
          travelStyle: 'Standard',
          preferredDestinations: enquiryData.destination ? [enquiryData.destination] : [],
          preferredAccommodation: [],
          interests: [],
        },
        totalEnquiries: 1,
        totalConvertedEnquiries: 0,
        lastEnquiryAt: Timestamp.now(),
        marketingConsent: enquiryData.marketingConsent || false,
        emailStatus: 'subscribed',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return userId;
    }
  } catch (err) {
    console.warn('Notice during customer upsert:', err);
    return userId;
  }
};

/**
 * Subscribes to real-time updates for all customers (Admin use).
 */
export const subscribeToCustomers = (
  onNext: (customers: CustomerDocument[]) => void,
  onError?: (err: Error) => void
) => {
  return onSnapshot(
    customersCollection,
    (snapshot) => {
      const loaded: CustomerDocument[] = [];
      snapshot.forEach((d) => {
        loaded.push({ id: d.id, ...(d.data() as Omit<CustomerDocument, 'id'>) });
      });
      onNext(loaded);
    },
    onError
  );
};

/**
 * Updates basic customer profile fields (Admin or Owner).
 */
export const updateCustomerProfile = async (
  customerId: string,
  updates: Partial<CustomerDocument>
) => {
  const customerRef = doc(db, 'customers', customerId);
  await updateDoc(customerRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

// ============================================================================
// ENQUIRY HELPERS
// ============================================================================

/**
 * Creates a new enquiry document in the Firestore `Enquiries` collection.
 */
export const createEnquiryDocument = async (
  data: Omit<EnquiryDocument, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ id: string; enquiryId: string }> => {
  try {
    let linkedCustomerId: string | undefined = data.customerId;

    if (data.traveller?.userId) {
      linkedCustomerId = await upsertCustomerFromEnquiry(data);
    }

    const docRef = await addDoc(enquiriesCollection, {
      ...data,
      customerId: linkedCustomerId || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Automatically record initial audit activity: ENQUIRY_RECEIVED
    try {
      await addDoc(collection(db, 'Enquiries', docRef.id, 'activities'), {
        enquiryId: docRef.id,
        type: 'ENQUIRY_RECEIVED',
        actorId: data.traveller?.userId || 'PUBLIC_TRAVELLER',
        actorName: data.traveller?.name || 'Explorer',
        createdAt: Timestamp.now(),
      });
    } catch (actErr) {
      console.warn('Initial activity record notice:', actErr);
    }

    return { id: docRef.id, enquiryId: data.enquiryId };
  } catch (error: any) {
    console.error('Error creating enquiry document in Firestore:', error);
    throw error;
  }
};

/** Add an internal note to an enquiry subcollection */
export const addInternalNote = async (
  enquiryDocId: string,
  note: Omit<InternalNote, 'id' | 'createdAt'>
) => {
  try {
    const notesRef = collection(db, 'Enquiries', enquiryDocId, 'notes');
    const docRef = await addDoc(notesRef, {
      ...note,
      createdAt: Timestamp.now(),
    });

    // Record activity audit trail
    await addEnquiryActivity(enquiryDocId, {
      enquiryId: enquiryDocId,
      type: 'NOTE_ADDED',
      actorId: note.authorId,
      actorName: note.authorName,
      metadata: {
        noteSnippet: note.text.length > 50 ? `${note.text.slice(0, 50)}...` : note.text,
      },
    });

    return docRef.id;
  } catch (error: any) {
    console.error('Error adding internal note:', error);
    throw error;
  }
};

/** Subscribe to realtime internal notes for an enquiry */
export const subscribeToInternalNotes = (
  enquiryDocId: string,
  onUpdate: (notes: InternalNote[]) => void,
  onError?: (err: any) => void
) => {
  const notesRef = collection(db, 'Enquiries', enquiryDocId, 'notes');
  const q = query(notesRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const notes: InternalNote[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<InternalNote, 'id'>),
      }));
      onUpdate(notes);
    },
    (err) => {
      console.error('Error listening to internal notes:', err);
      if (onError) onError(err);
    }
  );
};

/** Record an activity audit event for an enquiry */
export const addEnquiryActivity = async (
  enquiryDocId: string,
  activity: Omit<EnquiryActivity, 'id' | 'createdAt'>
) => {
  try {
    const activitiesRef = collection(db, 'Enquiries', enquiryDocId, 'activities');
    const docRef = await addDoc(activitiesRef, {
      ...activity,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding enquiry activity:', error);
    throw error;
  }
};

/** Subscribe to realtime activity audit timeline for an enquiry */
export const subscribeToEnquiryActivities = (
  enquiryDocId: string,
  onUpdate: (activities: EnquiryActivity[]) => void,
  onError?: (err: any) => void
) => {
  const activitiesRef = collection(db, 'Enquiries', enquiryDocId, 'activities');
  const q = query(activitiesRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const activities: EnquiryActivity[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<EnquiryActivity, 'id'>),
      }));
      onUpdate(activities);
    },
    (err) => {
      console.error('Error listening to enquiry activities:', err);
      if (onError) onError(err);
    }
  );
};

// ============================================================================
// PACKAGE-SPECIFIC HELPERS
// ============================================================================

/** Fetch all packages from Firestore with their document IDs */
export const getAllPackages = async () => {
  try {
    const snap = await getDocs(collection(db, 'packages'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error: any) {
    console.error('Error fetching packages:', error.message);
    throw error;
  }
};

/** Create a new package document and return the auto-generated ID */
export const createPackage = async (data: Record<string, any>): Promise<string> => {
  try {
    const { Timestamp: T } = await import('firebase/firestore');
    const docRef = await addDoc(collection(db, 'packages'), {
      ...data,
      createdAt: T.now(),
      updatedAt: T.now(),
    });
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating package:', error.message);
    throw error;
  }
};

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
// IMAGE COMPRESSION
// ============================================================================

/**
 * Compresses an image file using canvas before upload.
 * Resizes to maxWidth (default 1200px) and re-encodes as JPEG at given quality.
 * Skips compression for GIFs. Reduces file sizes by ~60-80%.
 */
export const compressImage = (
  file: File,
  maxWidth = 1200,
  quality = 0.82
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Skip GIFs — canvas kills animation
    if (file.type === 'image/gif') {
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Calculate new dimensions keeping aspect ratio
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else resolve(file);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')); };
    img.src = objectUrl;
  });
};

// ============================================================================
// FILE UPLOAD HELPERS
// ============================================================================

// Upload image to Firebase Storage (with automatic compression)
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const compressed = await compressImage(file);
    const fileName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    const fileRef = ref(storage, `${path}/${Date.now()}_${fileName}`);
    const uploadResult = await uploadBytes(fileRef, compressed, { contentType: 'image/jpeg' });
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
// BOOKING DOCUMENT UPLOAD HELPERS (E12)
// ============================================================================

const ALLOWED_BOOKING_DOC_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

const MAX_BOOKING_DOC_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Validates and uploads a traveller document to Firebase Storage.
 * Returns { fileUrl, storagePath } on success.
 * Throws a user-friendly Error on validation or upload failure.
 */
export const uploadBookingDocument = async (
  file: File,
  bookingId: string,
  docId: string
): Promise<{ fileUrl: string; storagePath: string }> => {
  // MIME type validation
  if (!ALLOWED_BOOKING_DOC_TYPES.includes(file.type)) {
    throw new Error(
      'This file type is not supported. Please upload a PDF, JPG, or PNG file.'
    );
  }

  // Size validation
  if (file.size > MAX_BOOKING_DOC_SIZE_BYTES) {
    throw new Error(
      'File is too large. Please upload a file smaller than 20 MB.'
    );
  }

  try {
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `booking-documents/${bookingId}/${docId}_${safeFileName}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file, { contentType: file.type });
    const fileUrl = await getDownloadURL(storageRef);
    return { fileUrl, storagePath };
  } catch (error: any) {
    console.error('Error uploading booking document:', error);
    throw new Error("Couldn't upload the document. Please try again.");
  }
};

/**
 * Deletes a booking document file from Firebase Storage by its storage path.
 * Safely handles missing files without throwing.
 */
export const deleteBookingDocumentFile = async (storagePath: string): Promise<void> => {
  if (!storagePath) return;
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (err: any) {
    // object-not-found is safe to ignore (file may already be gone)
    if (err?.code !== 'storage/object-not-found') {
      console.warn('Notice: could not delete booking document file:', err);
    }
  }
};

// Unified function to compress, upload and replace an image (prevents orphaned files)
export const uploadAndReplaceImage = async (
  file: File,
  path: string,
  oldImageUrl?: string | null
): Promise<string> => {
  try {
    // 1. Delete old image if it exists
    if (oldImageUrl && oldImageUrl.includes('firebasestorage')) {
      try {
        const oldFileRef = ref(storage, oldImageUrl);
        await deleteObject(oldFileRef);
      } catch (err) {
        console.warn("Could not delete old image (might not exist):", err);
      }
    }

    // 2. Compress then upload
    const compressed = await compressImage(file);
    const fileName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    const fileRef = ref(storage, `${path}/${Date.now()}_${fileName}`);
    await uploadBytes(fileRef, compressed, { contentType: 'image/jpeg' });
    return await getDownloadURL(fileRef);
  } catch (error: any) {
    console.error('Error in uploadAndReplaceImage:', error.message);
    throw error;
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

// ============================================================================
// AUTH HOOK
// ============================================================================

export const useAuth = () => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
};

// ============================================================================
// BOOKINGS REALTIME SERVICES (E7)
// ============================================================================

export const subscribeToBookings = (
  onSuccess: (bookings: any[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(collection(db, 'bookings'));
  return onSnapshot(
    q,
    (snapshot) => {
      const loaded: any[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      loaded.sort((a, b) => {
        const tA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate().getTime() : new Date((a.createdAt as any) || 0).getTime();
        const tB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate().getTime() : new Date((b.createdAt as any) || 0).getTime();
        const vA = isNaN(tA) ? 0 : tA;
        const vB = isNaN(tB) ? 0 : tB;
        return vB - vA;
      });
      onSuccess(loaded);
    },
    (err) => {
      console.error('Error in subscribeToBookings:', err);
      if (onError) onError(err);
    }
  );
};

export const subscribeToCustomerBookings = (
  userId: string,
  onSuccess: (bookings: any[]) => void,
  onError?: (error: Error) => void
) => {
  if (!userId) return () => {};
  const q = query(collection(db, 'bookings'), where('customerId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const loaded: any[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      loaded.sort((a, b) => {
        const tA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate().getTime() : new Date((a.createdAt as any) || 0).getTime();
        const tB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate().getTime() : new Date((b.createdAt as any) || 0).getTime();
        const vA = isNaN(tA) ? 0 : tA;
        const vB = isNaN(tB) ? 0 : tB;
        return vB - vA;
      });
      onSuccess(loaded);
    },
    (err) => {
      console.error('Error in subscribeToCustomerBookings:', err);
      if (onError) onError(err);
    }
  );
};

// ============================================================================
// CUSTOMER STORIES REALTIME & CRUD SERVICES (E13)
// ============================================================================
import { CustomerStory } from '../types/database';

/**
 * Subscribes to real-time updates for all customer stories (Admin Panel).
 */
export const subscribeToAllCustomerStories = (
  onSuccess: (stories: CustomerStory[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(customerStoriesCollection);
  return onSnapshot(
    q,
    (snapshot) => {
      const loaded: CustomerStory[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CustomerStory, 'id'>),
      }));

      // Sort by createdAt desc
      loaded.sort((a, b) => {
        const tA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate().getTime() : new Date((a.createdAt as any) || 0).getTime();
        const tB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate().getTime() : new Date((b.createdAt as any) || 0).getTime();
        return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA);
      });

      onSuccess(loaded);
    },
    (err) => {
      console.error('Error in subscribeToAllCustomerStories:', err);
      if (onError) onError(err);
    }
  );
};

/**
 * Subscribes to real-time updates for PUBLISHED customer stories (Public Website).
 * Featured stories come first, then sorted by publishedAt / createdAt desc.
 */
export const subscribeToPublishedCustomerStories = (
  onSuccess: (stories: CustomerStory[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(customerStoriesCollection, where('status', '==', 'PUBLISHED'));
  return onSnapshot(
    q,
    (snapshot) => {
      const loaded: CustomerStory[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CustomerStory, 'id'>),
      }));

      // Sort: Featured first, then newest publishedAt
      loaded.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;

        const tA = (a.publishedAt || a.createdAt as any)?.toDate
          ? (a.publishedAt || a.createdAt as any).toDate().getTime()
          : new Date((a.publishedAt || a.createdAt as any) || 0).getTime();
        const tB = (b.publishedAt || b.createdAt as any)?.toDate
          ? (b.publishedAt || b.createdAt as any).toDate().getTime()
          : new Date((b.publishedAt || b.createdAt as any) || 0).getTime();

        return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA);
      });

      onSuccess(loaded);
    },
    (err) => {
      console.error('Error in subscribeToPublishedCustomerStories:', err);
      if (onError) onError(err);
    }
  );
};

/**
 * Subscribes to real-time updates for a single story by its URL slug (Public Detail).
 */
export const subscribeToCustomerStoryBySlug = (
  slug: string,
  onSuccess: (story: CustomerStory | null) => void,
  onError?: (error: Error) => void
) => {
  if (!slug) {
    onSuccess(null);
    return () => {};
  }
  const q = query(customerStoriesCollection, where('slug', '==', slug.toLowerCase()));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onSuccess(null);
      } else {
        const d = snapshot.docs[0];
        onSuccess({ id: d.id, ...(d.data() as Omit<CustomerStory, 'id'>) });
      }
    },
    (err) => {
      console.error('Error in subscribeToCustomerStoryBySlug:', err);
      if (onError) onError(err);
    }
  );
};

/**
 * Creates a new CustomerStory document in Firestore.
 */
export const createCustomerStory = async (
  storyData: Omit<CustomerStory, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(customerStoriesCollection, {
      ...storyData,
      slug: storyData.slug.toLowerCase().trim(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      publishedAt: storyData.status === 'PUBLISHED' ? Timestamp.now() : null,
    });
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating customer story:', error);
    throw error;
  }
};

/**
 * Updates an existing CustomerStory document in Firestore.
 */
export const updateCustomerStory = async (
  storyId: string,
  updates: Partial<CustomerStory>
): Promise<void> => {
  try {
    const storyRef = doc(db, 'customerStories', storyId);
    const payload: Record<string, any> = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    if (updates.slug) {
      payload.slug = updates.slug.toLowerCase().trim();
    }
    if (updates.status === 'PUBLISHED' && !updates.publishedAt) {
      payload.publishedAt = Timestamp.now();
    }
    await updateDoc(storyRef, payload);
  } catch (error: any) {
    console.error('Error updating customer story:', error);
    throw error;
  }
};

/**
 * Deletes a CustomerStory document and cleans up any cover/gallery images.
 */
export const deleteCustomerStory = async (story: CustomerStory): Promise<void> => {
  try {
    // Clean up cover image if hosted in Firebase Storage
    if (story.coverImage) {
      await deleteImage(story.coverImage);
    }
    // Clean up gallery images if hosted in Firebase Storage
    if (story.gallery && story.gallery.length > 0) {
      for (const imgUrl of story.gallery) {
        await deleteImage(imgUrl);
      }
    }
    // Delete Firestore document
    await deleteDoc(doc(db, 'customerStories', story.id));
  } catch (error: any) {
    console.error('Error deleting customer story:', error);
    throw error;
  }
};

