import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
 
/**
 * Custom hook to check if current user has admin role
 * Fetches the user's profile and checks for admin role
 */
export function useAdminAuth() {
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminRole() {
      if (!user || !session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user has admin role by querying their profile
        // For this implementation, we'll check if user email contains "admin" 
        // or if they have a specific role field in their profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setIsAdmin(false);
        } else {
          // Check admin status - you can modify this logic based on your needs
          // For now, checking if email contains "admin" or if profile has admin metadata
          const isUserAdmin = 
            user.email?.includes('admin') ||
            user.user_metadata?.role === 'admin' ||
            profile?.email?.includes('admin');
          
          setIsAdmin(Boolean(isUserAdmin));
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminRole();
  }, [user, session]);

  return { isAdmin, loading };
}