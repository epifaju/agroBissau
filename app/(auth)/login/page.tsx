'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loginSchema } from '@/lib/validations';
import { Mail, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = loginSchema.parse({ email, password });

      const response = await signIn('credentials', {
        email: result.email,
        password: result.password,
        redirect: false,
      });

      if (response?.error) {
        if (response.error === 'EMAIL_NOT_VERIFIED') {
          setRegisteredEmail(email);
          setError('Veuillez vérifier votre email avant de vous connecter. Un email de vérification vous a été envoyé.');
        } else {
          setError(t('error.invalid'));
        }
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || t('error.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        setError('Un nouveau lien de vérification a été envoyé à votre email.');
        setTimeout(() => setError(''), 5000);
      } else {
        setError(data.error || 'Erreur lors de l\'envoi du lien');
      }
    } catch (error) {
      setError('Erreur lors de l\'envoi du lien');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{t('title')}</CardTitle>
          <CardDescription className="text-center">
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
                {registeredEmail && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={handleResendVerification}
                    disabled={resending}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {resending ? 'Envoi en cours...' : 'Renvoyer le lien'}
                  </Button>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('submitting') : t('submit')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">{t('noAccount')} </span>
            <Link href="/register" className="text-green-600 hover:underline">
              {t('registerLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

