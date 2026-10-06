import {
  db,
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

export const firestoreSyncService = {
  // 0. Save or Update User Account Identity in /users/{userId}
  async saveUserAccount(account: UserAccount): Promise<void> {
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
