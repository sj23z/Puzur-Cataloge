import React, { useEffect, useState } from 'react';
import { Card, Button, Input } from '../components/UI';
import { Brand } from '../types';
import { MockAPI } from '../services/mockDb';
import { Link } from 'react-router-dom';

const BrandList = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    MockAPI.getBrands().then(setBrands);
  }, []);

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.originCountry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Brand Catalog</h1>
          <p className="text-slate-500 text-sm">Select a manufacturer to view their exclusive product line.</p>
        </div>
        <div className="w-full sm:w-64">
          <Input 
            placeholder="Search brands or country..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.map(brand => (
          <Link key={brand.id} to={`/brands/${brand.id}`} className="group block">
            <Card className="h-full transition-all group-hover:shadow-md group-hover:border-teal-200">
              <div className="h-48 overflow-hidden relative bg-slate-100">
                <img 
                  src={brand.imageUrl} 
                  alt={brand.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                   <h3 className="text-white font-bold text-xl">{brand.name}</h3>
                   <p className="text-slate-200 text-xs">{brand.originCountry}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {brand.certifications.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold tracking-wide uppercase border border-slate-200">
                      {c}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">{brand.description}</p>
                <div className="flex items-center text-teal-600 text-sm font-medium group-hover:underline">
                  View Products &rarr;
                </div>
              </div>
            </Card>
          </Link>
        ))}
        {filteredBrands.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No brands found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandList;