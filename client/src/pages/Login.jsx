import { SignIn } from "@clerk/react";

function Login() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <SignIn
        forceRedirectUrl="/"
        fallbackRedirectUrl="/"
      />
    </main>
  );
}

export default Login;