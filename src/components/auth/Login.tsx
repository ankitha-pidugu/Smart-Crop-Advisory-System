import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { translate } from '../../utils/translations';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
  language: string;
  isLoading?: boolean;
}

export function Login({ onLogin, onSwitchToSignUp, onForgotPassword, language, isLoading = false }: LoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email.trim()) {
      setError(translate('emailRequired', language));
      return;
    }

    if (!formData.password.trim()) {
      setError(translate('passwordRequired', language));
      return;
    }

    try {
      await onLogin(formData.email, formData.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : translate('loginError', language));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <LogIn className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">{translate('welcomeBack', language)}</CardTitle>
          <CardDescription>
            {translate('loginDescription', language)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{translate('email', language)}</Label>
              <Input
                id="email"
                type="email"
                placeholder={translate('enterEmail', language)}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{translate('password', language)}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={translate('enterPassword', language)}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                className="p-0 text-green-600 hover:text-green-700 text-sm"
                onClick={onForgotPassword}
                disabled={isLoading}
              >
                {translate('forgotPassword', language)}
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {translate('signingIn', language)}
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  {translate('signIn', language)}
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {translate('noAccount', language)}{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 text-green-600 hover:text-green-700"
                  onClick={onSwitchToSignUp}
                  disabled={isLoading}
                >
                  {translate('signUp', language)}
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}