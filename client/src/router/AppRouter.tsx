import { useRoutes, type RouteObject } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import { pageRoutes } from "@/router/pageRouter";
import { adminRoutes } from "@/router/adminRouter";

const routes: RouteObject[] = [
  ...pageRoutes,
  ...adminRoutes,
  { path: "*", element: <NotFound /> },
];

const AppRouter = () => useRoutes(routes);

export default AppRouter;
