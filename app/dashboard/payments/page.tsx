'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';
import { CreditCard, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function PaymentsPage() {
  const { user, isLoading } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && user) {
      fetchTransactions();
    }
  }, [isLoading, user, page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/payments/history?page=${page}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'CANCELLED':
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      COMPLETED: 'default',
      PENDING: 'secondary',
      FAILED: 'destructive',
      CANCELLED: 'outline',
    };

    const labels: { [key: string]: string } = {
      COMPLETED: 'Complété',
      PENDING: 'En attente',
      FAILED: 'Échoué',
      CANCELLED: 'Annulé',
    };

    return (
      <Badge variant={variants[status] as any}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Historique des paiements</h1>

        {transactions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Aucune transaction pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {getStatusIcon(transaction.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">
                              {transaction.listing
                                ? transaction.listing.title
                                : 'Abonnement'}
                            </p>
                            {getStatusBadge(transaction.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            {transaction.paymentMethod.replace('_', ' ')} •{' '}
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {formatPrice(transaction.amount)}
                          </p>
                          <p className="text-xs text-gray-500">CFA</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Précédent
                </button>
                <span className="px-4 py-2">
                  Page {page} sur {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

