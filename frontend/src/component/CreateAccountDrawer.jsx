import React, { useState } from 'react'

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "../../components/ui/drawer";
import {Input } from '../../components/ui/input';
import {Select,SelectContent,SelectItem,SelectTrigger , SelectValue} from '../../components/ui/select';
import {Switch} from '../../components/ui/switch';
import { Button } from '../../components/ui/button';

import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import { accountSchema } from '../lib/schema';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';







const CreateAccountDrawer = ({ children, onAccountCreated }) => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: 'CURRENT',
      balance: '',
      isDefault: false,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = { ...data, userId: user.id };

      const response = await fetch('http://localhost:3000/api/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create account');
      }

      const result = await response.json();

      toast.success('Account Created!');
      reset();
      setOpen(false);

      // ✅ Trigger parent re-fetch
      if (onAccountCreated) {
        onAccountCreated(); // this will re-fetch accounts in DashboardPage
      }

    } catch (error) {
      console.log('Error:', error);
      toast.error('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Account</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Account Name</label>
              <Input id="name" placeholder="e.g. Main Checking" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            {/* Type Select */}
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">Account Type</label>
              <Select
                onValueChange={(value) => setValue('type', value)}
                defaultValue={watch('type')}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
            </div>

            {/* Balance Input */}
            <div className="space-y-2">
              <label htmlFor="balance" className="text-sm font-medium">Initial Balance</label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('balance')}
              />
              {errors.balance && <p className="text-sm text-red-500">{errors.balance.message}</p>}
            </div>

            {/* Default Switch */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <label htmlFor="balance" className="text-sm font-medium cursor-pointer">
                  Set as Default
                </label>
                <p className="text-sm text-muted-foreground">
                  This account will be selected by default for transactions
                </p>
              </div>
              <Switch
                id="isDefault"
                onCheckedChange={(checked) => setValue('isDefault', checked)}
                checked={watch('isDefault')}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button type="submit" className="flex-1">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateAccountDrawer;
