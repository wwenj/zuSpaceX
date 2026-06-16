import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getUserInfo, isAdmin } from "@/lib/auth";

const RequireAdmin = () => {
  const location = useLocation();
  const [status, setStatus] = useState<
    "checking" | "allowed" | "unauthenticated" | "forbidden"
  >("checking");

  useEffect(() => {
    let cancelled = false;

    const verifyAdmin = async () => {
      const user = await getUserInfo(true);

      if (!cancelled) {
        if (!user) {
          setStatus("unauthenticated");
          return;
        }

        setStatus(isAdmin(user.role) ? "allowed" : "forbidden");
      }
    };

    void verifyAdmin();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-secondary">
        权限验证中...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (status !== "allowed") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;
