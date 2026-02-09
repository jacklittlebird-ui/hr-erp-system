import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Employees from "./pages/Employees";
import EmployeeDetails from "./pages/EmployeeDetails";
import Leaves from "./pages/Leaves";
import Attendance from "./pages/Attendance";
import Performance from "./pages/Performance";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import Training from "./pages/Training";
import Loans from "./pages/Loans";
import Salaries from "./pages/Salaries";
import Reports from "./pages/Reports";
import SalaryReports from "./pages/SalaryReports";
import Departments from "./pages/Departments";
import Recruitment from "./pages/Recruitment";
import Assets from "./pages/Assets";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/leaves" element={<Leaves />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/employee-portal" element={<EmployeeAttendance />} />
            <Route path="/training" element={<Training />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/salaries" element={<Salaries />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/salary-reports" element={<SalaryReports />} />
            <Route path="/recruitment" element={<Recruitment />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
