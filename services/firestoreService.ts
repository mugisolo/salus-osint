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
    onError?: (error: FirestoreError) => void,
    onEmpty?: () => void
) => {
    if (!db) return () => {}; // No-op if DB not ready

    const q = query(collection(db, INCIDENTS_COL), orderBy('date', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
        if (snapshot.empty && onEmpty) {
            onEmpty();
        }
        const incidents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Incident[];
        callback(incidents);
    }, (error) => {
        if (onError && error.code !== 'permission-denied') onError(error);
    });
};

export const addIncidentToDb = async (incident: Incident) => {
    if (!db) return;
    try {
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
        if (onError && error.code !== 'permission-denied') onError(error);
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
    
    return onSnapshot(collection(db, PARL_CANDIDATES_COL), (snapshot) => {
        const candidates = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as ParliamentaryCandidate[];
        callback(candidates);
    }, (error) => {
        if (onError && error.code !== 'permission-denied') onError(error);
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
 * Helper: Remove undefined values from object
 * Firestore rejects undefined, so we must replace or remove them.
 */
const sanitizeData = (data: any) => {
    // JSON stringify/parse automatically removes undefined keys
    return JSON.parse(JSON.stringify(data));
};

/**
 * Helper to upload data in batches using SMART ID MAPPING
 */
const batchUpload = async (collectionName: string, items: any[], onProgress?: (msg: string) => void) => {
    const BATCH_SIZE = 300; // Updated to 300 as requested for stability
    const total = items.length;
    let count = 0;

    if (onProgress) onProgress(`Starting upload for ${collectionName} (${total} items)...`);

    for (let i = 0; i < total; i += BATCH_SIZE) {
        const chunk = items.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);
        
        chunk.forEach((item) => {
            // Use existing ID if available to prevent duplicates
            const docRef = item.id 
                ? doc(db, collectionName, String(item.id)) 
                : doc(collection(db, collectionName));
            
            // IMPORTANT: Sanitize data to remove 'undefined' fields which cause Firestore errors
            const cleanItem = sanitizeData(item);
            
            batch.set(docRef, cleanItem, { merge: true });
        });

        try {
            await batch.commit();
            count += chunk.length;
            if (onProgress) onProgress(`Uploaded ${count}/${total} to ${collectionName}`);
            
            // Increased delay to 500ms to be gentle on rate limits and prevent browser hang
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
            console.error(`Batch failed at index ${i}:`, err);
            if (onProgress) onProgress(`Error uploading batch ${i}-${i+BATCH_SIZE}. Checking console.`);
            throw err; // Re-throw to stop process or let caller handle
        }
    }
};

/**
 * ONE-TIME SEED FUNCTION
 */
export const seedDatabase = async (
    incidents: Incident[], 
    presCandidates: Candidate[], 
    parlCandidates: ParliamentaryCandidate[],
    onProgress: (msg: string) => void,
    onComplete: () => void
) => {
    if (!db) {
        alert("Firebase not configured.");
        return;
    }

    try {
        // Only upload Incidents if needed
        if (incidents.length > 0) await batchUpload(INCIDENTS_COL, incidents, onProgress);
        
        // Only upload Presidential if needed
        if (presCandidates.length > 0) await batchUpload(PRES_CANDIDATES_COL, presCandidates, onProgress);
        
        // Upload the large Parliamentary dataset
        if (parlCandidates.length > 0) {
            await batchUpload(PARL_CANDIDATES_COL, parlCandidates, onProgress);
        }
        
        onComplete();
    } catch (e: any) {
        console.error("Seeding Error:", e);
        if (e.code === 'permission-denied') {
            alert("UPLOAD FAILED: Permission Denied. Please check your Firestore Security Rules in the Firebase Console.");
        } else {
            alert(`Error seeding database: ${e.message}`);
        }
    }
};