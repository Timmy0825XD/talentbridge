export const TAX_BENEFITS_INFO = {
  title: 'Beneficios tributarios por contratar jóvenes en Colombia',
  sections: [
    {
      id: 'art-108-5',
      name: 'Artículo 108-5 E.T.',
      summary:
        'Deducción del 25% del valor pagado por salarios a jóvenes entre 18 y 28 años en primer empleo formal, ' +
        'sujeto a requisitos de la norma y límites de deducibilidad.',
    },
    {
      id: 'ley-2466-2025',
      name: 'Ley 2466 de 2025',
      summary:
        'Marco reciente de incentivos para formalización del empleo juvenil. Consulte el texto oficial ' +
        'y su reglamentación para vigencia y condiciones aplicables.',
    },
    {
      id: 'art-114-1',
      name: 'Artículo 114-1 E.T.',
      summary:
        'Beneficios asociados a la contratación de personal calificado y programas de formación, ' +
        'con topes y condiciones definidas en el Estatuto Tributario.',
    },
  ],
  disclaimer:
    'Esta información es orientativa y no reemplaza asesoría contable o legal. ' +
    'Los montos simulados son aproximaciones educativas basadas en supuestos simplificados.',
};

export interface TaxSimulationInput {
  monthlySalary: number;
  hireAge?: number;
}

export interface TaxSimulationResult {
  monthlySalary: number;
  estimatedAnnualSaving: number;
  estimatedMonthlySaving: number;
  breakdown: {
    deductionRate: number;
    annualDeductionBase: number;
    assumedTaxBenefitRate: number;
  };
  disclaimer: string;
}

export function simulateTaxBenefits(input: TaxSimulationInput): TaxSimulationResult {
  const monthlySalary = Math.max(0, input.monthlySalary);
  const hireAge = input.hireAge ?? 25;

  const deductionRate = hireAge >= 18 && hireAge <= 28 ? 0.25 : 0.10;
  const annualSalary = monthlySalary * 12;
  const annualDeductionBase = Math.round(annualSalary * deductionRate);
  const assumedTaxBenefitRate = 0.35;
  const estimatedAnnualSaving = Math.round(annualDeductionBase * assumedTaxBenefitRate);
  const estimatedMonthlySaving = Math.round(estimatedAnnualSaving / 12);

  return {
    monthlySalary,
    estimatedAnnualSaving,
    estimatedMonthlySaving,
    breakdown: {
      deductionRate,
      annualDeductionBase,
      assumedTaxBenefitRate,
    },
    disclaimer: TAX_BENEFITS_INFO.disclaimer,
  };
}
