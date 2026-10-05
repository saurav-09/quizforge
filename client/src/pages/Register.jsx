import { SignUp } from "@clerk/react";

function Register() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <SignUp
        forceRedirectUrl="/onboarding"
        fallbackRedirectUrl="/onboarding"
      />
    </main>
  );
}

export default Register;