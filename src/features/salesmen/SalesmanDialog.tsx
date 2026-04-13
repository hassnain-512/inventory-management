import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/common/Dialog';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/common/Select';
import { Salesman } from '@/types';

const salesmanSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d{1}$/, 'CNIC format: 42101-1234567-1'),
  mobile: z.string().regex(/^03\d{9}$/, 'Mobile format: 03XXXXXXXXX'),
  email: z.string().email('Invalid email').or(z.string().length(0)).optional().default(''),
  address: z.string().min(1, 'Address is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  status: z.enum(['active', 'inactive']),
});

type SalesmanFormData = z.infer<typeof salesmanSchema>;

interface SalesmanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesman: Salesman | null;
  onSave: (data: Omit<Salesman, 'id' | 'createdAt'>) => void;
}

export function SalesmanDialog({ open, onOpenChange, salesman, onSave }: SalesmanDialogProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SalesmanFormData>({
    resolver: zodResolver(salesmanSchema),
    defaultValues: {
      name: '', cnic: '', mobile: '', email: '',
      address: '', dateOfBirth: '', joiningDate: '', status: 'active',
    },
  });

  useEffect(() => {
    if (salesman) {
      reset({
        name: salesman.name, cnic: salesman.cnic, mobile: salesman.mobile,
        email: salesman.email, address: salesman.address,
        dateOfBirth: salesman.dateOfBirth, joiningDate: salesman.joiningDate,
        status: salesman.status,
      });
    } else {
      reset({
        name: '', cnic: '', mobile: '', email: '',
        address: '', dateOfBirth: '', joiningDate: '', status: 'active',
      });
    }
  }, [salesman, reset, open]);

  const onSubmit = (data: SalesmanFormData) => {
    onSave({ ...data, email: data.email || '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{salesman ? 'Edit Salesman' : 'Add Salesman'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Full Name *</Label>
              <Input {...register('name')} placeholder="Full name" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>CNIC *</Label>
              <Input {...register('cnic')} placeholder="42101-1234567-1" />
              {errors.cnic && <p className="text-sm text-destructive">{errors.cnic.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Mobile *</Label>
              <Input {...register('mobile')} placeholder="03001234567" />
              {errors.mobile && <p className="text-sm text-destructive">{errors.mobile.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register('email')} placeholder="email@example.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Date of Birth *</Label>
              <Input type="date" {...register('dateOfBirth')} />
              {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Joining Date *</Label>
              <Input type="date" {...register('joiningDate')} />
              {errors.joiningDate && <p className="text-sm text-destructive">{errors.joiningDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={watch('status')}
                onValueChange={v => setValue('status', v as 'active' | 'inactive')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Address *</Label>
              <Input {...register('address')} placeholder="Home address" />
              {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{salesman ? 'Update' : 'Add'} Salesman</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
