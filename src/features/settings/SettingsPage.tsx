import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/common/Select';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateSettings } from '@/features/settings/settingsSlice';
import { CURRENCY_OPTIONS, MESSAGES } from '@/constants';

const settingsSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessAddress: z.string().min(1, 'Address is required'),
  contactEmail: z.string().email('Invalid email'),
  contactPhone: z.string().min(1, 'Phone is required'),
  currencySymbol: z.string().min(1, 'Currency is required'),
  taxPercentage: z.coerce.number().min(0).max(100),
  invoicePrefix: z.string().min(1, 'Invoice prefix is required'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(state => state.settings);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      businessName: settings.businessName,
      businessAddress: settings.businessAddress,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      currencySymbol: settings.currencySymbol,
      taxPercentage: settings.taxPercentage,
      invoicePrefix: settings.invoicePrefix,
    },
  });

  useEffect(() => {
    reset({
      businessName: settings.businessName,
      businessAddress: settings.businessAddress,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      currencySymbol: settings.currencySymbol,
      taxPercentage: settings.taxPercentage,
      invoicePrefix: settings.invoicePrefix,
    });
  }, [settings, reset]);

  const onSubmit = (data: SettingsFormData) => {
    dispatch(updateSettings(data));
    toast.success(MESSAGES.SETTINGS_SAVED);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Info */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Configure your business details for invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Business Name *</Label>
              <Input {...register('businessName')} placeholder="Your business name" />
              {errors.businessName && (
                <p className="text-sm text-destructive">{errors.businessName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Business Address *</Label>
              <Input {...register('businessAddress')} placeholder="Business address" />
              {errors.businessAddress && (
                <p className="text-sm text-destructive">{errors.businessAddress.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Email *</Label>
                <Input type="email" {...register('contactEmail')} placeholder="email@business.com" />
                {errors.contactEmail && (
                  <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Contact Phone *</Label>
                <Input {...register('contactPhone')} placeholder="021-12345678" />
                {errors.contactPhone && (
                  <p className="text-sm text-destructive">{errors.contactPhone.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Settings</CardTitle>
            <CardDescription>Configure invoice generation preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency *</Label>
                <Select
                  value={watch('currencySymbol')}
                  onValueChange={v => setValue('currencySymbol', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tax Percentage</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register('taxPercentage')}
                  placeholder="0"
                />
                {errors.taxPercentage && (
                  <p className="text-sm text-destructive">{errors.taxPercentage.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Invoice Prefix *</Label>
                <Input {...register('invoicePrefix')} placeholder="INV" />
                {errors.invoicePrefix && (
                  <p className="text-sm text-destructive">{errors.invoicePrefix.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </form>
    </div>
  );
}
