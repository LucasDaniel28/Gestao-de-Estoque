import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Wine, Search, X, Package, Minus } from 'lucide-react';
import { Product, SaleUnit } from '../types';
import { productsService } from '../services/api';
import { toast } from 'react-toastify';
import { useCartStore } from '../store/cartStore';

interface ProductListProps {
  onEdit: (product: Product) => void;
  onAddNew: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ onEdit, onAddNew, onAddToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSaleUnitModal, setShowSaleUnitModal] = useState(false);
  const [selectedSaleUnit, setSelectedSaleUnit] = useState<SaleUnit>('unidade');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  
  const { addItem } = useCartStore();

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      await productsService.delete(id);
      toast.success('Produto excluído com sucesso!');
      loadProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const handleAddToCartClick = (product: Product) => {
    console.log('Produto selecionado:', product);
    console.log('packageQuantity:', product.packageQuantity);
    console.log('packagePrice:', product.packagePrice);
    setSelectedProduct(product);
    setSelectedSaleUnit('unidade');
    setSelectedQuantity(1);
    setShowSaleUnitModal(true);
  };

  const handleConfirmAddToCart = () => {
    if (selectedProduct && selectedQuantity > 0) {
      addItem(selectedProduct, selectedQuantity, selectedSaleUnit);
      const unitLabel = selectedSaleUnit === 'pacote' ? 'pacote(s)' : 'unidade(s)';
      toast.success(`${selectedQuantity} ${unitLabel} de ${selectedProduct.name} adicionado ao carrinho!`);
      setShowSaleUnitModal(false);
      setSelectedProduct(null);
      setSelectedQuantity(1);
    }
  };

  const handleCloseModal = () => {
    setShowSaleUnitModal(false);
    setSelectedProduct(null);
    setSelectedQuantity(1);
    setSelectedSaleUnit('unidade');
  };

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Produtos</h2>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent appearance-none bg-white"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236B7280\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
        >
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Wine size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                      {product.category}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">Unidade:</p>
                      <p className="text-2xl font-bold text-purple-600">
                        R$ {product.price.toFixed(2)}
                      </p>
                    </div>
                    {product.packageQuantity && product.packagePrice && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">
                          Pacote ({product.packageQuantity} un.):
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          R$ {product.packagePrice.toFixed(2)}
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Estoque: {product.quantity} un.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCartClick(product)}
                    disabled={product.quantity === 0}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      product.quantity === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <Plus size={16} />
                    Adicionar
                  </button>
                  <button
                    onClick={() => onEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Seleção de Unidade e Quantidade */}
      {showSaleUnitModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Adicionar ao Carrinho</h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-700 font-medium mb-6">{selectedProduct.name}</p>

            {/* Seleção de Tipo */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Venda:
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedSaleUnit('unidade')}
                  className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-colors ${
                    selectedSaleUnit === 'unidade'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedSaleUnit === 'unidade' ? 'bg-purple-200' : 'bg-purple-100'
                    }`}>
                      <Wine size={20} className="text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Unidade</p>
                      <p className="text-xs text-gray-600">Venda individual</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-purple-600">
                    R$ {selectedProduct.price.toFixed(2)}
                  </p>
                </button>

                {(selectedProduct.packageQuantity && selectedProduct.packageQuantity > 0 && 
                  selectedProduct.packagePrice && selectedProduct.packagePrice > 0) ? (
                  <button
                    onClick={() => setSelectedSaleUnit('pacote')}
                    className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-colors ${
                      selectedSaleUnit === 'pacote'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedSaleUnit === 'pacote' ? 'bg-green-200' : 'bg-green-100'
                      }`}>
                        <Package size={20} className="text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Pacote</p>
                        <p className="text-xs text-gray-600">
                          {selectedProduct.packageQuantity} unidades
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      R$ {selectedProduct.packagePrice.toFixed(2)}
                    </p>
                  </button>
                ) : (
                  <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-200 text-center">
                    <p className="text-sm text-gray-500">
                      Venda por pacote não disponível para este produto
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Seleção de Quantidade */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade:
              </label>
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Minus size={20} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 text-center text-3xl font-bold border-2 border-gray-300 rounded-lg py-3 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
                <button
                  onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Resumo */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Preço unitário:</span>
                <span className="font-semibold">
                  R$ {(selectedSaleUnit === 'pacote' 
                    ? selectedProduct.packagePrice 
                    : selectedProduct.price)?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Quantidade:</span>
                <span className="font-semibold">{selectedQuantity}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-purple-600">
                  R$ {((selectedSaleUnit === 'pacote' 
                    ? selectedProduct.packagePrice || 0
                    : selectedProduct.price) * selectedQuantity).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAddToCart}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;

