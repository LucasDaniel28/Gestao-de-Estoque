import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Box, Button, Card, CardContent, Typography, Chip, IconButton } from '@mui/material';
import { Download, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { StockMovement } from '../types';
import { salesService, productsService } from '../services/api';
import { toast } from 'react-toastify';

const ReportGrid: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, productsData] = await Promise.all([
        salesService.getAll(),
        productsService.getAll()
      ]);
      
      // Gerar movimentos de estoque a partir das vendas
      const stockMovements: StockMovement[] = [];
      
      // Processar vendas como movimentos de saída
      salesData.forEach((sale) => {
        sale.items.forEach((item) => {
          stockMovements.push({
            id: `${sale.id}-${item.productId}`,
            productId: item.productId,
            productName: item.productName,
            type: 'saida',
            quantity: item.quantity,
            unitPrice: item.price,
            totalValue: item.subtotal,
            createdAt: sale.createdAt,
            reason: `Venda #${sale.id.substring(0, 8).toUpperCase()}`
          });
        });
      });
      
      // Adicionar movimentos de entrada (simulados a partir do estoque atual)
      // Em um sistema real, isso viria de um registro de compras/entradas
      productsData.forEach((product) => {
        if (product.quantity > 0) {
          stockMovements.push({
            id: `entry-${product.id}`,
            productId: product.id,
            productName: product.name,
            type: 'entrada',
            quantity: product.quantity,
            unitPrice: product.price * 0.7, // Preço de compra simulado (70% do preço de venda)
            totalValue: product.quantity * product.price * 0.7,
            createdAt: product.createdAt,
            reason: 'Estoque inicial'
          });
        }
      });
      
      // Ordenar por data (mais recente primeiro)
      stockMovements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setMovements(stockMovements);
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
      toast.error('Erro ao carregar dados do relatório');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const exportToCSV = () => {
    const headers = ['Data', 'Produto', 'Tipo', 'Quantidade', 'Preço Unit.', 'Valor Total', 'Motivo'];
    const csvContent = [
      headers.join(','),
      ...movements.map(movement => [
        new Date(movement.createdAt).toLocaleString('pt-BR'),
        `"${movement.productName}"`,
        movement.type === 'entrada' ? 'Entrada' : 'Saída',
        movement.quantity,
        movement.unitPrice.toFixed(2),
        movement.totalValue.toFixed(2),
        `"${movement.reason}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-movimentos-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Relatório exportado com sucesso!');
  };

  const columns: GridColDef[] = [
    {
      field: 'createdAt',
      headerName: 'Data/Hora',
      width: 180,
      valueFormatter: (params: any) => new Date(params.value as string).toLocaleString('pt-BR'),
    },
    {
      field: 'productName',
      headerName: 'Produto',
      width: 250,
      flex: 1,
    },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={params.value === 'entrada' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          label={params.value === 'entrada' ? 'Entrada' : 'Saída'}
          color={params.value === 'entrada' ? 'success' : 'error'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'quantity',
      headerName: 'Quantidade',
      width: 120,
      type: 'number',
      valueFormatter: (params: any) => params.value.toLocaleString('pt-BR'),
    },
    {
      field: 'unitPrice',
      headerName: 'Preço Unit.',
      width: 130,
      type: 'number',
      valueFormatter: (params: any) => `R$ ${params.value.toFixed(2)}`,
    },
    {
      field: 'totalValue',
      headerName: 'Valor Total',
      width: 140,
      type: 'number',
      valueFormatter: (params: any) => `R$ ${params.value.toFixed(2)}`,
    },
    {
      field: 'reason',
      headerName: 'Motivo',
      width: 200,
      flex: 0.5,
    },
  ];

  const totalEntradas = movements
    .filter(m => m.type === 'entrada')
    .reduce((sum, m) => sum + m.totalValue, 0);

  const totalSaidas = movements
    .filter(m => m.type === 'saida')
    .reduce((sum, m) => sum + m.totalValue, 0);

  const saldo = totalEntradas - totalSaidas;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatório de Movimentação</h2>
          <p className="text-sm text-gray-600 mt-1">
            Controle de entrada e saída de itens do estoque
          </p>
        </div>
        <div className="flex gap-2">
          <IconButton onClick={loadData} color="primary" title="Atualizar">
            <RotateCcw size={20} />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Download size={18} />}
            onClick={exportToCSV}
            disabled={loading || movements.length === 0}
          >
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Resumo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <TrendingUp className="text-green-600" size={24} />
              <div>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  Total Entradas
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  R$ {totalEntradas.toFixed(2)}
                </Typography>
              </div>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <TrendingDown className="text-red-600" size={24} />
              <div>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  Total Saídas
                </Typography>
                <Typography variant="h5" color="error.main" fontWeight="bold">
                  R$ {totalSaidas.toFixed(2)}
                </Typography>
              </div>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <div className={`p-2 rounded-lg ${saldo >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <TrendingUp className={saldo >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
              </div>
              <div>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  Saldo
                </Typography>
                <Typography 
                  variant="h5" 
                  color={saldo >= 0 ? 'success.main' : 'error.main'} 
                  fontWeight="bold"
                >
                  R$ {saldo.toFixed(2)}
                </Typography>
              </div>
            </Box>
          </CardContent>
        </Card>
      </div>

      {/* DataGrid */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={movements}
              columns={columns}
              loading={loading}
              getRowId={(row) => row.id}
              slots={{
                toolbar: GridToolbar,
              }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              sx={{
                '& .MuiDataGrid-root': {
                  border: 'none',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f5f5f5',
                  borderBottom: '2px solid #e0e0e0',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f9f9f9',
                },
              }}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 25,
                  },
                },
                sorting: {
                  sortModel: [{ field: 'createdAt', sort: 'desc' }],
                },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
            />
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportGrid;
