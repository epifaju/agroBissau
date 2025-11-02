'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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

export function ReportButton({
  reportedUserId,
  reportedListingId,
  variant = 'icon',
}: ReportButtonProps) {
  const t = useTranslations('report');
  const tCommon = useTranslations('common');
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const REPORT_TYPES = [
    { value: 'SPAM', label: t('types.spam') },
    { value: 'INAPPROPRIATE', label: t('types.inappropriate') },
    { value: 'FAKE', label: t('types.fake') },
    { value: 'COPYRIGHT', label: t('types.copyright') },
    { value: 'SCAM', label: t('types.scam') },
    { value: 'OTHER', label: t('types.other') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    if (!type) {
      setError(t('errors.selectType'));
      return;
    }

    if (description.length < 10) {
      setError(t('errors.minDescription'));
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
        throw new Error(data.error || t('errors.createError'));
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
      setError(err.message || tCommon('error'));
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
      {t('button')}
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
          <ModalTitle>{t('title')}</ModalTitle>
          <ModalDescription>
            {reportedListingId
              ? t('descriptionListing')
              : t('descriptionUser')}
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">{t('typeLabel')} *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder={t('typePlaceholder')} />
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
                <Label htmlFor="reason">{t('reasonLabel')}</Label>
                <Textarea
                  id="reason"
                  placeholder={t('reasonPlaceholder')}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">{t('descriptionLabel')} *</Label>
              <Textarea
                id="description"
                placeholder={t('descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                minLength={10}
              />
              <p className="text-xs text-gray-500">
                {description.length}/{t('minChars')}
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                {t('success')}
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
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={loading || !type || description.length < 10}>
              {loading ? t('sending') : t('submit')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

