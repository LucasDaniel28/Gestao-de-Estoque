import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Calendar } from 'lucide-react';
import { Sale } from '../types';
import { salesService } from '../services/api';
import { toast } from 'react-toastify';

const SalesList: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await salesService.getAll();
      setSales(data);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      toast.error('Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleDownloadPDF = async (saleId: string) => {
    try {
      await salesService.downloadPDF(saleId);
      toast.success('Nota fiscal baixada com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast.error('Erro ao baixar nota fiscal');
    }
  };

  const filteredSales = sales.filter((sale) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      sale.id.toLowerCase().includes(searchLower) ||
      sale.customerName?.toLowerCase().includes(searchLower) ||
      sale.paymentMethod.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendas Realizadas</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total em vendas: <span className="font-bold text-purple-600">R$ {totalRevenue.toFixed(2)}</span>
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar vendas por ID, cliente ou forma de pagamento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        />
      </div>

      {/* Sales List */}
      {filteredSales.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Nenhuma venda encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText size={20} className="text-purple-600" />
                    <h3 className="font-semibold text-gray-900">
                      Venda #{sale.id.substring(0, 8).toUpperCase()}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      {new Date(sale.createdAt).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(sale.createdAt).toLocaleTimeString('pt-BR')}
                    </div>
                    <div>
                      <span className="font-medium">Pagamento:</span> {sale.paymentMethod}
                    </div>
                    {sale.customerName && (
                      <div>
                        <span className="font-medium">Cliente:</span> {sale.customerName}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Itens:</span> {sale.items.length}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-2">Produtos:</p>
                    <div className="space-y-1">
                      {sale.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="font-medium text-gray-900">
                            R$ {item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-purple-600">
                      R$ {sale.total.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadPDF(sale.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Download size={18} />
                    Baixar Nota Fiscal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesList;

