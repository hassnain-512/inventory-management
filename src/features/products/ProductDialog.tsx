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
import { Textarea } from '@/components/common/Textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/common/Select';
import { useAppSelector } from '@/store/hooks';
import { Product } from '@/types';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  code: z.string().min(1, 'Product code is required'),
  companyId: z.string().min(1, 'Company is required'),
  categoryId: z.string().min(1, 'Category is required'),
  basePrice: z.coerce.number().positive('Base price must be positive'),
  retailerPrice: z.coerce.number().positive('Retailer price must be positive'),
  stock: z.coerce.number().int().min(0, 'Stock must be 0 or more'),
  batchCode: z.string().min(1, 'Batch code is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  description: z.string().optional().default(''),
  status: z.enum(['active', 'inactive']),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (data: Omit<Product, 'id' | 'createdAt'>) => void;
}

export function ProductDialog({ open, onOpenChange, product, onSave }: ProductDialogProps) {
  const { companies } = useAppSelector(state => state.companies);
  const { categories } = useAppSelector(state => state.categories);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', code: '', companyId: '', categoryId: '',
      basePrice: 0, retailerPrice: 0, stock: 0,
      batchCode: '', expiryDate: '', description: '', status: 'active',
    },
  });

  const selectedCompanyId = watch('companyId');
  const filteredCategories = categories.filter(
    c => c.companyId === selectedCompanyId && c.status === 'active'
  );

  useEffect(() => {
    if (product) {
      reset({
        name: product.name, code: product.code,
        companyId: product.companyId, categoryId: product.categoryId,
        basePrice: product.basePrice, retailerPrice: product.retailerPrice,
        stock: product.stock, batchCode: product.batchCode,
        expiryDate: product.expiryDate, description: product.description,
        status: product.status,
      });
    } else {
      reset({
        name: '', code: '', companyId: '', categoryId: '',
        basePrice: 0, retailerPrice: 0, stock: 0,
        batchCode: '', expiryDate: '', description: '', status: 'active',
      });
    }
  }, [product, reset, open]);

  const onSubmit = (data: ProductFormData) => {
    onSave({ ...data, description: data.description || '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company *</Label>
              <Select
                value={watch('companyId')}
                onValueChange={v => { setValue('companyId', v); setValue('categoryId', ''); }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.filter(c => c.status === 'active').map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.companyId && <p className="text-sm text-destructive">{errors.companyId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={watch('categoryId')}
                onValueChange={v => setValue('categoryId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input {...register('name')} placeholder="Product name" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Product Code *</Label>
              <Input {...register('code')} placeholder="e.g. AMX-500" />
              {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Base Price *</Label>
              <Input type="number" step="0.01" {...register('basePrice')} placeholder="0.00" />
              {errors.basePrice && <p className="text-sm text-destructive">{errors.basePrice.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Retailer Price *</Label>
              <Input type="number" step="0.01" {...register('retailerPrice')} placeholder="0.00" />
              {errors.retailerPrice && <p className="text-sm text-destructive">{errors.retailerPrice.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Stock *</Label>
              <Input type="number" {...register('stock')} placeholder="0" />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Batch Code *</Label>
              <Input {...register('batchCode')} placeholder="BCH-001" />
              {errors.batchCode && <p className="text-sm text-destructive">{errors.batchCode.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Expiry Date *</Label>
              <Input type="date" {...register('expiryDate')} />
              {errors.expiryDate && <p className="text-sm text-destructive">{errors.expiryDate.message}</p>}
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
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...register('description')} placeholder="Product description" rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{product ? 'Update' : 'Add'} Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
