import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequireAuth } from "@/components/RequireRole";
import { CommandPalette } from "@/components/CommandPalette";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Attendance from "./pages/Attendance";
import Homework from "./pages/Homework";
import Exams from "./pages/Exams";
import Explain from "./pages/Explain";
import Students from "./pages/Students";
import Feedback from "./pages/Feedback";
import Meet from "./pages/Meet";
import Analytics from "./pages/Analytics";
import QuestionPaper from "./pages/QuestionPaper";
import SchoolSettings from "./pages/SchoolSettings";
import SchoolManagement from "./pages/SchoolManagement";
import ClassManagement from "./pages/ClassManagement";
import ActivityLogs from "./pages/ActivityLogs";
import SchoolHealthReport from "./pages/SchoolHealthReport";
import Announcements from "./pages/Announcements";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CommandPalette />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/student-dashboard" element={<RequireAuth><StudentDashboard /></RequireAuth>} />
            <Route path="/teacher-dashboard" element={<RequireAuth><TeacherDashboard /></RequireAuth>} />
            <Route path="/admin-dashboard" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
            <Route path="/dashboard" element={<Navigate to="/student-dashboard" replace />} />
            <Route path="/attendance" element={<RequireAuth><Attendance /></RequireAuth>} />
            <Route path="/homework" element={<RequireAuth><Homework /></RequireAuth>} />
            <Route path="/exams" element={<RequireAuth><Exams /></RequireAuth>} />
            <Route path="/explain" element={<RequireAuth><Explain /></RequireAuth>} />
            <Route path="/students" element={<RequireAuth><Students /></RequireAuth>} />
            <Route path="/feedback" element={<RequireAuth><Feedback /></RequireAuth>} />
            <Route path="/meet" element={<RequireAuth><Meet /></RequireAuth>} />
            <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
            <Route path="/question-paper" element={<RequireAuth><QuestionPaper /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><SchoolSettings /></RequireAuth>} />
            <Route path="/schools" element={<RequireAuth><SchoolManagement /></RequireAuth>} />
            <Route path="/classes" element={<RequireAuth><ClassManagement /></RequireAuth>} />
            <Route path="/activity-logs" element={<RequireAuth><ActivityLogs /></RequireAuth>} />
            <Route path="/health-report" element={<RequireAuth><SchoolHealthReport /></RequireAuth>} />
            <Route path="/announcements" element={<RequireAuth><Announcements /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;