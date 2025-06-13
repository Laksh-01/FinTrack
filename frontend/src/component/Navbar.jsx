import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Button } from "./ui/button"; // adjust the path as needed
import { Link } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";

const REDIRECT_URL = import.meta.env.VITE_REDIRECT_URL;

export function Header() {
  const { user } = useUser();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-background">
      <Link to="/" className="text-xl font-bold">
        fintracker
      </Link>

      <div className="flex items-center gap-4">
        <ModeToggle />

        <SignedIn>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user?.fullName}
          </span>
          <UserButton afterSignOutUrl="/app" />
        </SignedIn>

        <SignedOut>
          <SignInButton redirectUrl={REDIRECT_URL}>
            <Button variant="outline">Login</Button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}
