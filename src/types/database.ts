export type AppointmentStatus = 'agendado' | 'cancelado' | 'concluido';
export type FinancialType = 'receita' | 'despesa';
export type FinancialStatus = 'pago' | 'pendente' | 'atrasado';

export interface Aluno {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  plan: string;
  created_at: string;
}

export interface Agendamento {
  id: string;
  aluno_id: string;
  data_aula: string; // YYYY-MM-DD
  horario_inicio: string; // HH:mm
  horario_fim: string; // HH:mm
  observacoes?: string;
  descricao_aula?: string;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  aluno?: Aluno;
}

export interface LancamentoFinanceiro {
  id: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  tipo: FinancialType;
  status: FinancialStatus;
  categoria?: string;
  aluno_id?: string;
  created_at: string;
  // Joined data
  aluno?: Aluno;
}

export interface AppointmentFilters {
  aluno_id?: string;
  data_inicio?: string;
  data_fim?: string;
  status?: AppointmentStatus;
}

export interface FinancialFilters {
  tipo?: FinancialType;
  status?: FinancialStatus;
  data_inicio?: string;
  data_fim?: string;
}

export interface CreateAgendamentoDTO {
  aluno_id: string;
  data_aula: string;
  horario_inicio: string;
  horario_fim: string;
  observacoes?: string;
  descricao_aula?: string;
  status?: AppointmentStatus;
}

export interface CreateLancamentoDTO {
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  tipo: FinancialType;
  status: FinancialStatus;
  categoria?: string;
  aluno_id?: string;
}
