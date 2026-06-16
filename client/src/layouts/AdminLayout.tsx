import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { to: "/admin/articles", label: "文章管理" },
  { to: "/admin/projects", label: "项目管理" },
  { to: "/admin/comments", label: "留言管理" },
  { to: "/admin/users", label: "用户管理" },
];

const getNavClassName = (isActive: boolean) =>
  cn(
    "flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200",
    isActive
      ? "border-slate-900/10 bg-slate-900 text-white shadow-none"
      : "border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-900",
  );

const AdminLayout = () => {
  const location = useLocation();

  const currentTitle =
    adminNavItems.find(
      (item) =>
        location.pathname === item.to ||
        location.pathname.startsWith(`${item.to}/`),
    )?.label ?? "后台管理";

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#fcfdff_0%,#f5f8fb_46%,#f8fafc_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(248,250,252,0.94)_100%)] px-6 py-8 lg:flex lg:flex-col">
          <Link
            to="/admin/articles"
            className="block rounded-[28px] border border-slate-200/80 bg-[linear-gradient(135deg,#f7fbff_0%,#ffffff_52%,#f6f9fc_100%)] px-6 py-6 text-center shadow-none"
          >
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              admin 管理后台
            </h1>
          </Link>

          <nav className="mt-6 space-y-2 rounded-[28px] border border-slate-200/80 bg-white/75 p-3 shadow-none">
            {adminNavItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {({ isActive }) => (
                  <span className={getNavClassName(isActive)}>
                    {item.label}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200/80 bg-[linear-gradient(135deg,rgba(250,252,255,0.92),rgba(246,249,252,0.92)_48%,rgba(248,250,252,0.92))] backdrop-blur">
            <div className="px-4 py-5 md:px-8">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                {currentTitle}
              </h2>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 md:px-8">
            <nav className="mb-4 grid grid-cols-2 gap-3 lg:hidden">
              {adminNavItems.map((item) => (
                <NavLink key={item.to} to={item.to}>
                  {({ isActive }) => (
                    <span className={getNavClassName(isActive)}>
                      {item.label}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
