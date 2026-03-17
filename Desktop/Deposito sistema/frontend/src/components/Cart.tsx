import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

interface CartProps {
  onCheckout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ onCheckout, isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, getTotal, clearCart, getItemCount } = useCartStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <ShoppingCart size={24} className="text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Carrinho ({getItemCount()} {getItemCount() === 1 ? 'item' : 'itens'})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Seu carrinho está vazio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.saleUnit}`}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600">
                        R$ {item.price.toFixed(2)} / {item.saleUnit === 'pacote' ? 'pacote' : 'unidade'}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.saleUnit === 'pacote' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.saleUnit === 'pacote' ? 'Pacote' : 'Unidade'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.saleUnit, item.quantity - 1)}
                      className="p-1 rounded-lg bg-white hover:bg-gray-200 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.saleUnit, item.quantity + 1)}
                      className="p-1 rounded-lg bg-white hover:bg-gray-200 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-purple-600">
                      R$ {item.subtotal.toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId, item.saleUnit)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-gray-700">Total:</span>
              <span className="text-2xl font-bold text-purple-600">
                R$ {getTotal().toFixed(2)}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="flex-1 px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                Limpar Carrinho
              </button>
              <button
                onClick={onCheckout}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Finalizar Compra
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

