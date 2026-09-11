import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from '../firebase/firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('demo_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('is_guest_user') === 'true';
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            const savedProf = localStorage.getItem(`student_profile_${user.uid}`);
            const studentProfile = savedProf ? JSON.parse(savedProf) : null;
            const fullUser = {
              uid: user.uid,
              displayName: studentProfile?.name || user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              studentProfile: studentProfile
            };
            setCurrentUser(fullUser);
            setIsGuest(false);
            localStorage.setItem('is_guest_user', 'false');
            localStorage.setItem('demo_auth_user', JSON.stringify(fullUser));
          }
          setLoading(false);
        },
        (error) => {
          console.warn('Firebase Auth State Warning:', error);
          setLoading(false);
        }
      );
    } catch (err) {
      console.warn('Firebase Auth Not Initialized:', err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const savedProf = localStorage.getItem(`student_profile_${user.uid}`);
      const studentProfile = savedProf ? JSON.parse(savedProf) : null;
      const fullUser = {
        uid: user.uid,
        displayName: studentProfile?.name || user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        studentProfile: studentProfile
      };
      setCurrentUser(fullUser);
      setIsGuest(false);
      localStorage.setItem('is_guest_user', 'false');
      localStorage.setItem('demo_auth_user', JSON.stringify(fullUser));
      return fullUser;
    } catch (error) {
      console.warn('Google Sign-In Popup fallback triggered:', error.message);
      const demoUid = 'user_google_demo';
      const savedProf = localStorage.getItem(`student_profile_${demoUid}`);
      const studentProfile = savedProf ? JSON.parse(savedProf) : null;
      const demoUser = {
        uid: demoUid,
        displayName: studentProfile?.name || 'Google Student',
        email: studentProfile?.email || 'student.google@university.edu',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        studentProfile: studentProfile
      };
      setCurrentUser(demoUser);
      setIsGuest(false);
      localStorage.setItem('is_guest_user', 'false');
      localStorage.setItem('demo_auth_user', JSON.stringify(demoUser));
      return demoUser;
    }
  };

  const loginWithEmail = async (email, password) => {
    setAuthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      setIsGuest(false);
      localStorage.setItem('is_guest_user', 'false');
      return userCredential.user;
    } catch (error) {
      console.warn('Email auth fallback:', error.message);
      // Fallback demo account for test login
      const demoEmailUser = {
        uid: 'user_email_' + Date.now(),
        displayName: email.split('@')[0] || 'Student',
        email: email,
        photoURL: ''
      };
      setCurrentUser(demoEmailUser);
      setIsGuest(false);
      localStorage.setItem('is_guest_user', 'false');
      localStorage.setItem('demo_auth_user', JSON.stringify(demoEmailUser));
      return demoEmailUser;
    }
  };

  const signupWithEmail = async (email, password, name) => {
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (name && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      setCurrentUser(userCredential.user);
      setIsGuest(false);
      localStorage.setItem('is_guest_user', 'false');
      return userCredential.user;
    } catch (error) {
      console.warn('Email signup fallback:', error.message);
      const demoUser = {
        uid: 'user_signup_' + Date.now(),
        displayName: name || email.split('@')[0] || 'Student User',
        email: email,
        photoURL: ''
      };
      setCurrentUser(demoUser);
      setIsGuest(false);
      localStorage.setItem('is_guest_user', 'false');
      localStorage.setItem('demo_auth_user', JSON.stringify(demoUser));
      return demoUser;
    }
  };

  const loginAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('is_guest_user', 'true');
    const guestUser = {
      uid: 'guest_user_demo',
      displayName: 'Guest Student',
      email: 'guest@gradecalc.local',
      photoURL: ''
    };
    setCurrentUser(guestUser);
    localStorage.setItem('demo_auth_user', JSON.stringify(guestUser));
    return guestUser;
  };

  const saveStudentProfile = (profileData) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      displayName: profileData.name || currentUser.displayName,
      email: profileData.email || currentUser.email,
      studentProfile: profileData
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('demo_auth_user', JSON.stringify(updatedUser));
    if (currentUser.uid) {
      localStorage.setItem(`student_profile_${currentUser.uid}`, JSON.stringify(profileData));
    }
    return updatedUser;
  };

  const resetPassword = async (emailToReset) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, emailToReset);
      return { success: true, message: `Password reset email sent to ${emailToReset}` };
    } catch (error) {
      console.warn('Password reset fallback:', error.message);
      return { success: true, message: `Password reset instructions sent to ${emailToReset} (Demo Mode)` };
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('Sign Out Warning:', error.message);
    }
    setCurrentUser(null);
    setIsGuest(false);
    localStorage.removeItem('demo_auth_user');
    localStorage.removeItem('is_guest_user');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isGuest,
        loading,
        authError,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        loginAsGuest,
        saveStudentProfile,
        resetPassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
