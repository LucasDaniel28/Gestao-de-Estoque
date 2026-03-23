import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { ShoppingCart, Package, FileText, Wine, BarChart3 } from 'lucide-react';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import SalesList from './components/SalesList';
import ReportGrid from './components/ReportGrid';
import { Product } from './types';
import { useCartStore } from './store/cartStore';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

type View = 'products' | 'sales' | 'reports';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('products');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  
  const { getItemCount } = useCartStore();

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleAddNewProduct = () => {
    setEditingProduct(undefined);
    setShowProductForm(true);
  };

  const handleProductFormClose = () => {
    setShowProductForm(false);
    setEditingProduct(undefined);
  };

  const handleCheckoutClick = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setCurrentView('sales');
  };

  const itemCount = getItemCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Wine className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema Depósito</h1>
                <p className="text-xs text-gray-600">Gestão de Produtos e Vendas</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCart(true)}
                className="relative p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <ShoppingCart size={24} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-4 py-4">
            <button
              onClick={() => setCurrentView('products')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentView === 'products'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Package size={20} />
              Produtos
            </button>
            <button
              onClick={() => setCurrentView('sales')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentView === 'sales'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText size={20} />
              Vendas
            </button>
            <button
              onClick={() => setCurrentView('reports')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentView === 'reports'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 size={20} />
              Relatórios
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'products' ? (
          <ProductList
            onEdit={handleEditProduct}
            onAddNew={handleAddNewProduct}
            onAddToCart={() => {}} // Não usado mais, mantido por compatibilidade
          />
        ) : currentView === 'sales' ? (
          <SalesList />
        ) : (
          <ReportGrid />
        )}
      </main>

      {/* Modals */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleProductFormClose}
          onSuccess={() => {
            handleProductFormClose();
            window.location.reload();
          }}
        />
      )}

      {showCart && (
        <Cart
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          onCheckout={handleCheckoutClick}
        />
      )}

      {showCheckout && (
        <Checkout
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} Sistema Depósito - Gestão de Produtos e Vendas
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
