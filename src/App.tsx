import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CommandPalette } from "@/components/CommandPalette";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/homework" element={<Homework />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/explain" element={<Explain />} />
            <Route path="/students" element={<Students />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/meet" element={<Meet />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/question-paper" element={<QuestionPaper />} />
            <Route path="/settings" element={<SchoolSettings />} />
            <Route path="/classes" element={<ClassManagement />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
            <Route path="/health-report" element={<SchoolHealthReport />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
