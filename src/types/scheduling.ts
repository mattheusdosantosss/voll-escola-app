export type AppointmentStatus = 'agendado' | 'cancelado' | 'concluido';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  plan: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  aluno_id: string;
  data_aula: string; // YYYY-MM-DD
  horario_inicio: string; // HH:mm
  horario_fim: string; // HH:mm
  observacoes?: string;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  student?: Student;
}

export interface AppointmentFilters {
  aluno_id?: string;
  data_inicio?: string;
  data_fim?: string;
  status?: AppointmentStatus;
}

export interface CreateAppointmentDTO {
  aluno_id: string;
  data_aula: string;
  horario_inicio: string;
  horario_fim: string;
  observacoes?: string;
  status?: AppointmentStatus;
}
