import React, { useState } from 'react';
import { X, MessageSquare, Sparkles, Copy, Check, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { aiService } from '../services/aiService';

interface WhatsAppGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsAppGenerator({ isOpen, onClose }: WhatsAppGeneratorProps) {
  const [goal, setGoal] = useState('');
  const [tone, setTone] = useState<'formal' | 'amigável'>('amigável');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!goal || !context) return;
    setLoading(true);
    try {
      const result = await aiService.generateWhatsAppMessages({ goal, tone, context });
      setVariations(result);
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar mensagens. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
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
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white">
              <div className="flex items-center gap-2">
                <MessageSquare size={20} />
                <h3 className="text-xl font-bold">Gerador de Mensagens WhatsApp</h3>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Objetivo da Mensagem</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Ex: Lembrete de aula, Promoção, Boas-vindas"
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tom de Voz</label>
                  <div className="flex gap-2">
                    {(['amigável', 'formal'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                          tone === t 
                            ? 'bg-emerald-600 text-white shadow-md' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contexto / Detalhes</label>
                  <textarea 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-24 resize-none"
                    placeholder="Ex: Aluno faltou 2 vezes, aula amanhã às 10h, novo plano trimestral disponível"
                    value={context}
                    onChange={e => setContext(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={loading || !goal || !context}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Gerar Variações com IA
                    </>
                  )}
                </button>
              </div>

              {variations.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Sparkles size={14} className="text-emerald-500" />
                    Variações Sugeridas:
                  </h4>
                  {variations.map((v, i) => (
                    <div key={i} className="group relative bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all">
                      <p className="text-sm text-slate-600 pr-8">{v}</p>
                      <button 
                        onClick={() => copyToClipboard(v, i)}
                        className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        {copiedIndex === i ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
