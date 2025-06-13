import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Checkbox } from '../../components/ui/checkbox';
import { format } from 'date-fns';
import { categoryColors } from '../data/category';
import { Tooltip, TooltipProvider } from '../../components/ui/tooltip'; // Main provider from shadcn
import { TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip'; // Radix parts as in your original code
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, Search, Trash, X } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectTrigger, SelectGroup, SelectItem, SelectValue } from '../../components/ui/select';
import { useUser } from '@clerk/clerk-react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';


// This is the CSS that makes the table responsive.
// It's included here for convenience, but you can move it to a global CSS file.
const responsiveTableStyles = `
  @media (max-width: 639px) { /* Corresponds to Tailwind's 'sm' breakpoint */
    
    .responsive-transaction-table thead {
      display: none;
    }

    .responsive-transaction-table tbody,
    .responsive-transaction-table tr {
      display: block;
    }

    .responsive-transaction-table tr {
      border: 1px solid hsl(var(--border));
      border-radius: 0.375rem; /* rounded-md */
      margin-bottom: 1rem; /* mb-4 */
      position: relative;
      padding: 1rem 0.5rem 0.5rem 3.5rem; /* p-4 but with space for checkbox */
    }

    .responsive-transaction-table td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-align: right;
      padding: 0.5rem 0; /* Vertical padding between items */
      border-bottom: 1px dashed hsl(var(--border));
    }
    
    .responsive-transaction-table tr > td:last-of-type {
        border-bottom: none;
    }

    .responsive-transaction-table td[data-label]::before {
      content: attr(data-label);
      font-weight: 600;
      text-align: left;
      margin-right: 1rem;
      color: hsl(var(--muted-foreground));
    }
    
    /* Special cell for long descriptions to stack vertically */
    .responsive-transaction-table .description-cell {
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      padding-top: 1rem; /* Extra space at the top */
    }
    .responsive-transaction-table .description-cell::before {
      margin-bottom: 0.25rem; /* Space between label and value */
    }

    /* Absolute positioning for controls */
    .responsive-transaction-table .checkbox-cell {
      position: absolute;
      top: 1.25rem;
      left: 1rem;
      border: none;
      padding: 0;
      height: auto;
    }

    .responsive-transaction-table .actions-cell {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      border: none;
      padding: 0;
      height: auto;

    
    }
  }
`;


