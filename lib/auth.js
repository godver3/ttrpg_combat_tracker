import { useEffect } from 'react';
import { useRouter } from 'next/router';

export const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user && router.pathname !== '/login') {
      router.push('/login');
    }
  }, [router]);

  return null;
};

export const getUser = () => {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('user'));
  }
  return null;
};
