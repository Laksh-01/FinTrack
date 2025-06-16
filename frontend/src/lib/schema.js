import { z } from "zod";

export const accountSchema = z.object({
    name : z.string().min(1,"Name is required"),
    type : z.enum(["CURRENT" , "SAVINGS"]),
    balance : z.string().min(1,"Initial balance is required"),
    isDefault : z.boolean().default(false),
})





export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE", "INVESTMENTS"]),
    amount: z.string().min(1, "Amount is required"),
    description: z.string().optional(),
    date: z.date({ required_error: "Date is required" }),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    interestRate: z.number().optional(), // number now
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required for recurring transactions",
        path: ["recurringInterval"],
      });
    }

    if (data.type === "INVESTMENTS") {
  if (
    data.interestRate === undefined ||
    typeof data.interestRate !== "number" ||
    isNaN(data.interestRate) ||
    data.interestRate < 0
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Valid rate of interest (positive number) is required for investments",
      path: ["interestRate"],
    });
  }
}

  });
