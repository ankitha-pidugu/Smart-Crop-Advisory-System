import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { MapPin, X } from 'lucide-react';
import { translate } from '../utils/translations';

interface LocationAccessProps {
  onLocationAllowed: (latitude: number, longitude: number, address: string, pincode?: string) => void;
  onLocationDenied: () => void;
  language: string;
}

export function LocationAccess({ onLocationAllowed, onLocationDenied, language }: LocationAccessProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError(translate('locationNotSupported', language));
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding to get address
        try {
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=demo&limit=1`
          );
          const data = await response.json();
          const result = data.results?.[0];
          const address = result?.formatted || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          const pincode = result?.components?.postcode;
          
          setIsLoading(false);
          onLocationAllowed(latitude, longitude, address, pincode);
        } catch (err) {
          console.error('Geocoding error:', err);
          const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setIsLoading(false);
          onLocationAllowed(latitude, longitude, address);
        }
      },
      (error) => {
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError(translate('locationPermissionDenied', language));
            break;
          case error.POSITION_UNAVAILABLE:
            setError(translate('locationUnavailable', language));
            break;
          case error.TIMEOUT:
            setError(translate('locationTimeout', language));
            break;
          default:
            setError(translate('locationError', language));
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <div />
            <Button
              variant="ghost"
              size="sm"
              onClick={onLocationDenied}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-xl">
            {translate('allowLocationAccess', language)}
          </CardTitle>
          <CardDescription className="text-center">
            {translate('locationAccessDescription', language)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
            <Button
              onClick={requestLocation}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <MapPin className="mr-2 h-4 w-4" />
              {isLoading 
                ? translate('detectingLocation', language)
                : translate('allowLocation', language)
              }
            </Button>
            
            <Button
              variant="outline"
              onClick={onLocationDenied}
              className="w-full"
            >
              {translate('enterManually', language)}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            {translate('locationPrivacyNote', language)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}