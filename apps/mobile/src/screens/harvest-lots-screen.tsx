import { useConfirmLotDestination, useHarvestLots } from '@colheita/api-client';
import type { HarvestLot, LotDestination, QualityGrade } from '@colheita/contracts';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/card';
import { ErrorText } from '../components/error-text';
import { PrimaryButton } from '../components/primary-button';
import { QualityGradeBadge } from '../components/quality-grade-badge';
import { capitalize, formatMoney } from '../utils/format';
import type { ProducerStackParamList } from '../app/navigation';

const DESTINATION_LABELS: Record<LotDestination, string> = {
  MARKETPLACE: 'Vender (preço cheio)',
  DISCOUNT_MARKETPLACE: 'Vender com desconto',
  AUCTION: 'Leilão',
  INDUSTRY: 'Vender para indústria',
  DONATION: 'Doar',
  ANIMAL_FEED: 'Ração animal (vegetal)',
  COMPOST: 'Compostagem',
};
const ALLOWED_DESTINATIONS: Record<QualityGrade, LotDestination[]> = {
  A: ['MARKETPLACE', 'DISCOUNT_MARKETPLACE', 'INDUSTRY', 'DONATION'],
  B: ['DISCOUNT_MARKETPLACE', 'MARKETPLACE', 'INDUSTRY', 'DONATION'],
  C: ['INDUSTRY', 'DONATION', 'ANIMAL_FEED', 'COMPOST'],
  D: ['DONATION', 'ANIMAL_FEED', 'COMPOST'],
};

function HarvestLotItem({ harvestLot }: { harvestLot: HarvestLot }) {
  const confirmLotDestination = useConfirmLotDestination();
  const grade = harvestLot.classification?.grade;
  const isAwaitingDecision = harvestLot.status === 'CLASSIFIED' || harvestLot.status === 'NEEDS_REVIEW';

  return (
    <Card>
      <View className="flex-row items-center gap-3">
        <Image source={{ uri: harvestLot.photoUrls[0] }} className="h-16 w-16 rounded-sm" accessibilityLabel="Foto do lote" />
        <View className="flex-1">
          <Text className="text-lg font-semibold text-evergreen">
            {harvestLot.quantityBoxes} cx de {capitalize(harvestLot.crop)}
          </Text>
          {harvestLot.suggestedPricePerBox !== null && (
            <Text className="text-base text-evergreen">Sugerido: {formatMoney(harvestLot.suggestedPricePerBox)} / cx</Text>
          )}
          {harvestLot.status === 'PENDING_CLASSIFICATION' && <Text className="text-border-active">Classificando…</Text>}
        </View>
        {grade ? <QualityGradeBadge grade={grade} /> : <ActivityIndicator />}
      </View>
      {harvestLot.classification?.defects.length ? (
        <Text className="text-border-active">Defeitos: {harvestLot.classification.defects.join(', ')}</Text>
      ) : null}
      {isAwaitingDecision && grade && (
        <View className="gap-2">
          <Text className="font-semibold text-evergreen">Para onde vai este lote?</Text>
          {ALLOWED_DESTINATIONS[grade].map((destination) => (
            <PrimaryButton
              key={destination}
              title={`${DESTINATION_LABELS[destination]}${destination === harvestLot.destination ? ' (sugerido)' : ''}`}
              variant={destination === harvestLot.destination ? 'primary' : 'ghost'}
              loading={confirmLotDestination.isPending && confirmLotDestination.variables?.destination === destination}
              onPress={() => confirmLotDestination.mutate({ harvestLotId: harvestLot.id, destination })}
            />
          ))}
          <ErrorText error={confirmLotDestination.error} />
        </View>
      )}
      {!isAwaitingDecision && harvestLot.destination && (
        <Text className="text-green-dark">Destino: {DESTINATION_LABELS[harvestLot.destination]}</Text>
      )}
    </Card>
  );
}

export function HarvestLotsScreen() {
  const { data: harvestLots, isLoading, isRefetching, refetch } = useHarvestLots();
  const navigation = useNavigation<NativeStackNavigationProp<ProducerStackParamList>>();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ScrollView
        contentContainerClassName="gap-4 p-4"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
      >
        <Text className="text-2xl font-semibold text-evergreen">Minhas colheitas</Text>
        <PrimaryButton title="+ Fotografar colheita" onPress={() => navigation.navigate('NewHarvestLot')} />
        {isLoading && <ActivityIndicator />}
        {harvestLots?.length === 0 && <Text className="text-border-active">Fotografe sua primeira colheita.</Text>}
        {harvestLots?.map((harvestLot) => <HarvestLotItem key={harvestLot.id} harvestLot={harvestLot} />)}
      </ScrollView>
    </SafeAreaView>
  );
}
