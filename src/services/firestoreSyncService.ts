import { useState, useEffect } from 'react';
import {
  db,
  auth,
  handleFirestoreError,
  OperationType
} from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { UserProfile, JobOffer } from '../types';
import { UserAccount } from '../types/auth';

export type FirestoreSyncStatus =
  | 'connected'
  | 'syncing'
  | 'quota_exhausted'
  | 'demo_local'
  | 'offline';

export interface FirestoreStatusInfo {
  status: FirestoreSyncStatus;
  message: string;
  isQuotaExhausted: boolean;
  lastSyncTime?: string;
}

/**
 * Checks if the Firebase quota circuit breaker has been tripped for this session.
 */
function isQuotaExhausted(): boolean {
  if (typeof window !== 'undefined') {
    return (
      window.sessionStorage.getItem('firestore_quota_exhausted') === 'true' ||
      window.localStorage.getItem('firestore_quota_exhausted') === 'true'
    );
  }
  return false;
}

// Internal Pub/Sub for live status updates across components
type StatusListener = (info: FirestoreStatusInfo) => void;
const listeners = new Set<StatusListener>();

let currentStatusInfo: FirestoreStatusInfo = {
  status: isQuotaExhausted() ? 'quota_exhausted' : 'connected',
  message: isQuotaExhausted()
    ? 'Quota Firestore atteint (Mode local-first actif)'
    : 'Cloud Firestore connecté',
  isQuotaExhausted: isQuotaExhausted(),
};

export function updateFirestoreStatus(newInfo: Partial<FirestoreStatusInfo>) {
  currentStatusInfo = { ...currentStatusInfo, ...newInfo };
  listeners.forEach(fn => fn(currentStatusInfo));
}

