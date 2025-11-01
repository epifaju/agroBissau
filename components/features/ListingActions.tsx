'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface ListingActionsProps {
  listingId: string;
  onDelete?: () => void;
}

export function ListingActions({ listingId, onDelete }: ListingActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la suppression');
        return;
      }

      if (onDelete) {
        onDelete();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Erreur lors de la suppression de l\'annonce');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <Link href={`/listings/edit/${listingId}`}>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Modifier
        </Button>
      </Link>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={deleting}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        {deleting ? 'Suppression...' : 'Supprimer'}
      </Button>
    </div>
  );
}

