import { Navigate, type RouteObject } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import RequireAdmin from "@/router/RequireAdmin";
import AdminArticles from "@/admin/Articles";
import AdminProjects from "@/admin/Projects";
import AdminComments from "@/admin/Comments";
import AdminUsers from "@/admin/Users";

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: <RequireAdmin />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="articles" replace /> },
          { path: "articles", element: <AdminArticles /> },
          { path: "projects", element: <AdminProjects /> },
          { path: "comments", element: <AdminComments /> },
          { path: "users", element: <AdminUsers /> },
        ],
      },
    ],
  },
];
