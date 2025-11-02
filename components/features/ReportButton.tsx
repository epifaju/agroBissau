'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui/modal';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';

interface ReportButtonProps {
  reportedUserId?: string;
  reportedListingId?: string;
  variant?: 'icon' | 'button';
}

const REPORT_TYPES = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'INAPPROPRIATE', label: 'Contenu inapproprié' },
  { value: 'FAKE', label: 'Contenu faux ou trompeur' },
  { value: 'COPYRIGHT', label: 'Violation de droits d\'auteur' },
  { value: 'SCAM', label: 'Arnaque' },
  { value: 'OTHER', label: 'Autre' },
];

export function ReportButton({
  reportedUserId,
  reportedListingId,
  variant = 'icon',
}: ReportButtonProps) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    if (!type) {
      setError('Veuillez sélectionner un type de signalement');
      return;
    }

    if (description.length < 10) {
      setError('La description doit contenir au moins 10 caractères');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          reason: reason || undefined,
          description,
          reportedUserId: reportedUserId || undefined,
          reportedListingId: reportedListingId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du rapport');
      }

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setType('');
        setReason('');
        setDescription('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      setType('');
      setReason('');
      setDescription('');
      setError(null);
      setSuccess(false);
    }
    setOpen(newOpen);
  };

  if (!isAuthenticated && variant === 'icon') {
    return null;
  }

  const buttonContent = variant === 'icon' ? (
    <Flag className="w-4 h-4" />
  ) : (
    <>
      <Flag className="w-4 h-4 mr-2" />
      Signaler
    </>
  );

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalTrigger asChild>
        <Button
          variant={variant === 'icon' ? 'ghost' : 'outline'}
          size={variant === 'icon' ? 'icon' : 'default'}
          className={variant === 'icon' ? 'h-8 w-8' : ''}
          onClick={() => {
            if (!isAuthenticated) {
              window.location.href = '/login';
            }
          }}
        >
          {buttonContent}
        </Button>
      </ModalTrigger>

      <ModalContent>
        <ModalHeader>
          <ModalTitle>Signaler un contenu</ModalTitle>
          <ModalDescription>
            {reportedListingId
              ? 'Vous êtes sur le point de signaler une annonce. Veuillez nous aider à comprendre le problème.'
              : 'Vous êtes sur le point de signaler un utilisateur. Veuillez nous aider à comprendre le problème.'}
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type de signalement *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((reportType) => (
                    <SelectItem key={reportType.value} value={reportType.value}>
                      {reportType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === 'OTHER' && (
              <div className="space-y-2">
                <Label htmlFor="reason">Raison (optionnel)</Label>
                <Textarea
                  id="reason"
                  placeholder="Décrivez brièvement la raison..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Décrivez en détail le problème... (minimum 10 caractères)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                minLength={10}
              />
              <p className="text-xs text-gray-500">
                {description.length}/10 caractères minimum
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                Rapport créé avec succès. Nous examinerons votre signalement sous peu.
              </div>
            )}
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !type || description.length < 10}>
              {loading ? 'Envoi...' : 'Envoyer le rapport'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

