import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, FileText, Tag, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { financialService } from '../services/financialService';
import { studentService } from '../services/studentService';
import { CreateLancamentoDTO, Aluno, LancamentoFinanceiro, FinancialType, FinancialStatus } from '../types/database';

interface FinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingLancamento?: LancamentoFinanceiro | null;
}

export default function FinancialModal({ isOpen, onClose, onSuccess, editingLancamento }: FinancialModalProps) {
  const [students, setStudents] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateLancamentoDTO>({
    description: '',
    value: 0,
    maturity: new Date().toISOString().split('T')[0],
    type: 'receita',
    status: 'pendente',
    student_id: undefined
  });

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
      if (editingLancamento) {
        setFormData({
          description: editingLancamento.description,
          value: editingLancamento.value,
          maturity: editingLancamento.maturity,
          payment_date: editingLancamento.payment_date,
          type: editingLancamento.type,
          status: editingLancamento.status,
          student_id: editingLancamento.student_id || undefined
        });
      } else {
        setFormData({
          description: '',
          value: 0,
          maturity: new Date().toISOString().split('T')[0],
          type: 'receita',
          status: 'pendente',
          student_id: undefined
        });
      }
    }
  }, [isOpen, editingLancamento]);

  const fetchStudents = async () => {
    try {
      const data = await studentService.getStudents();
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingLancamento) {
        await financialService.updateLancamento(editingLancamento.id, formData);
      } else {
        await financialService.createLancamento(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar lançamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {editingLancamento ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <DollarSign size={16} />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      required
                      type="text" 
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Ex: Mensalidade João Silva"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as FinancialType})}
                  >
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="0,00"
                      value={formData.value}
                      onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vencimento</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      required
                      type="date" 
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.maturity}
                      onChange={e => setFormData({...formData, maturity: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as FinancialStatus})}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="atrasado">Atrasado</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aluno (Opcional)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.student_id || ''}
                      onChange={e => setFormData({...formData, student_id: e.target.value || undefined})}
                    >
                      <option value="">Nenhum aluno vinculado</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>{student.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : (
                    <>
                      <DollarSign size={20} />
                      {editingLancamento ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
