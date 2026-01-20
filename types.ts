export enum PaymentStatus {
  PAID = 'Paid',
  PENDING = 'Pending'
}

export enum PaymentMode {
  CASH = 'Cash',
  UPI = 'UPI',
  BANK = 'Bank'
}

export interface DriverPayment {
  totalAmount: number;
  advance: number;
  remaining: number;
  status: PaymentStatus;
  mode: PaymentMode;
}

export interface Expenses {
  fuelCost: number;
  fuelQuantity?: number;
  toll: number;
  parking: number;
  other: number;
}

export interface KmTracking {
  start: number;
  end: number;
  total: number;
}

export interface Trip {
  id: string;
  date: string; // ISO Date string
  vehicleId: string;
  driverName: string;
  driverPhone: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  dropLocation: string;
  startTime: string;
  endTime: string;
  
  income: number; // Total Trip Amount
  expenses: Expenses;
  driverPayment: DriverPayment;
  km: KmTracking;
  
  netProfit: number;
  notes: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  model: string;
  nickname?: string;
  
  // Maintenance Dates
  lastServiceDate?: string;
  nextServiceDue?: string;
  oilChangeDate?: string;
  tyreChangeDate?: string;
  brakeServiceDate?: string;
  batteryChangeDate?: string;
  insuranceExpiry?: string;
  pollutionExpiry?: string;
}

export interface DashboardStats {
  todayTrips: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  pendingPayments: number;
  bestVehicle: string;
}