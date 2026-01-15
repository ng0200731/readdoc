'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Document } from '@/lib/db-utils';

interface RenameDialogProps {
  document: Document;
  onRename: (documentId: number, newName: string) => void;
  onClose: () => void;
}

export function RenameDialog({ document, onRename, onClose }: RenameDialogProps) {
  const [newName, setNewName] = useState(document.name);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newName.trim() === document.name) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await onRename(document.id, newName.trim());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Document</DialogTitle>
          <DialogDescription>
            Enter a new name for &ldquo;{document.original_name}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new document name"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !newName.trim()}>
              {isLoading ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
