import { supabase } from '../lib/supabase';
import { LancamentoFinanceiro, FinancialFilters, CreateLancamentoDTO } from '../types/database';

export const financialService = {
  async getLancamentos(filters: FinancialFilters, page: number = 1, pageSize: number = 10) {
    let query = supabase
      .from('financeiro')
      .select('*, aluno:alunos(*)', { count: 'exact' });

    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.data_inicio) {
      query = query.gte('maturity', filters.data_inicio);
    }
    if (filters.data_fim) {
      query = query.lte('maturity', filters.data_fim);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order('maturity', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data: data as LancamentoFinanceiro[], count };
  },

  async getTotals() {
    const { data, error } = await supabase
      .from('financeiro')
      .select('type, value, status');

    if (error) throw error;

    const totals = {
      totalAReceber: 0,
      totalAPagar: 0,
      totalPendente: 0,
    };

    data.forEach((item) => {
      if (item.type === 'receita') {
        if (item.status === 'pago') {
          totals.totalAReceber += item.value;
        } else {
          totals.totalPendente += item.value;
        }
      } else if (item.type === 'despesa') {
        totals.totalAPagar += item.value;
      }
    });

    return totals;
  },

  async createLancamento(lancamento: CreateLancamentoDTO) {
    const { data, error } = await supabase
      .from('financeiro')
      .insert([lancamento])
      .select('*, aluno:alunos(*)')
      .single();

    if (error) throw error;
    return data as LancamentoFinanceiro;
  },

  async updateLancamento(id: string, updates: Partial<LancamentoFinanceiro>) {
    const { data, error } = await supabase
      .from('financeiro')
      .update(updates)
      .eq('id', id)
      .select('*, aluno:alunos(*)')
      .single();

    if (error) throw error;
    return data as LancamentoFinanceiro;
  },

  async deleteLancamento(id: string) {
    const { error } = await supabase
      .from('financeiro')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
