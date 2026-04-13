import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/common/Table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/common/Select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/common/AlertDialog';
import { SalesmanDialog } from './SalesmanDialog';
import { useSalesmen } from '@/hooks/useSalesmen';
import { Salesman } from '@/types';
import { formatDate } from '@/utils/helpers';
import { MESSAGES } from '@/constants';

export function SalesmenPage() {
  const {
    filteredSalesmen,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    addSalesman,
    updateSalesman,
    deleteSalesman,
    toggleStatus,
  } = useSalesmen();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSalesman, setEditingSalesman] = useState<Salesman | null>(null);

  const handleSave = (data: Omit<Salesman, 'id' | 'createdAt'>) => {
    if (editingSalesman) {
      updateSalesman({ ...data, id: editingSalesman.id, createdAt: editingSalesman.createdAt });
      toast.success(MESSAGES.SALESMAN_UPDATED);
    } else {
      addSalesman(data);
      toast.success(MESSAGES.SALESMAN_ADDED);
    }
    setDialogOpen(false);
    setEditingSalesman(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or CNIC..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditingSalesman(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Salesman
        </Button>
      </div>

      <div className="border rounded-lg bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>CNIC</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joining Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSalesmen.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No salesmen found
                </TableCell>
              </TableRow>
            ) : (
              filteredSalesmen.map((salesman, index) => (
                <TableRow key={salesman.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{salesman.name}</TableCell>
                  <TableCell>{salesman.cnic}</TableCell>
                  <TableCell>{salesman.mobile}</TableCell>
                  <TableCell>{salesman.email}</TableCell>
                  <TableCell>{formatDate(salesman.joiningDate)}</TableCell>
                  <TableCell>
                    <Badge variant={salesman.status === 'active' ? 'success' : 'secondary'}>
                      {salesman.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => toggleStatus(salesman.id)}>
                        {salesman.status === 'active' ? (
                          <ToggleRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditingSalesman(salesman); setDialogOpen(true); }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Salesman</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete "{salesman.name}"? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => {
                                deleteSalesman(salesman.id);
                                toast.success(MESSAGES.SALESMAN_DELETED);
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SalesmanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        salesman={editingSalesman}
        onSave={handleSave}
      />
    </div>
  );
}
