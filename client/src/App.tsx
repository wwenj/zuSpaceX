import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sooner } from "@/components/ui/sonner";
import { HashRouter } from "react-router-dom";
import AppRouter from "@/router/AppRouter";

const App = () => (
  <>
    <Toaster />
    <Sooner />
    <HashRouter>
      <AppRouter />
    </HashRouter>
  </>
);

export default App;
