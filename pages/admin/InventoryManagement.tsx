import React, { useEffect, useState } from 'react';
import { Brand, Product } from '../../types';
import { MockAPI } from '../../services/mockDb';
import { Button, Input, Modal, Card, formatCurrency } from '../../components/UI';
import { v4 as uuidv4 } from 'uuid';

const InventoryManagement = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  
  // Brand Modal State
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Partial<Brand>>({});

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    const data = await MockAPI.getBrands();
    setBrands(data);
    if (data.length > 0 && !selectedBrandId) {
      setSelectedBrandId(data[0].id);
    }
  };

  useEffect(() => {
    if (selectedBrandId) {
      MockAPI.getProducts(selectedBrandId).then(setProducts);
    } else {
      setProducts([]);
    }
  }, [selectedBrandId]);

  // --- Image Handling ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Brand Handlers ---
  const openNewBrand = () => {
    setEditingBrand({
      name: '',
      description: '',
      originCountry: '',
      certifications: [],
      imageUrl: ''
    });
    setIsBrandModalOpen(true);
  };

  const openEditBrand = () => {
    const currentBrand = brands.find(b => b.id === selectedBrandId);
    if (currentBrand) {
      setEditingBrand({...currentBrand});
      setIsBrandModalOpen(true);
    }
  };

  const handleSaveBrand = async () => {
    if (!editingBrand.name) return;
    
    const brandToSave: Brand = {
      id: editingBrand.id || uuidv4(),
      name: editingBrand.name,
      description: editingBrand.description || '',
      originCountry: editingBrand.originCountry || '',
      certifications: editingBrand.certifications || [],
      imageUrl: editingBrand.imageUrl || 'https://via.placeholder.com/800x600'
    };

    await MockAPI.saveBrand(brandToSave);
    setIsBrandModalOpen(false);
    await loadBrands();
    setSelectedBrandId(brandToSave.id);
  };

  // --- Product Handlers ---
  const openNewProduct = () => {
    setEditingProduct({ basePrice: 0, stockStatus: 'IN_STOCK', imageUrl: '' });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct.name || !selectedBrandId) return;

    const prod: Product = {
      id: editingProduct.id || uuidv4(),
      brandId: selectedBrandId,
      name: editingProduct.name!,
      specs: editingProduct.specs || '',
      description: editingProduct.description || '',
      basePrice: editingProduct.basePrice || 0,
      imageUrl: editingProduct.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image',
      stockStatus: editingProduct.stockStatus || 'IN_STOCK'
    };

    await MockAPI.saveProduct(prod);
    setIsProductModalOpen(false);
    MockAPI.getProducts(selectedBrandId).then(setProducts);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
         <Button size="sm" onClick={openNewBrand} className="md:hidden">+ Brand</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Brand Selector - Horizontal scroll on mobile, Vertical list on desktop */}
        <div className="w-full md:w-64 shrink-0 space-y-4">
           <Card className="p-2 md:p-4 bg-slate-50 md:bg-white border-0 md:border border-slate-200">
             <div className="hidden md:flex justify-between items-center mb-4">
               <h3 className="font-semibold text-slate-700">Brands</h3>
               <button onClick={openNewBrand} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded hover:bg-teal-100">+ Add</button>
             </div>
             
             <div className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 md:gap-1 pb-2 md:pb-0 scrollbar-hide">
               {brands.map(b => (
                 <button 
                   key={b.id}
                   onClick={() => setSelectedBrandId(b.id)}
                   className={`flex-shrink-0 px-4 py-2 md:px-3 md:py-2 rounded-full md:rounded-lg text-sm font-medium transition-colors whitespace-nowrap text-left
                     ${selectedBrandId === b.id 
                       ? 'bg-teal-600 text-white shadow-md' 
                       : 'bg-white md:bg-transparent text-slate-600 border md:border-0 border-slate-200 hover:bg-slate-50'}`}
                 >
                   {b.name}
                 </button>
               ))}
               {brands.length === 0 && <p className="text-xs text-slate-400 p-2">No brands available.</p>}
             </div>
           </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {brands.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {brands.find(b => b.id === selectedBrandId)?.name}
                    <button onClick={openEditBrand} className="text-xs text-slate-400 font-normal hover:text-teal-600 underline ml-2">Edit</button>
                  </h2>
                  <p className="text-sm text-slate-500">{brands.find(b => b.id === selectedBrandId)?.originCountry}</p>
                </div>
                <Button size="sm" onClick={openNewProduct} className="w-full sm:w-auto">+ Add Product</Button>
              </div>

              {/* Desktop Table / Mobile Cards */}
              <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
                 {/* Desktop Header */}
                 <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50 px-6 py-3 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase">
                    <div className="col-span-2">Image</div>
                    <div className="col-span-4">Product</div>
                    <div className="col-span-3">Base Price</div>
                    <div className="col-span-2">Stock</div>
                    <div className="col-span-1 text-right">Edit</div>
                 </div>

                 <div className="divide-y divide-slate-100">
                   {products.map(p => (
                     <div key={p.id} className="p-4 md:px-6 md:py-4 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                       {/* Mobile Top Row */}
                       <div className="flex w-full md:contents">
                          <div className="w-16 h-16 md:w-12 md:h-12 bg-slate-100 rounded overflow-hidden shrink-0 md:col-span-2">
                            <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="ml-4 flex-1 md:ml-0 md:col-span-4">
                             <div className="font-medium text-slate-900">{p.name}</div>
                             <div className="text-xs text-slate-500">{p.specs}</div>
                             <div className="md:hidden mt-1 font-medium text-teal-700">{formatCurrency(p.basePrice)}</div>
                          </div>
                          
                          {/* Mobile Action */}
                          <div className="md:hidden ml-auto">
                             <button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="p-2 text-slate-400 hover:text-teal-600">
                               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                               </svg>
                             </button>
                          </div>
                       </div>

                       {/* Desktop Columns (Hidden on Mobile) */}
                       <div className="hidden md:block col-span-3 text-sm text-slate-600">{formatCurrency(p.basePrice)}</div>
                       
                       <div className="w-full md:w-auto md:col-span-2 mt-2 md:mt-0">
                         <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium w-full md:w-auto text-center ${p.stockStatus === 'IN_STOCK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                             {p.stockStatus.replace('_', ' ')}
                         </span>
                       </div>

                       <div className="hidden md:block col-span-1 text-right">
                         <button 
                             className="text-teal-600 hover:text-teal-900 text-sm font-medium"
                             onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }}
                           >
                             Edit
                           </button>
                       </div>
                     </div>
                   ))}
                   {products.length === 0 && <div className="p-8 text-center text-slate-500">No products found.</div>}
                 </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 p-4 text-center">
              <p>Select a brand above to manage inventory.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Brand Modal --- */}
      <Modal isOpen={isBrandModalOpen} onClose={() => setIsBrandModalOpen(false)} title={editingBrand.id ? "Edit Brand" : "Add New Brand"}>
         <div className="space-y-4">
            <Input label="Brand Name" value={editingBrand.name || ''} onChange={e => setEditingBrand({...editingBrand, name: e.target.value})} />
            <Input label="Origin Country" value={editingBrand.originCountry || ''} onChange={e => setEditingBrand({...editingBrand, originCountry: e.target.value})} />
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                rows={3}
                value={editingBrand.description || ''}
                onChange={e => setEditingBrand({...editingBrand, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Brand Banner Image</label>
              <div className="flex items-center gap-4">
                {editingBrand.imageUrl && (
                  <img src={editingBrand.imageUrl} alt="Preview" className="w-16 h-12 object-cover rounded bg-slate-100" />
                )}
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, val => setEditingBrand({...editingBrand, imageUrl: val}))} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
              </div>
            </div>

            <Input label="Certifications (comma separated)" value={editingBrand.certifications?.join(', ') || ''} onChange={e => setEditingBrand({...editingBrand, certifications: e.target.value.split(',').map(s => s.trim())})} />

            <div className="pt-2">
              <Button className="w-full" onClick={handleSaveBrand}>Save Brand</Button>
            </div>
         </div>
      </Modal>

      {/* --- Product Modal --- */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Product Details">
        <div className="space-y-4">
          <Input label="Name" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
          <Input label="Specs (e.g. 1x1ml)" value={editingProduct.specs || ''} onChange={e => setEditingProduct({...editingProduct, specs: e.target.value})} />
          <Input label="Base Price (IQD)" type="number" value={editingProduct.basePrice || 0} onChange={e => setEditingProduct({...editingProduct, basePrice: parseFloat(e.target.value)})} />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              rows={2}
              value={editingProduct.description || ''}
              onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Product Photo</label>
             <div className="flex flex-col gap-2">
               {editingProduct.imageUrl && (
                 <div className="w-full h-32 bg-slate-50 rounded border border-slate-200 flex items-center justify-center overflow-hidden">
                   <img src={editingProduct.imageUrl} alt="Preview" className="h-full object-contain" />
                 </div>
               )}
               <input type="file" accept="image/*" onChange={e => handleImageUpload(e, val => setEditingProduct({...editingProduct, imageUrl: val}))} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Stock Status</label>
            <select 
               className="w-full border border-slate-300 rounded-md p-2 text-sm"
               value={editingProduct.stockStatus}
               onChange={e => setEditingProduct({...editingProduct, stockStatus: e.target.value as any})}
            >
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

          <Button className="w-full mt-4" onClick={handleSaveProduct}>Save Product</Button>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryManagement;