"use client";

import { useEffect, useState } from "react";
import { Database, RefreshCw, LogIn, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    console.error("Global error boundary captured:", error);
  }, [error]);

  const isDbError =
    error.message?.includes("Can't reach database") ||
    error.message?.includes("PrismaClient") ||
    error.message?.includes("database server") ||
    error.message?.includes("connect_timeout") ||
    error.name === "PrismaClientInitializationError";

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      reset();
      setIsRetrying(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-canvas-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-ash rounded-xl shadow-subtle p-6 text-center space-y-5">
        <div className="w-12 h-12 mx-auto rounded-full bg-paper-mist flex items-center justify-center text-charcoal">
          {isDbError ? (
            <Database className="w-6 h-6 text-indigo-600 animate-pulse" />
          ) : (
            <AlertCircle className="w-6 h-6 text-amber-600" />
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-charcoal">
            {isDbError ? "Database is Reconnecting" : "Unexpected Application Error"}
          </h2>
          <p className="text-sm text-steel leading-relaxed">
            {isDbError
              ? "The database is warming up or reconnecting. Your account and data are safe—please retry in a few seconds."
              : "An unexpected error occurred. You can retry loading the application or return to the login screen."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full sm:w-auto"
            variant="primary"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRetrying ? "animate-spin" : ""}`}
            />
            {isRetrying ? "Reconnecting..." : "Retry Connection"}
          </Button>

          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => (window.location.href = "/login")}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