export function subscribeFirestoreStatus(callback: StatusListener): () => void {
  callback(currentStatusInfo);
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * React Hook: Obtains the real-time Cloud Firestore connection & quota status
 */
export function useFirestoreSyncStatus(currentUserId?: string): FirestoreStatusInfo {
  const [status, setStatus] = useState<FirestoreStatusInfo>(() => {
    if (isQuotaExhausted()) {
      return {
        status: 'quota_exhausted',
        message: 'Quota journalier Firestore atteint (Mode local-first actif)',
        isQuotaExhausted: true
      };
    }
    if (currentUserId?.startsWith('demo-')) {
      return {
        status: 'demo_local',
        message: 'Mode Démo (Stockage local sécurisé)',
        isQuotaExhausted: false
      };
    }
    return currentStatusInfo;
  });

  useEffect(() => {
    const unsub = subscribeFirestoreStatus(setStatus);

    const handleQuotaEvent = () => {
      setStatus({
        status: 'quota_exhausted',
        message: 'Quota journalier Firestore atteint (Mode local-first actif)',
        isQuotaExhausted: true,
        lastSyncTime: currentStatusInfo.lastSyncTime
      });
    };

    const handleOnline = () => {
      if (!isQuotaExhausted()) {
        updateFirestoreStatus({ status: 'connected', message: 'Cloud Firestore reconnecté' });
      }
    };

    const handleOffline = () => {
      updateFirestoreStatus({ status: 'offline', message: 'Réseau hors-ligne • Cache actif' });
    };

    window.addEventListener('firestore-quota-change', handleQuotaEvent);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsub();
      window.removeEventListener('firestore-quota-change', handleQuotaEvent);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isQuotaExhausted()) {
    return {
      status: 'quota_exhausted',
      message: 'Quota journalier Firestore atteint • Données préservées en local',
      isQuotaExhausted: true,
      lastSyncTime: status.lastSyncTime
    };
  }

  if (currentUserId?.startsWith('demo-')) {
    return {
      status: 'demo_local',
      message: 'Session Démo (Stockage local actif)',
      isQuotaExhausted: false,
      lastSyncTime: status.lastSyncTime
    };
  }

  return status;
}

/**
 * Checks whether the current session is authorized to sync with Firestore.
 * Supports both authenticated Firebase users and demo sandbox sessions
 * authorized by firestore.rules, and respects quota limits.
 */
function canSyncWithFirestore(userId: string | undefined): boolean {
  if (!userId || isQuotaExhausted()) return false;
  if (userId === 'demo-user-lausanne' || userId.startsWith('demo-')) return true;
  return Boolean(auth.currentUser && auth.currentUser.uid === userId);
}

export const firestoreSyncService = {
  // 0. Save or Update User Account Identity in /users/{userId}
  async saveUserAccount(account: UserAccount): Promise<void> {
    if (!canSyncWithFirestore(account.id)) return;
    const docPath = `users/${account.id}`;
    try {
      const docRef = doc(db, 'users', account.id);
      await setDoc(docRef, {
        uid: account.id,
        email: account.email,
        fullName: account.fullName,
        trialExpiresAt: account.trialExpiresAt,
        subscriptionPlan: account.subscriptionPlan,
        updatedAt: new Date().toISOString(),
        createdAt: account.createdAt || new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  // Fetch User Account Identity from /users/{userId}
  async getUserAccount(userId: string): Promise<UserAccount | null> {
    if (!canSyncWithFirestore(userId)) return null;
    const docPath = `users/${userId}`;
    try {
      const docRef = doc(db, 'users', userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as UserAccount;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, docPath);
      return null;
    }
  },

  // 1. Save or Update User Candidate Profile
  async saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
    if (!canSyncWithFirestore(userId)) return;
    const docPath = `users/${userId}/profiles/main`;
    try {
      const docRef = doc(db, 'users', userId, 'profiles', 'main');
      await setDoc(docRef, {
        ...profile,
        userId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  // 2. Fetch User Candidate Profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!canSyncWithFirestore(userId)) return null;
    const docPath = `users/${userId}/profiles/main`;
    try {
      const docRef = doc(db, 'users', userId, 'profiles', 'main');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, docPath);
      return null;
    }
  },

  // 3. Realtime Listener for Candidate Profile
  subscribeToProfile(
    userId: string,
    onData: (profile: UserProfile) => void
  ): () => void {
    if (!canSyncWithFirestore(userId)) return () => {};
    const docPath = `users/${userId}/profiles/main`;
    const docRef = doc(db, 'users', userId, 'profiles', 'main');

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onData(snapshot.data() as UserProfile);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, docPath);
      }
    );

    return unsubscribe;
  },

  // 4. Save a single Job Offer to the User's personal pipeline
  async saveJobOffer(userId: string, job: JobOffer): Promise<void> {
    if (!canSyncWithFirestore(userId)) return;
    const docPath = `users/${userId}/jobs/${job.id}`;
    try {
      const jobDocRef = doc(db, 'users', userId, 'jobs', job.id);
      await setDoc(jobDocRef, {
        ...job,
        userId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  // 5. Delete a Job Offer from the User's pipeline
  async deleteJobOffer(userId: string, jobId: string): Promise<void> {
    if (!canSyncWithFirestore(userId)) return;
    const docPath = `users/${userId}/jobs/${jobId}`;
    try {
      const jobDocRef = doc(db, 'users', userId, 'jobs', jobId);
      await deleteDoc(jobDocRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },

  // 6. Realtime Listener for User's Job Pipeline
  subscribeToJobs(
    userId: string,
    onData: (jobs: JobOffer[]) => void
  ): () => void {
    if (!canSyncWithFirestore(userId)) return () => {};
    const collectionPath = `users/${userId}/jobs`;
    const collRef = collection(db, 'users', userId, 'jobs');

    const unsubscribe = onSnapshot(
      collRef,
      (snapshot) => {
        const jobs: JobOffer[] = [];
        snapshot.forEach((doc) => {
          jobs.push(doc.data() as JobOffer);
        });
        if (jobs.length > 0) {
          onData(jobs);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, collectionPath);
      }
    );

    return unsubscribe;
  }
};
