import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { Login } from './auth/Login';
import { SignUp } from './auth/SignUp';
import { ForgotPassword } from './auth/ForgotPassword';
import { LocationAccess } from './LocationAccess';
import { toast } from 'sonner@2.0.3';
import { translate } from '../utils/translations';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AuthWrapperProps {
  children: React.ReactNode;
  language: string;
}

type AuthState = 'login' | 'signup' | 'forgot-password';

interface User {
  id: string;
  email: string;
  name: string;
}

interface UserProfile {
  name: string;
  location: string;
  preferred_language: string;
  latitude?: number;
  longitude?: number;
}

export function AuthWrapper({ children, language }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authState, setAuthState] = useState<AuthState>('login');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email || ''
        };
        setUser(userData);
        
        // Fetch user profile
        await fetchUserProfile(session.access_token);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Check user error:', error);
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (accessToken: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5dea8d1f/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { profile } = await response.json();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    setAuthLoading(true);
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5dea8d1f/auth/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || translate('signUpError', language));
      }

      // Sign in the user after successful signup
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      if (signInData.user && signInData.session) {
        const userData = {
          id: signInData.user.id,
          email: signInData.user.email || '',
          name: signInData.user.user_metadata?.name || name
        };
        setUser(userData);
        
        // Create initial profile
        await createUserProfile(signInData.session.access_token, name);
        
        // Show location modal for new users
        setShowLocationModal(true);
        
        toast.success(translate('createAccount', language) + ' ' + translate('successful', language));
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user && data.session) {
        const userData = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email || ''
        };
        setUser(userData);
        
        // Fetch existing profile
        await fetchUserProfile(data.session.access_token);
        
        toast.success(translate('welcomeBack', language));
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    setAuthLoading(true);
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5dea8d1f/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || translate('resetPasswordError', language));
      }

      toast.success(translate('resetEmailSent', language));
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const createUserProfile = async (accessToken: string, name: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5dea8d1f/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          location: '',
          preferred_language: language
        })
      });

      if (response.ok) {
        const profile = {
          name,
          location: '',
          preferred_language: language
        };
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Create profile error:', error);
    }
  };

  const handleLocationAllowed = async (latitude: number, longitude: number, address: string) => {
    if (!user) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5dea8d1f/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: address,
          latitude,
          longitude,
          preferred_language: language
        })
      });

      if (response.ok) {
        setUserProfile(prev => prev ? {
          ...prev,
          location: address,
          latitude,
          longitude
        } : null);
        setShowLocationModal(false);
        toast.success(translate('locationUpdated', language) || 'Location updated successfully');
      }
    } catch (error) {
      console.error('Update location error:', error);
      toast.error(translate('locationError', language));
    }
  };

  const handleLocationDenied = () => {
    setShowLocationModal(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      toast.success(translate('signedOut', language) || 'Signed out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-green-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const renderAuthComponent = () => {
      switch (authState) {
        case 'signup':
          return (
            <SignUp
              onSignUp={handleSignUp}
              onSwitchToLogin={() => setAuthState('login')}
              language={language}
              isLoading={authLoading}
            />
          );
        case 'forgot-password':
          return (
            <ForgotPassword
              onResetPassword={handleForgotPassword}
              onBackToLogin={() => setAuthState('login')}
              language={language}
              isLoading={authLoading}
            />
          );
        default:
          return (
            <Login
              onLogin={handleLogin}
              onSwitchToSignUp={() => setAuthState('signup')}
              onForgotPassword={() => setAuthState('forgot-password')}
              language={language}
              isLoading={authLoading}
            />
          );
      }
    };

    return renderAuthComponent();
  }

  return (
    <>
      {children}
      {showLocationModal && (
        <LocationAccess
          onLocationAllowed={handleLocationAllowed}
          onLocationDenied={handleLocationDenied}
          language={language}
        />
      )}
    </>
  );
}