import { useState, useEffect } from "react";
import { Pencil, Check, X, Loader } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useUser } from "@clerk/clerk-react";

const BudgetProgress = ({ initialBudget, currentExpenses, onBudgetUpdate ,loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [budget, setBudget] = useState(initialBudget || 0);
  const [newBudget, setNewBudget] = useState(initialBudget || "");
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useUser();
  const clerkUserId = user?.id;

  // Update local budget if initialBudget prop changes
  useEffect(() => {
    setBudget(initialBudget || 0);
    setNewBudget(initialBudget?.toString() || "");
  }, [initialBudget]);

  const percentUsed = budget > 0 ? (currentExpenses / budget) * 100 : 0;

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/update-budget", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ clerkUserId, amount }),
      });

      if (!response.ok) throw new Error("Failed to update budget");

      const data = await response.json();
      if (data?.success) {
        toast.success("Budget updated successfully");
        setIsEditing(false);
        onBudgetUpdate(); // Refresh parent state
      }
    } catch (error) {
      toast.error("Failed to update budget");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNewBudget(budget.toString());
    setIsEditing(false);
  };

  if (loading) {
  return (
    <div className="p-6 m-[30px] text-muted-foreground text-sm">
     <Loader/>
    </div>
  );
}


console.log(currentExpenses);


  return (
    <Card className="p-6 m-[30px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-sm font-medium">
            Monthly Budget (Default Account)
          </CardTitle>

          <div className="flex items-center gap-2 mt-1">
            {isEditing ? (
              <>
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-32"
                  placeholder="Enter amount"
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUpdateBudget}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </>
            ) : (
              <>
                <CardDescription>
                  {budget
                    ? `₹${currentExpenses?.toFixed(2) || 0} of ₹${budget.toFixed(2)} spent`
                    : "No budget set"}
                </CardDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {budget > 0 && (
          <div className="space-y-2">
            <Progress
  value={percentUsed}
  indicatorClassName={`${
    percentUsed >= 90
      ? "bg-red-500"
      : percentUsed >= 75
      ? "bg-yellow-500"
      : "bg-green-500"
  }`}
/>

            <p className="text-xs text-muted-foreground text-right">
              {percentUsed.toFixed(1)}% used
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetProgress;
