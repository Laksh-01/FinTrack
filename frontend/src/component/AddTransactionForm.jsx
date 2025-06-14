import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { transactionSchema } from '../lib/schema'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select"
import { Input } from '../../components/ui/input'
import CreateAccountDrawer from './CreateAccountDrawer'
import { Button } from '../../components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { CalendarRangeIcon, Loader2 } from 'lucide-react'
import { Calendar } from '../../components/ui/calendar'
import { format } from 'date-fns'
import { Switch } from '../../components/ui/switch'

import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { toast } from 'sonner'
import ReceiptScanner from './ReceiptScanner'

const AddTransactionForm = ({ accounts, categories, editMode = false, initialData = null }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [transaction, setTransaction] = useState("")
  const { user } = useUser()
  const { accountId } = useParams()

    const {
    register,
    handleSubmit,
    control, 
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: "",
      description: "",
      accountId: "",
      category: "",
      date: new Date(),
      isRecurring: false,
      recurringInterval: undefined,
    },
  });

  const [hasInitialized, setHasInitialized] = useState(false)

  

  useEffect(() => {
  if (editMode && initialData && !hasInitialized) {
  
    setValue("type", initialData.type);
    setValue("amount", initialData.amount.toString());
    setValue("description", initialData.description);
    setValue("accountId", initialData.accountId);
    setValue("category", initialData.category);
    setValue("date", new Date(initialData.date));
    setValue("isRecurring", initialData.isRecurring);

    if (initialData.recurringInterval) {
      setValue("recurringInterval", initialData.recurringInterval);
    }

    // setHasInitialized(true);
  } else if (!editMode && accounts.length > 0) {
    const defaultAccountId = accounts.find((ac) => ac.isDefault)?.id;
    if (defaultAccountId) {
      setValue("accountId", defaultAccountId);
    
    }
  }
}, [accounts]);

 

  useEffect(() => {
    if (transaction && !loading) {
      if(editMode){
         toast.success("Transaction updated successfully")
      }else{
         toast.success("Transaction created successfully")
      }
     
      navigate(`/account/${getValues("accountId")}`)
      reset()
    }
  }, [transaction, loading, getValues, navigate, reset])

  const clerkUserId = user?.id
  const createTransaction = async (data, accountId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/transaction/create-transaction`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ clerkUserId, accountId, data }),
      })

      if (!response.ok) throw new Error('Failed to fetch accounts')
      const result = await response.json()
      setTransaction(result.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTransaction = async (data,accountId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/transaction/update-transaction`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
       body: JSON.stringify({ clerkUserId, accountId, id: initialData.id, data }),
      })

      if (!response.ok) throw new Error('Failed to fetch accounts')
      const result = await response.json()
      //  console.log(result);
      setTransaction(result.transaction)

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
  const formData = {
    ...data,
    amount: parseFloat(data.amount),
  };
  setLoading(true);
  
  if (editMode && initialData?.id) {
     updateTransaction(formData, getValues("accountId"));
  } else {
     createTransaction(formData, getValues("accountId"));
  }
};


  const type = watch("type")
  const isRecurring = watch("isRecurring")
  const date = watch("date")

  const filteredCategories = categories.filter((category) => category.type === type)

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString())
      setValue("date", new Date(scannedData.date))
      if (scannedData.description) setValue("description", scannedData.description)
      if (scannedData.category) setValue("category", scannedData.category)
      toast.success("Receipt scanned successfully")
    }
  }



  return (
    <form className="space-y-6 pb-10 " onSubmit={handleSubmit(onSubmit)}>
      <ReceiptScanner onScanComplete={handleScanComplete} />

      <div className="space-y-2">
        <label className="text-sm font-medium ">Type</label>
     <Select
  onValueChange={(value) => setValue("type", value)}
  value={watch("type")}  
  className ="pb-10" 
>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
      </div>

      {/* Amount & Account */}
      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium block w-[150px]">Amount</label>
          <Input type="number" step="0.01" placeholder="0.00" {...register("amount")} />
          {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
        </div>

        <div className="space-y-2">
        <label className="text-sm font-medium block w-[150px]">Account</label>


          <Select 
          onValueChange={(value) => setValue("accountId", value)}
          value={watch("accountId")}  
          >
            <SelectTrigger >
              <SelectValue placeholder="Select account"  children={accounts.find(ac => ac.id === watch("accountId"))?.name} />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} (₹{parseFloat(account.balance).toFixed(2)})
                </SelectItem>
              ))}
              <CreateAccountDrawer>
                <Button variant="ghost" className="w-full justify-start text-left text-sm">
                  Create Account
                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>
          {errors.accountId && <p className="text-sm text-red-500">{errors.accountId.message}</p>}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium block w-[150px]">Category</label>
   <Select    
   value={watch("category")} 
   onValueChange={(value) => setValue("category", value)}
   >


          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium block w-[150px]">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full pl-3 text-left font-normal">
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarRangeIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setValue("date", date)}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium block w-[150px]">Description</label>
        <Input placeholder="Enter description" {...register("description")} />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

    
<Controller
  name="isRecurring"
  control={control}

  render={({ field }) => (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <label className="text-sm font-medium block w-[150px]">Recurring Transaction</label>
        <p className="text-sm text-muted-foreground">
          Set up a recurring schedule for this transaction
        </p>
      </div>
      <Switch
  
        checked={field.value}
        onCheckedChange={field.onChange}
      />
    </div>
  )}
/>


      {/* Recurring Interval */}
      {isRecurring && (
        <div className="space-y-2">
          <label className="text-sm font-medium block w-[150px]">Recurring Interval</label>
        <Select
        onValueChange={(value) => setValue("recurringInterval", value)}
        value={watch("recurringInterval")}  
        >

            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-sm text-red-500">{errors.recurringInterval.message}</p>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4 m-5">
        <Button type="button" variant="outline" className="w-[50%]" onClick={() => navigate('/app/v1/dashboard')}>
          Cancel
        </Button>
        <Button type="submit" className="w-[50%]" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  )
}

export default AddTransactionForm
