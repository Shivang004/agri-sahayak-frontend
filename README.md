# Agri Sahayak - Agricultural Assistant

A comprehensive AI-powered agricultural assistant platform with multi-language support, market data visualization, and weather forecasting capabilities.

## Features

### 🌍 Multi-Language Support
- **Supported Languages**: English, Hindi, Punjabi, Marathi, Telugu, Tamil
- **Complete Localization**: All UI elements, messages, and responses are translated
- **Language Persistence**: Selected language is saved in localStorage
- **Native Language Names**: Display names in both English and native scripts

### 📊 Market Data Visualization
- **Price Charts**: Interactive line charts showing commodity price trends
- **Quantity Charts**: Bar charts displaying market quantities
- **Filtering Options**:
  - Commodity selection (Wheat, Rice, Maize, Pulses, Soybean, Cotton, Sugarcane)
  - State and district selection
  - Date range picker (default: 3 months ago to current date)
- **Data Summary**: Average prices, quantities, and data point counts
- **API Integration**: Ready for backend integration with `/api/commodities`, `/api/geographies`, `/api/prices`, `/api/quantity` endpoints

### 🌤️ Weather Forecast & Agriculture Insights
- **Open-Meteo Integration**: Real-time weather data from Open-Meteo API
- **Automatic Location Detection**: Uses browser geolocation API
- **Agriculture-Relevant Data**:
  - Soil temperature and moisture
  - Evapotranspiration rates
  - UV index and sunshine duration
  - Precipitation probability
- **Smart Insights**:
  - Irrigation recommendations based on soil moisture
  - Crop health assessments
  - Pest risk evaluation
  - Harvest timing suggestions
- **Visualizations**:
  - 24-hour temperature forecast
  - 7-day precipitation forecast
  - Daily weather cards with icons

### 💬 AI Chat Interface
- **Multi-language Support**: Chat in any supported language
- **Voice Input/Output**: Speech-to-text and text-to-speech capabilities
- **Agricultural Expertise**: Specialized knowledge for farming queries

## Technical Implementation

### Frontend Architecture
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **State Management**: React Context for language management
- **Date Handling**: date-fns library

### API Integration Points

#### Market Data APIs (Mock Implementation)
```typescript
// Commodities API
GET /api/commodities
Response: Commodity[]

// Geographies API  
GET /api/geographies
Response: Geography[]

// Prices API
GET /api/prices?commodity=wheat&state=mh&district=mumbai&fromDate=2024-01-01&toDate=2024-04-01
Response: MarketDataResponse

// Quantity API
GET /api/quantity?commodity=wheat&state=mh&district=mumbai&fromDate=2024-01-01&toDate=2024-04-01
Response: MarketDataResponse
```

#### Weather API
- **Provider**: Open-Meteo (https://open-meteo.com/)
- **Features**: Free, no API key required, high accuracy
- **Data**: Current weather, hourly forecasts, daily forecasts
- **Agriculture Parameters**: Soil temperature, moisture, evapotranspiration

### Language System
- **Translation Files**: Centralized in `/lib/translations.ts`
- **Context Provider**: `/lib/LanguageContext.tsx`
- **Hook**: `useLanguage()` for easy access to translations
- **Dynamic Updates**: All components automatically update when language changes

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production
```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with LanguageProvider
│   ├── page.tsx            # Main page with tab navigation
│   └── globals.css         # Global styles
├── components/
│   ├── ChatInterface.tsx   # AI chat component
│   ├── MarketData.tsx      # Market data visualization
│   ├── WeatherForecast.tsx # Weather forecast component
│   ├── LanguageSelector.tsx # Language selection dropdown
│   ├── Dashboard.tsx       # Dashboard with charts
│   ├── FertilizerTool.tsx  # Government fertilizer tool
│   ├── ChatInput.tsx       # Chat input component
│   └── MessageList.tsx     # Chat message display
├── lib/
│   ├── translations.ts     # Multi-language translations
│   ├── LanguageContext.tsx # Language context provider
│   ├── marketApi.ts        # Market data API functions
│   ├── weatherApi.ts       # Weather API functions
│   └── api.ts             # General API utilities
├── hooks/
│   ├── useSpeechToText.ts # Speech recognition hook
│   └── useTextToSpeech.ts # Text-to-speech hook
└── types/
    └── web-speech.d.ts    # Web Speech API types
```

## Backend Integration

The frontend is designed to work with a backend that provides the following endpoints:

### Required Backend APIs
1. **Commodities API**: `/api/commodities` - List of available commodities
2. **Geographies API**: `/api/geographies` - States and districts data
3. **Prices API**: `/api/prices` - Historical price data
4. **Quantity API**: `/api/quantity` - Historical quantity data
5. **Chat API**: `/api/chat` - AI chat responses

### Data Models
```typescript
interface Commodity {
  id: string;
  name: string;
  nameHindi?: string;
  namePunjabi?: string;
  nameMarathi?: string;
  nameTelugu?: string;
  nameTamil?: string;
}

interface Geography {
  id: string;
  name: string;
  type: 'state' | 'district';
  parentId?: string;
}

interface MarketDataPoint {
  date: string;
  price: number;
  quantity: number;
  commodity: string;
  state?: string;
  district?: string;
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
