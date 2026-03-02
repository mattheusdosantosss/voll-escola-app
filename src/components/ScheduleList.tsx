import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Edit2, 
  XCircle, 
  AlertCircle,
  Search,
  CheckCircle2,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { schedulingService } from '../services/schedulingService';
import { studentService } from '../services/studentService';
import { Agendamento, AppointmentFilters, AppointmentStatus, Aluno } from '../types/database';

interface ScheduleListProps {
  onEdit: (appointment: Agendamento) => void;
  refreshKey: number;
}

export default function ScheduleList({ onEdit, refreshKey }: ScheduleListProps) {
  const [appointments, setAppointments] = useState<Agendamento[]>([]);
  const [students, setStudents] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [filters, setFilters] = useState<AppointmentFilters>({
    aluno_id: '',
    data_inicio: '',
    data_fim: '',
    status: undefined
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [filters, page, refreshKey]);

  const fetchStudents = async () => {
    try {
      const data = await studentService.getStudents();
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, count } = await schedulingService.getAppointments(filters, page, pageSize);
      setAppointments(data);
      setTotalCount(count || 0);
    } catch (err: any) {
      setError('Erro ao carregar agendamentos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;
    try {
      await schedulingService.cancelAppointment(id);
      fetchAppointments();
    } catch (err) {
      alert('Erro ao cancelar agendamento.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir permanentemente este agendamento?')) return;
    try {
      await schedulingService.deleteAppointment(id);
      fetchAppointments();
    } catch (err) {
      alert('Erro ao excluir agendamento.');
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const getStatusStyle = (status: AppointmentStatus) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-700';
      case 'cancelado': return 'bg-red-100 text-red-700';
      case 'concluido': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
          <Filter size={18} />
          <span>Filtros</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aluno</label>
            <select 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={filters.aluno_id || ''}
              onChange={e => setFilters({...filters, aluno_id: e.target.value})}
            >
              <option value="">Todos os alunos</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data Início</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={filters.data_inicio || ''}
              onChange={e => setFilters({...filters, data_inicio: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data Fim</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={filters.data_fim || ''}
              onChange={e => setFilters({...filters, data_fim: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
            <select 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={filters.status || ''}
              onChange={e => setFilters({...filters, status: (e.target.value || undefined) as AppointmentStatus})}
            >
              <option value="">Todos os status</option>
              <option value="agendado">Agendado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Data e Hora</th>
                <th className="px-6 py-4 font-semibold">Aluno</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Observações</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>Carregando agendamentos...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-red-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={24} />
                      <span>{error}</span>
                    </div>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Nenhum agendamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">
                          {new Date(apt.data_aula + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={12} /> {apt.horario_inicio.slice(0, 5)} - {apt.horario_fim.slice(0, 5)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          {apt.aluno?.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{apt.aluno?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-500 max-w-xs truncate" title={apt.observacoes}>
                        {apt.observacoes || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onEdit(apt)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        {apt.status !== 'cancelado' && (
                          <button 
                            onClick={() => handleCancel(apt.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Cancelar"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(apt.id)}
                          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                          title="Excluir"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Mostrando {appointments.length} de {totalCount} agendamentos
            </span>
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-bold text-slate-700">{page} / {totalPages}</span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
