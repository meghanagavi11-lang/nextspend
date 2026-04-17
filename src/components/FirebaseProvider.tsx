import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, query, where, orderBy, doc, getDocFromServer } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { OperationType, handleFirestoreError } from '../lib/utils';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  expenses: any[];
  goals: any[];
  subscriptions: any[];
  bills: any[];
  familyGroups: any[];
  investments: any[];
  isAuthReady: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [familyGroups, setFamilyGroups] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Test connection
  useEffect(() => {
    if (isAuthReady) {
      const testConnection = async () => {
        try {
          await getDocFromServer(doc(db, 'test', 'connection'));
        } catch (error) {
          if (error instanceof Error && error.message.includes('the client is offline')) {
            console.error("Please check your Firebase configuration. The client is offline.");
          }
        }
      };
      testConnection();
    }
  }, [isAuthReady]);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setGoals([]);
      setSubscriptions([]);
      setBills([]);
      setFamilyGroups([]);
      setInvestments([]);
      return;
    }

    const expensesQuery = query(
      collection(db, 'expenses'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'expenses', auth));

    const goalsQuery = query(
      collection(db, 'goals'),
      where('uid', '==', user.uid)
    );

    const unsubGoals = onSnapshot(goalsQuery, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'goals', auth));

    const subsQuery = query(
      collection(db, 'subscriptions'),
      where('uid', '==', user.uid)
    );

    const unsubSubs = onSnapshot(subsQuery, (snapshot) => {
      setSubscriptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'subscriptions', auth));

    const billsQuery = query(
      collection(db, 'bills'),
      where('uid', '==', user.uid)
    );

    const unsubBills = onSnapshot(billsQuery, (snapshot) => {
      setBills(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'bills', auth));

    const groupsQuery = query(
      collection(db, 'familyGroups'),
      where('memberUids', 'array-contains', user.uid)
    );

    const unsubGroups = onSnapshot(groupsQuery, (snapshot) => {
      setFamilyGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'familyGroups', auth));

    const investmentsQuery = query(
      collection(db, 'investments'),
      where('uid', '==', user.uid)
    );

    const unsubInvestments = onSnapshot(investmentsQuery, (snapshot) => {
      setInvestments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'investments', auth));

    return () => {
      unsubExpenses();
      unsubGoals();
      unsubSubs();
      unsubBills();
      unsubGroups();
      unsubInvestments();
    };
  }, [user]);

  return (
    <FirebaseContext.Provider value={{ user, loading, expenses, goals, subscriptions, bills, familyGroups, investments, isAuthReady }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
