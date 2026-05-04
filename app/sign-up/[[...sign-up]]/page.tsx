import { SignUp } from "@clerk/nextjs";
import { AuthLeftPanel } from "@/components/auth/auth-left-panel";

export default function SignUpPage() {
  return (
    <main className="flex h-screen bg-base">
      <AuthLeftPanel />
      <div className="flex flex-1 items-center justify-center">
        <SignUp />
      </div>
    </main>
  );
}
