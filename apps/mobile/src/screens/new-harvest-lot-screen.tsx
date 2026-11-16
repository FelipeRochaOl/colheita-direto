import Toast from '@ant-design/react-native/lib/toast';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { PrimaryButton } from '../components/primary-button';
import { ScreenContainer } from '../components/screen-container';
import { TextField } from '../components/text-field';
import { CREATE_HARVEST_LOT_MUTATION_KEY, OfflineHarvestLotInput } from '../features/harvest-lots/offline-harvest-lot-mutation';

const MAX_PHOTOS = 5;

/** Foto → lote. Funciona sem internet: o envio fica na fila e sai quando o sinal voltar. */
export function NewHarvestLotScreen() {
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [crop, setCrop] = useState('');
  const [quantityBoxes, setQuantityBoxes] = useState('');
  const [boxWeightKg, setBoxWeightKg] = useState('20');
  const navigation = useNavigation();
  const createHarvestLot = useMutation<unknown, Error, OfflineHarvestLotInput>({ mutationKey: CREATE_HARVEST_LOT_MUTATION_KEY });

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!result.canceled) setPhotoUris((current) => [...current, result.assets[0].uri].slice(0, MAX_PHOTOS));
  };

  const submit = () => {
    createHarvestLot.mutate({
      crop: crop.trim(),
      quantityBoxes: Number(quantityBoxes),
      boxWeightKg: Number(boxWeightKg.replace(',', '.')),
      photoUris,
      harvestedAt: new Date().toISOString(),
    });
    Toast.success(createHarvestLot.isPaused ? 'Sem internet: enviaremos quando o sinal voltar' : 'Lote enviado para classificação');
    navigation.goBack();
  };

  const canSubmit = photoUris.length > 0 && crop.trim().length > 1 && Number(quantityBoxes) > 0 && Number(boxWeightKg.replace(',', '.')) > 0;

  return (
    <ScreenContainer title="Nova colheita">
      <Text className="text-base text-border-active">Tire de 1 a 5 fotos das caixas, com boa luz.</Text>
      <View className="flex-row flex-wrap gap-2">
        {photoUris.map((uri) => (
          <Image key={uri} source={{ uri }} className="h-24 w-24 rounded-sm" accessibilityLabel="Foto do lote" />
        ))}
      </View>
      {photoUris.length < MAX_PHOTOS && <PrimaryButton title="Tirar foto" variant="ghost" onPress={() => void takePhoto()} />}
      <TextField label="Produto" value={crop} onChangeText={setCrop} placeholder="tomate" />
      <TextField label="Quantas caixas" keyboardType="number-pad" value={quantityBoxes} onChangeText={setQuantityBoxes} />
      <TextField label="Peso de uma caixa (kg)" keyboardType="decimal-pad" value={boxWeightKg} onChangeText={setBoxWeightKg} />
      <PrimaryButton title="Classificar colheita" disabled={!canSubmit} onPress={submit} />
    </ScreenContainer>
  );
}
