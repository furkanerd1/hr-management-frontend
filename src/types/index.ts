import { UserRole, EmployeeStatus, LeaveType, LeaveStatus, AnnouncementType, NotificationType } from '../constants';

// Base API Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  roles: string[];
  mustChangePassword: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hireDate: string;
  birthDate: string;
  address: string;
  role: UserRole;
  status: EmployeeStatus;
  departmentId: string;
  positionId: string;
  managerId?: string;
}

export interface ChangePasswordRequest {
  email: string;
  oldPassword: string;
  newPassword: string;
}

// Employee
export interface Employee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  hireDate: string;
  birthDate: string;
  address: string;
  departmentName: string;
  positionTitle: string;
  managerFullName?: string;
  role: UserRole;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeDetailResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  hireDate: string;
  birthDate: string;
  address: string;
  departmentName: string;
  positionTitle: string;
  managerFullName?: string;
  role: UserRole;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  departmentName: string;
  positionTitle: string;
  status: EmployeeStatus;
}

export interface EmployeeUpdateRequest {
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  departmentId: string;
  positionId: string;
  managerId?: string;
  status: EmployeeStatus;
}

export interface EmployeeBasicUpdateRequest {
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
}

// Department
export interface Department {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentDetailResponse {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentListItem {
  id: string;
  name: string;
}

export interface DepartmentCreateRequest {
  name: string;
  description?: string;
}

export interface DepartmentUpdateRequest {
  name: string;
  description?: string;
}

export interface DepartmentFilterRequest {
  name?: string;
  description?: string;
  searchTerm?: string;
}

// Position
export interface Position {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PositionListItem {
  id: string;
  title: string;
}

// Leave Request
export interface LeaveRequestDetailResponse {
  id: string;
  employeeId: string;
  employeeFullName: string;
  email: string;
  departmentName: string;
  positionName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: LeaveStatus;
  approverName?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface LeaveRequestListItem {
  id: string;
  employeeId: string;
  employeeFullName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: LeaveStatus;
}

export interface LeaveRequestCreateRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface LeaveRequestEditRequest {
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  reason?: string;
}

export interface EmployeeLeaveBalanceResponse {
  employeeId: string;
  vacationBalance: number;
  maternityBalance: number;
}

// Backward compatibility
export interface LeaveRequest extends LeaveRequestDetailResponse {}
export interface LeaveBalance extends EmployeeLeaveBalanceResponse {}

// Announcement
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  createdBy: string;
  createdAt: string;
}

// Notification
export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

// Salary
export interface Salary {
  id: string;
  employeeId: string;
  employeeFullName: string;
  phone: string;
  email: string;
  departmentName: string;
  positionName: string;
  salary: number;
  bonus: number;
  totalSalary: number;
  effectiveDate: string;
  createdAt: string;
}

export interface SalaryListItem {
  id: string;
  employeeId: string;
  employeeFullName: string;
  salary: number;
  bonus: number;
  totalSalary: number;
  effectiveDate: string;
}

// Performance Review
export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeFullName: string;
  email: string;
  departmentName: string;
  positionName: string;
  managerFullName?: string;
  reviewerFullName: string;
  rating: number;
  comments: string;
  reviewDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceReviewListItem {
  id: string;
  employeeId: string;
  employeeFullName: string;
  reviewerId: string;
  reviewerFullName: string;
  rating: number;
  reviewDate: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Filter requests
export interface FilterRequest {
  searchTerm?: string;
}

export interface EmployeeFilterRequest extends FilterRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentId?: string;
  positionId?: string;
  status?: EmployeeStatus;
  role?: UserRole;
  hireDateAfter?: string;
  hireDateBefore?: string;
}

export interface LeaveRequestFilterRequest extends FilterRequest {
  leaveType?: LeaveType;
  status?: LeaveStatus;
  startDateAfter?: string;
  startDateBefore?: string;
  endDateAfter?: string;
  endDateBefore?: string;
}

export interface AttendanceFilterRequest {
  dateAfter?: string;
  dateBefore?: string;
}

export interface DepartmentFilterRequest extends FilterRequest {
  name?: string;
  description?: string;
}

export interface PositionFilterRequest extends FilterRequest {
  title?: string;
  description?: string;
}

// Position Response Types
export interface PositionDetailResponse {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PositionListItem {
  id: string;
  title: string;
}

export interface PositionCreateRequest {
  title: string;
  description?: string;
}

export interface PositionUpdateRequest {
  title: string;
  description?: string;
}

// Salary Types
export interface SalaryListItem {
  id: string;
  employeeId: string;
  employeeFullName: string;
  salary: number;
  bonus: number;
  totalSalary: number;
  effectiveDate: string;
}

export interface SalaryDetailResponse {
  id: string;
  employeeId: string;
  employeeFullName: string;
  phone: string;
  email: string;
  departmentName: string;
  positionName: string;
  salary: number;
  bonus: number;
  totalSalary: number;
  effectiveDate: string;
  createdAt: string;
}

export interface SalaryCreateRequest {
  employeeId: string;
  salary: number;
  bonus: number; // Always required by backend
  effectiveDate: string;
}

export interface SalaryFilterRequest {
  minSalary?: number;
  maxSalary?: number;
  minBonus?: number;
  maxBonus?: number;
  effectiveDateAfter?: string;
  effectiveDateBefore?: string;
  searchTerm?: string;
}

// Performance Review
export interface PerformanceReviewListItem {
  id: string;
  employeeId: string;
  employeeFullName: string;
  reviewerId: string;
  reviewerFullName: string;
  rating: number;
  reviewDate: string;
}

export interface PerformanceReviewDetailResponse {
  id: string;
  employeeId: string;
  employeeFullName: string;
  email: string;
  departmentName: string;
  positionName: string;
  managerFullName: string;
  reviewerFullName: string;
  rating: number;
  comments: string;
  reviewDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceReviewCreateRequest {
  employeeId: string;
  rating: number; // 1-5
  comments: string;
  reviewDate?: string; // Optional, defaults to today
}

export interface PerformanceReviewUpdateRequest {
  rating: number; // 1-5
  comments: string;
  reviewDate?: string;
}

export interface PerformanceReviewFilterRequest {
  reviewerId?: string;
  minRating?: number;
  maxRating?: number;
  reviewDateAfter?: string;
  reviewDateBefore?: string;
  searchTerm?: string;
}

// Attendance interfaces
export interface AttendanceListItem {
  id: string;
  employeeId: string;
  employeeFullName: string;
  email: string;
  departmentName: string;
  positionName: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
}

export interface AttendanceDetailResponse {
  id: string;
  employeeId: string;
  employeeFullName: string;
  email: string;
  departmentName: string;
  positionName: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceCreateRequest {
  employeeId: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
}

export interface AttendanceUpdateRequest {
  date: string;
  checkInTime: string;
  checkOutTime?: string;
}

export interface AttendanceFilterRequest {
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  departmentId?: string;
}

// Notification interfaces
export interface NotificationResponse {
  id: string;
  message: string;
  type: 'LEAVE' | 'PERFORMANCE' | 'GENERAL' | 'ANNOUNCEMENT';
  isRead: boolean;
  createdAt: string;
}

// Announcement interfaces
export interface AnnouncementResponse {
  id: string;
  title: string;
  content: string;
  type: 'HOLIDAY' | 'POLICY' | 'EVENT' | 'GENERAL';
  createdBy: string;
  createdAt: string;
}

export interface AnnouncementCreateRequest {
  title: string;
  content: string;
  type: 'HOLIDAY' | 'POLICY' | 'EVENT' | 'GENERAL';
}