import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateSumaAlzadaContract = (projectName: any, costData: any, materials: any[]) => {
  try {
    const doc = new jsPDF();
    const primaryColor = [212, 175, 55]; // Gold #D4AF37

    doc.setFillColor(15, 17, 21);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("CONTRATO DE CONSTRUCCIÓN A SUMA ALZADA", 105, 15, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("I. COMPARECIENTES", 15, 40);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Por una parte, como EL MANDANTE: ________________________________________________,", 15, 50);
    doc.text("RUT: _______________, domiciliado en ____________________________________________.", 15, 57);
    doc.text("Y por otra parte, como EL CONTRATISTA: _________________________________________,", 15, 67);
    doc.text("RUT: _______________, domiciliado en ____________________________________________.", 15, 74);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("II. OBJETO DEL CONTRATO", 15, 90);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const formattedTotal = Math.round(costData.total * 1.19).toLocaleString('es-CL');
    doc.text(`El CONTRATISTA se obliga a ejecutar la obra denominada "${projectName || 'Obra Nueva'}",`, 15, 100);
    doc.text(`ubicada en ______________________________________________________________________,`, 15, 107);
    doc.text(`por el precio total y fijo a Suma Alzada de $${formattedTotal} CLP (IVA Incluido).`, 15, 114);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("III. ANEXO TÉCNICO (PRESUPUESTO APROBADO)", 15, 130);

    autoTable(doc, {
      startY: 135,
      head: [['Ítem', 'Descripción', 'Cant.', 'Total']],
      body: materials.slice(0, 15).map((m, i) => [ // Max 15 items for space
        `1.${i+1}`, 
        m.nombre, 
        `${m.cantidad.toFixed(2)} ${m.unidad}`, 
        `$${Math.round(m.costo).toLocaleString('es-CL')}`
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 17, 21], textColor: [255, 255, 255] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("IV. CONDICIONES DE PAGO Y PLAZOS", 15, finalY);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("1. Anticipo: 30% contra firma de este contrato.", 15, finalY + 10);
    doc.text("2. Estado de Pago: 60% según avance físico.", 15, finalY + 17);
    doc.text("3. Retención: 10% a 30 días de la recepción final.", 15, finalY + 24);
    doc.text("4. Plazo de Ejecución: _____ días corridos.", 15, finalY + 31);

    // Firmas
    doc.setFont("helvetica", "bold");
    doc.text("__________________________", 40, finalY + 60, { align: "center" });
    doc.text("EL MANDANTE", 40, finalY + 65, { align: "center" });

    doc.text("__________________________", 170, finalY + 60, { align: "center" });
    doc.text("EL CONTRATISTA", 170, finalY + 65, { align: "center" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(`Contrato autogenerado por ObraGo Elite AEC el ${new Date().toLocaleDateString()}`, 105, 285, { align: "center" });

    doc.save(`Contrato_SumaAlzada_${projectName || 'Obra'}.pdf`);
  } catch (error) {
    console.error("Contract PDF Fail:", error);
    alert("Error al generar el contrato.");
  }
};
