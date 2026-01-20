import React, { useState, useEffect } from 'react';
import { Plus, Car, Calendar, Tool, Trash2, X, Save, AlertTriangle } from 'lucide-react';
import { Vehicle } from '../types';
import { getVehicles, saveVehicle, deleteVehicle } from '../services/dataService';

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState: Vehicle = {
    id: '',
    registrationNumber: '',
    model: '',
    nickname: '',
    lastServiceDate: '',
    nextServiceDue: '',
    insuranceExpiry: '',
    pollutionExpiry: ''
  };

  const [formData, setFormData] = useState<Vehicle>(initialFormState);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setVehicles(getVehicles());
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ ...initialFormState, id: `v${Date.now()}` });
    setIsFormOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setFormData(vehicle);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this vehicle? This will not delete associated trip history.')) {
      deleteVehicle(id);
      loadData();
    }
  };

  const handleSave = () => {
    if (!formData.registrationNumber || !formData.model) {
      alert("Registration Number and Model are required.");
      return;
    }
    saveVehicle(formData);
    setIsFormOpen(false);
    loadData();
  };

  // Helper to check if a date is approaching (within 7 days)
  const isApproaching = (dateStr?: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 15 && diffDays >= 0;
  };

  const isExpired = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Vehicle Management</h1>
        <button 
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
        >
          <Plus size={20} className="mr-2" /> Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition">
            <div className="p-6 border-b border-slate-50 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Car size={20} className="text-blue-500"/>
                    {vehicle.registrationNumber}
                </h3>
                <p className="text-slate-500 text-sm font-medium">{vehicle.model}</p>
                {vehicle.nickname && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full mt-1 inline-block">{vehicle.nickname}</span>}
              </div>
              <div className="flex gap-2">
                 <button onClick={() => handleEdit(vehicle)} className="text-slate-400 hover:text-blue-600">
                   <Tool size={18} />
                 </button>
                 <button onClick={() => handleDelete(vehicle.id)} className="text-slate-400 hover:text-red-600">
                   <Trash2 size={18} />
                 </button>
              </div>
            </div>
            
            <div className="p-6 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-2"><Calendar size={14} /> Service Due</span>
                    <span className={`font-medium ${isExpired(vehicle.nextServiceDue) ? 'text-red-600' : isApproaching(vehicle.nextServiceDue) ? 'text-orange-500' : 'text-slate-800'}`}>
                        {vehicle.nextServiceDue || 'N/A'}
                        {(isExpired(vehicle.nextServiceDue) || isApproaching(vehicle.nextServiceDue)) && <AlertTriangle size={14} className="inline ml-1"/>}
                    </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Insurance</span>
                    <span className={`font-medium ${isExpired(vehicle.insuranceExpiry) ? 'text-red-600' : isApproaching(vehicle.insuranceExpiry) ? 'text-orange-500' : 'text-slate-800'}`}>
                        {vehicle.insuranceExpiry || 'N/A'}
                    </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Pollution</span>
                    <span className={`font-medium ${isExpired(vehicle.pollutionExpiry) ? 'text-red-600' : 'text-slate-800'}`}>
                        {vehicle.pollutionExpiry || 'N/A'}
                    </span>
                </div>
            </div>
          </div>
        ))}

        {vehicles.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
                No vehicles added yet.
            </div>
        )}
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                <button onClick={() => setIsFormOpen(false)}><X size={20} className="text-slate-500 hover:text-slate-800"/></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reg Number *</label>
                        <input type="text" className="w-full p-2 border rounded uppercase" 
                        value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Model *</label>
                        <input type="text" className="w-full p-2 border rounded" 
                        value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nickname (Optional)</label>
                    <input type="text" className="w-full p-2 border rounded" placeholder="e.g. White Innova"
                    value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} />
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-blue-600 mb-3 uppercase tracking-wide">Maintenance Schedule</h4>
                    <div className="space-y-3">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Last Service</label>
                                <input type="date" className="w-full p-2 border rounded text-sm"
                                value={formData.lastServiceDate} onChange={e => setFormData({...formData, lastServiceDate: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1 font-bold">Next Service Due</label>
                                <input type="date" className="w-full p-2 border border-blue-200 bg-blue-50 rounded text-sm"
                                value={formData.nextServiceDue} onChange={e => setFormData({...formData, nextServiceDue: e.target.value})} />
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Insurance Expiry</label>
                                <input type="date" className="w-full p-2 border rounded text-sm"
                                value={formData.insuranceExpiry} onChange={e => setFormData({...formData, insuranceExpiry: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Pollution Expiry</label>
                                <input type="date" className="w-full p-2 border rounded text-sm"
                                value={formData.pollutionExpiry} onChange={e => setFormData({...formData, pollutionExpiry: e.target.value})} />
                            </div>
                         </div>
                    </div>
                </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
                 <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                 <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                    <Save size={18} className="mr-2"/> Save Vehicle
                 </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;