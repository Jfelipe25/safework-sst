export const CHECKLIST = [
  {
    id: "planeacion",
    title: "1. Planificación del SG-SST",
    icon: "📌",
    color: "#3B82F6",
    items: [
      { id: "p1", text: "La empresa cuenta con una política de SST documentada, firmada por la alta dirección y comunicada a todos los trabajadores.", pts: 2.5 },
      { id: "p2", text: "Existe una asignación y comunicación de responsabilidades en SST para todos los niveles de la organización.", pts: 2.5 },
      { id: "p3", text: "La empresa ha realizado la identificación, evaluación y valoración de riesgos (Matriz GTC-45) actualizada.", pts: 4 },
      { id: "p4", text: "Existe un plan anual de trabajo de SST con objetivos, metas, actividades y responsables.", pts: 3 },
      { id: "p5", text: "Se han definido los recursos financieros para la implementación del SG-SST.", pts: 2 },
      { id: "p6", text: "El personal que diseña el SG-SST cuenta con la formación en SST de 50 horas requerida.", pts: 2.5 },
      { id: "p7", text: "Existe una normativa legal vigente en materia de SST identificada y aplicada a la empresa.", pts: 2 },
      { id: "p8", text: "La empresa tiene definido su nivel de riesgo y ha informado a la ARL correspondiente.", pts: 1.5 },
    ],
  },
  {
    id: "implementacion",
    title: "2. Implementación y Operación",
    icon: "⚙️",
    color: "#10B981",
    items: [
      { id: "i1", text: "Existe un programa de capacitación en SST que incluye la inducción, re-inducción y formación continua.", pts: 3 },
      { id: "i2", text: "Está conformado y en funcionamiento el COPASST (10+ trabajadores) o Vigía SST (menos de 10 trabajadores).", pts: 3.5 },
      { id: "i3", text: "Existe un Comité de Convivencia Laboral legalmente constituido y activo.", pts: 2.5 },
      { id: "i4", text: "Se cuenta con un programa de mantenimiento preventivo de equipos, instalaciones y herramientas.", pts: 2 },
      { id: "i5", text: "La empresa tiene procedimientos de trabajo seguro para actividades de alto riesgo identificadas.", pts: 3 },
      { id: "i6", text: "Los trabajadores cuentan con los elementos de protección personal (EPP) adecuados a los riesgos de su cargo.", pts: 2.5 },
      { id: "i7", text: "Se realizan exámenes médicos ocupacionales de ingreso, periódicos y de retiro para los trabajadores.", pts: 3 },
      { id: "i8", text: "Existe un plan de emergencias y se han realizado simulacros en el último año.", pts: 2.5 },
      { id: "i9", text: "La empresa tiene señalización de seguridad y demarcación de áreas en todas sus instalaciones.", pts: 1.5 },
      { id: "i10", text: "Se aplican mecanismos de control de riesgos: eliminación, sustitución, controles de ingeniería y administrativos.", pts: 2.5 },
    ],
  },
  {
    id: "verificacion",
    title: "3. Verificación y Seguimiento",
    icon: "✔️",
    color: "#F59E0B",
    items: [
      { id: "v1", text: "La empresa realiza inspecciones periódicas de las condiciones de trabajo y del ambiente laboral.", pts: 2.5 },
      { id: "v2", text: "Se tiene un sistema de reporte e investigación de accidentes e incidentes de trabajo.", pts: 3.5 },
      { id: "v3", text: "Los accidentes de trabajo son reportados a la ARL dentro de los dos días hábiles establecidos por ley.", pts: 3 },
      { id: "v4", text: "Se realizan mediciones ambientales (ruido, iluminación, temperatura, etc.) cuando aplica.", pts: 2 },
      { id: "v5", text: "Existen indicadores de SST (frecuencia, severidad, mortalidad) que son monitoreados periódicamente.", pts: 2.5 },
      { id: "v6", text: "Se realizan auditorías internas del SG-SST al menos una vez al año.", pts: 3 },
      { id: "v7", text: "La alta dirección revisa el SG-SST anualmente con base en los resultados e indicadores.", pts: 2.5 },
    ],
  },
  {
    id: "mejora",
    title: "4. Mejoramiento Continuo",
    icon: "🔄",
    color: "#EF4444",
    items: [
      { id: "m1", text: "Existen planes de acción para las no conformidades identificadas en auditorías e inspecciones.", pts: 3 },
      { id: "m2", text: "Las acciones correctivas implementadas son verificadas en su cumplimiento y efectividad.", pts: 2.5 },
      { id: "m3", text: "El SG-SST es actualizado cuando hay cambios en procesos, equipos, instalaciones o normativa legal.", pts: 2.5 },
      { id: "m4", text: "Se documentan y conservan las lecciones aprendidas de accidentes e incidentes ocurridos.", pts: 2 },
      { id: "m5", text: "Los trabajadores participan activamente en la identificación de peligros y propuesta de mejoras.", pts: 2 },
    ],
  },
  {
    id: "gestion",
    title: "5. Gestión del Riesgo y Contratistas",
    icon: "🤝",
    color: "#8B5CF6",
    items: [
      { id: "g1", text: "Se realizan acciones de promoción de la salud y prevención de enfermedades laborales.", pts: 2.5 },
      { id: "g2", text: "La empresa tiene programas de vigilancia epidemiológica para los riesgos prioritarios.", pts: 2.5 },
      { id: "g3", text: "Se gestionan los requisitos de SST con proveedores y contratistas (verificación de afiliaciones, EPP, etc.).", pts: 3 },
      { id: "g4", text: "Los trabajadores en misión o en actividades de alto riesgo cuentan con protección específica adicional.", pts: 2 },
      { id: "g5", text: "Existe un control de cambios que evalúa el impacto en SST antes de implementar modificaciones.", pts: 2 },
    ],
  },
  {
    id: "vigilancia",
    title: "6. Medicina del Trabajo y Vigilancia",
    icon: "🏥",
    color: "#14B8A6",
    items: [
      { id: "vl1", text: "Los diagnósticos de salud de los trabajadores están actualizados y se usan para tomar decisiones preventivas.", pts: 2.5 },
      { id: "vl2", text: "Se realizan actividades de pausas activas y ergonomía para los trabajadores con riesgos biomecánicos.", pts: 2 },
      { id: "vl3", text: "Existe un programa de prevención del riesgo psicosocial (estrés, acoso laboral, carga mental).", pts: 2.5 },
      { id: "vl4", text: "Se cuenta con botiquines de primeros auxilios dotados y actualizados en las instalaciones.", pts: 2 },
      { id: "vl5", text: "Se realizan jornadas de salud (vacunación, tamizaje visual, etc.) para los trabajadores.", pts: 2 },
    ],
  },
];

export const CAT_COLORS: Record<string, string> = {
  planeacion: "#3B82F6",
  implementacion: "#10B981",
  verificacion: "#F59E0B",
  mejora: "#EF4444",
  gestion: "#8B5CF6",
  vigilancia: "#06B6D4",
};

export const getCatTotalPts = (catId: string) => {
  const cat = CHECKLIST.find((c) => c.id === catId);
  return cat ? cat.items.reduce((s, i) => s + i.pts, 0) : 0;
};
