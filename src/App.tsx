import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Students from "./pages/Students";
import Classes from "./pages/Classes";
import Tests from "./pages/Tests";
import Events from "./pages/Events";
import QRScanner from "./components/QRScanner";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background pb-16 md:pb-0">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Navbar />
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/teacher" element={
                <ProtectedRoute>
                  <Navbar />
                  <TeacherDashboard />
                </ProtectedRoute>
              } />
              <Route path="/student" element={
                <ProtectedRoute>
                  <Navbar />
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <Navbar />
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/students" element={
                <ProtectedRoute>
                  <Navbar />
                  <Students />
                </ProtectedRoute>
              } />
              <Route path="/classes" element={
                <ProtectedRoute>
                  <Navbar />
                  <Classes />
                </ProtectedRoute>
              } />
              <Route path="/tests" element={
                <ProtectedRoute>
                  <Navbar />
                  <Tests />
                </ProtectedRoute>
              } />
              <Route path="/events" element={
                <ProtectedRoute>
                  <Navbar />
                  <Events />
                </ProtectedRoute>
              } />
              <Route path="/scan" element={
                <ProtectedRoute>
                  <Navbar />
                  <QRScanner />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
