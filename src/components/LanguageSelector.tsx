import { useState } from "react";
import { Button } from "./ui/button";
import { Globe, Languages, Check } from "lucide-react";

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

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="fixed top-3 right-3 z-50 bg-white/95 backdrop-blur-sm border-green-200 hover:bg-green-50 shadow-lg rounded-full px-3 py-2 h-auto flex items-center gap-1.5 text-sm font-medium"
      >
        <Globe className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
        <span className="text-green-700 hidden xs:inline">{currentLang.nativeName}</span>
        <span className="text-green-700 xs:hidden">{currentLang.code.toUpperCase()}</span>
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="fixed top-14 right-3 z-50 w-[calc(100vw-24px)] max-w-xs bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-green-700">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-white" />
              <span className="font-semibold text-white text-sm">Choose Language</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white text-xl leading-none w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Language List */}
          <div className="p-2 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-1.5">
              {SUPPORTED_LANGUAGES.map((language) => {
                const isActive = currentLanguage === language.code;
                return (
                  <button
                    key={language.code}
                    onClick={() => {
                      onLanguageChange(language.code);
                      setIsOpen(false);
                    }}
                    className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left ${
                      isActive
                        ? "bg-green-50 border-green-300 shadow-sm"
                        : "hover:bg-gray-50 border-transparent hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <span className={`text-sm font-semibold ${isActive ? "text-green-700" : "text-gray-800"}`}>
                        {language.nativeName}
                      </span>
                      {isActive && <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />}
                    </div>
                    <span className="text-xs text-gray-500">{language.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}