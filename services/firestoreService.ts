import { db } from '../firebaseConfig';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, setDoc, query, orderBy, FirestoreError, writeBatch } from "firebase/firestore";
import { Incident, Candidate, ParliamentaryCandidate } from '../types';

// Collection References
const INCIDENTS_COL = 'incidents';
const PRES_CANDIDATES_COL = 'presidential_candidates';
const PARL_CANDIDATES_COL = 'parliamentary_candidates';

/**
 * Subscribe to Incidents
 */
export const subscribeToIncidents = (
    callback: (data: Incident[]) => void,
    onError?: (error: FirestoreError) => void
) => {
    if (!db) return () => {}; // No-op if DB not ready

    const q = query(collection(db, INCIDENTS_COL), orderBy('date', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
        const incidents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Incident[];
        callback(incidents);
    }, (error) => {
        // Suppress explicit console error to avoid noise when permission is denied
        // The UI will handle the fallback via onError
        if (onError) onError(error);
    });
};

export const addIncidentToDb = async (incident: Incident) => {
    if (!db) return;
    try {
        // We use the ID from the local object or let Firestore generate one
        const { id, ...data } = incident;
        await addDoc(collection(db, INCIDENTS_COL), data);
    } catch (e) {
        console.error("Error adding incident:", e);
        throw e;
    }
};

export const deleteIncidentFromDb = async (id: string) => {
    if (!db) return;
    try {
        await deleteDoc(doc(db, INCIDENTS_COL, id));
    } catch (e) {
        console.error("Error deleting incident:", e);
        throw e;
    }
};

/**
 * Subscribe to Presidential Candidates
 */
export const subscribeToPresidential = (
    callback: (data: Candidate[]) => void,
    onError?: (error: FirestoreError) => void
) => {
    if (!db) return () => {};

    const q = query(collection(db, PRES_CANDIDATES_COL), orderBy('projectedVoteShare', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const candidates = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Candidate[];
        callback(candidates);
    }, (error) => {
        if (onError) onError(error);
    });
};

export const addPresidentialToDb = async (candidate: Candidate) => {
    if (!db) return;
    const { id, ...data } = candidate;
    await addDoc(collection(db, PRES_CANDIDATES_COL), data);
};

export const deletePresidentialFromDb = async (id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, PRES_CANDIDATES_COL, id));
};

/**
 * Subscribe to Parliamentary Candidates
 */
export const subscribeToParliamentary = (
    callback: (data: ParliamentaryCandidate[]) => void,
    onError?: (error: FirestoreError) => void
) => {
    if (!db) return () => {};
    
    // Limits can be applied here if data is huge
    return onSnapshot(collection(db, PARL_CANDIDATES_COL), (snapshot) => {
        const candidates = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as ParliamentaryCandidate[];
        callback(candidates);
    }, (error) => {
        if (onError) onError(error);
    });
};

export const addParliamentaryToDb = async (candidate: ParliamentaryCandidate) => {
    if (!db) return;
    const { id, ...data } = candidate;
    await addDoc(collection(db, PARL_CANDIDATES_COL), data);
};

export const deleteParliamentaryFromDb = async (id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, PARL_CANDIDATES_COL, id));
};

/**
 * Helper to upload data in batches using SMART ID MAPPING
 * 1. Uses item.id as the Document Key (preventing duplicates).
 * 2. Uses { merge: true } to update existing records without data loss.
 * 3. Batches operations to 400 to respect Firestore limits (500).
 */
const batchUpload = async (collectionName: string, items: any[]) => {
    const BATCH_SIZE = 400;
    const total = items.length;
    let count = 0;

    console.log(`Starting SMART batch upload for ${collectionName}. Total items: ${total}`);

    for (let i = 0; i < total; i += BATCH_SIZE) {
        const chunk = items.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);
        
        chunk.forEach((item) => {
            // SAFETY: Use the item's existing ID as the Firestore Document ID.
            // This ensures idempotency (running script twice won't create duplicates).
            const docRef = item.id 
                ? doc(db, collectionName, String(item.id)) 
                : doc(collection(db, collectionName));
            
            // Merge: true ensures we update specific fields if they exist, rather than overwriting
            batch.set(docRef, item, { merge: true });
        });

        await batch.commit();
        count += chunk.length;
        console.log(`Uploaded batch: ${count}/${total} to ${collectionName}`);
    }
};

/**
 * ONE-TIME SEED FUNCTION
 * Call this button once to upload your local MOCK data to Firestore using Batches
 */
export const seedDatabase = async (
    incidents: Incident[], 
    presCandidates: Candidate[], 
    parlCandidates: ParliamentaryCandidate[]
) => {
    if (!db) {
        alert("Firebase not configured. Please check firebaseConfig.ts");
        return;
    }

    const confirmMsg = `Ready to upload massive dataset to Cloud:\n\n` +
        `- ${parlCandidates.length} Parliamentary Candidates\n` +
        `- ${presCandidates.length} Presidential Candidates\n` +
        `- ${incidents.length} Incidents\n\n` +
        `Mode: SMART BATCH (Duplicate Prevention Enabled).\n` + 
        `Click OK to start. This may take a few seconds.`;

    if (!window.confirm(confirmMsg)) return;

    try {
        // Upload Incidents
        await batchUpload(INCIDENTS_COL, incidents);

        // Upload Presidential
        await batchUpload(PRES_CANDIDATES_COL, presCandidates);

        // Upload Parliamentary (The big one)
        await batchUpload(PARL_CANDIDATES_COL, parlCandidates);
        
        alert("SUCCESS: All datasets successfully synchronized to Firestore Cloud.\n\nVerify in your Firebase Console.");
        
    } catch (e: any) {
        console.error("Seeding Error:", e);
        if (e.code === 'permission-denied') {
            alert("UPLOAD FAILED: Permission Denied.\n\nPlease go to Firebase Console > Firestore > Rules and change 'allow read, write: if false;' to 'allow read, write: if true;'");
        } else {
            alert(`Error seeding database: ${e.message}`);
        }
    }
};