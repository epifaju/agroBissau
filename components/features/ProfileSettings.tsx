'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Save, Upload } from 'lucide-react';

export function ProfileSettings() {
  const { user } = useAuth();
  const t = useTranslations('settings');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone((user as any).phone || '');
      setAvatar((user as any).avatar || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/users/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          avatar,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
        // Refresh user data
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la mise à jour' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Upload via API sécurisée
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.url) {
        setAvatar(data.url);
        setMessage({ type: 'success', text: 'Avatar mis à jour' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors du téléchargement' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du téléchargement' });
    }
  };

  const userInitials = `${firstName[0] || ''}${lastName[0] || ''}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Avatar Section */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Photo de profil</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-20 w-20 md:h-24 md:w-24">
              <AvatarImage src={avatar} />
              <AvatarFallback className="text-2xl md:text-3xl">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto touch-target"
                  asChild
                >
                  <label htmlFor="avatar-upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Changer la photo
                  </label>
                </Button>
              </Label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">
                PNG, JPG jusqu'à 2MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm md:text-base">
                Prénom *
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="lastName" className="text-sm md:text-base">
                Nom *
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-sm md:text-base">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="mt-1 bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              L'email ne peut pas être modifié
            </p>
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm md:text-base">
              Téléphone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+245 955 123 456"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            'Enregistrement...'
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

