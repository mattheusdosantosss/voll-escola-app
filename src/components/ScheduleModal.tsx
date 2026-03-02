import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, FileText, Sparkles, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { schedulingService } from '../services/schedulingService';
import { studentService } from '../services/studentService';
import { aiService } from '../services/aiService';
import { CreateAgendamentoDTO, Aluno, Agendamento, AppointmentStatus } from '../types/database';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingAppointment?: Agendamento | null;
}

export default function ScheduleModal({ isOpen, onClose, onSuccess, editingAppointment }: ScheduleModalProps) {
  const [students, setStudents] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AI Assistant State
  const [aiParams, setAiParams] = useState({
    level: 'Iniciante',
    goal: 'Fortalecimento de Core',
    duration: '60 min',
    observations: ''
  });

  const [formData, setFormData] = useState<CreateAgendamentoDTO>({
    aluno_id: '',
    data_aula: new Date().toISOString().split('T')[0],
    horario_inicio: '08:00',
    horario_fim: '09:00',
    observacoes: '',
    descricao_aula: '',
    status: 'agendado'
  });

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
      if (editingAppointment) {
        setFormData({
          aluno_id: editingAppointment.aluno_id,
          data_aula: editingAppointment.data_aula,
          horario_inicio: editingAppointment.horario_inicio.slice(0, 5),
          horario_fim: editingAppointment.horario_fim.slice(0, 5),
          observacoes: editingAppointment.observacoes || '',
          descricao_aula: editingAppointment.descricao_aula || '',
          status: editingAppointment.status
        });
      } else {
        setFormData({
          aluno_id: '',
          data_aula: new Date().toISOString().split('T')[0],
          horario_inicio: '08:00',
          horario_fim: '09:00',
          observacoes: '',
          descricao_aula: '',
          status: 'agendado'
        });
      }
    }
  }, [isOpen, editingAppointment]);

  const fetchStudents = async () => {
    try {
      const data = await studentService.getStudents();
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleGenerateAI = async () => {
    const student = students.find(s => s.id === formData.aluno_id);
    if (!student) {
      setError('Selecione um aluno primeiro para usar a IA.');
      return;
    }

    setAiLoading(true);
    setError(null);
    try {
      const description = await aiService.generateLessonDescription({
        studentName: student.name,
        ...aiParams
      });
      setFormData(prev => ({ ...prev, descricao_aula: description }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingAppointment) {
        await schedulingService.updateAppointment(editingAppointment.id, formData);
      } else {
        await schedulingService.createAppointment(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao salvar o agendamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h3 className="text-xl font-bold text-slate-800">
                {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              {/* Form Section */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aluno</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      required
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.aluno_id}
                      onChange={e => setFormData({...formData, aluno_id: e.target.value})}
                    >
                      <option value="">Selecione um aluno</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data da Aula</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required
                        type="date" 
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        value={formData.data_aula}
                        onChange={e => setFormData({...formData, data_aula: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                    <select 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as AppointmentStatus})}
                    >
                      <option value="agendado">Agendado</option>
                      <option value="concluido">Concluído</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Início</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required
                        type="time" 
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        value={formData.horario_inicio}
                        onChange={e => setFormData({...formData, horario_inicio: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fim</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required
                        type="time" 
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        value={formData.horario_fim}
                        onChange={e => setFormData({...formData, horario_fim: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição da Aula (Sugerida por IA)</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-3 text-slate-400" />
                    <textarea 
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-32 resize-none"
                      placeholder="A descrição detalhada da aula aparecerá aqui..."
                      value={formData.descricao_aula}
                      onChange={e => setFormData({...formData, descricao_aula: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Observações Internas</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-3 text-slate-400" />
                    <textarea 
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-20 resize-none"
                      placeholder="Alguma observação importante?"
                      value={formData.observacoes}
                      onChange={e => setFormData({...formData, observacoes: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : editingAppointment ? 'Atualizar Agendamento' : 'Confirmar Agendamento'}
                  </button>
                </div>
              </form>

              {/* AI Assistant Section */}
              <div className="p-6 bg-slate-50/50 space-y-6">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <Brain size={20} />
                  <h4>Assistente IA</h4>
                </div>
                
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Preencha os detalhes abaixo para que a IA gere uma descrição técnica completa para esta aula.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nível do Aluno</label>
                      <select 
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        value={aiParams.level}
                        onChange={e => setAiParams({...aiParams, level: e.target.value})}
                      >
                        <option>Iniciante</option>
                        <option>Intermediário</option>
                        <option>Avançado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Objetivo</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        value={aiParams.goal}
                        onChange={e => setAiParams({...aiParams, goal: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Duração</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        value={aiParams.duration}
                        onChange={e => setAiParams({...aiParams, duration: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Observações IA</label>
                      <textarea 
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-16 resize-none"
                        placeholder="Ex: Focar em alongamento de cadeia posterior"
                        value={aiParams.observations}
                        onChange={e => setAiParams({...aiParams, observations: e.target.value})}
                      />
                    </div>

                    <button 
                      type="button"
                      onClick={handleGenerateAI}
                      disabled={aiLoading || !formData.aluno_id}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {aiLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Sparkles size={14} />
                          Gerar Descrição com IA
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <h5 className="text-[10px] font-bold text-emerald-800 uppercase mb-2">Dica da IA</h5>
                  <p className="text-[11px] text-emerald-700 leading-relaxed italic">
                    "A descrição gerada pela IA foca nos princípios do Pilates: Concentração, Controle, Centralização, Precisão, Respiração e Fluidez."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
