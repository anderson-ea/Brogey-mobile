import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import * as Google from "expo-google-app-auth";
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut } from "@firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext({});

const config = {
  androidClientId: "secretKey.apps.googleusercontent.com",
  iosClientId: "secretKey.apps.googleusercontent.com",
  scope: ["profile", "email"],
  permissions: ["public_profile", "email", "gender", "location"],
};

export const AuthProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(
    () => 
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // logged in
          setUser(user);
        } else {
          // not logged in
          setUser(null);
        }
      
        setLoadingInitial(false)
      }), 
    []
  );
  const logout = () => {
    setLoading(true);
    signOut(auth)
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  };

  const signInWithGoogle = async () => {
    setLoading(true);

    await Google.logInAsync(config).then(async (logInResult) => {
      if (logInResult.type === "success") {
        const { idToken, accessToken } = logInResult;
        const credential = GoogleAuthProvider.credential(idToken, accessToken);

        await signInWithCredential(auth, credential);
      }
      return Promise.reject();
    })
    .catch(error => setError(error))
    .finally(() => setLoading(false));
  };

  const memoedValue = useMemo(() => ({
    user,
    loading,
    error,
    signInWithGoogle,
    logout,
  }), [user, loading, error])

  return (
    <AuthContext.Provider value={memoedValue}>
      {!loadingInitial && children}
    </AuthContext.Provider>
  );
};

export default function useAuth() {
  return useContext(AuthContext);
}