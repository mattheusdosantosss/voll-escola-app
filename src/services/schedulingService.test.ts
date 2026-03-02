import { schedulingService } from './schedulingService';
import { supabase } from '../lib/supabase';

/**
 * Exemplos de Testes de Integração/Unitários para Lógica de Agendamento
 * 
 * Nota: Estes testes assumem um ambiente com Supabase configurado.
 * Em um ambiente de CI/CD real, usaríamos mocks para o supabase client.
 */

export const runSchedulingTests = async () => {
  console.group('Iniciando Testes de Agendamento');
  
  const testStudentId = '00000000-0000-0000-0000-000000000000'; // Mock ID
  const testDate = '2026-05-20';

  // Teste 1: Validação de Horário (Fim > Início)
  try {
    console.log('Teste 1: Validar horário_fim <= horário_inicio');
    await schedulingService.createAppointment({
      student_id: testStudentId,
      date_class: testDate,
      hour_start: '10:00',
      hour_end: '09:00',
      status: 'agendado'
    });
    console.error('❌ Teste 1 falhou: Deveria ter lançado erro de validação.');
  } catch (e: any) {
    if (e.message.includes('posterior')) {
      console.log('✅ Teste 1 passou: Erro de validação lançado corretamente.');
    } else {
      console.error('❌ Teste 1 falhou: Erro inesperado:', e.message);
    }
  }

  // Teste 2: Detecção de Conflito de Horário
  // Este teste é conceitual pois depende do banco de dados real
  console.log('Teste 2: Detecção de conflito de horário (Conceitual)');
  const mockExisting = [
    { inicio: '08:00', fim: '09:00' }
  ];
  const newApt = { inicio: '08:30', fim: '09:30' };
  
  const hasOverlap = (s1: string, e1: string, s2: string, e2: string) => (s1 < e2 && e1 > s2);
  
  if (hasOverlap(newApt.inicio, newApt.fim, mockExisting[0].inicio, mockExisting[0].fim)) {
    console.log('✅ Teste 2 passou: Lógica de sobreposição detectou conflito corretamente.');
  } else {
    console.error('❌ Teste 2 falhou: Lógica de sobreposição não detectou conflito.');
  }

  console.groupEnd();
};
