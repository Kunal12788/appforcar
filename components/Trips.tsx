import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, CheckCircle, AlertCircle, X, Save } from 'lucide-react';
import { Trip, Vehicle, PaymentStatus, PaymentMode } from '../types';
import { getTrips, saveTrip, deleteTrip, getVehicles } from '../services/dataService';

const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Empty Form State
  const initialFormState: Trip = {
    id: '',
    date: new Date().toISOString().split('T')[0],
    vehicleId: '',
    driverName: '',
    driverPhone: '',
    customerName: '',
    customerPhone: '',
    pickupLocation: '',
    dropLocation: '',
    startTime: '',
    endTime: '',
    income: 0,
    expenses: { fuelCost: 0, fuelQuantity: 0, toll: 0, parking: 0, other: 0 },
    driverPayment: { totalAmount: 0, advance: 0, remaining: 0, status: PaymentStatus.PENDING, mode: PaymentMode.CASH },
    km: { start: 0, end: 0, total: 0 },
    netProfit: 0,
    notes: ''
  };

  const [formData, setFormData] = useState<Trip>(initialFormState);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTrips(getTrips());
    setVehicles(getVehicles());
  };

  const handleAddNew = () => {
    setFormData({
      ...initialFormState,
      id: `T-${Math.floor(Math.random() * 10000)}`, // Simple ID generation
      vehicleId: vehicles.length > 0 ? vehicles[0].id : ''
    });
    setIsFormOpen(true);
  };

  const handleEdit = (trip: Trip) => {
    setFormData(trip);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this trip?')) {
      deleteTrip(id);
      loadData();
    }
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.vehicleId || !formData.customerName || !formData.income) {
      alert("Please fill in Vehicle, Customer Name and Income Amount.");
      return;
    }

    // Auto Calculations
    const totalExpenses = 
      Number(formData.expenses.fuelCost) + 
      Number(formData.expenses.toll) + 
      Number(formData.expenses.parking) + 
      Number(formData.expenses.other) + 
      Number(formData.driverPayment.totalAmount);
    
    const calculatedProfit = Number(formData.income) - totalExpenses;
    
    const kmTotal = Number(formData.km.end) - Number(formData.km.start);
    const paymentRemaining = Number(formData.driverPayment.totalAmount) - Number(formData.driverPayment.advance);
    const paymentStatus = paymentRemaining <= 0 ? PaymentStatus.PAID : PaymentStatus.PENDING;

    const finalTripData: Trip = {
      ...formData,
      netProfit: calculatedProfit,
      km: { ...formData.km, total: kmTotal >= 0 ? kmTotal : 0 },
      driverPayment: { ...formData.driverPayment, remaining: paymentRemaining, status: paymentStatus }
    };

    saveTrip(finalTripData);
    setIsFormOpen(false);
    loadData();
  };

  const filteredTrips = trips.filter(t => 
    t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Trip Management</h1>
        <button 
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
        >
          <Plus size={20} className="mr-2" /> New Trip
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by Customer, Driver or Trip ID..."
          className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
      </div>

      {/* List View */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="p-4 font-medium">Date/ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Route</th>
                <th className="p-4 font-medium">Vehicle/Driver</th>
                <th className="p-4 font-medium text-right">Income</th>
                <th className="p-4 font-medium text-right">Profit</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrips.map((trip) => {
                const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                return (
                  <tr key={trip.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{trip.date}</div>
                      <div className="text-xs text-slate-400">{trip.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-800">{trip.customerName}</div>
                      <div className="text-xs text-slate-400">{trip.customerPhone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> {trip.pickupLocation}
                      </div>
                      <div className="text-sm text-slate-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> {trip.dropLocation}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium">{vehicle?.registrationNumber || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{trip.driverName}</div>
                    </td>
                    <td className="p-4 text-right font-medium text-slate-800">
                      ₹{trip.income}
                    </td>
                    <td className={`p-4 text-right font-bold ${trip.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ₹{trip.netProfit}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trip.driverPayment.status === PaymentStatus.PAID ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {trip.driverPayment.status === PaymentStatus.PAID ? 'Paid' : `Due: ₹${trip.driverPayment.remaining}`}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(trip)} className="p-1.5 hover:bg-slate-200 rounded text-blue-600">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(trip.id)} className="p-1.5 hover:bg-slate-200 rounded text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTrips.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No trips found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto animate-fade-in-right">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">{formData.id && trips.some(t => t.id === formData.id) ? 'Edit Trip' : 'New Trip'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={24} className="text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Details */}
              <section className="space-y-4">
                <h3 className="text-sm uppercase tracking-wide text-slate-400 font-semibold">Trip Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input type="date" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle</label>
                    <select className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})}>
                      <option value="">Select Vehicle</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.model} ({v.registrationNumber})</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Driver Name</label>
                    <input type="text" className="w-full p-2 border rounded" placeholder="Name"
                       value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Driver Phone</label>
                    <input type="tel" className="w-full p-2 border rounded" placeholder="Phone"
                       value={formData.driverPhone} onChange={e => setFormData({...formData, driverPhone: e.target.value})} />
                  </div>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Customer & Route */}
              <section className="space-y-4">
                <h3 className="text-sm uppercase tracking-wide text-slate-400 font-semibold">Customer & Route</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" className="w-full p-2 border rounded" placeholder="Customer Name"
                    value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
                  <input type="tel" className="w-full p-2 border rounded" placeholder="Customer Phone"
                    value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" className="w-full p-2 border rounded" placeholder="Pickup Location"
                    value={formData.pickupLocation} onChange={e => setFormData({...formData, pickupLocation: e.target.value})} />
                  <input type="text" className="w-full p-2 border rounded" placeholder="Drop Location"
                    value={formData.dropLocation} onChange={e => setFormData({...formData, dropLocation: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-500">Start Time</label>
                        <input type="time" className="w-full p-2 border rounded"
                        value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500">End Time</label>
                        <input type="time" className="w-full p-2 border rounded"
                        value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                    </div>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* KM Tracking */}
              <section className="space-y-4">
                <h3 className="text-sm uppercase tracking-wide text-slate-400 font-semibold">Odometer (KM)</h3>
                <div className="grid grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start KM</label>
                    <input type="number" className="w-full p-2 border rounded"
                      value={formData.km.start} onChange={e => setFormData({...formData, km: {...formData.km, start: Number(e.target.value)}})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End KM</label>
                    <input type="number" className="w-full p-2 border rounded"
                      value={formData.km.end} onChange={e => setFormData({...formData, km: {...formData.km, end: Number(e.target.value)}})} />
                  </div>
                  <div className="pb-2 text-sm text-slate-600 font-bold">
                    Total: {formData.km.end - formData.km.start} km
                  </div>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Finances */}
              <section className="space-y-4 bg-slate-50 p-4 rounded-lg">
                <h3 className="text-sm uppercase tracking-wide text-slate-400 font-semibold">Financials</h3>
                
                {/* Income */}
                <div>
                  <label className="block text-sm font-bold text-emerald-700 mb-1">Total Trip Income</label>
                  <input type="number" className="w-full p-3 border-2 border-emerald-200 rounded text-lg font-bold text-emerald-800 focus:ring-emerald-500"
                    placeholder="0.00"
                    value={formData.income} onChange={e => setFormData({...formData, income: Number(e.target.value)})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Fuel Cost</label>
                    <input type="number" className="w-full p-2 border rounded"
                      value={formData.expenses.fuelCost} onChange={e => setFormData({...formData, expenses: {...formData.expenses, fuelCost: Number(e.target.value)}})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Toll & Parking</label>
                    <div className="flex gap-2">
                        <input type="number" placeholder="Toll" className="w-1/2 p-2 border rounded"
                        value={formData.expenses.toll} onChange={e => setFormData({...formData, expenses: {...formData.expenses, toll: Number(e.target.value)}})} />
                        <input type="number" placeholder="Park" className="w-1/2 p-2 border rounded"
                        value={formData.expenses.parking} onChange={e => setFormData({...formData, expenses: {...formData.expenses, parking: Number(e.target.value)}})} />
                    </div>
                  </div>
                </div>

                {/* Driver Payment */}
                <div className="bg-white p-3 rounded border border-slate-200">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Driver Payment</h4>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                            <label className="text-xs text-slate-500">Total Pay</label>
                            <input type="number" className="w-full p-2 border rounded"
                            value={formData.driverPayment.totalAmount} onChange={e => setFormData({...formData, driverPayment: {...formData.driverPayment, totalAmount: Number(e.target.value)}})} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Advance Given</label>
                            <input type="number" className="w-full p-2 border rounded"
                            value={formData.driverPayment.advance} onChange={e => setFormData({...formData, driverPayment: {...formData.driverPayment, advance: Number(e.target.value)}})} />
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Balance: <span className="font-bold text-orange-600">
                            {formData.driverPayment.totalAmount - formData.driverPayment.advance}
                        </span></span>
                        <select className="border rounded p-1 text-xs" value={formData.driverPayment.mode} onChange={e => setFormData({...formData, driverPayment: {...formData.driverPayment, mode: e.target.value as PaymentMode}})}>
                            <option value={PaymentMode.CASH}>Cash</option>
                            <option value={PaymentMode.UPI}>UPI</option>
                            <option value={PaymentMode.BANK}>Bank</option>
                        </select>
                    </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700">Other Expenses</label>
                   <input type="number" className="w-full p-2 border rounded"
                      value={formData.expenses.other} onChange={e => setFormData({...formData, expenses: {...formData.expenses, other: Number(e.target.value)}})} />
                </div>
              </section>
              
               {/* Notes */}
               <section>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                    <textarea className="w-full p-2 border rounded h-20" placeholder="Delays, customer requests..."
                    value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
               </section>

            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 sticky bottom-0 z-10 flex justify-end gap-3">
                <button onClick={() => setIsFormOpen(false)} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition">
                    Cancel
                </button>
                <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center">
                    <Save size={18} className="mr-2" /> Save Trip
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;