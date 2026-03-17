import React, { useState } from 'react';
import { X, CreditCard, DollarSign, Smartphone } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { salesService } from '../services/api';
import { toast } from 'react-toastify';

interface CheckoutProps {
  onClose: () => void;
  onSuccess: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onClose, onSuccess }) => {
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: 'Dinheiro',
    customerName: '',
    customerCPF: '',
    customerPhone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sale = await salesService.create({
        items,
        paymentMethod: formData.paymentMethod,
        customerName: formData.customerName || undefined,
        customerCPF: formData.customerCPF || undefined,
        customerPhone: formData.customerPhone || undefined,
      });

      toast.success('Venda realizada com sucesso!');
      
      // Download automático da nota fiscal
      try {
        await salesService.downloadPDF(sale.id);
      } catch (pdfError) {
        console.error('Erro ao baixar PDF:', pdfError);
        toast.warning('Venda realizada, mas houve erro ao gerar a nota fiscal');
      }

      clearCart();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao finalizar compra:', error);
      toast.error(error.response?.data?.message || 'Erro ao finalizar compra');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const paymentMethods = [
    { value: 'Dinheiro', icon: DollarSign, label: 'Dinheiro' },
    { value: 'Cartão de Crédito', icon: CreditCard, label: 'Cartão de Crédito' },
    { value: 'Cartão de Débito', icon: CreditCard, label: 'Cartão de Débito' },
    { value: 'PIX', icon: Smartphone, label: 'PIX' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Finalizar Compra</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Resumo do Pedido */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Resumo do Pedido</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="font-medium">R$ {item.subtotal.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-purple-600">R$ {getTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Forma de Pagamento *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.value}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.paymentMethod === method.value
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={formData.paymentMethod === method.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <Icon size={20} className={formData.paymentMethod === method.value ? 'text-purple-600' : 'text-gray-400'} />
                    <span className={`font-medium ${formData.paymentMethod === method.value ? 'text-purple-600' : 'text-gray-700'}`}>
                      {method.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Informações do Cliente (opcional) */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Informações do Cliente (Opcional)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Nome do cliente"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    name="customerCPF"
                    value={formData.customerCPF}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300 font-medium"
            >
              {loading ? 'Processando...' : 'Confirmar Venda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;

