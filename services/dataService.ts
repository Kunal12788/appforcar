import { Trip, Vehicle, DashboardStats, PaymentStatus, PaymentMode } from '../types';

const TRIPS_KEY = 'navexa_trips';
const VEHICLES_KEY = 'navexa_vehicles';

// --- Mock Data Initialization ---
const initData = () => {
  if (!localStorage.getItem(VEHICLES_KEY)) {
    const mockVehicles: Vehicle[] = [
      {
        id: 'v1',
        registrationNumber: 'KA-01-AB-1234',
        model: 'Toyota Innova Crysta',
        nickname: 'White Beast',
        insuranceExpiry: '2024-12-31',
        nextServiceDue: '2024-06-15'
      },
      {
        id: 'v2',
        registrationNumber: 'KA-05-XY-9876',
        model: 'Swift Dzire',
        nickname: 'City Runner',
        insuranceExpiry: '2024-08-20',
        nextServiceDue: '2024-07-01'
      }
    ];
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(mockVehicles));
  }

  if (!localStorage.getItem(TRIPS_KEY)) {
    // Add a few dummy trips
    const mockTrips: Trip[] = [
      {
        id: 'T-1001',
        date: new Date().toISOString().split('T')[0],
        vehicleId: 'v1',
        driverName: 'Ramesh',
        driverPhone: '9988776655',
        customerName: 'John Doe',
        customerPhone: '9876543210',
        pickupLocation: 'Airport',
        dropLocation: 'Whitefield',
        startTime: '10:00',
        endTime: '12:00',
        income: 3500,
        expenses: {
          fuelCost: 500,
          toll: 100,
          parking: 50,
          other: 0
        },
        driverPayment: {
          totalAmount: 500,
          advance: 200,
          remaining: 300,
          status: PaymentStatus.PENDING,
          mode: PaymentMode.CASH
        },
        km: {
          start: 10000,
          end: 10045,
          total: 45
        },
        netProfit: 2350,
        notes: 'Smooth trip.'
      }
    ];
    localStorage.setItem(TRIPS_KEY, JSON.stringify(mockTrips));
  }
};

initData();

// --- Trips ---

export const getTrips = (): Trip[] => {
  const data = localStorage.getItem(TRIPS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTrip = (trip: Trip): void => {
  const trips = getTrips();
  const index = trips.findIndex(t => t.id === trip.id);
  if (index >= 0) {
    trips[index] = trip;
  } else {
    trips.unshift(trip); // Add new trips to the top
  }
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
};

export const deleteTrip = (id: string): void => {
  const trips = getTrips().filter(t => t.id !== id);
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
};

// --- Vehicles ---

export const getVehicles = (): Vehicle[] => {
  const data = localStorage.getItem(VEHICLES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveVehicle = (vehicle: Vehicle): void => {
  const vehicles = getVehicles();
  const index = vehicles.findIndex(v => v.id === vehicle.id);
  if (index >= 0) {
    vehicles[index] = vehicle;
  } else {
    vehicles.push(vehicle);
  }
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
};

export const deleteVehicle = (id: string): void => {
  const vehicles = getVehicles().filter(v => v.id !== id);
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
};

// --- Analytics ---

export const getDashboardStats = (): DashboardStats => {
  const trips = getTrips();
  const vehicles = getVehicles();
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  let todayTrips = 0;
  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  let monthlyProfit = 0;
  let pendingPayments = 0;
  const vehiclePerformance: Record<string, number> = {};

  trips.forEach(trip => {
    const tripDate = new Date(trip.date);
    
    // Today's trips
    if (trip.date === today) {
      todayTrips++;
    }

    // Monthly Stats
    if (tripDate.getMonth() === currentMonth && tripDate.getFullYear() === currentYear) {
      monthlyIncome += trip.income;
      const totalExp = trip.expenses.fuelCost + trip.expenses.toll + trip.expenses.parking + trip.expenses.other + trip.driverPayment.totalAmount;
      monthlyExpenses += totalExp;
      monthlyProfit += trip.netProfit;
    }

    // Pending Payments (Global, not just monthly)
    if (trip.driverPayment.status === PaymentStatus.PENDING) {
      pendingPayments += trip.driverPayment.remaining;
    }

    // Vehicle Performance
    if (!vehiclePerformance[trip.vehicleId]) {
      vehiclePerformance[trip.vehicleId] = 0;
    }
    vehiclePerformance[trip.vehicleId] += trip.netProfit;
  });

  // Find best vehicle
  let bestVehicleId = '';
  let maxProfit = -Infinity;
  for (const [vId, profit] of Object.entries(vehiclePerformance)) {
    if (profit > maxProfit) {
      maxProfit = profit;
      bestVehicleId = vId;
    }
  }
  const bestVehicleObj = vehicles.find(v => v.id === bestVehicleId);
  const bestVehicle = bestVehicleObj ? `${bestVehicleObj.model} (${bestVehicleObj.registrationNumber})` : 'N/A';

  return {
    todayTrips,
    monthlyIncome,
    monthlyExpenses,
    monthlyProfit,
    pendingPayments,
    bestVehicle
  };
};