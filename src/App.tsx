import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/useAuth";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Surplus from "./pages/Surplus";
import Volunteer from "./pages/Volunteer";
import FoodHubs from "./pages/FoodHubs";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import TestAuth from "./pages/TestAuth";
import EmailTest from "./components/EmailTest";
import AuthTest from "./components/AuthTest";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="light" storageKey="nourishsa-ui-theme">
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
              <Navigation />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/surplus" element={<Surplus />} />
                <Route path="/volunteer" element={<Volunteer />} />
                <Route path="/hubs" element={<FoodHubs />} /> {/* Fixed typo: path instead of pat */}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignIn />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/test-auth" element={<TestAuth />} />
                <Route path="/test-email" element={<EmailTest />} />
                <Route path="/auth-test" element={<AuthTest />} />
                <Route path="/profile" element={
                  <ProtectedRoute requireAuth={true}>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;