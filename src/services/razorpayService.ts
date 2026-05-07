/**
 * Razorpay Payment Integration Service
 * Handles payment order creation, verification, and webhook processing
 */

import { db } from './firebaseService';
import { doc, setDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Payment } from '../types/database';

// Declare Razorpay types (from CDN)
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayKeyResponse {
  success: boolean;
  razorpayKeyId?: string;
  webhookUrl?: string;
}

interface PaymentOrderResponse {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  error?: string;
}

interface WebhookPayload {
  event: string;
  payload?: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
      };
    };
  };
}

/**
 * Load Razorpay script from CDN
 */
export const loadRazorpayScript = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Create a Razorpay payment order
 * NOTE: This should ideally call your backend API to securely create orders
 * For now, we'll prepare the client-side data
 */
export const createPaymentOrder = async (
  bookingId: string,
  packageId: string,
  userId: string,
  amount: number, // in smallest currency unit (paise for INR)
  currency: string = 'INR',
  isAdvancePayment: boolean = false,
  advancePercentage?: number,
  addOnsAmount?: number
): Promise<PaymentOrderResponse> => {
  try {
    // In production, this would call your backend API:
    // const response = await fetch('/api/payments/create-order', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     bookingId, packageId, userId, amount, currency, isAdvancePayment
    //   })
    // });
    
    // For now, generate a mock order ID
    const orderId = `order_${Date.now()}`;
    
    // Save payment record to Firestore
    await setDoc(doc(db, 'payments', orderId), {
      bookingId,
      packageId,
      userId,
      amount,
      currency,
      razorpayOrderId: orderId,
      status: 'pending',
      isAdvancePayment,
      advancePercentage,
      addOnsAmount,
      webhookVerified: false,
      paymentAttemptedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    } as Partial<Payment>);

    return {
      success: true,
      orderId,
      amount,
      currency
    };
  } catch (error) {
    console.error('Error creating payment order:', error);
    return {
      success: false,
      error: 'Failed to create payment order'
    };
  }
};

/**
 * Verify payment signature
 * In production, this verification should happen on your backend
 */
export const verifyPaymentSignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  keySecret: string
): boolean => {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', keySecret);
  hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
  const generated_signature = hmac.digest('hex');
  return generated_signature === razorpaySignature;
};

/**
 * Process payment and update booking/payment records
 */
export const processPaymentSuccess = async (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  bookingId: string
): Promise<boolean> => {
  try {
    // Find the payment record
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, where('razorpayOrderId', '==', razorpayOrderId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.error('Payment record not found for order:', razorpayOrderId);
      return false;
    }

    const paymentDoc = snapshot.docs[0];
    const paymentId = paymentDoc.id;

    // Update payment record
    await updateDoc(doc(db, 'payments', paymentId), {
      razorpayPaymentId,
      razorpaySignature,
      status: 'captured',
      webhookVerified: true,
      paymentCompletedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // Update booking status
    await updateDoc(doc(db, 'bookings', bookingId), {
      'payment.status': 'completed',
      'payment.razorpayPaymentId': razorpayPaymentId,
      bookingStatus: 'confirmed',
      updatedAt: Timestamp.now()
    });

    return true;
  } catch (error) {
    console.error('Error processing payment success:', error);
    return false;
  }
};

/**
 * Process payment failure
 */
export const processPaymentFailure = async (
  razorpayOrderId: string,
  errorCode: string,
  errorDescription: string,
  bookingId: string
): Promise<boolean> => {
  try {
    // Find the payment record
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, where('razorpayOrderId', '==', razorpayOrderId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.error('Payment record not found for order:', razorpayOrderId);
      return false;
    }

    const paymentDoc = snapshot.docs[0];
    const paymentId = paymentDoc.id;

    // Update payment record with failure info
    await updateDoc(doc(db, 'payments', paymentId), {
      status: 'failed',
      notes: `${errorCode}: ${errorDescription}`,
      updatedAt: Timestamp.now()
    });

    // Update booking status
    await updateDoc(doc(db, 'bookings', bookingId), {
      'payment.status': 'failed',
      'payment.failureReason': errorDescription,
      bookingStatus: 'pending',
      updatedAt: Timestamp.now()
    });

    return true;
  } catch (error) {
    console.error('Error processing payment failure:', error);
    return false;
  }
};

/**
 * Initiate Razorpay checkout (on client side)
 */
export interface CheckoutConfig {
  key: string;
  orderId: string;
  amount: number;
  currency: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  bookingTitle: string;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

export const initiateCheckout = async (config: CheckoutConfig): Promise<boolean> => {
  try {
    if (!window.Razorpay) {
      console.error('Razorpay script not loaded');
      return false;
    }

    const options = {
      key: config.key,
      order_id: config.orderId,
      amount: config.amount,
      currency: config.currency,
      name: 'No Fixed Address',
      description: config.bookingTitle,
      prefill: {
        email: config.userEmail,
        contact: config.userPhone,
        name: config.userName
      },
      theme: {
        color: '#9E1B1D' // NFA burgundy color
      },
      handler: function(response: any) {
        config.onSuccess(response);
      },
      modal: {
        ondismiss: function() {
          config.onFailure({ error: 'Payment cancelled by user' });
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
    return true;
  } catch (error) {
    console.error('Error initiating checkout:', error);
    return false;
  }
};

/**
 * Fetch payment records for admin dashboard
 */
export const getPaymentRecords = async (bookingId?: string) => {
  try {
    const paymentsRef = collection(db, 'payments');
    let q;
    
    if (bookingId) {
      q = query(paymentsRef, where('bookingId', '==', bookingId));
    } else {
      q = query(paymentsRef);
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching payment records:', error);
    return [];
  }
};

/**
 * Get payment status for a booking
 */
export const getPaymentStatus = async (bookingId: string) => {
  try {
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, where('bookingId', '==', bookingId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const latestPayment = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => b.createdAt?.toDate() - a.createdAt?.toDate())[0];

    return latestPayment;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return null;
  }
};

/**
 * Fetch global Razorpay settings from payment-settings collection
 */
export const getRazorpaySettings = async () => {
  try {
    const settingsRef = collection(db, 'payment-settings');
    const snapshot = await getDocs(settingsRef);

    if (snapshot.empty) {
      console.warn('No Razorpay settings configured');
      return null;
    }

    const settings = snapshot.docs[0].data();
    return {
      keyId: settings.keyId,
      keySecret: settings.keySecret,
      webhookUrl: settings.webhookUrl,
      webhookSecret: settings.webhookSecret,
      isActive: settings.isActive
    };
  } catch (error) {
    console.error('Error fetching Razorpay settings:', error);
    return null;
  }
};
