// app/page.tsx
'use client'

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { ESP32RealtimeControl } from '@/components/ESP32RoomControl';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-4xl font- text-gray-900 mb-4">
       FPI
        </h1>
        <img src='/logo.png' className='mx-auto my-3 w-[250px]'/>
        <p className="text-gray-500 mb-8 max-w-md">
         Platform FPI pour demande de financement et suivi des projets. Vous pouvez accéder à votre dashboard pour gérer vos projets et consulter les informations pertinentes.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
        >
          Accéder au dashboard
          <FaArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
     
    </div>
  );
}
