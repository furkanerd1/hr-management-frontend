// API Base URL
export const API_BASE_URL = 'http://localhost:8081';

// User Roles
export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  HR = 'HR'
}

// Employee Status
export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

// Leave Types
export enum LeaveType {
  VACATION = 'VACATION',
  SICK = 'SICK',
  UNPAID = 'UNPAID',
  MATERNITY = 'MATERNITY'
}

// Leave Status
export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Announcement Types
export enum AnnouncementType {
  HOLIDAY = 'HOLIDAY',
  POLICY = 'POLICY',
  EVENT = 'EVENT',
  GENERAL = 'GENERAL'
}

// Notification Types
export enum NotificationType {
  LEAVE = 'LEAVE',
  PERFORMANCE = 'PERFORMANCE',
  GENERAL = 'GENERAL',
  ANNOUNCEMENT = 'ANNOUNCEMENT'
}