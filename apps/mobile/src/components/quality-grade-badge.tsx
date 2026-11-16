import type { QualityGrade } from '@colheita/contracts';
import { qualityGradeColors } from '@colheita/design-tokens';
import { Text, View } from 'react-native';

export function QualityGradeBadge({ grade }: { grade: QualityGrade }) {
  return (
    <View
      accessibilityLabel={`Classe ${grade}`}
      className="h-12 w-12 items-center justify-center rounded-full"
      style={{ backgroundColor: qualityGradeColors[grade] }}
    >
      <Text className="text-xl font-semibold text-white">{grade}</Text>
    </View>
  );
}
