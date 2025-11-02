'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Token de vérification manquant');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Votre email a été vérifié avec succès !');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } else {
        if (data.error?.includes('expiré')) {
          setStatus('expired');
        } else {
          setStatus('error');
        }
        setMessage(data.error || 'Une erreur est survenue lors de la vérification');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Erreur lors de la vérification');
    }
  };

  const resendVerification = async () => {
    if (!email) {
      setMessage('Email manquant pour renvoyer le lien');
      return;
    }

    setResending(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStatus('loading');
      } else {
        setMessage(data.error || 'Erreur lors de l\'envoi du lien');
      }
    } catch (error) {
      setMessage('Erreur lors de l\'envoi du lien');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && <Loader2 className="w-16 h-16 mx-auto text-blue-600 animate-spin" />}
          {status === 'success' && <CheckCircle className="w-16 h-16 mx-auto text-green-600" />}
          {(status === 'error' || status === 'expired') && <XCircle className="w-16 h-16 mx-auto text-red-600" />}
          
          <CardTitle className="text-2xl mt-4">
            {status === 'loading' && 'Vérification en cours...'}
            {status === 'success' && 'Email vérifié !'}
            {status === 'expired' && 'Lien expiré'}
            {status === 'error' && 'Erreur de vérification'}
          </CardTitle>
          <CardDescription className="text-base">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 text-sm">
                  Redirection vers la page de connexion...
                </p>
              </div>
              <Button className="w-full" onClick={() => router.push('/login')}>
                Aller à la connexion
              </Button>
            </div>
          )}

          {status === 'expired' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm mb-4">
                  Le lien de vérification a expiré. Veuillez demander un nouveau lien.
                </p>
              </div>
              {email && (
                <Button 
                  className="w-full" 
                  onClick={resendVerification}
                  disabled={resending}
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Renvoyer le lien
                    </>
                  )}
                </Button>
              )}
              <div className="text-center text-sm">
                <Link href="/login" className="text-blue-600 hover:underline">
                  Retour à la connexion
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  {message}
                </p>
              </div>
              <div className="text-center space-y-2">
                <Button asChild className="w-full">
                  <Link href="/login">Retour à la connexion</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/register">Créer un compte</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

