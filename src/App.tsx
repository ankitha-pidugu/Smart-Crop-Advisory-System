import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Homepage } from "./components/Homepage";
import { FarmerInputForm, FarmerFormData } from "./components/FarmerInputForm";
import { Dashboard } from "./components/Dashboard";
import { PestInfo } from "./components/PestInfo";
import { Chatbot } from "./components/Chatbot";
import { LanguageSelector } from "./components/LanguageSelector";
import { LocationAccess } from "./components/LocationAccess";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { translate, useTranslations } from "./utils/translations";
import { supabase } from "./supabase/client";

function AppContent() {
  const [formData, setFormData] = useState<FarmerFormData | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const { translations } = useTranslations(currentLanguage);
  const [userLocation, setUserLocation] = useState<string>("");
  const [detectedPincode, setDetectedPincode] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleGetStarted = () => {
    navigate("/form");
  };

  const handlePestReport = () => {
    navigate("/pest-info");
  };

  const handleFormSubmit = async (data: FarmerFormData) => {
    try {
      // Insert into Supabase
      const { error } = await supabase
        .from('farm_profiles')
        .insert([
          {
            soil_type: data.soilType,
            ph_level: data.phLevel,
            location: data.location,
            existing_crop: data.existingCrop,
            preferred_crop: data.preferredCrop
          }
        ]);

      if (error) {
        throw error;
      }
      
      setFormData(data);
      navigate("/dashboard");
      toast.success(translate('dataSavedSuccessfully', currentLanguage) || 'Data saved successfully securely!');
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to save form data to the database.');
    }
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
  };

  const handleRequestLocation = () => {
    setShowLocationModal(true);
  };

  const handleLocationAllowed = async (latitude: number, longitude: number, address: string, pincode?: string) => {
    try {
      // Simulate location saving
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUserLocation(address);
      if (pincode) setDetectedPincode(pincode);
      setShowLocationModal(false);
      toast.success(translate('locationUpdated', currentLanguage) || 'Location updated successfully');
    } catch (error) {
      console.error('Update location error:', error);
      toast.error(translate('locationError', currentLanguage));
    }
  };

  const handleLocationDenied = () => {
    setShowLocationModal(false);
  };

  const showNavigation = location.pathname !== "/";

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      {showNavigation && (
        <div className="bg-white border-b border-gray-200 px-3 py-2 sm:px-4 sm:py-3 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            {/* Left: Title + Location badge */}
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-green-700 whitespace-nowrap">
                <span className="hidden sm:inline">Smart Crop Advisory</span>
                <span className="sm:hidden">🌱 Crop Advisory</span>
              </h1>
              {userLocation && (
                <div className="hidden md:flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded-full px-2 py-1 border truncate max-w-[160px]">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{userLocation}</span>
                </div>
              )}
            </div>
            
            {/* Right: Action buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Location button — icon only on mobile */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestLocation}
                className="text-green-600 border-green-200 hover:bg-green-50 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="hidden sm:inline ml-1.5">{translate('allowLocation', currentLanguage)}</span>
              </Button>
              
              {/* Back to Home button — icon only on mobile */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
                className="text-blue-600 border-blue-200 hover:bg-blue-50 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <span className="sm:hidden">🏠</span>
                <span className="hidden sm:inline">{translate('backToHome', currentLanguage) || 'Back to Home'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Routes>
        <Route 
          path="/" 
          element={
            <Homepage 
              onGetStarted={handleGetStarted} 
              onPestReport={handlePestReport}
              language={currentLanguage} 
            />
          } 
        />
        <Route 
          path="/form" 
          element={
            <FarmerInputForm 
              onSubmit={handleFormSubmit} 
              language={currentLanguage} 
              detectedPincode={detectedPincode}
            />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            formData ? (
              <Dashboard 
                formData={formData} 
                language={currentLanguage} 
              />
            ) : (
              <Homepage 
                onGetStarted={handleGetStarted} 
                onPestReport={handlePestReport}
                language={currentLanguage} 
              />
            )
          } 
        />
        <Route 
          path="/pest-info" 
          element={
            <PestInfo 
              language={currentLanguage} 
            />
          } 
        />
        {/* Catch-all route for unmatched paths */}
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
      
      {/* Chat and Language Components */}
      <Chatbot language={currentLanguage} formData={formData} />
      <LanguageSelector 
        currentLanguage={currentLanguage} 
        onLanguageChange={handleLanguageChange} 
        translations={translations}
      />

      {/* Location Modal */}
      {showLocationModal && (
        <LocationAccess
          onLocationAllowed={handleLocationAllowed}
          onLocationDenied={handleLocationDenied}
          language={currentLanguage}
        />
      )}
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}