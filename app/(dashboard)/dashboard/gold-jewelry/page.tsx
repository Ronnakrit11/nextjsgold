'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ImagePlus, Loader2 } from 'lucide-react';
import { useTheme } from '@/lib/theme-provider';
import Image from 'next/image';
import { toast } from 'sonner';

interface Product {
  id: number;
  categoryId: number;
  code: string;
  name: string;
  description: string | null;
  weight: number;
  weightUnit: string;
  purity: number;
  sellingPrice: number;
  workmanshipFee: number;
  imageUrl: string | null;
  status: string;
}

export default function GoldJewelryPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const response = await fetch('/api/management/products');
      if (response.ok) {
        const data = await response.json();
        // Filter only jewelry products (categoryId: 1 for ทองรูปพรรณ)
        const jewelryProducts = data.filter((product: Product) => product.categoryId === 1);
        setProducts(jewelryProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className={`text-lg lg:text-2xl font-medium mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        ทองรูปพรรณ
      </h1>

      <Card className={isDark ? 'bg-[#151515] border-[#2A2A2A]' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-orange-500" />
            <span className={isDark ? 'text-white' : ''}>สินค้าทองรูปพรรณ</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`border rounded-lg overflow-hidden ${
                    isDark 
                      ? 'bg-[#1a1a1a] border-[#2A2A2A] hover:bg-[#202020]' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="aspect-square relative">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <ImagePlus className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className={`font-medium ${isDark ? 'text-white' : ''}`}>
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {product.description}
                      </p>
                    )}
                    <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <p>น้ำหนัก: {product.weight} {product.weightUnit}</p>
                      <p>ความบริสุทธิ์: {product.purity}%</p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div>
                        <p className="text-orange-500 font-medium text-lg">
                          ฿{Number(product.sellingPrice).toLocaleString()}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          ค่ากำเหน็จ: ฿{Number(product.workmanshipFee).toLocaleString()}
                        </p>
                      </div>
                      <Button 
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => toast.info('Coming soon!')}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        ซื้อ
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              ไม่พบสินค้าทองรูปพรรณในขณะนี้
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}