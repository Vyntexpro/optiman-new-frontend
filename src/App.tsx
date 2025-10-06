import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/auth/Login";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./mainLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/*" element={<MainLayout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          classNames: {
            toast: "px-2 py-[6px] rounded-lg shadow-lg bg-white",
            title: "!text-[12px]",
          },
        }}
      />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
