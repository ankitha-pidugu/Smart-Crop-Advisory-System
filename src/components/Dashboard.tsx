import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { CheckCircle, XCircle, TrendingUp, CloudRain, Thermometer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { FarmerFormData } from "./FarmerInputForm";
import { useTranslations } from "../utils/translations";
import { supabase } from "../supabase/client";
import { getOfflineRecommendations } from "../utils/cropEngine";
import { getAdvancedRecommendations } from "../utils/largeDatasetEngine";
import { EXTRACTED_MARKET_DATABASE } from "../utils/extractedMarketDatabase";

interface DashboardProps {
  formData: FarmerFormData;
  language: string;
}

export function Dashboard({ formData, language }: DashboardProps) {
  const { t } = useTranslations(language);
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [marketPrices, setMarketPrices] = useState<any[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [isLoadingMarket, setIsLoadingMarket] = useState(true);
  
  const [recommendedCrops, setRecommendedCrops] = useState<any[]>([]);
  const [notRecommendedCrops, setNotRecommendedCrops] = useState<any[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  const [locationDetails, setLocationDetails] = useState<{ village: string; district: string }>({ village: '', district: '' });

  useEffect(() => {
    const loadDashboard = async () => {
      const latestWeather = await fetchWeatherData();
      fetchMarketPrices();
      fetchRecommendations(latestWeather);
    };
    
    loadDashboard();
    
    // Set up simulated real-time updates
    const marketInterval = setInterval(fetchMarketPrices, 60000); // Update every minute
    const weatherInterval = setInterval(fetchWeatherData, 300000); // Update every 5 minutes

    return () => {
      clearInterval(marketInterval);
      clearInterval(weatherInterval);
    };
  }, [formData.location, formData.district]);

  const fetchRecommendations = async (weather?: any[]) => {
    setIsLoadingRecommendations(true);
    try {
      // Offline local highly accurate K-NN Engine based on Kaggle dataset mappings
      const avgTemp = (weather && weather.length > 0) ? weather[0].temperature : 25;
      const avgHum = (weather && weather.length > 0) ? weather[0].humidity : 60;
      const expectedRain = (weather && weather.length > 0) ? weather[0].rainfall * 10 : 100; // rough monthly scaling 

      const result = getAdvancedRecommendations(
        formData.soilType,
        parseFloat(formData.phLevel),
        avgTemp,
        avgHum,
        expectedRain,
        formData.preferredCrop
      );

      setRecommendedCrops(result.recommended);
      setNotRecommendedCrops(result.notRecommended);
    } catch (error) {
      console.error('Failed to fetch crop recommendations:', error);
      // Smart Local Fallback Engine when completely failing
      const fallbackCrops = getOfflineRecommendations(
        formData.soilType, 
        parseFloat(formData.phLevel), 
        'moderate', // fallback climate if weather not loaded
        formData.preferredCrop
      );
      
      setRecommendedCrops(fallbackCrops);
      setNotRecommendedCrops([
        { name: t('rice'), reason: t('requiresMoreWater') },
        { name: t('cotton'), reason: t('soilPhNotOptimal') },
        { name: t('sugarcane'), reason: t('climateNotSuitable') },
      ]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const fetchWeatherData = async () => {
    try {
      const apiKey = (import.meta as any).env.VITE_WEATHER_API_KEY;
      if (!apiKey) {
        throw new Error("Weather API key not found");
      }

      // Using the 5 day / 3 hour forecast API from OpenWeatherMap
      const queryLocation = formData.district || formData.location;
      const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${queryLocation}&appid=${apiKey}&units=metric`);
      if (!res.ok) {
        throw new Error("Failed to fetch weather data");
      }
      const rawData = await res.json();

      try {
        if (rawData.city && rawData.city.coord) {
          const { lat, lon } = rawData.city.coord;
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
          const geoData = await geoRes.json();
          const address = geoData.address || {};
          
          let villageName = address.village || address.suburb || address.neighbourhood || address.town || "";
          let districtName = address.state_district || address.county || address.city_district || "";
          
          setLocationDetails({ village: villageName, district: districtName });
        }
      } catch (e) {
        console.error('Geocoding error:', e);
      }

      // Process the 3-hour interval data into daily averages/summaries
      const dailyData = new Map();
      const daysOfWeek = [t('sunday'), t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday')];

      rawData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000);
        const dayString = daysOfWeek[date.getDay()];
        
        if (!dailyData.has(dayString)) {
          dailyData.set(dayString, {
            day: dayString,
            temperature: [],
            humidity: [],
            rainfall: 0,
            count: 0
          });
        }
        
        const dayData = dailyData.get(dayString);
        dayData.temperature.push(item.main.temp);
        dayData.humidity.push(item.main.humidity);
        if (item.rain && item.rain['3h']) {
          dayData.rainfall += item.rain['3h'];
        }
        dayData.count += 1;
      });

      // Format the daily records for the chart
      const chartData: any[] = [];
      dailyData.forEach((data) => {
        const avgTemp = data.temperature.reduce((a: number, b: number) => a + b, 0) / data.count;
        const avgHum = data.humidity.reduce((a: number, b: number) => a + b, 0) / data.count;
        
        chartData.push({
          day: data.day,
          temperature: Math.round(avgTemp * 10) / 10,
          humidity: Math.round(avgHum),
          rainfall: Math.round(data.rainfall * 10) / 10
        });
      });

      // OpenWeatherMap gives 5 days of data
      const finalData = chartData.slice(0, 5);
      setWeatherData(finalData);
      return finalData;
    } catch (error) {
      console.error('Weather fetch error:', error);
      // Fallback to mock data if the API fails or location is invalid
      const fallbackData = [
        { day: t('monday'), rainfall: 0, temperature: 25, humidity: 65 },
        { day: t('tuesday'), rainfall: 2, temperature: 24, humidity: 70 },
        { day: t('wednesday'), rainfall: 5, temperature: 22, humidity: 75 }
      ];
      setWeatherData(fallbackData);
      return fallbackData;
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const fetchMarketPrices = async () => {
    try {
      // Transitioning to purely offline accurate market data from CSV
      if (EXTRACTED_MARKET_DATABASE && EXTRACTED_MARKET_DATABASE.length > 0) {
        setMarketPrices(EXTRACTED_MARKET_DATABASE.map(item => ({
          crop: item.crop,
          currentPrice: item.currentPrice,
          trend: item.trend === "Bullish" ? "up" : item.trend === "Bearish" ? "down" : "stable",
          change: item.change.startsWith('+') ? item.change : item.change
        })));
      } else {
        // Fallback to Supabase if local DB is empty for some reason
        const { data, error } = await supabase
          .from('market_prices')
          .select('*')
          .order('crop', { ascending: true });

        if (error) throw error;
        if (data) {
          setMarketPrices(data.map(item => ({
            crop: item.crop,
            currentPrice: item.current_price,
            trend: item.trend,
            change: item.change
          })));
        }
      }
    } catch (error) {
      console.error('Market prices fetch error:', error);
    } finally {
      setIsLoadingMarket(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              {t('farmDashboard')}
            </h1>
            <p className="text-gray-600">
              {t('personalizedRecommendations')} {formData.location}
              {locationDetails.village && ` (${locationDetails.village})`}
              {locationDetails.district && `, ${locationDetails.district} District`}
              {' '}• {formData.soilType} soil • pH {formData.phLevel}
              {formData.preferredCrop && ` • Preferred: ${formData.preferredCrop}`}
            </p>
          </div>
          <button 
            onClick={() => navigate("/form")}
            className="px-4 py-2 bg-white text-green-700 border border-green-200 rounded-md hover:bg-green-50 shadow-sm transition-colors font-medium self-start whitespace-nowrap"
          >
            ← {t('backToInput')}
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recommended Crops */}
          <Card className="shadow-lg border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-6 w-6 text-green-600" />
                {t('recommendedCrops')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {isLoadingRecommendations ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                </div>
              ) : (
                recommendedCrops.map((crop, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-green-800">{crop.name}</h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {crop.confidence}% {t('matchPercentage')}
                        </Badge>
                      </div>
                      <p className="text-sm text-green-600 mt-1">{crop.reason}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Not Recommended Crops */}
          <Card className="shadow-lg border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <XCircle className="h-6 w-6 text-red-600" />
                {t('notRecommended')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {notRecommendedCrops.map((crop, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800">{crop.name}</h3>
                    <p className="text-sm text-red-600 mt-1">{crop.reason}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Weather Forecast */}
        <Card className="mt-8 shadow-lg border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <CloudRain className="h-6 w-6 text-blue-600" />
              {t('weatherForecast')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Rainfall Chart */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <CloudRain className="h-4 w-4 text-blue-500" />
                  {t('rainfall')}
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rainfall" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Temperature Chart */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  {t('temperature')}
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Prices */}
        <Card className="mt-8 shadow-lg border-yellow-200">
          <CardHeader className="bg-yellow-50">
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
              {t('currentMarketPrices')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('crop')}</TableHead>
                  <TableHead>{t('currentPrice')}</TableHead>
                  <TableHead>{t('change24h')}</TableHead>
                  <TableHead>{t('trend')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketPrices.map((item, index) => (
                  <TableRow key={index} className="hover:bg-yellow-50">
                    <TableCell className="font-medium">{item.crop}</TableCell>
                    <TableCell className="font-semibold">{item.currentPrice}</TableCell>
                    <TableCell className={item.trend === "up" ? "text-green-600" : "text-red-600"}>
                      {item.change}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {item.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}