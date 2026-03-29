import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Sprout, Brain, Leaf, Users, Bug, MapPin, Cpu } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useTranslations } from "../utils/translations";

interface HomepageProps {
  onGetStarted: () => void;
  onPestReport: () => void;
  language: string;
}

export function Homepage({ onGetStarted, onPestReport, language }: HomepageProps) {
  const { t } = useTranslations(language);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="h-8 w-8 text-green-200" />
                <span className="text-green-200 text-lg">{t('aiPoweredAgriculture')}</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                {t('smartCropAdvisorySystem')}
              </h1>
              <p className="text-xl lg:text-2xl text-green-100 max-w-2xl">
                {t('personalizedFarmingGuidance')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={onGetStarted}
                  size="lg" 
                  className="bg-white text-green-700 hover:bg-green-50 text-lg px-8 py-6 rounded-xl"
                >
                  {t('getStarted')}
                  <Sprout className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  onClick={onPestReport}
                  size="lg" 
                  className="bg-green-500 text-white hover:bg-green-400 text-lg px-8 py-6 rounded-xl border-2 border-white/20"
                >
                  {t('reportPestProblem')}
                  <Bug className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1595956481935-a9e254951d49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwZmFybWVyJTIwY3JvcHMlMjBmaWVsZHxlbnwxfHx8fDE3NTczNTM5NDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Smiling farmer in field"
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
                <Brain className="h-6 w-6 text-green-600" />
                <span className="text-green-800 font-medium">{t('aiPowered')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              {t('whyChooseOurSystem')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('advancedAiTechnology')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow border-green-100">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">{t('aiPoweredInsights')}</h3>
              <p className="text-gray-600">
                {t('aiInsightsDescription')}
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow border-green-100">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">{t('sustainableFarming')}</h3>
              <p className="text-gray-600">
                {t('sustainableFarmingDescription')}
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow border-green-100">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">{t('localLanguageSupport')}</h3>
              <p className="text-gray-600">
                {t('localLanguageSupportDescription')}
              </p>
            </Card>
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-b from-white to-green-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 relative">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4 inline-block relative">
              {t('How It Works')}
              <div className="absolute -bottom-2 left-1/4 right-1/4 h-1.5 bg-green-500 rounded-full"></div>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6">
              {t('Your journey to smarter, more profitable farming in 3 simple steps')}
            </p>
          </div>

          <div className="max-w-5xl mx-auto relative px-4 sm:px-0">
            {/* Connecting dashed line for desktop */}
            <div className="hidden md:block absolute top-[48px] left-[16%] right-[16%] h-1 border-t-4 border-dashed border-green-200 z-0"></div>
            
            <div className="grid md:grid-cols-3 gap-12 lg:gap-16 relative z-10">
              {/* Step 1 */}
              <div className="text-center group relative">
                <div className="bg-white border-4 border-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:border-green-500 group-hover:scale-110 transition-all duration-500 relative z-10">
                  <div className="absolute -top-2 -right-2 bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg ring-4 ring-white">1</div>
                  <MapPin className="h-10 w-10 text-green-600 group-hover:text-green-500 transition-colors duration-500 group-hover:animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-green-700 transition-colors">{t('Share Details')}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {t('Tell us about your soil, location, and farming goals using our simple form or voice assistant.')}
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center group relative">
                <div className="bg-white border-4 border-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:border-green-500 group-hover:scale-110 transition-all duration-500 relative z-10">
                  <div className="absolute -top-2 -right-2 bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg ring-4 ring-white">2</div>
                  <Cpu className="h-10 w-10 text-green-600 group-hover:text-green-500 transition-colors duration-500 group-hover:animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-green-700 transition-colors">{t('AI Analysis')}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {t('Our AI instantly analyzes local weather, soil data, and market trends for your specific region.')}
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center group relative">
                <div className="bg-white border-4 border-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:border-green-500 group-hover:scale-110 transition-all duration-500 relative z-10">
                  <div className="absolute -top-2 -right-2 bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg ring-4 ring-white">3</div>
                  <Sprout className="h-10 w-10 text-green-600 group-hover:text-green-500 transition-colors duration-500 group-hover:scale-125" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-green-700 transition-colors">{t('Get Solutions')}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {t('Receive tailored crop recommendations, pest solutions, and 24/7 farming advice in your local language.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}