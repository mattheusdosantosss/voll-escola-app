export type AppointmentStatus = 'agendado' | 'cancelado' | 'concluido';
export type FinancialType = 'receita' | 'despesa';
export type FinancialStatus = 'pago' | 'pendente' | 'atrasado';

export interface Aluno {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Agendamento {
  id: string;
  student_id: string;
  date_class: string; // YYYY-MM-DD
  hour_start: string; // HH:mm
  hour_end: string; // HH:mm
  description?: string;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  aluno?: Aluno;
}

export interface LancamentoFinanceiro {
  id: string;
  description: string;
  value: number;
  maturity: string;
  payment_date?: string;
  type: FinancialType;
  status: FinancialStatus;
  student_id?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  aluno?: Aluno;
}

export interface AppointmentFilters {
  student_id?: string;
  data_inicio?: string;
  data_fim?: string;
  status?: AppointmentStatus;
}

export interface FinancialFilters {
  type?: FinancialType;
  status?: FinancialStatus;
  data_inicio?: string;
  data_fim?: string;
}

export interface CreateAgendamentoDTO {
  student_id: string;
  date_class: string;
  hour_start: string;
  hour_end: string;
  description?: string;
  status?: AppointmentStatus;
}

export interface CreateLancamentoDTO {
  description: string;
  value: number;
  maturity: string;
  payment_date?: string;
  type: FinancialType;
  status: FinancialStatus;
  student_id?: string;
}
