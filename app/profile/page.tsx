"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { getStates, getDistricts, type State, type District } from '@/lib/localData';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [states] = useState<State[]>(() => getStates());
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedState, setSelectedState] = useState<number | null>(user?.state_id || null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(user?.district_id || null);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  useEffect(() => {
    if (selectedState) {
      const districtsForState = getDistricts(selectedState);
      setDistricts(districtsForState);
      if (districtsForState.length > 0 && !selectedDistrict) {
        setSelectedDistrict(districtsForState[0].district_id);
      }
    } else {
      setDistricts([]);
      setSelectedDistrict(null);
    }
  }, [selectedState, selectedDistrict]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingLocation && (!selectedState || !selectedDistrict)) {
      alert('Please select both state and district');
      return;
    }
    
    const updateData: any = { username };
    if (password) {
      updateData.password = password;
    }
    if (isEditingLocation && selectedState && selectedDistrict) {
      updateData.state_id = selectedState;
      updateData.district_id = selectedDistrict;
    }
    
    await updateUser(updateData);
    alert('Profile updated successfully!');
    setIsEditingPassword(false);
    setIsEditingLocation(false);
    setPassword('');
  };

  const getStateName = (stateId: number) => {
    const state = states.find(s => s.state_id === stateId);
    return state?.state_name || 'Unknown';
  };

  const getDistrictName = (districtId: number) => {
    const district = districts.find(d => d.district_id === districtId);
    return district?.district_name || 'Unknown';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="mt-4 text-3xl font-bold text-green-600">{t('User Profile')}</h1>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">{t('Username')}</label>
            <p className="mt-1 text-lg">{username}</p>
          </div>

          <div>
            <button
              onClick={() => setIsEditingPassword(!isEditingPassword)}
              className="text-sm font-medium text-green-600 hover:underline"
            >
              {t('Change Password')}
            </button>
            {isEditingPassword && (
              <div className="mt-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {t('Enter New Password')}
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">{t('Current Location')}</label>
            <p className="mt-1 text-lg">
              {getStateName(user.state_id)}, {getDistrictName(user.district_id)}
            </p>
            <button
              onClick={() => setIsEditingLocation(!isEditingLocation)}
              className="text-sm font-medium text-green-600 hover:underline"
            >
              {t('Change Location')}
            </button>
            {isEditingLocation && (
              <div className="mt-2 space-y-4">
                <div>
                  <label htmlFor="state" className="text-sm font-medium text-gray-700">
                    State
                  </label>
                  <select
                    id="state"
                    name="state"
                    required
                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={selectedState || ''}
                    onChange={(e) => setSelectedState(Number(e.target.value) || null)}
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state.state_id} value={state.state_id}>
                        {state.state_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="district" className="text-sm font-medium text-gray-700">
                    District
                  </label>
                  <select
                    id="district"
                    name="district"
                    required
                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={selectedDistrict || ''}
                    onChange={(e) => setSelectedDistrict(Number(e.target.value) || null)}
                    disabled={!selectedState}
                  >
                    <option value="">Select District</option>
                    {districts.map(district => (
                      <option key={district.district_id} value={district.district_id}>
                        {district.district_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mt-6">
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {t('Update Profile')}
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link href="/" className="text-sm text-green-600 hover:underline">
            {t('Back To Home')}
          </Link>
        </div>
      </div>
    </div>
  );
}