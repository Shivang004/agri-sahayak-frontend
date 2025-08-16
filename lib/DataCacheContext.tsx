"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Commodity, State, District, PriceData, QuantityData } from '@/lib/marketApi';
import type { WeatherData, LocationData } from '@/lib/weatherApi';
import type { ChatMessage } from '@/components/MessageList';

interface DataCacheContextType {
  // Market data cache
  commodities: Commodity[];
  states: State[];
  districts: { [stateId: number]: District[] };
  marketData: { [key: string]: { prices: PriceData[]; quantities: QuantityData[] } };
  
  // Selected values cache
  selectedCommodity: number | null;
  selectedState: number | null;
  selectedDistrict: number | null;
  fromDate: string;
  toDate: string;
  
  // Weather data cache
  weatherData: { [key: string]: WeatherData };
  locationData: LocationData | null;
  
  // Chat cache
  chatMessages: ChatMessage[];
  
  // Cache management functions
  setCommodities: (data: Commodity[]) => void;
  setStates: (data: State[]) => void;
  setDistricts: (stateId: number, data: District[]) => void;
  setMarketData: (key: string, prices: PriceData[], quantities: QuantityData[]) => void;
  setWeatherData: (key: string, data: WeatherData) => void;
  setLocationData: (data: LocationData) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;
  
  // Selected values management
  setSelectedCommodity: (commodityId: number | null) => void;
  setSelectedState: (stateId: number | null) => void;
  setSelectedDistrict: (districtId: number | null) => void;
  setDateRange: (fromDate: string, toDate: string) => void;
  
  // Cache validation
  isCommoditiesCached: () => boolean;
  isStatesCached: () => boolean;
  isDistrictsCached: (stateId: number) => boolean;
  isMarketDataCached: (key: string) => boolean;
  isWeatherDataCached: (key: string) => boolean;
  isChatCached: () => boolean;
  
  // Cache clearing
  clearMarketDataCache: () => void;
  clearWeatherDataCache: () => void;
  clearAllCache: () => void;
}

const DataCacheContext = createContext<DataCacheContextType | undefined>(undefined);

export function DataCacheProvider({ children }: { children: React.ReactNode }) {
  const [commodities, setCommoditiesState] = useState<Commodity[]>([]);
  const [states, setStatesState] = useState<State[]>([]);
  const [districts, setDistrictsState] = useState<{ [stateId: number]: District[] }>({});
  const [marketData, setMarketDataState] = useState<{ [key: string]: { prices: PriceData[]; quantities: QuantityData[] } }>({});
  const [weatherData, setWeatherDataState] = useState<{ [key: string]: WeatherData }>({});
  const [locationData, setLocationDataState] = useState<LocationData | null>(null);
  const [chatMessages, setChatMessagesState] = useState<ChatMessage[]>([]);
  
  // Selected values state
  const [selectedCommodity, setSelectedCommodityState] = useState<number | null>(null);
  const [selectedState, setSelectedStateState] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrictState] = useState<number | null>(null);
  const [fromDate, setFromDateState] = useState<string>('');
  const [toDate, setToDateState] = useState<string>('');

  const setCommodities = useCallback((data: Commodity[]) => {
    setCommoditiesState(data);
  }, []);

  const setStates = useCallback((data: State[]) => {
    setStatesState(data);
  }, []);

  const setDistricts = useCallback((stateId: number, data: District[]) => {
    setDistrictsState(prev => ({ ...prev, [stateId]: data }));
  }, []);

  const setMarketData = useCallback((key: string, prices: PriceData[], quantities: QuantityData[]) => {
    setMarketDataState(prev => ({ ...prev, [key]: { prices, quantities } }));
  }, []);

  const setWeatherData = useCallback((key: string, data: WeatherData) => {
    setWeatherDataState(prev => ({ ...prev, [key]: data }));
  }, []);

  const setLocationData = useCallback((data: LocationData) => {
    setLocationDataState(data);
  }, []);

  const setChatMessages = useCallback((messages: ChatMessage[]) => {
    setChatMessagesState(messages);
  }, []);

  const addChatMessage = useCallback((message: ChatMessage) => {
    setChatMessagesState(prev => [...prev, message]);
  }, []);

  const clearChatMessages = useCallback(() => {
    setChatMessagesState([]);
  }, []);

  // Selected values functions
  const setSelectedCommodity = useCallback((commodityId: number | null) => {
    setSelectedCommodityState(commodityId);
  }, []);

  const setSelectedState = useCallback((stateId: number | null) => {
    setSelectedStateState(stateId);
  }, []);

  const setSelectedDistrict = useCallback((districtId: number | null) => {
    setSelectedDistrictState(districtId);
  }, []);

  const setDateRange = useCallback((from: string, to: string) => {
    setFromDateState(from);
    setToDateState(to);
  }, []);

  const isCommoditiesCached = useCallback(() => {
    return commodities.length > 0;
  }, [commodities]);

  const isStatesCached = useCallback(() => {
    return states.length > 0;
  }, [states]);

  const isDistrictsCached = useCallback((stateId: number) => {
    return districts[stateId] && districts[stateId].length > 0;
  }, [districts]);

  const isMarketDataCached = useCallback((key: string) => {
    return marketData[key] !== undefined;
  }, [marketData]);

  const isWeatherDataCached = useCallback((key: string) => {
    return weatherData[key] !== undefined;
  }, [weatherData]);

  const isChatCached = useCallback(() => {
    return chatMessages.length > 0;
  }, [chatMessages]);

  const clearMarketDataCache = useCallback(() => {
    setMarketDataState({});
  }, []);

  const clearWeatherDataCache = useCallback(() => {
    setWeatherDataState({});
  }, []);

  const clearAllCache = useCallback(() => {
    setCommoditiesState([]);
    setStatesState([]);
    setDistrictsState({});
    setMarketDataState({});
    setWeatherDataState({});
    setLocationDataState(null);
    setSelectedCommodityState(null);
    setSelectedStateState(null);
    setSelectedDistrictState(null);
    setFromDateState('');
    setToDateState('');
    setChatMessagesState([]);
  }, []);

  const value: DataCacheContextType = {
    commodities,
    states,
    districts,
    marketData,
    weatherData,
    locationData,
    chatMessages,
    selectedCommodity,
    selectedState,
    selectedDistrict,
    fromDate,
    toDate,
    setCommodities,
    setStates,
    setDistricts,
    setMarketData,
    setWeatherData,
    setLocationData,
    setChatMessages,
    addChatMessage,
    clearChatMessages,
    setSelectedCommodity,
    setSelectedState,
    setSelectedDistrict,
    setDateRange,
    isCommoditiesCached,
    isStatesCached,
    isDistrictsCached,
    isMarketDataCached,
    isWeatherDataCached,
    isChatCached,
    clearMarketDataCache,
    clearWeatherDataCache,
    clearAllCache,
  };

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  );
}

export function useDataCache() {
  const context = useContext(DataCacheContext);
  if (context === undefined) {
    throw new Error('useDataCache must be used within a DataCacheProvider');
  }
  return context;
}
