'use client';

import { useState, useEffect } from 'react';
import { Plus, Folder, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Group {
  id: number;
  name: string;
  created_at: string;
}

export function GroupManager() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newGroupName.trim() }),
      });

      if (response.ok) {
        setNewGroupName('');
        setIsCreateDialogOpen(false);
        loadGroups();
      } else {
        const error = await response.json();
        alert(`Failed to create group: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteGroup = async (groupId: number) => {
    try {
      // TODO: Implement delete group API
      console.log('Deleting group:', groupId);
      loadGroups();
    } catch (error) {
      console.error('Failed to delete group:', error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Groups</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Group</DialogTitle>
              <DialogDescription>
                Create a new group to organize your documents.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    createGroup();
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={createGroup}
                disabled={isCreating || !newGroupName.trim()}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading groups...</div>
        ) : groups.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            No groups yet
            <br />
            <span className="text-xs">Create your first group to organize documents</span>
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded border"
            >
              <div className="flex items-center space-x-2">
                <Folder className="h-3 w-3 text-gray-500" />
                <span className="text-sm">{group.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteGroup(group.id)}
                className="h-5 w-5 p-0 text-gray-400 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
