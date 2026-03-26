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
  const [detectedAddress, setDetectedAddress] = useState<string>("");
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
      setUserLocation(address);
      if (pincode) setDetectedPincode(pincode);
      setDetectedAddress(address);
      setShowLocationModal(false);
      toast.success(translate('locationUpdated', currentLanguage) || 'Location detected! Filling form...');
      // Navigate to form so it auto-fills immediately
      navigate('/form');
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
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-green-700">Smart Crop Advisory</h1>
              {userLocation && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{userLocation}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestLocation}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <MapPin className="h-4 w-4 mr-2" />
                {translate('allowLocation', currentLanguage)}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                {translate('backToHome', currentLanguage) || 'Back to Home'}
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
              detectedAddress={detectedAddress}
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