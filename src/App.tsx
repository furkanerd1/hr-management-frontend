import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EmployeesList from './components/EmployeesList';
import NewEmployee from './components/NewEmployee';
import EmployeeDetail from './components/EmployeeDetail';
import EmployeeEdit from './components/EmployeeEdit';
import DepartmentsList from './components/DepartmentsList';
import DepartmentDetail from './components/DepartmentDetail';
import DepartmentForm from './components/DepartmentForm';
import DepartmentEmployees from './components/DepartmentEmployees';
import PositionsList from './components/positions/PositionsList';
import PositionDetail from './components/positions/PositionDetail';
import PositionForm from './components/positions/PositionForm';
import LeavesList from './components/leaves/LeavesList';
import LeaveDetail from './components/leaves/LeaveDetail';
import LeaveForm from './components/leaves/LeaveForm';
import SalariesList from './components/salaries/SalariesList';
import SalaryDetail from './components/salaries/SalaryDetail';
import SalaryForm from './components/salaries/SalaryForm';
import MySalaryHistory from './components/salaries/MySalaryHistory';
import ChangePassword from './components/ChangePassword';
import SetInitialPassword from './components/SetInitialPassword';
import Profile from './components/Profile';
import PerformanceList from './components/performance/PerformanceList';
import PerformanceDetail from './components/performance/PerformanceDetail';
import PerformanceForm from './components/performance/PerformanceForm';
import MyPerformance from './components/performance/MyPerformance';
import MyNotifications from './components/notifications/MyNotifications';
import AttendanceList from './components/attendance/AttendanceList';
import AttendanceDetail from './components/attendance/AttendanceDetail';
import AnnouncementsList from './components/announcements/AnnouncementsList';
import AnnouncementForm from './components/announcements/AnnouncementForm';
import NotificationsList from './components/notifications/NotificationsList';
import CheckInCheckOutPage from './pages/CheckInCheckOutPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } />
            <Route path="/set-initial-password" element={
              <ProtectedRoute>
                <SetInitialPassword />
              </ProtectedRoute>
            } />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="employees" element={<EmployeesList />} />
              <Route path="employees/new" element={<NewEmployee />} />
              <Route path="employees/:id/view" element={<EmployeeDetail />} />
              <Route path="employees/:id/edit" element={<EmployeeEdit />} />
              <Route path="departments" element={<DepartmentsList />} />
              <Route path="departments/new" element={<DepartmentForm />} />
              <Route path="departments/:id/view" element={<DepartmentDetail />} />
              <Route path="departments/:id/edit" element={<DepartmentForm />} />
              <Route path="departments/:id/employees" element={<DepartmentEmployees />} />
              <Route path="positions" element={<PositionsList />} />
              <Route path="positions/new" element={<PositionForm />} />
              <Route path="positions/:id" element={<PositionDetail />} />
              <Route path="positions/:id/edit" element={<PositionForm />} />
              <Route path="leaves" element={<LeavesList />} />
              <Route path="leaves/new" element={<LeaveForm />} />
              <Route path="leaves/:id" element={<LeaveDetail />} />
              <Route path="leaves/:id/edit" element={<LeaveForm />} />
              <Route path="salaries" element={<SalariesList />} />
              <Route path="salaries/new" element={<SalaryForm />} />
              <Route path="salaries/:id" element={<SalaryDetail />} />
              <Route path="salaries/:id/edit" element={<SalaryForm />} />
              <Route path="my-salary-history" element={<MySalaryHistory />} />
              <Route path="performance" element={<PerformanceList />} />
              <Route path="performance/new" element={<PerformanceForm />} />
              <Route path="performance/:id" element={<PerformanceDetail />} />
              <Route path="performance/:id/edit" element={<PerformanceForm />} />
              <Route path="my-performance" element={<MyPerformance />} />
              <Route path="my-notifications" element={<MyNotifications />} />
              <Route path="checkin-checkout" element={<CheckInCheckOutPage />} />
              <Route path="attendance" element={<AttendanceList />} />
              <Route path="attendance/:id" element={<AttendanceDetail />} />
              <Route path="announcements" element={<AnnouncementsList />} />
              <Route path="announcements/new" element={<AnnouncementForm />} />
              <Route path="notifications" element={<NotificationsList />} />
              <Route path="profile" element={<Profile />} />
              {/* Diğer route'lar buraya eklenecek */}
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
