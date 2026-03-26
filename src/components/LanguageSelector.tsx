import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Globe, Languages } from "lucide-react";

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  translations: any;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "es", name: "Spanish", nativeName: "Español" },
];

export function LanguageSelector({ currentLanguage, onLanguageChange, translations }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = (key: string) => translations[key] || key;

  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm border-green-200 hover:bg-green-50 shadow-lg"
      >
        <Globe className="h-4 w-4 mr-2" />
        {currentLang.code.toUpperCase()}
      </Button>
    );
  }

  return (
    <Card className="fixed top-4 right-4 z-50 w-72 shadow-2xl border-green-200 bg-white/95 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-green-600" />
            <span className="font-medium text-gray-800">{t('chooseLanguage')}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0 hover:bg-green-100"
          >
            ×
          </Button>
        </div>

        <div className="space-y-2">
          {SUPPORTED_LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                onLanguageChange(language.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                currentLanguage === language.code
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "hover:bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex-1 text-left">
                <div className="font-medium">{language.nativeName}</div>
                <div className="text-sm text-gray-500">{language.name}</div>
              </div>
              {currentLanguage === language.code && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            More languages coming soon!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}