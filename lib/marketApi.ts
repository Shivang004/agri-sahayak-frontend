export interface Commodity {
  commodity_id: number;
  commodity_name: string;
}

export interface State {
  state_id: number;
  state_name: string;
}

export interface District {
  district_id: number;
  district_name: string;
}

export interface PriceData {
  date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
}

export interface QuantityData {
  date: string;
  quantity: number;
}

export interface MarketDataResponse {
  prices?: PriceData[];
  quantities?: QuantityData[];
  commodity?: string;
  state?: string;
  district?: string;
  dateRange: {
    from: string;
    to: string;
  };
}

const API_BASE = 'http://agri-sahayak-backend-production.up.railway.app/api/data';

// Fetch commodities from backend
export async function fetchCommodities(): Promise<Commodity[]> {
  try {
    const response = await fetch(`${API_BASE}/commodities`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.commodities || [];
  } catch (error) {
    console.error('Error fetching commodities:', error);
    return [];
  }
}

// Fetch states from backend
export async function fetchStates(): Promise<State[]> {
  try {
    const response = await fetch(`${API_BASE}/states`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.states || [];
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
}

// Fetch districts for a specific state
export async function fetchDistricts(stateId: number): Promise<District[]> {
  try {
    const response = await fetch(`${API_BASE}/districts/${stateId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.districts || [];
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
}

// Fetch prices from backend
export async function fetchPrices(params: {
  commodity_id: number;
  state_id: number;
  district_id: number[];
  from_date: string;
  to_date: string;
}): Promise<PriceData[]> {
  try {
    const response = await fetch(`${API_BASE}/prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.prices || [];
  } catch (error) {
    console.error('Error fetching prices:', error);
    return [];
  }
}

// Fetch quantities from backend
export async function fetchQuantities(params: {
  commodity_id: number;
  state_id: number;
  district_id: number[];
  from_date: string;
  to_date: string;
}): Promise<QuantityData[]> {
  try {
    const response = await fetch(`${API_BASE}/quantities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.quantities || [];
  } catch (error) {
    console.error('Error fetching quantities:', error);
    return [];
  }
}

// Helper function to aggregate data by date
export function aggregateDataByDate<T extends { date: string }>(data: T[], key: keyof T): { date: string; value: number }[] {
  const aggregated = new Map<string, number[]>();
  
  data.forEach(item => {
    const date = item.date;
    const value = Number(item[key]);
    if (!isNaN(value)) {
      if (!aggregated.has(date)) {
        aggregated.set(date, []);
      }
      aggregated.get(date)!.push(value);
    }
  });
  
  return Array.from(aggregated.entries()).map(([date, values]) => ({
    date,
    value: values.reduce((sum, val) => sum + val, 0) / values.length // Average for the day
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Helper function to get latest data point
export function getLatestDataPoint<T extends { date: string }>(data: T[]): T | null {
  if (data.length === 0) return null;
  
  return data.reduce((latest, current) => {
    const latestDate = new Date(latest.date);
    const currentDate = new Date(current.date);
    return currentDate > latestDate ? current : latest;
  });
}
