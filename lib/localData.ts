import commoditiesData from '../commodities.json';
import geographiesData from '../geographies.json';

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

// Get unique states from geographies data
export function getStates(): State[] {
  const stateMap = new Map<number, string>();
  
  geographiesData.forEach(geo => {
    if (!stateMap.has(geo.census_state_id)) {
      stateMap.set(geo.census_state_id, geo.census_state_name);
    }
  });
  
  return Array.from(stateMap.entries()).map(([state_id, state_name]) => ({
    state_id,
    state_name
  })).sort((a, b) => a.state_name.localeCompare(b.state_name));
}

// Get districts for a specific state
export function getDistricts(stateId: number): District[] {
  return geographiesData
    .filter(geo => geo.census_state_id === stateId)
    .map(geo => ({
      district_id: geo.census_district_id,
      district_name: geo.census_district_name
    }))
    .sort((a, b) => a.district_name.localeCompare(b.district_name));
}

// Get all commodities
export function getCommodities(): Commodity[] {
  return commoditiesData.sort((a, b) => a.commodity_name.localeCompare(b.commodity_name));
}

// Get commodity by ID
export function getCommodityById(commodityId: number): Commodity | undefined {
  return commoditiesData.find(c => c.commodity_id === commodityId);
}

// Get state by ID
export function getStateById(stateId: number): State | undefined {
  const stateMap = new Map<number, string>();
  
  geographiesData.forEach(geo => {
    if (!stateMap.has(geo.census_state_id)) {
      stateMap.set(geo.census_state_id, geo.census_state_name);
    }
  });
  
  const stateName = stateMap.get(stateId);
  return stateName ? { state_id: stateId, state_name: stateName } : undefined;
}

// Get district by ID
export function getDistrictById(districtId: number): District | undefined {
  const geo = geographiesData.find(g => g.census_district_id === districtId);
  return geo ? {
    district_id: geo.census_district_id,
    district_name: geo.census_district_name
  } : undefined;
}
