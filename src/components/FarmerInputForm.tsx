import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { MapPin, Droplets, Sprout, TestTube } from "lucide-react";
import { useTranslations } from "../utils/translations";

interface FarmerInputFormProps {
  onSubmit: (data: FarmerFormData) => void;
  language: string;
  detectedPincode?: string;
}

export interface FarmerFormData {
  soilType: string;
  phLevel: string;
  location: string;
  district: string;
  existingCrop: string;
  preferredCrop: string;
}

export function FarmerInputForm({ onSubmit, language, detectedPincode }: FarmerInputFormProps) {
  const { t } = useTranslations(language);
  const [formData, setFormData] = useState<FarmerFormData>({
    soilType: "",
    phLevel: "",
    location: "",
    district: "",
    existingCrop: "",
    preferredCrop: "",
  });

  const [pinCode, setPinCode] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    if (detectedPincode && detectedPincode.length === 6) {
      handlePinCodeChange(detectedPincode);
    }
  }, [detectedPincode]);

  const handlePinCodeChange = async (value: string) => {
    setPinCode(value);
    if (value.length === 6) {
      setIsLoadingLocation(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await response.json();
        if (data && data[0] && data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          const locationString = `${postOffice.Name}, ${postOffice.District}, ${postOffice.State}`;
          handleInputChange("location", locationString);
          handleInputChange("district", postOffice.District);
        }
      } catch (error) {
        console.error("Error fetching location:", error);
      } finally {
        setIsLoadingLocation(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof FarmerFormData, value: string) => {
    setFormData((prev: FarmerFormData) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-xl border-green-200">
          <CardHeader className="text-center bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl lg:text-3xl flex items-center justify-center gap-2">
              <Sprout className="h-8 w-8" />
              {t('farmInformationForm')}
            </CardTitle>
            <p className="text-green-100 mt-2">
              {t('tellUsAboutYourFarm')}
            </p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Soil Type */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-700">
                  <TestTube className="h-4 w-4 text-green-600" />
                  {t('soilType')}
                </Label>
                <Select onValueChange={(value) => handleInputChange("soilType", value)}>
                  <SelectTrigger className="bg-white border-green-200 focus:border-green-500">
                    <SelectValue placeholder={t('selectSoilType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clay">{t('claysoil')}</SelectItem>
                    <SelectItem value="sandy">{t('sandySoil')}</SelectItem>
                    <SelectItem value="loamy">{t('loamySoil')}</SelectItem>
                    <SelectItem value="silty">{t('siltySoil')}</SelectItem>
                    <SelectItem value="peaty">{t('peatySoil')}</SelectItem>
                    <SelectItem value="chalky">{t('chalkySoil')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* pH Value */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-700">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  {t('soilPhValue')}
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  placeholder={t('phPlaceholder')}
                  value={formData.phLevel}
                  onChange={(e) => handleInputChange("phLevel", e.target.value)}
                  className="bg-white border-green-200 focus:border-green-500"
                />
                <p className="text-sm text-gray-500">
                  {t('phDescription')}
                </p>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-red-600" />
                    {t('enterPinCode')}
                  </Label>
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder={t('pincodePlaceholder')}
                    value={pinCode}
                    onChange={(e) => handlePinCodeChange(e.target.value)}
                    className="bg-white border-green-200 focus:border-green-500"
                  />
                  {isLoadingLocation && <p className="text-sm text-green-600 animate-pulse">{t('fetchingLocation')}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    {t('location')} {t('autoFilledOrManual')}
                  </Label>
                  <Input
                    type="text"
                    placeholder={t('locationPlaceholder')}
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="bg-white border-green-200 focus:border-green-500"
                  />
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t('locationDescription')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Existing Crop */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-700">
                  <Sprout className="h-4 w-4 text-green-600" />
                  {t('currentCrop')}
                </Label>
                <Input
                  type="text"
                  placeholder={t('enterCurrentCrop')}
                  value={formData.existingCrop}
                  onChange={(e) => handleInputChange("existingCrop", e.target.value)}
                  className="bg-white border-green-200 focus:border-green-500"
                />
                  {t('currentCropDescription')}
              </div>

              {/* Preferred Crop Category */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-700">
                  <Sprout className="h-4 w-4 text-green-600" />
                  {t('preferredCropCategory')}
                </Label>
                <Select onValueChange={(value) => handleInputChange("preferredCrop", value)}>
                  <SelectTrigger className="bg-white border-green-200 focus:border-green-500">
                    <SelectValue placeholder={t('selectCropCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cereals">{t('cereals')}</SelectItem>
                    <SelectItem value="vegetables">{t('vegetables')}</SelectItem>
                    <SelectItem value="fruits">{t('fruits')}</SelectItem>
                    <SelectItem value="pulses">{t('pulses')}</SelectItem>
                    <SelectItem value="cash">{t('cashCrops')}</SelectItem>
                    <SelectItem value="spices">{t('spicesHerbs')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg rounded-xl"
                disabled={!formData.soilType || !formData.phLevel || !formData.location || !formData.preferredCrop}
              >
                {t('getCropRecommendations')}
                <Sprout className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}