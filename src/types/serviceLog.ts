export enum ServiceType {
  PLANNED = "planned",
  UNPLANNED = "unplanned",
  EMERGENCY = "emergency",
}

export type ServiceLog = {
  id?: number; //Optional Id for IndexedDB to delete element later
  providerId: string;
  serviceOrder: string;
  carId: string;
  odometer: number;
  engineHours: number;
  startDate: string;
  endDate: string;
  type: ServiceType;
  serviceDescription: string;
};

export type Draft = {
  id: string;
  title: string;
  data: ServiceLog;
  createdAt: string;
  updatedAt: string;
};
