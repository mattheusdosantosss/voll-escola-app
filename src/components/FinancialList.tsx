import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Filter, 
  Search, 
  MoreVertical, 
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Edit2
} from 'lucide-react';
import { financialService } from '../services/financialService';
import { LancamentoFinanceiro, FinancialFilters, FinancialType, FinancialStatus } from '../types/database';
import FinancialModal from './FinancialModal';

export default function FinancialList() {
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ totalAReceber: 0, totalAPagar: 0, totalPendente: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState<LancamentoFinanceiro | null>(null);
  const [filters, setFilters] = useState<FinancialFilters>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchData();
  }, [filters, refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await financialService.getLancamentos(filters);
      const totalsData = await financialService.getTotals();
      setLancamentos(data);
      setTotals(totalsData);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      try {
        await financialService.deleteLancamento(id);
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error('Error deleting lancamento:', error);
      }
    }
  };

  const handleEdit = (lancamento: LancamentoFinanceiro) => {
    setEditingLancamento(lancamento);
    setIsModalOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Recebido</p>
          <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totals.totalAReceber)}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
              <TrendingDown size={20} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total a Pagar</p>
          <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totals.totalAPagar)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Pendente (Receitas)</p>
          <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totals.totalPendente)}</h3>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex gap-2">
          <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
            value={filters.type || ''}
            onChange={(e) => setFilters({...filters, type: e.target.value as FinancialType || undefined})}
          >
            <option value="">Todos os Tipos</option>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
          <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
            value={filters.status || ''}
            onChange={(e) => setFilters({...filters, status: e.target.value as FinancialStatus || undefined})}
          >
            <option value="">Todos os Status</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="atrasado">Atrasado</option>
          </select>
        </div>
        
        <button 
          onClick={() => {
            setEditingLancamento(null);
            setIsModalOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Novo Lançamento
        </button>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Descrição</th>
                <th className="px-6 py-4 font-semibold">Tipo</th>
                <th className="px-6 py-4 font-semibold">Valor</th>
                <th className="px-6 py-4 font-semibold">Vencimento</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Carregando lançamentos...</td>
                </tr>
              ) : lancamentos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Nenhum lançamento encontrado.</td>
                </tr>
              ) : (
                lancamentos.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-800">{item.description}</p>
                        {item.aluno && <p className="text-xs text-slate-500">Aluno: {item.aluno.name}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.type === 'receita' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.type === 'receita' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {item.type === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {formatCurrency(item.value)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(item.maturity).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : 
                        item.status === 'atrasado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FinancialModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          setRefreshKey(prev => prev + 1);
        }}
        editingLancamento={editingLancamento}
      />
    </div>
  );
}
