export enum EmployeeStatus {
  WORKING = "Working",
  ON_VACATION = "OnVacation",
  LUNCH_TIME = "LunchTime",
  BUSINESS_TRIP = "BusinessTrip",
}

export interface Employee {
  id: string;
  name: string;
  status: EmployeeStatus;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFormData {
  name: string;
  status: EmployeeStatus;
}
