import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { MessageCircle, Send, Bot, User, X, Mic } from "lucide-react";
import { useTranslations } from "../utils/translations";
import { getChatbotResponse } from "../utils/geminiService";
import { FarmerFormData } from "./FarmerInputForm";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  language: string;
  formData?: FarmerFormData | null;
}

export function Chatbot({ language, formData }: ChatbotProps) {
  const { t } = useTranslations(language);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: t("helloFarmingAssistant"),
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef<any>(null);

  const [isTyping, setIsTyping] = useState(false);

  const recommendedQuestions = [
    t("howToControlPests"),
    t("whatFertilizerToUse"),
    t("whenToSprayCrops"),
    t("howMuchWaterToGive"),
    t("weatherForecastForMyCrop"),
    t("marketPriceForWheat"),
  ];

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleSendMessage = async (text?: string) => {
    const finalMessage = text || inputMessage;
    if (!finalMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: finalMessage,
      timestamp: new Date(),
    };

    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const botResponse = await getChatbotResponse(finalMessage, language, formData);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: botResponse,
        timestamp: new Date(),
      };
      setMessages((prev: Message[]) => [...prev, botMessage]);

      const utterance = new SpeechSynthesisUtterance(botResponse);
      utterance.lang = language === "hi" ? "hi-IN" : "en-US";
      window.speechSynthesis.speak(utterance);
    } catch (error) {
       console.error(error);
    } finally {
       setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-[0_0_20px_rgba(22,163,74,0.4)] z-50 hover:scale-110 transition-transform duration-300 border-2 border-white"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 w-full sm:w-96 h-[100dvh] sm:h-[600px] shadow-2xl z-[100] border-green-200 flex flex-col bg-white sm:rounded-2xl rounded-none transition-all duration-300 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shrink-0 sm:rounded-t-2xl rounded-none">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            {t('farmAssistant')}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-green-100 text-sm mt-1 opacity-90">
          {t('chatbotDescription')}
        </p>
      </CardHeader>

      <CardContent className="p-0 flex flex-col flex-1">
        {/* Messages with fixed height + scroll only */}
        <ScrollArea className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message: Message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.type === "bot" && (
                      <Bot className="h-4 w-4 mt-0.5 text-green-600" />
                    )}
                    {message.type === "user" && (
                      <User className="h-4 w-4 mt-0.5" />
                    )}
                    <span className="text-sm">{message.content}</span>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800">
                  <div className="flex items-start gap-2">
                    <Bot className="h-4 w-4 mt-0.5 text-green-600" />
                    <span className="text-sm italic text-gray-500">{t('thinking')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Recommended Questions */}
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {recommendedQuestions.map((q, i) => (
              <Button
                key={i}
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handleSendMessage(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>

        {/* Input + mic + close button */}
        <div className="p-3 sm:p-4 border-t border-green-100 bg-gray-50 shrink-0">
          <div className="flex gap-2 items-center">
            <Input
              value={inputMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('typeYourQuestion')}
              className="flex-1 border-green-200 focus:border-green-500 bg-white rounded-full px-4"
            />
            <Button
              onClick={() => handleSendMessage()}
              size="icon"
              className="bg-green-600 hover:bg-green-700 h-10 w-10 rounded-full shrink-0 shadow-md transition-transform hover:scale-105"
              disabled={!inputMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button
              onClick={startListening}
              size="icon"
              className={`${
                listening ? "bg-red-500 animate-pulse" : "bg-green-500 hover:bg-green-600"
              } h-10 w-10 rounded-full shrink-0 shadow-md transition-all hover:scale-105`}
            >
              <Mic className="h-4 w-4 text-white" />
            </Button>
          </div>
          {/* Mobile close button at the bottom */}
          <div className="mt-3 text-center sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1" /> Close Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