const TransactionTable = ({ transactions = [], onDataChange }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [recurringFilter, setRecurringFilter] = useState("");
    const [selectedIDs, setSelectedIds] = useState([]);
    // Added missing state for pagination logic in your filters
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({
        field: "date",
        direction: "desc",
    })

    const { user } = useUser();
    const clerkUserId = user?.id;

    const filteredAndSortedTransactions = useMemo(() => {
        let result = [...transactions];

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter((transaction) =>
                transaction.description?.toLowerCase().includes(searchLower))
        }

        if (recurringFilter) {
            result = result.filter((transaction) => {
                if (recurringFilter === "recurring") return transaction.isRecurring;
                return !transaction.isRecurring;
            });
        }

        if (typeFilter) {
            result = result.filter((transaction) => transaction.type === typeFilter);
        }

        result.sort((a, b) => {
            let comparison = 0;
            switch (sortConfig.field) {
                case "date":
                    comparison = new Date(b.date) - new Date(a.date); // Corrected for descending first
                    break;
                case "amount":
                    comparison = a.amount - b.amount;
                    break;
                case "category":
                    comparison = a.category.localeCompare(b.category);
                    break;
                default:
                    comparison = 0;
            }
            return sortConfig.direction === "asc" ? comparison : -comparison;
        })

        return result;
    }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

    const RECURRING_INTERVALS = {
        DAILY: "Daily",
        WEEKLY: "Weekly",
        MONTHLY: "Monthly",
        YEARLY: "Yearly",
    }

    const handleSort = (field) => {
        setSortConfig(current => ({
            field,
            direction:
                current.field === field && current.direction === "asc" ? "desc" : "asc",
        }))
    }

    const handleSelect = (id) => {
        setSelectedIds(
            (current) => current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        )
    };

    const handleSelectAll = () => {
        setSelectedIds(
            (current) => current.length === filteredAndSortedTransactions.length
                ? []
                : filteredAndSortedTransactions.map((t) => t.id)
        )
    };

    const manageTransactionEdit = async (accountId) => {
        navigate(`/transaction/edit/${accountId}`);
    };

    const manageTransactionDelete = async (transactionId) => {
        try {
            const response = await fetch("http://localhost:3000/api/account/deleteTransaction", {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ clerkUserId, transactionId }),
            });
            if (response.status === 204) {
                onDataChange();
                toast.error("Transaction successfully deleted");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleBulkDelete = async (selectedIDs) => {
        try {
            const response = await fetch("http://localhost:3000/api/account/deleteBulkTransactions", {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ clerkUserId, transactionIds: selectedIDs }),
            });
            if (response.status === 204) {
                onDataChange();
                setSelectedIds([]);
                toast.error(`${selectedIDs.length} transaction(s) successfully deleted`);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleClearFilters = async () => {
        setSearchTerm("");
        setTypeFilter("");
        setRecurringFilter("");
        setSelectedIds([]);
    }

    return (
        <div className='space-y-4'>
            {/* Renders the CSS styles into the document's head */}
            <style>{responsiveTableStyles}</style>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-8"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Select
                        value={typeFilter}
                        onValueChange={(value) => {
                            setTypeFilter(value === 'ALL' ? '' : value);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[130px]">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={recurringFilter}
                        onValueChange={(value) => {
                            setRecurringFilter(value === 'ALL' ? '' : value);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="All Transactions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Transactions</SelectItem>
                            <SelectItem value="recurring">Recurring Only</SelectItem>
                            <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
                        </SelectContent>
                    </Select>
                    {(searchTerm || typeFilter || recurringFilter) && (
                        <Button variant="outline" size="icon" onClick={handleClearFilters} title="Clear Filters" >
                            <X className='h-4 w-4' />
                        </Button>
                    )}
                </div>
            </div>

            {selectedIDs.length > 0 && (
                <div className="flex items-center gap-2">
                    <Button variant="destructive" size="sm" onClick={() => handleBulkDelete(selectedIDs)}>
                        <Trash className="mr-2 h-4 w-4" /> Delete ({selectedIDs.length})
                    </Button>
                    <p className="text-sm text-muted-foreground">{selectedIDs.length} item(s) selected</p>
                </div>
            )}


            {/* Responsive Transactions Table */}
            <div className='sm:rounded-md sm:border overflow-x-auto max-w-full'>
                <Table className="w-full table-fixed responsive-transaction-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    onCheckedChange={handleSelectAll}
                                    checked={
                                        selectedIDs.length === filteredAndSortedTransactions.length &&
                                        filteredAndSortedTransactions.length > 0
                                    }
                                />
                            </TableHead>
                            <TableHead className="cursor-pointer pl-2 w-[120px]" onClick={() => handleSort("date")}>
                                <div className='flex items-center'>Date {sortConfig.field === 'date' && (
                                    sortConfig.direction === "asc" ? <ChevronUp className='ml-1 h-4 w-4' /> : <ChevronDown className='ml-1 h-4 w-4' />
                                )}
                                </div>
                            </TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                                <div className='flex items-center'>Category {sortConfig.field === 'category' && (
                                    sortConfig.direction === "asc" ? <ChevronUp className='ml-1 h-4 w-4' /> : <ChevronDown className='ml-1 h-4 w-4' />
                                )}</div>
                            </TableHead>
                            <TableHead className="cursor-pointer w-[150px]" onClick={() => handleSort("amount")}>
                                <div className='flex items-center justify-end'>Amount {sortConfig.field === "amount" && (
                                    sortConfig.direction === "asc" ? <ChevronUp className='ml-1 h-4 w-4' /> : <ChevronDown className='ml-1 h-4 w-4' />
                                )}</div>
                            </TableHead>
                            <TableHead className="w-[150px]">Recurring</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndSortedTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">No Transactions Found</TableCell>
                            </TableRow>
                        ) : (
                            filteredAndSortedTransactions.map((transaction) => (
                                <TableRow key={transaction.id} className="sm:table-row">
                                    <TableCell className="checkbox-cell sm:w-[50px] sm:table-cell">
                                        <Checkbox
                                            onCheckedChange={() => handleSelect(transaction.id)}
                                            checked={selectedIDs.includes(transaction.id)}
                                        />
                                    </TableCell>
                                    <TableCell data-label="Date" className="sm:table-cell sm:pl-2"   >
                                        {format(new Date(transaction.date), "PP")}
                                    </TableCell>
                                    <TableCell data-label="Description" className="description-cell sm:table-cell font-medium whitespace-normal break-words">
                                        {transaction.description}
                                    </TableCell>
                                    <TableCell data-label="Category" className='sm:table-cell capitalize'>
                                        <span style={{ background: categoryColors[transaction.category] || '#6B7280' }} className='px-2 py-1 rounded text-white text-sm'>{transaction.category}</span>
                                    </TableCell>
                                    <TableCell data-label="Amount" className="sm:table-cell sm:text-right" style={{ color: transaction.type === "EXPENSE" ? "#DC2626" : "#16A34A" }}  // red-600 and green-600
>
                                        {transaction.type === "EXPENSE" ? "-" : "+"}
                                        ₹{parseFloat(transaction.amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell data-label="Recurring" className="sm:table-cell">
                                        {transaction.isRecurring ? (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge variant="outline" className='gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200'>
                                                            <Clock className="h-3 w-3" />
                                                            {RECURRING_INTERVALS[transaction.recurringInterval]}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-white text-black border border-gray-200 shadow-lg p-2 text-sm rounded-md">
                                                        <div className='font-medium'>Next Date:</div>
                                                        <div>{format(new Date(transaction.nextRecurringDate), "PP")}</div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : (
                                            <Badge variant="outline" className='gap-1'>
                                                <Clock className="h-3 w-3" /> one-time
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="actions-cell sm:w-[50px] sm:table-cell ">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className='h-4 w-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => manageTransactionEdit(transaction.id)}>Edit</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => manageTransactionDelete(transaction.id)} className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default TransactionTable;