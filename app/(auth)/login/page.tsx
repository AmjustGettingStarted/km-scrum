import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-canvas-white flex flex-col justify-center items-center px-4">
      <LoginForm />
      <p className="mt-6 text-xs text-fog text-center">
        Restricted to registered team members. Contact your Manager for access.
      </p>
    </div>
  );
}
