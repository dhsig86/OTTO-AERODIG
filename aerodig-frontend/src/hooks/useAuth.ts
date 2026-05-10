import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { getAuthSafe, googleProvider } from '../services/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuthSafe();
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function login() {
    const auth = getAuthSafe();
    if (!auth) return;
    await signInWithPopup(auth, googleProvider);
  }

  async function logout() {
    const auth = getAuthSafe();
    if (!auth) return;
    await signOut(auth);
  }

  return { user, loading, login, logout };
}
