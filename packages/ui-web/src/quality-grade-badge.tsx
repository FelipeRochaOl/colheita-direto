import type { QualityGrade } from '@colheita/contracts';
import { qualityGradeColors } from '@colheita/design-tokens';
import { Tooltip } from 'antd';

const GRADE_DESCRIPTIONS: Record<QualityGrade, string> = {
  A: 'Padrão comercial',
  B: 'Defeito estético leve',
  C: 'Para indústria',
  D: 'Para doação ou reaproveitamento',
};

/** Selo da classe de qualidade (A–D) definida pela visão computacional. */
export function QualityGradeBadge({
  grade,
  size = 'medium',
}: {
  grade: QualityGrade;
  size?: 'medium' | 'large';
}) {
  const dimension = size === 'large' ? 48 : 32;
  return (
    <Tooltip title={GRADE_DESCRIPTIONS[grade]}>
      <span
        aria-label={`Classe ${grade}: ${GRADE_DESCRIPTIONS[grade]}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: dimension,
          height: dimension,
          borderRadius: '50%',
          backgroundColor: qualityGradeColors[grade],
          color: '#FFFFFF',
          fontWeight: 600,
          fontSize: dimension / 2,
        }}
      >
        {grade}
      </span>
    </Tooltip>
  );
}

export function describeQualityGrade(grade: QualityGrade): string {
  return GRADE_DESCRIPTIONS[grade];
}
