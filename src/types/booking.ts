export type BookingStatus = 'pending' | 'approved' | 'cancelled' | 'completed' | 'paid';

export interface BookingFormData {
  subject: string;
  date: string;
  time: string;
  startTimeUTC?: string;
  duration: number;
  message?: string;
}

export interface RescheduleData {
  bookingId: string;
  newStartTime: string;
  message?: string;
}

export interface Booking {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  subject: string;
  startTime: string | Date;
  endTime: string | Date;
  status: BookingStatus;
  message?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}