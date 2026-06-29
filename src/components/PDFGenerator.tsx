


// components/PDFGenerator.tsx
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFData {
  nomProjet: string;
  promoteurNom: string;
  montantSollicite: string;
  dateSoumission: string;
  notes: Record<string, number>;
  commentaires: Record<string, string>;
  decision: string;
  commentaireGlobal: string;
  recommandations: string;
  logoUrl?: string;
}

export const generateRapportPDF = async (data: PDFData) => {
  const doc = new jsPDF();
  
  const primaryColor = '#1e40af';
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;
  
  // ============================================
  // EN-TÊTE
  // ============================================
  
  // Fond de l'en-tête
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Ligne décorative
  doc.setFillColor('#3b82f6');
  doc.rect(0, 35, pageWidth, 3, 'F');
  
  // Logo (si disponible)
  if (data.logoUrl) {
    try {
      const logoUrl: string = data.logoUrl;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Erreur chargement logo'));
        img.src = logoUrl;
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      
      const logoBase64 = canvas.toDataURL('image/png');
      
      const maxLogoHeight = 20;
      const scale = Math.min(1, maxLogoHeight / (img.naturalHeight / 3.78));
      const logoWidth = (img.naturalWidth * scale) / 3.78;
      const logoHeight = (img.naturalHeight * scale) / 3.78;
      
      const logoX = margin;
      const logoY = 5;
      
      doc.setFillColor('#ffffff');
      doc.roundedRect(logoX - 2, logoY - 2, logoWidth + 4, logoHeight + 4, 2, 2, 'F');
      
      doc.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
    } catch (error) {
      console.warn('Logo non chargé:', error);
    }
  }
  
  // Titre dans l'en-tête
  doc.setFontSize(22);
  doc.setTextColor('#ffffff');
  doc.setFont('helvetica', 'bold');
  doc.text('Rapport d\'Analyse Technique', margin + 45, 18);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Fonds de Promotion de l\'Industrie (FPI)', margin + 45, 26);
  
  // Date
  doc.setFontSize(8);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, 26, { align: 'right' });
  
  yPos = 45;
  
  // ============================================
  // SECTION 1 : INFORMATIONS DU PROJET
  // ============================================
  
  doc.setFontSize(14);
  doc.setTextColor('#1e293b');
  doc.setFont('helvetica', 'bold');
  doc.text('1. Informations du Projet', margin, yPos);
  yPos += 10;
  
  // Formater la date correctement
  let dateSoumissionFormatted = 'Non spécifiée';
  if (data.dateSoumission) {
    try {
      const date = new Date(data.dateSoumission);
      if (!isNaN(date.getTime())) {
        dateSoumissionFormatted = date.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (e) {
      dateSoumissionFormatted = data.dateSoumission;
    }
  }
  
  autoTable(doc, {
    startY: yPos,
    body: [
      ['Nom du projet', data.nomProjet || '-'],
      ['Promoteur', data.promoteurNom || '-'],
      ['Montant sollicite', data.montantSollicite || '-'],
      ['Date de soumission', dateSoumissionFormatted],
    ],
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { 
        fontStyle: 'bold', 
        cellWidth: 45, 
        fillColor: '#f1f5f9',
        textColor: '#1e293b',
      },
      1: { 
        cellWidth: 'auto',
        textColor: '#64748b',
      },
    },
    margin: { left: margin },
    tableWidth: contentWidth,
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // ============================================
  // SECTION 2 : GRILLE D'EVALUATION
  // ============================================
  
  if (yPos > 230) {
    doc.addPage();
    yPos = margin;
  }
  
  doc.setFontSize(14);
  doc.setTextColor('#1e293b');
  doc.setFont('helvetica', 'bold');
  doc.text('2. Grille d\'Evaluation', margin, yPos);
  yPos += 10;
  
  const criteres = [
    { key: 'faisabilite', label: 'Faisabilite technique' },
    { key: 'impact', label: 'Impact socio-economique' },
    { key: 'finance', label: 'Viabilite financiere' },
    { key: 'equipe', label: 'Qualite de l\'equipe' },
    { key: 'marche', label: 'Potentiel du marche' },
  ];
  
  const notesData = criteres.map(c => [
    c.label,
    `${data.notes[c.key] || 0}/5`,
    data.commentaires[c.key] || '-',
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Critere', 'Note', 'Commentaire']],
    body: notesData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: '#ffffff',
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: '#334155',
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 'auto' },
    },
    margin: { left: margin },
    tableWidth: contentWidth,
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 12;
  
  // Note globale
  const noteTotale = Object.values(data.notes).reduce((a, b) => a + (b || 0), 0) / criteres.length;
  
  doc.setFillColor('#eff6ff');
  doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, 'F');
  
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`Note Globale: ${noteTotale.toFixed(1)}/5`, pageWidth / 2, yPos + 8, { align: 'center' });
  
  yPos += 22;
  
  // ============================================
  // SECTION 3 : DECISION
  // ============================================
  
  if (yPos > 240) {
    doc.addPage();
    yPos = margin;
  }
  
  doc.setFontSize(14);
  doc.setTextColor('#1e293b');
  doc.setFont('helvetica', 'bold');
  doc.text('3. Decision', margin, yPos);
  yPos += 12;
  
  const decisionLabels: Record<string, string> = {
    favorable: 'FAVORABLE',
    defavorable: 'DEFAVORABLE',
    reserve: 'RESERVE',
  };
  
  const decisionColors: Record<string, string> = {
    favorable: '#059669',
    defavorable: '#dc2626',
    reserve: '#d97706',
  };
  
  const decisionText = decisionLabels[data.decision] || 'RESERVE';
  const decisionColor = decisionColors[data.decision] || '#d97706';
  
  // Badge de decision
  doc.setFillColor(decisionColor);
  doc.setTextColor('#ffffff');
  doc.roundedRect(margin, yPos, 60, 10, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(decisionText, margin + 30, yPos + 7, { align: 'center' });
  yPos += 18;
  
  // Commentaire global
  doc.setFontSize(11);
  doc.setTextColor('#374151');
  doc.setFont('helvetica', 'bold');
  doc.text('Commentaire global:', margin, yPos);
  yPos += 7;
  
  doc.setFontSize(9);
  doc.setTextColor('#64748b');
  doc.setFont('helvetica', 'normal');
  const commentLines = doc.splitTextToSize(data.commentaireGlobal || 'Aucun commentaire', contentWidth);
  doc.text(commentLines, margin, yPos);
  yPos += commentLines.length * 5 + 12;
  
  // Recommandations
  if (data.recommandations) {
    if (yPos > 240) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFontSize(11);
    doc.setTextColor('#374151');
    doc.setFont('helvetica', 'bold');
    doc.text('Recommandations:', margin, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    doc.setTextColor('#64748b');
    doc.setFont('helvetica', 'normal');
    const recoLines = doc.splitTextToSize(data.recommandations, contentWidth);
    doc.text(recoLines, margin, yPos);
  }
  
  // Pied de page
  const pageCount = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setDrawColor('#e2e8f0');
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    doc.setFontSize(7);
    doc.setTextColor('#94a3b8');
    doc.text(
      'Document genere par le systeme FPI - Confidentiel',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    
    doc.text(
      `Page ${i} / ${pageCount}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }
  
  // Sauvegarde
  const safeFileName = data.nomProjet
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
  
  doc.save(`rapport-analyse-${safeFileName}.pdf`);
};