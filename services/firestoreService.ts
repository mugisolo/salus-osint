import { db } from '../firebaseConfig';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, setDoc, query, orderBy, FirestoreError, writeBatch, getDocs, limit } from "firebase/firestore";
import { Incident, Candidate, ParliamentaryCandidate, SitRep } from '../types';

const INCIDENTS_COL = 'incidents';
const PRES_CANDIDATES_COL = 'presidential_candidates';
const PARL_CANDIDATES_COL = 'parliamentary_candidates';
const SITREP_COL = 'sitreps';

export const subscribeToIncidents = (callback: (data: Incident[]) => void, onError?: (error: FirestoreError) => void, onEmpty?: () => void) => {
    if (!db) return () => {}; 
    const q = query(collection(db, INCIDENTS_COL), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
        if (snapshot.empty && onEmpty) onEmpty();
        const incidents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Incident[];
        callback(incidents);
    }, (error) => {
        if (onError && error.code !== 'permission-denied') onError(error);
    });
};

export const addIncidentToDb = async (incident: Incident) => {
    if (!db) return;
    const { id, ...data } = incident;
    await addDoc(collection(db, INCIDENTS_COL), data);
};

// Fixed: Added missing export deleteIncidentFromDb
export const deleteIncidentFromDb = async (id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, INCIDENTS_COL, id));
};

export const subscribeToPresidential = (callback: (data: Candidate[]) => void, onError?: (error: FirestoreError) => void) => {
    if (!db) return () => {};
    const q = query(collection(db, PRES_CANDIDATES_COL), orderBy('projectedVoteShare', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const candidates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Candidate[];
        callback(candidates);
    }, (error) => {
        if (onError && error.code !== 'permission-denied') onError(error);
    });
};

// Fixed: Added missing export addPresidentialToDb
export const addPresidentialToDb = async (candidate: Candidate) => {
    if (!db) return;
    const { id, ...data } = candidate;
    await addDoc(collection(db, PRES_CANDIDATES_COL), data);
};

// Fixed: Added missing export deletePresidentialFromDb
export const deletePresidentialFromDb = async (id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, PRES_CANDIDATES_COL, id));
};

export const subscribeToParliamentary = (callback: (data: ParliamentaryCandidate[]) => void, onError?: (error: FirestoreError) => void) => {
    if (!db) return () => {};
    return onSnapshot(collection(db, PARL_CANDIDATES_COL), (snapshot) => {
        const candidates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ParliamentaryCandidate[];
        callback(candidates);
    }, (error) => {
        if (onError && error.code !== 'permission-denied') onError(error);
    });
};

// Fixed: Added missing export addParliamentaryToDb
export const addParliamentaryToDb = async (candidate: ParliamentaryCandidate) => {
    if (!db) return;
    const { id, ...data } = candidate;
    await addDoc(collection(db, PARL_CANDIDATES_COL), data);
};

// Fixed: Added missing export deleteParliamentaryFromDb
export const deleteParliamentaryFromDb = async (id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, PARL_CANDIDATES_COL, id));
};

export const saveSitRep = async (sitRep: SitRep) => {
    if (!db) return;
    await addDoc(collection(db, SITREP_COL), sitRep);
};

export const getSitRepHistory = async (): Promise<SitRep[]> => {
    if (!db) return [];
    try {
        const q = query(collection(db, SITREP_COL), orderBy('timestamp', 'desc'), limit(30));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SitRep[];
    } catch (e: any) {
        return [];
    }
};

const sanitizeData = (data: any) => JSON.parse(JSON.stringify(data));

const batchUpload = async (collectionName: string, items: any[], onProgress?: (msg: string) => void) => {
    if (!db) return;
    const BATCH_SIZE = 300;
    const total = items.length;
    for (let i = 0; i < total; i += BATCH_SIZE) {
        const chunk = items.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);
        chunk.forEach((item) => {
            const docRef = item.id ? doc(db, collectionName, String(item.id)) : doc(collection(db, collectionName));
            batch.set(docRef, sanitizeData(item), { merge: true });
        });
        await batch.commit();
        if (onProgress) onProgress(`Uploaded ${Math.min(i + BATCH_SIZE, total)}/${total}`);
    }
};

export const seedDatabase = async (incidents: Incident[], presCandidates: Candidate[], parlCandidates: ParliamentaryCandidate[], onProgress: (msg: string) => void, onComplete: () => void) => {
    if (!db) return;
    try {
        if (incidents.length > 0) await batchUpload(INCIDENTS_COL, incidents, onProgress);
        if (presCandidates.length > 0) await batchUpload(PRES_CANDIDATES_COL, presCandidates, onProgress);
        if (parlCandidates.length > 0) await batchUpload(PARL_CANDIDATES_COL, parlCandidates, onProgress);
        onComplete();
    } catch (e: any) {
        console.error(e);
    }
};