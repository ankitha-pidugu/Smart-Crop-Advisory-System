import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, Key, Loader2, Mail } from 'lucide-react';
import { translate } from '../../utils/translations';

interface ForgotPasswordProps {
  onResetPassword: (email: string) => Promise<void>;
  onBackToLogin: () => void;
  language: string;
  isLoading?: boolean;
}

export function ForgotPassword({ onResetPassword, onBackToLogin, language, isLoading = false }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError(translate('emailRequired', language));
      return;
    }

    try {
      await onResetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : translate('resetPasswordError', language));
    }
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-start mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToLogin}
              className="p-2"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1" />
          </div>
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Key className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">{translate('resetPassword', language)}</CardTitle>
          <CardDescription>
            {translate('resetPasswordDescription', language)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <Alert className="border-green-200 bg-green-50">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {translate('resetEmailSent', language)}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {translate('checkEmailInstructions', language)}
                </p>
                <Button
                  variant="outline"
                  onClick={onBackToLogin}
                  className="w-full"
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {translate('backToLogin', language)}
                </Button>
              </div>
            </div>
          ) : (
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
                  value={email}
                  onChange={(e) => handleInputChange(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {translate('sendingResetLink', language)}
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    {translate('sendResetLink', language)}
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-green-600 hover:text-green-700"
                  onClick={onBackToLogin}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {translate('backToLogin', language)}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}