import React, { useEffect, useState } from 'react';
import { MockAPI } from '../../services/mockDb';
import { Card } from '../../components/UI';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, orders: 0, brands: 0, products: 0 });

  useEffect(() => {
    const loadStats = async () => {
      const users = await MockAPI.getUsers();
      const orders = await MockAPI.getOrders();
      const brands = await MockAPI.getBrands();
      const products = await MockAPI.getProducts();
      setStats({
        users: users.length,
        orders: orders.filter(o => o.status === 'PENDING').length,
        brands: brands.length,
        products: products.length
      });
    };
    loadStats();
  }, []);

  const StatCard = ({ title, value, link, color }: any) => (
    <Link to={link} className="block">
      <Card className="hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: color }}>
        <div className="p-6">
          <p className="text-slate-500 font-medium text-sm uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Administrator Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pending Requests" value={stats.orders} link="/admin/orders" color="#f59e0b" />
        <StatCard title="Total Users" value={stats.users} link="/admin/users" color="#0ea5e9" />
        <StatCard title="Active Brands" value={stats.brands} link="/admin/inventory" color="#10b981" />
        <StatCard title="Total SKUs" value={stats.products} link="/admin/inventory" color="#6366f1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="p-6">
           <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
           <div className="space-y-3">
             <Link to="/admin/users" className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
               <span className="font-medium text-slate-900">Create New User</span>
               <p className="text-sm text-slate-500">Add a doctor or clinic account</p>
             </Link>
             <Link to="/admin/inventory" className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
               <span className="font-medium text-slate-900">Add Product</span>
               <p className="text-sm text-slate-500">Update catalog with new inventory</p>
             </Link>
           </div>
         </Card>
         <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">System Health</h3>
            <div className="text-sm text-slate-600 space-y-2">
              <div className="flex justify-between">
                <span>Database Status</span>
                <span className="text-green-600 font-medium">Online (Local)</span>
              </div>
              <div className="flex justify-between">
                <span>Security</span>
                <span className="text-green-600 font-medium">Enforced</span>
              </div>
              <div className="flex justify-between">
                <span>Last Backup</span>
                <span>Today, 04:00 AM</span>
              </div>
            </div>
         </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;