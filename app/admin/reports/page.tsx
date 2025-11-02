'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flag, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/utils';

interface Report {
  id: string;
  type: string;
  reason: string | null;
  description: string;
  status: string;
  reporter: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reportedUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  reportedListing: {
    id: string;
    title: string;
    status: string;
  } | null;
  adminNote: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  SPAM: 'Spam',
  INAPPROPRIATE: 'Inapproprié',
  FAKE: 'Faux',
  COPYRIGHT: 'Copyright',
  SCAM: 'Arnaque',
  OTHER: 'Autre',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  REVIEWING: 'En cours',
  RESOLVED: 'Résolu',
  DISMISSED: 'Rejeté',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  REVIEWING: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800',
  DISMISSED: 'bg-gray-100 text-gray-800',
};

export default function AdminReportsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    limit: 20,
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchReports();
    }
  }, [isLoading, isAuthenticated, page, statusFilter, typeFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
      });

      const response = await fetch(`/api/admin/reports?${params}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');

      const data = await response.json();
      setReports(data.reports);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setAdminNote(report.adminNote || '');
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedReport) return;

    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/admin/reports/${selectedReport.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminNote: adminNote || undefined,
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');

      // Rafraîchir la liste
      await fetchReports();
      setShowDetailModal(false);
      setSelectedReport(null);
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Erreur lors de la mise à jour du rapport');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Chargement...</div>;
  }

  if (!isAuthenticated || (user as any)?.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">Accès refusé. Administrateur requis.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Rapports</h1>
            <p className="text-gray-600 mt-2">
              Gérez les signalements de contenu inapproprié
            </p>
          </div>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Statut</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="PENDING">En attente</SelectItem>
                    <SelectItem value="REVIEWING">En cours</SelectItem>
                    <SelectItem value="RESOLVED">Résolu</SelectItem>
                    <SelectItem value="DISMISSED">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    {Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table des rapports */}
        <Card>
          <CardHeader>
            <CardTitle>Rapports ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun rapport trouvé
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Contenu signalé</TableHead>
                      <TableHead>Signaleur</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {REPORT_TYPE_LABELS[report.type] || report.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {report.reportedListing ? (
                            <div>
                              <p className="font-medium">Annonce: {report.reportedListing.title}</p>
                              <p className="text-sm text-gray-500">ID: {report.reportedListing.id}</p>
                            </div>
                          ) : report.reportedUser ? (
                            <div>
                              <p className="font-medium">
                                Utilisateur: {report.reportedUser.firstName} {report.reportedUser.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{report.reportedUser.email}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {report.reporter.firstName} {report.reporter.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{report.reporter.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[report.status] || ''}>
                            {STATUS_LABELS[report.status] || report.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(report.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(report)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-600">
                      Page {page} sur {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Modal de détails */}
        {selectedReport && (
          <Modal open={showDetailModal} onOpenChange={setShowDetailModal}>
            <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <ModalHeader>
                <ModalTitle>Détails du rapport</ModalTitle>
                <ModalDescription>
                  Rapport #{selectedReport.id.substring(0, 8)}...
                </ModalDescription>
              </ModalHeader>

              <div className="space-y-4 py-4">
                <div>
                  <h3 className="font-semibold mb-2">Type</h3>
                  <Badge>{REPORT_TYPE_LABELS[selectedReport.type] || selectedReport.type}</Badge>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.description}</p>
                </div>

                {selectedReport.reason && (
                  <div>
                    <h3 className="font-semibold mb-2">Raison</h3>
                    <p className="text-gray-700">{selectedReport.reason}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Signaleur</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <p>
                      {selectedReport.reporter.firstName} {selectedReport.reporter.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{selectedReport.reporter.email}</p>
                  </div>
                </div>

                {selectedReport.reportedUser && (
                  <div>
                    <h3 className="font-semibold mb-2">Utilisateur signalé</h3>
                    <div className="bg-gray-50 p-3 rounded">
                      <p>
                        {selectedReport.reportedUser.firstName} {selectedReport.reportedUser.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{selectedReport.reportedUser.email}</p>
                    </div>
                  </div>
                )}

                {selectedReport.reportedListing && (
                  <div>
                    <h3 className="font-semibold mb-2">Annonce signalée</h3>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">{selectedReport.reportedListing.title}</p>
                      <p className="text-sm text-gray-600">ID: {selectedReport.reportedListing.id}</p>
                      <p className="text-sm text-gray-600">
                        Statut: {selectedReport.reportedListing.status}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Note administrateur</h3>
                  <Textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Ajouter une note (optionnel)..."
                    rows={3}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Statut actuel</h3>
                  <Badge className={STATUS_COLORS[selectedReport.status] || ''}>
                    {STATUS_LABELS[selectedReport.status] || selectedReport.status}
                  </Badge>
                </div>
              </div>

              <ModalFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedReport(null);
                  }}
                  disabled={updatingStatus}
                >
                  Fermer
                </Button>
                {selectedReport.status !== 'RESOLVED' && (
                  <Button
                    variant="default"
                    onClick={() => handleUpdateStatus('RESOLVED')}
                    disabled={updatingStatus}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Résoudre
                  </Button>
                )}
                {selectedReport.status !== 'DISMISSED' && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus('DISMISSED')}
                    disabled={updatingStatus}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeter
                  </Button>
                )}
                {selectedReport.status !== 'REVIEWING' && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus('REVIEWING')}
                    disabled={updatingStatus}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    En cours d'examen
                  </Button>
                )}
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </div>
    </div>
  );
}

