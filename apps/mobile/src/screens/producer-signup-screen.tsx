import { useRegisterProducer } from '@colheita/api-client';
import type { GeoPoint } from '@colheita/contracts';
import * as Location from 'expo-location';
import { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { ErrorText } from '../components/error-text';
import { PrimaryButton } from '../components/primary-button';
import { ScreenContainer } from '../components/screen-container';
import { TextField } from '../components/text-field';

const PRIVACY_POLICY_VERSION = '2026-11';

export function ProducerSignupScreen() {
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [crops, setCrops] = useState('');
  const [farmLocation, setFarmLocation] = useState<GeoPoint | null>(null);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const registerProducer = useRegisterProducer();

  const captureFarmLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      setLocationError('Sem a localização não conseguimos achar compradores perto de você.');
      return;
    }
    const position = await Location.getCurrentPositionAsync({});
    setFarmLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
    setLocationError(null);
  };

  const canSubmit = name && farmName && city && state.length === 2 && crops && farmLocation && acceptedPrivacy;

  return (
    <ScreenContainer title="Cadastro do produtor">
      <TextField label="Seu nome" value={name} onChangeText={setName} />
      <TextField label="Nome do sítio" value={farmName} onChangeText={setFarmName} />
      <TextField label="Cidade" value={city} onChangeText={setCity} />
      <TextField label="UF" value={state} onChangeText={setState} maxLength={2} autoCapitalize="characters" />
      <TextField label="O que você planta (separe por vírgula)" value={crops} onChangeText={setCrops} placeholder="tomate, alface" />
      <PrimaryButton
        title={farmLocation ? 'Localização marcada ✓' : 'Estou na propriedade: marcar localização'}
        variant="ghost"
        onPress={() => void captureFarmLocation()}
      />
      {locationError && <Text className="text-danger">{locationError}</Text>}
      <View className="flex-row items-center gap-3">
        <Switch value={acceptedPrivacy} onValueChange={setAcceptedPrivacy} />
        <Text className="flex-1 text-base text-evergreen">Aceito os termos de uso e a política de privacidade.</Text>
      </View>
      <ErrorText error={registerProducer.error} />
      <PrimaryButton
        title="Criar meu cadastro"
        disabled={!canSubmit}
        loading={registerProducer.isPending}
        onPress={() =>
          registerProducer.mutate({
            name,
            farmName,
            city,
            state,
            farmLocation: farmLocation!,
            crops: crops.split(',').map((crop) => crop.trim()).filter(Boolean),
            acceptedPrivacyPolicyVersion: PRIVACY_POLICY_VERSION,
          })
        }
      />
    </ScreenContainer>
  );
}
