import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  isNew?: boolean;
  type: string;
  size: string;
  careDifficulty: string;
}

export default function Product() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['tabletop']);
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  // Mock data - 60 products for pagination
  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Tùng La Hán Dáng Văn Nhân',
      description: 'Cây nội thất, cây phong thủy',
      price: '425.000 ₫',
      image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&h=300&fit=crop',
      isNew: true,
      type: 'drought',
      size: 'medium',
      careDifficulty: 'easy',
    },
    {
      id: 2,
      name: 'Cây Trầu Bà Vàng',
      description: 'Cây để bàn, cây nội thất',
      price: '220.000 ₫',
      image: 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=400&h=300&fit=crop',
      isNew: true,
      type: 'tabletop',
      size: 'small',
      careDifficulty: 'easy',
    },
    {
      id: 3,
      name: 'Cây Kim Ngân',
      description: 'Cây phong thủy, cây nội thất',
      price: '780.000 ₫',
      image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop',
      type: 'drought',
      size: 'large',
      careDifficulty: 'medium',
    },
    {
      id: 4,
      name: 'Cây Lưỡi Hổ',
      description: 'Cây để bàn, dễ chăm sóc',
      price: '350.000 ₫',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
      isNew: true,
      type: 'tabletop',
      size: 'small',
      careDifficulty: 'easy',
    },
    {
      id: 5,
      name: 'Cây Phát Tài',
      description: 'Cây nội thất, cây phong thủy',
      price: '520.000 ₫',
      image: 'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=300&fit=crop',
      type: 'drought',
      size: 'medium',
      careDifficulty: 'medium',
    },
    {
      id: 6,
      name: 'Cây Trúc Nhật',
      description: 'Cây treo tường, trang trí',
      price: '280.000 ₫',
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop',
      type: 'aquatic',
      size: 'small',
      careDifficulty: 'easy',
    },
    {
      id: 7,
      name: 'Cây Đa Búp Đỏ',
      description: 'Cây nội thất lớn',
      price: '950.000 ₫',
      image: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=400&h=300&fit=crop',
      type: 'indoor',
      size: 'large',
      careDifficulty: 'medium',
    },
    {
      id: 8,
      name: 'Cây Sen Đá',
      description: 'Cây để bàn nhỏ xinh',
      price: '150.000 ₫',
      image: 'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=400&h=300&fit=crop',
      isNew: true,
      type: 'tabletop',
      size: 'small',
      careDifficulty: 'easy',
    },
    {
      id: 9,
      name: 'Cây Monstera',
      description: 'Cây nội thất hiện đại',
      price: '650.000 ₫',
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop',
      type: 'drought',
      size: 'medium',
      careDifficulty: 'medium',
    },
    {
      id: 10,
      name: 'Cây Dây Nhện',
      description: 'Cây treo tường',
      price: '180.000 ₫',
      image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop',
      type: 'aquatic',
      size: 'small',
      careDifficulty: 'easy',
    },
    // Add more products to reach 60
    // Using valid image URLs from Home.tsx
    ...Array.from({ length: 50 }, (_, i) => {
      const validImages = [
        'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop',
      ];
      return {
        id: i + 11,
        name: `Cây Cảnh ${i + 11}`,
        description: 'Cây nội thất đẹp',
        price: `${(Math.floor(Math.random() * 800) + 200).toLocaleString('vi-VN')} ₫`,
        image: validImages[i % validImages.length],
        isNew: i % 3 === 0,
        type: ['tabletop', 'aquatic', 'drought'][i % 3],
        size: ['small', 'medium', 'large'][i % 3],
        careDifficulty: ['easy', 'medium', 'expert'][i % 3],
      };
    }),
  ];

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      if (selectedTypes.length > 0 && !selectedTypes.includes(product.type)) return false;
      if (selectedSize && product.size !== selectedSize) return false;
      if (selectedDifficulty && product.careDifficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [mockProducts, selectedDifficulty, selectedSize, selectedTypes]);

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'newest') return b.id - a.id;
    if (sortBy === 'price-low') {
      const priceA = parseInt(a.price.replace(/[^\d]/g, ''));
      const priceB = parseInt(b.price.replace(/[^\d]/g, ''));
      return priceA - priceB;
    }
    if (sortBy === 'price-high') {
      const priceA = parseInt(a.price.replace(/[^\d]/g, ''));
      const priceB = parseInt(b.price.replace(/[^\d]/g, ''));
      return priceB - priceA;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + productsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 py-19">
      {/* Hero Banner Section */}
      <section className="bg-green-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-green-800 mb-3">
            Khám Phá Bộ Sưu Tập Cây Cảnh
          </h1>
          <p className="text-gray-700 text-lg">
            Mang thiên nhiên vào không gian sống của bạn với những tác phẩm nghệ thuật xanh.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="w-5 h-5 text-green-700" />
                <h2 className="text-xl font-bold text-gray-900">Bộ lọc</h2>
              </div>

              {/* Plant Type Filter */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">LOẠI CÂY</h3>
                <div className="space-y-3">
                  {[
                    { value: 'tabletop', label: 'Cây để bàn' },
                    { value: 'aquatic', label: 'Cây thủy sinh' },
                    { value: 'drought', label: 'Cây chịu hạn' },
                  ].map((type) => {
                    const checked = selectedTypes.includes(type.value);
                    return (
                      <label key={type.value} className="flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setCurrentPage(1);
                            setSelectedTypes((prev) => {
                              if (prev.includes(type.value)) return prev.filter((t) => t !== type.value);
                              return [...prev, type.value];
                            });
                          }}
                          className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-600"
                        />
                        <span className="ml-3 text-gray-700">{type.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">MỨC GIÁ</h3>
                <select
                  value={sortBy === 'price-low' || sortBy === 'price-high' ? sortBy : ''}
                  onChange={(e) => {
                    setCurrentPage(1);
                    const v = e.target.value;
                    if (v === 'price-low' || v === 'price-high') setSortBy(v);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="price-low">Giá: Thấp đến Cao</option>
                  <option value="price-high">Giá: Cao đến Thấp</option>
                </select>
              </div>

              {/* Size Filter */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">KÍCH THƯỚC</h3>
                <div className="space-y-2">
                  {[
                    { value: 'small' as const, label: 'Nhỏ' },
                    { value: 'medium' as const, label: 'Vừa' },
                    { value: 'large' as const, label: 'Lớn' },
                  ].map((s) => {
                    const active = selectedSize === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => {
                          setCurrentPage(1);
                          setSelectedSize(s.value);
                        }}
                        className={[
                          'w-full text-left px-4 py-2.5 rounded-lg border transition',
                          active
                            ? 'bg-green-700 border-green-700 text-white'
                            : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50',
                        ].join(' ')}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Care Difficulty Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">ĐỘ KHÓ CHĂM SÓC</h3>
                <div className="space-y-3">
                  {[
                    { value: 'easy', label: 'Dễ chăm sóc' },
                    { value: 'medium', label: 'Trung bình' },
                    { value: 'expert', label: 'Chuyên gia' },
                  ].map((difficulty) => (
                    <label key={difficulty.value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="difficulty"
                        checked={selectedDifficulty === difficulty.value}
                        onChange={() => setSelectedDifficulty(difficulty.value)}
                        className="w-5 h-5 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-3 text-gray-700">{difficulty.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Section - Products */}
          <div className="flex-1">
            {/* Info Bar */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-700">
                Hiển thị {paginatedProducts.length} sản phẩm
              </p>
              <div className="flex items-center gap-3">
                <span className="text-gray-700">Sắp xếp theo:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-low">Giá thấp đến cao</option>
                  <option value="price-high">Giá cao đến thấp</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow block"
                  aria-label={`Xem chi tiết ${product.name}`}
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover"
                    />
                    {product.isNew && (
                      <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                        MỚI VỀ
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    <p className="text-lg font-bold text-green-600">{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                if (i === 4 && currentPage < totalPages - 2) {
                  return (
                    <React.Fragment key="ellipsis">
                      <span className="px-3">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                      >
                        {totalPages}
                      </button>
                    </React.Fragment>
                  );
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg border ${
                      currentPage === pageNum
                        ? 'bg-green-800 text-white border-green-800'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
