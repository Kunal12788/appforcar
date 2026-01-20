import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Trips from './components/Trips';
import Vehicles from './components/Vehicles';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/settings" element={<div className="p-8 text-center text-slate-500">Settings coming soon...</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;