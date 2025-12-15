import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Badge } from '../components/UI';
import { Brand, OrderRequest } from '../types';
import { MockAPI } from '../services/mockDb';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderRequest[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const allBrands = await MockAPI.getBrands();
      // Simulate "Recommended" by picking first 2
      setBrands(allBrands.slice(0, 3));
      
      const allOrders = await MockAPI.getOrders();
      setRecentOrders(allOrders.filter(o => o.userId === user?.id).slice(0, 3));
    };
    fetchData();
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.fullName}</h1>
        <p className="text-slate-500 mt-1">{user?.clinicName} • Discount Tier: <span className="text-teal-600 font-semibold">{Math.round((1 - user!.discountTier) * 100)}% Off List Price</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Recommended Brands</h2>
              <Link to="/brands" className="text-sm text-teal-600 hover:text-teal-700 font-medium">View Full Catalog &rarr;</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brands.map(brand => (
                <Card key={brand.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                  <div className="h-40 bg-slate-200 w-full relative">
                    <img src={brand.imageUrl} alt={brand.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2">
                       <Badge>Featured</Badge>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-slate-900">{brand.name}</h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{brand.description}</p>
                    <div className="mt-auto">
                      <Link to={`/brands/${brand.id}`}>
                        <Button variant="outline" size="sm" className="w-full">View Products</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Status & History */}
        <div className="space-y-6">
           <section>
             <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Order Requests</h2>
             <Card>
               {recentOrders.length === 0 ? (
                 <div className="p-8 text-center text-slate-500 text-sm">
                   No recent requests found.
                 </div>
               ) : (
                 <div className="divide-y divide-slate-100">
                   {recentOrders.map(order => (
                     <div key={order.id} className="p-4">
                       <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-slate-400">#{order.id.slice(0, 8)}</span>
                          <Badge color={
                            order.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-slate-100 text-slate-700'
                          }>{order.status}</Badge>
                       </div>
                       <p className="text-sm font-medium text-slate-900">{order.items.length} items</p>
                       <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                     </div>
                   ))}
                   <div className="p-3 bg-slate-50 text-center">
                     <span className="text-xs text-slate-500">Contact support for tracking</span>
                   </div>
                 </div>
               )}
             </Card>
           </section>

           <section>
              <Card className="bg-teal-50 border-teal-100">
                <div className="p-5">
                  <h3 className="font-semibold text-teal-900 mb-2">Need Assistance?</h3>
                  <p className="text-sm text-teal-700 mb-4">Our specialized representatives are available for product training and inquiries.</p>
                  <Button variant="primary" size="sm" className="w-full">Contact Support</Button>
                </div>
              </Card>
           </section>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;