import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { Aluno } from "../types/database";

export const exportService = {
  exportStudentsToCSV(students: Aluno[]) {
    const data = students.map(s => ({
      Nome: s.nome,
      Email: s.email,
      Telefone: s.telefone,
      Status: s.status,
      "Data de Cadastro": new Date(s.created_at).toLocaleDateString('pt-BR')
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `alunos_voll_studio_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportStudentsToPDF(students: Aluno[]) {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Relatório de Alunos - VOLL Studio", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

    const tableData = students.map(s => [
      s.nome,
      s.email,
      s.telefone,
      s.status,
      new Date(s.created_at).toLocaleDateString('pt-BR')
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Nome', 'Email', 'Telefone', 'Status', 'Cadastro']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [5, 150, 105] }, // Emerald-600
    });

    doc.save(`alunos_voll_studio_${new Date().getTime()}.pdf`);
  }
};
