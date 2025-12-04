import { db } from '../firebaseConfig';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, setDoc, query, orderBy } from "firebase/firestore";
import { Incident, Candidate, ParliamentaryCandidate } from '../types';

// Collection References
const INCIDENTS_COL = 'incidents';
const PRES_CANDIDATES_COL = 'presidential_candidates';
const PARL_CANDIDATES_COL = 'parliamentary_candidates';

/**
 * Subscribe to Incidents
 */
export const subscribeToIncidents = (callback: (data: Incident[]) => void) => {
    if (!db) return () => {}; // No-op if DB not ready

    const q = query(collection(db, INCIDENTS_COL), orderBy('date', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
        const incidents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Incident[];
        callback(incidents);
    }, (error) => {
        console.error("Error listening to incidents:", error);
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
    }
};

export const deleteIncidentFromDb = async (id: string) => {
    if (!db) return;
    try {
        await deleteDoc(doc(db, INCIDENTS_COL, id));
    } catch (e) {
        console.error("Error deleting incident:", e);
    }
};

/**
 * Subscribe to Presidential Candidates
 */
export const subscribeToPresidential = (callback: (data: Candidate[]) => void) => {
    if (!db) return () => {};

    const q = query(collection(db, PRES_CANDIDATES_COL), orderBy('projectedVoteShare', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const candidates = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Candidate[];
        callback(candidates);
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
export const subscribeToParliamentary = (callback: (data: ParliamentaryCandidate[]) => void) => {
    if (!db) return () => {};
    
    // Limits can be applied here if data is huge
    return onSnapshot(collection(db, PARL_CANDIDATES_COL), (snapshot) => {
        const candidates = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as ParliamentaryCandidate[];
        callback(candidates);
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
 * ONE-TIME SEED FUNCTION
 * Call this button once to upload your local MOCK data to Firestore
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

    if (!window.confirm("This will upload all current MOCK data to Firestore. Continue?")) return;

    try {
        console.log("Seeding Incidents...");
        for (const i of incidents) {
            const { id, ...data } = i; // Let firestore create IDs
            await addDoc(collection(db, INCIDENTS_COL), data);
        }

        console.log("Seeding Presidential...");
        for (const c of presCandidates) {
            const { id, ...data } = c;
            await addDoc(collection(db, PRES_CANDIDATES_COL), data);
        }

        console.log("Seeding Parliamentary (First 50 to save quota)...");
        for (const c of parlCandidates.slice(0, 50)) {
            const { id, ...data } = c;
            await addDoc(collection(db, PARL_CANDIDATES_COL), data);
        }
        
        alert("Database Seeding Complete! The Dashboard will now update in real-time.");
    } catch (e) {
        console.error("Seeding Error:", e);
        alert("Error seeding database. Check console.");
    }
};
