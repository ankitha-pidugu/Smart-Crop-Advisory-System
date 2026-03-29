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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg z-50"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 h-[500px] shadow-2xl z-50 border-green-200 flex flex-col">
      <CardHeader className="bg-green-600 text-white rounded-t-lg p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5" />
            {t('farmAssistant')}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-green-700 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-green-100 text-sm">
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

        {/* Input + mic + back button */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2 items-center">
            <Input
              value={inputMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('typeYourQuestion')}
              className="flex-1 border-green-200 focus:border-green-500"
            />
            <Button
              onClick={() => handleSendMessage()}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              disabled={!inputMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button
              onClick={startListening}
              size="sm"
              className={`${
                listening ? "bg-red-500" : "bg-green-500"
              } hover:opacity-80`}
            >
              <Mic className="h-4 w-4 text-white" />
            </Button>
          </div>
          {/* Wrong/Back button */}
          <div className="mt-2 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-red-500 border-red-300 hover:bg-red-100"
            >
              <X className="h-4 w-4 mr-1" /> {t('back')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
