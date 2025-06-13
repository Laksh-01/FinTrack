import React from "react";
import { Switch } from "../../components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export function AccountCard({ account, onUpdate, isLoading }) {
  const { name, type, balance, isDefault, id } = account;
  const navigate = useNavigate();

  const handleDefaultChange = async () => {
    if (isDefault) {
      toast.info("This is already your default account.");
      return;
    }

    if (onUpdate) {
      onUpdate(id);
    }
  };

  const handleCardClick = () => {
    navigate(`/account/${id}`);
  };

  return (
    <Card onClick={handleCardClick} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
        <Switch
          checked={isDefault}
          onCheckedChange={handleDefaultChange}
          onClick={(e) => e.stopPropagation()} // ⛔ Prevent card click on toggle
          disabled={isLoading}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">₹{parseFloat(balance).toFixed(2)}</div>
        <p className="text-xs text-muted-foreground">
          {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()} Account
        </p>
      </CardContent>
    </Card>
  );
}
