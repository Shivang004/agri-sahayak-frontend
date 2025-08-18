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

type AuthView = 'home' | 'login' | 'signup';

export default function Page() {
  const { t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const { clearAllCache } = useDataCache();
  const [activeTab, setActiveTab] = useState<'chat' | 'market' | 'weather' | 'fertilizer'>('chat');
  const [authView, setAuthView] = useState<AuthView>('home');

  if (!isAuthenticated) {
    if (authView === 'signup') {
      return <Signup onSwitchToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'login') {
      return <Login onSwitchToSignup={() => setAuthView('signup')} />;
    }
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Agri Sahayak Logo" className="h-12 w-12" />
              <h1 className="text-2xl font-bold text-green-600">{t('title')}</h1>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <button
                onClick={() => setAuthView('login')}
                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              >
                {t('login')}
              </button>
              <button
                onClick={() => setAuthView('signup')}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                {t('Signup')}
              </button>
            </div>
          </div>
        </header>

        <section className="bg-gradient-to-b from-green-50 to-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-16 grid gap-8 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">{t('homeTagline')}</h2>
              <p className="mt-4 text-lg text-gray-600">
                {t('homeAbout')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => setAuthView('signup')}
                  className="px-6 py-3 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  {t('Create Your Account')}
                </button>
                <button
                  onClick={() => setAuthView('login')}
                  className="px-6 py-3 text-sm font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                >
                  {t('Already Have An Account')}
                </button>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md border">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold">AS</span>
                  <div>
                    <p className="text-sm text-gray-500">Assistant</p>
                    <p className="font-semibold text-gray-800">How can I help you today?</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>• {t('homeSample1')}</p>
                  <p>• {t('homeSample2')}</p>
                  <p>• {t('homeSample3')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border-t">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <h3 className="text-2xl font-bold text-gray-900">{t('homeHowToUse')}</h3>
            <ol className="mt-6 grid gap-6 md:grid-cols-3">
              <li className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold">1</div>
                <div>
                  <p className="font-semibold text-gray-800">{t('homeStep1Title')}</p>
                  <p className="text-gray-600 text-sm">{t('homeStep1Desc')}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold">2</div>
                <div>
                  <p className="font-semibold text-gray-800">{t('homeStep2Title')}</p>
                  <p className="text-gray-600 text-sm">{t('homeStep2Desc')}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold">3</div>
                <div>
                  <p className="font-semibold text-gray-800">{t('homeStep3Title')}</p>
                  <p className="text-gray-600 text-sm">{t('homeStep3Desc')}</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section className="bg-gray-50 border-t">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <h3 className="text-2xl font-bold text-gray-900">{t('homeFeaturesTitle')}</h3>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <p className="font-semibold text-gray-800">{t('featureChatTitle')}</p>
                <p className="mt-2 text-sm text-gray-600">{t('featureChatDesc')}</p>
              </div>
              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <p className="font-semibold text-gray-800">{t('featureMarketTitle')}</p>
                <p className="mt-2 text-sm text-gray-600">{t('featureMarketDesc')}</p>
              </div>
              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <p className="font-semibold text-gray-800">{t('featureWeatherTitle')}</p>
                <p className="mt-2 text-sm text-gray-600">{t('featureWeatherDesc')}</p>
              </div>
              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <p className="font-semibold text-gray-800">{t('featureFertilizerTitle')}</p>
                <p className="mt-2 text-sm text-gray-600">{t('featureFertilizerDesc')}</p>
              </div>
              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <p className="font-semibold text-gray-800">{t('featureLanguageTitle')}</p>
                <p className="mt-2 text-sm text-gray-600">{t('featureLanguageDesc')}</p>
              </div>
              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <p className="font-semibold text-gray-800">{t('featureFastTitle')}</p>
                <p className="mt-2 text-sm text-gray-600">{t('featureFastDesc')}</p>
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={() => setAuthView('signup')}
                className="px-6 py-3 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                {t('Create Your Account')}
              </button>
            </div>
          </div>
        </section>

        <footer className="border-t bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-gray-500">
            © {new Date().getFullYear()} {t('title')}. {t('homeFooter')}
          </div>
        </footer>
      </main>
    );
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