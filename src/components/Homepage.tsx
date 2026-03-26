import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Sprout, Brain, Leaf, Users, Bug, ChevronRight } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full translate-x-32 translate-y-32" />
        
        <div className="relative container mx-auto px-4 pt-16 pb-12 sm:py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Text Content */}
            <div className="space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium">
                <Sprout className="h-4 w-4 text-green-200 flex-shrink-0" />
                <span className="text-green-100">{t('aiPoweredAgriculture')}</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight">
                {t('smartCropAdvisorySystem')}
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-green-100 max-w-xl mx-auto lg:mx-0">
                {t('personalizedFarmingGuidance')}
              </p>
              
              {/* Buttons — stacked on mobile, side by side on sm+ */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <Button 
                  onClick={onGetStarted}
                  size="lg" 
                  className="bg-white text-green-700 hover:bg-green-50 font-semibold text-base px-6 py-5 rounded-xl shadow-lg w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {t('getStarted')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={onPestReport}
                  size="lg" 
                  className="bg-transparent text-white hover:bg-white/10 font-semibold text-base px-6 py-5 rounded-xl border-2 border-white/50 w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {t('reportPestProblem')}
                  <Bug className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Hero Image — hidden on very small screens */}
            <div className="relative hidden sm:block">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent rounded-2xl" />
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1595956481935-a9e254951d49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwZmFybWVyJTIwY3JvcHMlMjBmaWVsZHxlbnwxfHx8fDE3NTczNTM5NDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Smiling farmer in field"
                className="rounded-2xl shadow-2xl w-full h-72 sm:h-80 lg:h-[400px] object-cover"
              />
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-2.5 flex items-center gap-2 shadow-lg">
                <Brain className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-semibold text-sm">{t('aiPowered')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              {t('whyChooseOurSystem')}
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
              {t('advancedAiTechnology')}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {[
              { icon: Brain, titleKey: 'aiPoweredInsights', descKey: 'aiInsightsDescription', color: 'blue' },
              { icon: Leaf, titleKey: 'sustainableFarming', descKey: 'sustainableFarmingDescription', color: 'green' },
              { icon: Users, titleKey: 'localLanguageSupport', descKey: 'localLanguageSupportDescription', color: 'purple' },
            ].map(({ icon: Icon, titleKey, descKey, color }) => (
              <Card
                key={titleKey}
                className="p-6 sm:p-8 text-center hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1"
              >
                <div className={`bg-${color === 'blue' ? 'blue' : color === 'green' ? 'green' : 'purple'}-50 rounded-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`h-7 w-7 sm:h-8 sm:w-8 text-${color === 'blue' ? 'blue' : color === 'green' ? 'green' : 'purple'}-600`} />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800">{t(titleKey)}</h3>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{t(descKey)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}