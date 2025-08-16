"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useDataCache } from '@/lib/DataCacheContext';
import { 
  fetchCommodities, 
  fetchStates,
  fetchDistricts,
  fetchPrices, 
  fetchQuantities,
  aggregateDataByDate,
  getLatestDataPoint,
  type Commodity,
  type State,
  type District,
  type PriceData,
  type QuantityData
} from '@/lib/marketApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, subMonths } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function MarketData() {
  const { t } = useLanguage();
  const {
    commodities: cachedCommodities,
    states: cachedStates,
    districts: cachedDistricts,
    marketData: cachedMarketData,
    selectedCommodity: cachedSelectedCommodity,
    selectedState: cachedSelectedState,
    selectedDistrict: cachedSelectedDistrict,
    fromDate: cachedFromDate,
    toDate: cachedToDate,
    setCommodities,
    setStates,
    setDistricts,
    setMarketData,
    setSelectedCommodity,
    setSelectedState,
    setSelectedDistrict,
    setDateRange,
    isCommoditiesCached,
    isStatesCached,
    isDistrictsCached,
    isMarketDataCached
  } = useDataCache();

  // Use cached values or defaults
  const [selectedCommodity, setSelectedCommodityLocal] = useState<number | null>(
    cachedSelectedCommodity || null
  );
  const [selectedState, setSelectedStateLocal] = useState<number | null>(
    cachedSelectedState || null
  );
  const [selectedDistrict, setSelectedDistrictLocal] = useState<number | null>(
    cachedSelectedDistrict || null
  );
  const [fromDate, setFromDateLocal] = useState<string>(
    cachedFromDate || format(subMonths(new Date(), 3), 'yyyy-MM-dd')
  );
  const [toDate, setToDateLocal] = useState<string>(
    cachedToDate || format(new Date(), 'yyyy-MM-dd')
  );
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [quantityData, setQuantityData] = useState<QuantityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Update cache when local state changes
  useEffect(() => {
    if (selectedCommodity !== cachedSelectedCommodity) {
      setSelectedCommodity(selectedCommodity);
    }
  }, [selectedCommodity, cachedSelectedCommodity, setSelectedCommodity]);

  useEffect(() => {
    if (selectedState !== cachedSelectedState) {
      setSelectedState(selectedState);
    }
  }, [selectedState, cachedSelectedState, setSelectedState]);

  useEffect(() => {
    if (selectedDistrict !== cachedSelectedDistrict) {
      setSelectedDistrict(selectedDistrict);
    }
  }, [selectedDistrict, cachedSelectedDistrict, setSelectedDistrict]);

  useEffect(() => {
    if (fromDate !== cachedFromDate || toDate !== cachedToDate) {
      setDateRange(fromDate, toDate);
    }
  }, [fromDate, toDate, cachedFromDate, cachedToDate, setDateRange]);

  // Load initial data only if not cached
  useEffect(() => {
    if (!isCommoditiesCached() || !isStatesCached()) {
      loadInitialData();
    } else {
      // Set initial commodity if not already set
      if (!selectedCommodity && cachedCommodities.length > 0) {
        setSelectedCommodityLocal(cachedCommodities[0].commodity_id);
      }
    }
  }, [isCommoditiesCached, isStatesCached, cachedCommodities, selectedCommodity]);

  // Load districts when state changes
  useEffect(() => {
    if (selectedState) {
      if (!isDistrictsCached(selectedState)) {
        loadDistricts(selectedState);
      } else {
        // Set initial district if not already set
        const districtsForState = cachedDistricts[selectedState];
        if (districtsForState && districtsForState.length > 0 && !selectedDistrict) {
          setSelectedDistrictLocal(districtsForState[0].district_id);
        }
      }
    } else {
      setSelectedDistrictLocal(null);
    }
  }, [selectedState, isDistrictsCached, cachedDistricts, selectedDistrict]);

  const loadInitialData = async () => {
    try {
      const [commoditiesData, statesData] = await Promise.all([
        fetchCommodities(),
        fetchStates()
      ]);
      setCommodities(commoditiesData);
      setStates(statesData);
      if (commoditiesData.length > 0 && !selectedCommodity) {
        setSelectedCommodityLocal(commoditiesData[0].commodity_id);
      }
    } catch (err) {
      setError('Failed to load initial data');
    }
  };

  const loadDistricts = async (stateId: number) => {
    try {
      const districtsData = await fetchDistricts(stateId);
      setDistricts(stateId, districtsData);
      if (districtsData.length > 0 && !selectedDistrict) {
        setSelectedDistrictLocal(districtsData[0].district_id);
      }
    } catch (err) {
      setError('Failed to load districts');
    }
  };

  const loadMarketData = async () => {
    if (!selectedCommodity || !selectedState || !selectedDistrict) return;

    // Create cache key
    const cacheKey = `${selectedCommodity}-${selectedState}-${selectedDistrict}-${fromDate}-${toDate}`;

    // Check if data is already cached
    if (isMarketDataCached(cacheKey)) {
      const cachedData = cachedMarketData[cacheKey];
      setPriceData(cachedData.prices);
      setQuantityData(cachedData.quantities);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = {
        commodity_id: selectedCommodity,
        state_id: selectedState,
        district_id: [selectedDistrict],
        from_date: fromDate,
        to_date: toDate
      };

      const [priceResponse, quantityResponse] = await Promise.all([
        fetchPrices(params),
        fetchQuantities(params)
      ]);

      setPriceData(priceResponse);
      setQuantityData(quantityResponse);
      
      // Cache the data
      setMarketData(cacheKey, priceResponse, quantityResponse);
    } catch (err) {
      setError('Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const getCommodityName = (commodityId: number) => {
    const commodity = cachedCommodities.find(c => c.commodity_id === commodityId);
    return commodity?.commodity_name || 'Unknown';
  };

  const getStateName = (stateId: number) => {
    const state = cachedStates.find(s => s.state_id === stateId);
    return state?.state_name || 'Unknown';
  };

  const getDistrictName = (districtId: number) => {
    if (!selectedState) return 'Unknown';
    const district = cachedDistricts[selectedState]?.find((d: District) => d.district_id === districtId);
    return district?.district_name || 'Unknown';
  };

  // Aggregate data by date for plotting
  const aggregatedPriceData = priceData.length > 0 ? aggregateDataByDate(priceData, 'modal_price') : [];
  const aggregatedQuantityData = quantityData.length > 0 ? aggregateDataByDate(quantityData, 'quantity') : [];

  // Get latest data points for labels
  const latestPrice = getLatestDataPoint(priceData);
  const latestQuantity = getLatestDataPoint(quantityData);

  const priceChartData = aggregatedPriceData.length > 0 ? {
    labels: aggregatedPriceData.map(d => format(new Date(d.date), 'MMM dd')),
    datasets: [
      {
        label: `${t('modalPrice')} (₹/Quintal)`,
        data: aggregatedPriceData.map(d => d.value),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1
      }
    ]
  } : null;

  const quantityChartData = aggregatedQuantityData.length > 0 ? {
    labels: aggregatedQuantityData.map(d => format(new Date(d.date), 'MMM dd')),
    datasets: [
      {
        label: `${t('arrivalQuantity')} (Tonnes)`,
        data: aggregatedQuantityData.map(d => d.value),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1
      }
    ]
  } : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">{t('marketPrices')}</h2>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('selectCommodity')}
            </label>
            <select
              value={selectedCommodity || ''}
              onChange={(e) => setSelectedCommodityLocal(Number(e.target.value) || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('selectCommodity')}</option>
              {cachedCommodities.map(commodity => (
                <option key={commodity.commodity_id} value={commodity.commodity_id}>
                  {commodity.commodity_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('selectState')}
            </label>
            <select
              value={selectedState || ''}
              onChange={(e) => {
                setSelectedStateLocal(Number(e.target.value) || null);
                setSelectedDistrictLocal(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('selectState')}</option>
              {cachedStates.map(state => (
                <option key={state.state_id} value={state.state_id}>
                  {state.state_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('selectDistrict')}
            </label>
            <select
              value={selectedDistrict || ''}
              onChange={(e) => setSelectedDistrictLocal(Number(e.target.value) || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={!selectedState}
            >
              <option value="">{t('selectDistrict')}</option>
              {selectedState && cachedDistricts[selectedState]?.map((district: District) => (
                <option key={district.district_id} value={district.district_id}>
                  {district.district_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('dateRange')}
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDateLocal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDateLocal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <button
          onClick={loadMarketData}
          disabled={!selectedCommodity || !selectedState || !selectedDistrict || loading}
          className="w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('loading') : t('loadData')}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Current Data Labels */}
      {(latestPrice || latestQuantity) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {latestPrice && (
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-semibold mb-2">{t('currentPrices')}</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">{t('minPrice')}:</span>
                  <div className="font-semibold">₹{latestPrice.min_price}/Quintal</div>
                </div>
                <div>
                  <span className="text-gray-600">{t('maxPrice')}:</span>
                  <div className="font-semibold">₹{latestPrice.max_price}/Quintal</div>
                </div>
                <div>
                  <span className="text-gray-600">{t('modalPrice')}:</span>
                  <div className="font-semibold">₹{latestPrice.modal_price}/Quintal</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {t('asOf')}: {format(new Date(latestPrice.date), 'MMM dd, yyyy')}
              </div>
            </div>
          )}
          
          {latestQuantity && (
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-semibold mb-2">{t('currentArrival')}</h3>
              <div className="text-2xl font-bold text-green-600">
                {latestQuantity.quantity} Tonnes
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {t('asOf')}: {format(new Date(latestQuantity.date), 'MMM dd, yyyy')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      {priceChartData && quantityChartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">{t('priceChart')}</h3>
            <Line 
              data={priceChartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true },
                  title: {
                    display: true,
                    text: `${getCommodityName(selectedCommodity!)} - ${t('modalPrice')}`
                  }
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    title: {
                      display: true,
                      text: '₹/Quintal'
                    }
                  }
                },
                elements: {
                  line: {
                    tension: 0.1
                  },
                  point: {
                    radius: 4,
                    hoverRadius: 6
                  }
                }
              }}
            />
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">{t('quantityChart')}</h3>
            <Line 
              data={quantityChartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true },
                  title: {
                    display: true,
                    text: `${getCommodityName(selectedCommodity!)} - ${t('arrivalQuantity')}`
                  }
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    title: {
                      display: true,
                      text: 'Tonnes'
                    }
                  }
                },
                elements: {
                  line: {
                    tension: 0.1
                  },
                  point: {
                    radius: 4,
                    hoverRadius: 6
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Data Summary */}
      {priceData.length > 0 && quantityData.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">{t('dataSummary')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ₹{Math.round(priceData.reduce((sum, d) => sum + d.modal_price, 0) / priceData.length)}
              </div>
              <div className="text-sm text-gray-600">{t('averageModalPrice')}</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(quantityData.reduce((sum, d) => sum + d.quantity, 0) / quantityData.length)}
              </div>
              <div className="text-sm text-gray-600">{t('averageQuantity')}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {priceData.length}
              </div>
              <div className="text-sm text-gray-600">{t('dataPoints')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
