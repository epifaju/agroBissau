import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('errors.404');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {t('message')}
        </h2>
        <p className="text-gray-600 mb-8">
          {t('description')}
        </p>
        <Link href="/">
          <Button>{t('backHome')}</Button>
        </Link>
      </div>
    </div>
  );
}

