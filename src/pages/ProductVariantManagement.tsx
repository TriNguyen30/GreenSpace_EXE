import { useState, useEffect } from "react";
import { notification } from "antd";
import { 
  getProductVariants, 
  createProductVariant, 
  updateProductVariant, 
  deleteProductVariant, 
  getProductVariantById 
} from "@/services/productVariant.service";
import { getProducts } from "@/services/product.service";
import type { 
  ProductVariant, 
  CreateProductVariantPayload
} from "@/types/productVariant";

export default function ProductVariantManagement() {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [viewingVariant, setViewingVariant] = useState<ProductVariant | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [formData, setFormData] = useState<CreateProductVariantPayload>({
    productId: "",
    sku: "",
    price: 0,
    stockQuantity: 0,
    imageUrl: "",
    color: "",
    sizeOrModel: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchVariants(selectedProductId);
    }
  }, [selectedProductId]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchVariants = async (productId: string) => {
    try {
      setLoading(true);
      const data = await getProductVariants(productId);
      console.log("Fetched variants data:", data);
      console.log("Type of data:", typeof data);
      console.log("Is array?", Array.isArray(data));
      
      // Đảm bảo data là mảng
      if (Array.isArray(data)) {
        setVariants(data);
        console.log("Variants set to state:", data.length);
      } else {
        console.error("API returned non-array data:", data);
        setVariants([]);
      }
    } catch (error) {
      console.error("Failed to fetch variants:", error);
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  // Debug log để kiểm tra render
  useEffect(() => {
    console.log("Current variants state:", variants);
    console.log("Variants length:", variants.length);
    console.log("Selected productId:", selectedProductId);
  }, [variants, selectedProductId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        productId: selectedProductId,
      };

      if (editingVariant) {
        await updateProductVariant(selectedProductId, editingVariant.variantId, {
          ...formData,
          isActive: true
        });
        notification.success({ message: "Biến thể được cập nhật thành công!" });
      } else {
        await createProductVariant(selectedProductId, payload);
        notification.success({ message: "Biến thể được tạo thành công!" });
      }
      await fetchVariants(selectedProductId);
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save variant:", error);
      notification.error({ message: "Không thể lưu biến thể." });
    }
  };

  const handleEdit = async (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      productId: variant.productId,
      sku: variant.sku,
      price: variant.price,
      stockQuantity: variant.stockQuantity,
      imageUrl: variant.imageUrl,
      color: variant.color,
      sizeOrModel: variant.sizeOrModel,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string, variantId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa biến thể này không?")) {
      try {
        // Sử dụng selectedProductId thay vì productId từ variant
        await deleteProductVariant(selectedProductId, variantId);
        notification.success({ message: "Biến thể được xóa thành công!" });
        await fetchVariants(selectedProductId);
      } catch (error) {
        console.error("Failed to delete variant:", error);
        notification.error({ message: "Không thể xóa biến thể." });
      }
    }
  };

  const handleView = async (productId: string, variantId: string) => {
    try {
      const variant = await getProductVariantById(productId, variantId);
      setViewingVariant(variant);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch variant details:", error);
      notification.error({ message: "Không thể tải chi tiết biến thể." });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVariant(null);
    setFormData({
      productId: "",
      sku: "",
      price: 0,
      stockQuantity: 0,
      imageUrl: "",
      color: "",
      sizeOrModel: "",
    });
  };

  const closeViewModal = () => {
    setIsDetailModalOpen(false);
    setViewingVariant(null);
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.productId === productId);
    return product ? product.name : "Unknown Product";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Biến thể Sản phẩm</h1>
          <p className="text-gray-600">Quản lý các biến thể của sản phẩm.</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Chọn sản phẩm</option>
            {products.map((product) => (
              <option key={product.productId} value={product.productId}>
                {product.name}
              </option>
            ))}
          </select>
          {selectedProductId && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 00-1 1v3h3a1 1 0 002 0v-3H6a1 1 0 00-1-1v3h3a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Thêm Biến thể
            </button>
          )}
        </div>
      </div>

      {selectedProductId && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Màu sắc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kích cỡ/Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  </td>
                </tr>
              ) : variants.length > 0 ? (
                variants.map((variant) => (
                  <tr key={variant.variantId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {variant.imageUrl && (
                        <img
                          src={variant.imageUrl}
                          alt={variant.sku}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {variant.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {variant.color}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {variant.sizeOrModel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {variant.price.toLocaleString()}đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {variant.stockQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        variant.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {variant.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(variant)}
                          className="text-green-600 hover:text-green-900"
                          title="Chỉnh sửa"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleView(selectedProductId, variant.variantId)}
                          className="text-green-600 hover:text-green-900"
                          title="Xem chi tiết"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(selectedProductId, variant.variantId)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        {/* Tạm thời ẩn nút xem chi tiết để tránh 404 error */}
                        {/* <button
                          onClick={() => handleView(variant.productId, variant.variantId)}
                          className="text-green-600 hover:text-green-900"
                          title="Xem chi tiết"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-center">
                      <div className="text-gray-500 text-lg">Chưa có biến thể nào</div>
                      <p className="text-gray-400">Vui lòng chọn sản phẩm để xem biến thể.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingVariant ? "Chỉnh sửa Biến thể" : "Thêm Biến thể Mới"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Màu sắc</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Kích cỡ/Model</label>
                  <input
                    type="text"
                    value={formData.sizeOrModel}
                    onChange={(e) => setFormData({ ...formData, sizeOrModel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Giá</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Số lượng tồn kho</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">URL Hình ảnh</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mr-4 px-6 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingVariant ? "Cập nhật" : "Tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && viewingVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết Biến thể</h3>
              <button
                onClick={closeViewModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {viewingVariant.imageUrl && (
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Hình ảnh</label>
                    <img
                      src={viewingVariant.imageUrl}
                      alt={viewingVariant.sku}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">SKU</label>
                  <p className="text-gray-900 font-medium">{viewingVariant.sku}</p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Màu sắc</label>
                  <p className="text-gray-900 font-medium">{viewingVariant.color}</p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Kích cỡ/Model</label>
                  <p className="text-gray-900 font-medium">{viewingVariant.sizeOrModel}</p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Giá</label>
                  <p className="text-gray-900 font-medium">{viewingVariant.price.toLocaleString()}đ</p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Số lượng tồn kho</label>
                  <p className="text-gray-900 font-medium">{viewingVariant.stockQuantity}</p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Trạng thái</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    viewingVariant.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {viewingVariant.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
