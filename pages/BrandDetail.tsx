
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brand, Product, OrderRequest, OrderStatus } from '../types';
import { MockAPI } from '../services/mockDb';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Modal, Badge, formatCurrency } from '../components/UI';
import { v4 as uuidv4 } from 'uuid';

const BrandDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      MockAPI.getBrands().then(brands => {
        const b = brands.find(b => b.id === id);
        if (b) setBrand(b);
        else navigate('/brands');
      });
      MockAPI.getProducts(id).then(setProducts);
    }
  }, [id, navigate]);

  const calculatePrice = (basePrice: number) => {
    // Simple logic: base * tier
    return basePrice * (user?.discountTier || 1);
  };

  const handleRequestOrder = async () => {
    if (!selectedProduct || !user) return;
    setIsSubmitting(true);

    const price = calculatePrice(selectedProduct.basePrice);

    const order: OrderRequest = {
      id: uuidv4(),
      userId: user.id,
      userFullName: user.fullName,
      clinicName: user.clinicName,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      items: [
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity: qty,
          unitPriceAtRequest: price
        }
      ]
    };

    try {
      await MockAPI.createOrder(order);
      alert("Order request sent successfully! An agent will confirm availability shortly.");
      setSelectedProduct(null);
      setQty(1);
    } catch (e) {
      alert("Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!brand) return <div className="p-8 text-center">Loading brand...</div>;

  return (
    <div>
      {/* Brand Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/3 h-64 md:h-auto relative">
             <img src={brand.imageUrl} alt={brand.name} className="absolute inset-0 w-full h-full object-cover" />
             <div className="absolute inset-0 bg-black/10"></div>
          </div>
          <div className="p-6 md:p-8 flex-1">
            <div className="flex flex-col h-full justify-center">
              <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-3xl font-bold text-slate-900">{brand.name}</h1>
                 <Badge color="bg-teal-50 text-teal-700 border border-teal-100">{brand.originCountry}</Badge>
              </div>
              <p className="text-slate-600 mb-6 text-lg">{brand.description}</p>
              
              <div className="space-y-2 mb-6">
                 <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Certifications</h4>
                 <div className="flex gap-2">
                   {brand.certifications.map(c => (
                     <span key={c} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-200">{c}</span>
                   ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <h2 className="text-xl font-bold text-slate-900 mb-6">Product Catalog</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map(product => {
          const price = calculatePrice(product.basePrice);
          return (
            <Card key={product.id} className="flex flex-col">
              <div className="h-48 bg-white p-4 flex items-center justify-center border-b border-slate-100 relative">
                <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain" />
                {product.stockStatus !== 'IN_STOCK' && (
                  <div className="absolute top-2 right-2">
                    <Badge color={product.stockStatus === 'LOW_STOCK' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                      {product.stockStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-slate-900">{product.name}</h3>
                  <p className="text-sm font-medium text-slate-500 mb-2">{product.specs}</p>
                  <p className="text-sm text-slate-600">{product.description}</p>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase">Your Price</span>
                    <span className="text-xl font-bold text-teal-700">{formatCurrency(price)}</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setSelectedProduct(product)}
                    disabled={product.stockStatus === 'OUT_OF_STOCK'}
                  >
                    Request Order
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Order Request Modal */}
      <Modal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        title="Request Order Quote"
      >
        {selectedProduct && (
          <div className="space-y-4">
             <div className="flex items-start gap-4">
                <img src={selectedProduct.imageUrl} className="w-16 h-16 object-cover rounded bg-slate-100" alt="" />
                <div>
                   <h4 className="font-bold text-slate-900">{selectedProduct.name}</h4>
                   <p className="text-sm text-slate-500">{selectedProduct.specs}</p>
                   <p className="text-teal-600 font-medium mt-1">{formatCurrency(calculatePrice(selectedProduct.basePrice))} / unit</p>
                </div>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
               <input 
                 type="number" 
                 min="1" 
                 max="100" 
                 value={qty} 
                 onChange={e => setQty(parseInt(e.target.value) || 1)}
                 className="w-full border border-slate-300 rounded-md p-2" 
               />
             </div>

             <div className="bg-slate-50 p-3 rounded text-sm text-slate-600">
                <p><strong>Note:</strong> This is a request only. No payment is processed now. An administrator will review stock and confirm the final invoice.</p>
             </div>

             <div className="flex gap-3 pt-2">
               <Button className="flex-1" onClick={handleRequestOrder} disabled={isSubmitting}>
                 {isSubmitting ? 'Sending...' : 'Submit Request'}
               </Button>
               <Button variant="outline" onClick={() => setSelectedProduct(null)}>Cancel</Button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BrandDetail;
