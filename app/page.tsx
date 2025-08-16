"use client";

import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useDataCache } from '@/lib/DataCacheContext';
import ChatInterface from '@/components/ChatInterface';
import FertilizerTool from '@/components/FertilizerTool';
import MarketData from '@/components/MarketData';
import WeatherForecast from '@/components/WeatherForecast';
import LanguageSelector from '@/components/LanguageSelector';
import { useAuth } from '@/lib/AuthContext';
import Login from '@/components/Login';
import Signup from '@/components/Signup';
import Link from 'next/link';

type AuthView = 'login' | 'signup';

export default function Page() {
  const { t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const { clearAllCache } = useDataCache();
  const [activeTab, setActiveTab] = useState<'chat' | 'market' | 'weather' | 'fertilizer'>('chat');
  const [authView, setAuthView] = useState<AuthView>('login');

  if (!isAuthenticated) {
    if (authView === 'signup') {
      return <Signup onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <Login onSwitchToSignup={() => setAuthView('signup')} />;
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case 'market':
        return <MarketData />;
      case 'weather':
        return <WeatherForecast />;
      case 'fertilizer':
        return <FertilizerTool />;
      case 'chat':
      default:
        return (
          <div className="flex h-full">
            <div className="flex w-full flex-col">
              <ChatInterface />
            </div>
          </div>
        );
    }
  };

  return (
    <main className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex-shrink-0 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Image Logo */}
              <img 
                src="/logo.png" 
                alt="Agri Sahayak Logo" 
                className="h-12 w-12"
              />
              <h1 className="text-2xl font-bold text-green-600">{t('title')}</h1>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Link href="/profile" className="p-2 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
              <button
                onClick={() => {
                  clearAllCache();
                  logout();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex-shrink-0 border-b bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chat'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('chat')}
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'market'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('marketPrices')}
            </button>
            <button
              onClick={() => setActiveTab('weather')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'weather'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('weatherForecast')}
            </button>
            <button
              onClick={() => setActiveTab('fertilizer')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'fertilizer'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('fertilizerTool')}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow overflow-hidden p-6">
        <div className="mx-auto h-full max-w-7xl">
          <div className="h-full overflow-y-auto">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </main>
  );
}