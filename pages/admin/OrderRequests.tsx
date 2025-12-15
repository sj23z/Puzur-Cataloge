import React, { useEffect, useState } from 'react';
import { OrderRequest, OrderStatus } from '../../types';
import { MockAPI } from '../../services/mockDb';
import { Badge, Button, Card, formatCurrency } from '../../components/UI';

const OrderRequests = () => {
  const [orders, setOrders] = useState<OrderRequest[]>([]);

  const loadOrders = () => MockAPI.getOrders().then(setOrders);
  useEffect(() => { loadOrders(); }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await MockAPI.updateOrderStatus(id, status);
    loadOrders();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Order Requests</h1>
      
      <div className="space-y-4">
        {orders.map(order => (
          <Card key={order.id} className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{order.clinicName || order.userFullName}</h3>
                <p className="text-sm text-slate-500">Request #{order.id.slice(0, 8)} • {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <Badge color={
                 order.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                 order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                 order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                 'bg-blue-100 text-blue-800'
              }>
                {order.status}
              </Badge>
            </div>

            <div className="space-y-2 mb-6">
               {order.items.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded">
                    <div>
                      <span className="font-medium text-slate-900">{item.productName}</span>
                      <span className="text-slate-500 text-sm ml-2">x {item.quantity}</span>
                    </div>
                    <div className="text-teal-700 font-bold">
                       {formatCurrency(item.unitPriceAtRequest * item.quantity)}
                    </div>
                 </div>
               ))}
               <div className="flex justify-end pt-2">
                 <p className="text-sm text-slate-500">Estimated Total: <span className="font-bold text-slate-900">{formatCurrency(order.items.reduce((acc, i) => acc + (i.unitPriceAtRequest * i.quantity), 0))}</span></p>
               </div>
            </div>

            <div className="flex justify-end gap-3">
              {order.status === 'PENDING' && (
                <>
                  <Button variant="danger" size="sm" onClick={() => updateStatus(order.id, OrderStatus.CANCELLED)}>Decline</Button>
                  <Button variant="primary" size="sm" onClick={() => updateStatus(order.id, OrderStatus.APPROVED)}>Approve Request</Button>
                </>
              )}
              {order.status === 'APPROVED' && (
                <Button variant="secondary" size="sm" onClick={() => updateStatus(order.id, OrderStatus.SHIPPED)}>Mark Shipped</Button>
              )}
            </div>
          </Card>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200">
            No order requests found.
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderRequests;