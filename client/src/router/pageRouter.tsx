import type { RouteObject } from "react-router-dom";
import PageLayout from "@/layouts/PageLayout";
import Home from "@/pages/Home";
import Blog from "@/pages/Blog";
import BlogDetail from "@/pages/BlogDetail";
import Projects from "@/pages/Projects";
import Guestbook from "@/pages/Guestbook";
import About from "@/pages/About";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Chat from "@/pages/Chat";

export const pageRoutes: RouteObject[] = [
  {
    element: <PageLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "blog", element: <Blog /> },
      { path: "blog/:id", element: <BlogDetail /> },
      { path: "projects", element: <Projects /> },
      { path: "about", element: <About /> },
      { path: "chat", element: <Chat /> },
      { path: "login", element: <Login /> },
      { path: "guestbook", element: <Guestbook /> },
      { path: "profile", element: <Profile /> },
    ],
  },
];
