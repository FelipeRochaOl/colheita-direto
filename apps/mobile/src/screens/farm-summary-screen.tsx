import { useFarmSummary } from '@colheita/api-client';
import { ActivityIndicator, Text, View } from 'react-native';
import { Card } from '../components/card';
import { PrimaryButton } from '../components/primary-button';
import { ScreenContainer } from '../components/screen-container';
import { apiClient } from '../app/api-client';
import { capitalize, formatMoney } from '../utils/format';

export function FarmSummaryScreen() {
  const { data: summary, isLoading } = useFarmSummary();

  return (
    <ScreenContainer title="Gestão">
      {isLoading && <ActivityIndicator />}
      {summary && (
        <>
          <View className="flex-row gap-2">
            {[
              { label: 'Receitas', value: summary.revenue },
              { label: 'Despesas', value: summary.expenses },
              { label: 'Lucro', value: summary.profit },
            ].map((item) => (
              <View key={item.label} className="flex-1 rounded-md bg-teal-dark p-3">
                <Text className="text-sm text-muted">{item.label}</Text>
                <Text className="text-base font-semibold text-brand">{formatMoney(item.value)}</Text>
              </View>
            ))}
          </View>
          <Card>
            <Text className="font-semibold text-evergreen">Estoque</Text>
            {summary.stock.length === 0 && <Text className="text-border-active">Sem estoque.</Text>}
            {summary.stock.map((item) => (
              <Text key={item.crop} className="text-base text-evergreen">
                {capitalize(item.crop)}: {item.boxesAvailable} cx disponíveis
                {item.boxesAwaitingClassification ? ` · ${item.boxesAwaitingClassification} em classificação` : ''}
              </Text>
            ))}
          </Card>
          <Text className="text-border-active">
            Dica: anote despesas por áudio no WhatsApp, por exemplo "gastei 200 reais de adubo".
          </Text>
        </>
      )}
      <PrimaryButton title="Sair" variant="ghost" onPress={() => void apiClient.logout()} />
    </ScreenContainer>
  );
}
