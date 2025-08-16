// Test script to verify backend connection
// Run this with: node test-backend-connection.js

const API_BASE = 'https://agri-sahayak-backend-production.up.railway.app/api/data';

async function testBackendConnection() {
  console.log('🌾 Testing Agri Sahayak Backend Connection\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
    }

    // Test commodities
    console.log('\n2. Testing commodities endpoint...');
    const commoditiesResponse = await fetch(`${API_BASE}/commodities`);
    if (commoditiesResponse.ok) {
      const commoditiesData = await commoditiesResponse.json();
      console.log('✅ Commodities loaded:', commoditiesData.commodities?.length || 0, 'commodities');
      if (commoditiesData.commodities?.length > 0) {
        console.log('   Sample:', commoditiesData.commodities[0]);
      }
    } else {
      console.log('❌ Commodities failed:', commoditiesResponse.status);
    }

    // Test states
    console.log('\n3. Testing states endpoint...');
    const statesResponse = await fetch(`${API_BASE}/states`);
    if (statesResponse.ok) {
      const statesData = await statesResponse.json();
      console.log('✅ States loaded:', statesData.states?.length || 0, 'states');
      if (statesData.states?.length > 0) {
        console.log('   Sample:', statesData.states[0]);
      }
    } else {
      console.log('❌ States failed:', statesResponse.status);
    }

    // Test districts for a sample state (Uttar Pradesh - state_id 8)
    console.log('\n4. Testing districts endpoint...');
    const districtsResponse = await fetch(`${API_BASE}/districts/8`);
    if (districtsResponse.ok) {
      const districtsData = await districtsResponse.json();
      console.log('✅ Districts loaded for UP:', districtsData.districts?.length || 0, 'districts');
      if (districtsData.districts?.length > 0) {
        console.log('   Sample:', districtsData.districts[0]);
      }
    } else {
      console.log('❌ Districts failed:', districtsResponse.status);
    }

    // Test prices endpoint
    console.log('\n5. Testing prices endpoint...');
    const pricePayload = {
      commodity_id: 1,
      state_id: 8,
      district_id: [104],
      from_date: '2024-01-01',
      to_date: '2024-01-31'
    };
    
    const pricesResponse = await fetch(`${API_BASE}/prices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pricePayload)
    });
    
    if (pricesResponse.ok) {
      const pricesData = await pricesResponse.json();
      console.log('✅ Prices loaded:', pricesData.prices?.length || 0, 'price records');
      if (pricesData.prices?.length > 0) {
        console.log('   Sample:', pricesData.prices[0]);
      }
    } else {
      console.log('❌ Prices failed:', pricesResponse.status);
      const errorText = await pricesResponse.text();
      console.log('   Error:', errorText);
    }

    // Test quantities endpoint
    console.log('\n6. Testing quantities endpoint...');
    const quantityPayload = {
      commodity_id: 1,
      state_id: 8,
      district_id: [104],
      from_date: '2024-01-01',
      to_date: '2024-01-31'
    };
    
    const quantitiesResponse = await fetch(`${API_BASE}/quantities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quantityPayload)
    });
    
    if (quantitiesResponse.ok) {
      const quantitiesData = await quantitiesResponse.json();
      console.log('✅ Quantities loaded:', quantitiesData.quantities?.length || 0, 'quantity records');
      if (quantitiesData.quantities?.length > 0) {
        console.log('   Sample:', quantitiesData.quantities[0]);
      }
    } else {
      console.log('❌ Quantities failed:', quantitiesResponse.status);
      const errorText = await quantitiesResponse.text();
      console.log('   Error:', errorText);
    }

    console.log('\n✨ Backend connection test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure the backend server is running on https://agri-sahayak-backend-production.up.railway.app');
  }
}

// Run the test
testBackendConnection();
