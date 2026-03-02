import { supabase } from '../lib/supabase';
import { Aluno } from '../types/database';

export const studentService = {
  async getStudents() {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Aluno[];
  },

  async getStudentById(id: string) {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Aluno;
  },

  async createStudent(student: Omit<Aluno, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('alunos')
      .insert([student])
      .select()
      .single();

    if (error) throw error;
    return data as Aluno;
  },

  async updateStudent(id: string, updates: Partial<Aluno>) {
    const { data, error } = await supabase
      .from('alunos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Aluno;
  },

  async deleteStudent(id: string) {
    const { error } = await supabase
      .from('alunos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
