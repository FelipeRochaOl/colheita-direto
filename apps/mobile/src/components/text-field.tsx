import { Text, TextInput, TextInputProps, View } from 'react-native';

/** Campo de texto grande e legível no sol (alvo de toque ≥ 48dp). */
export function TextField({ label, ...inputProps }: TextInputProps & { label: string }) {
  return (
    <View className="gap-1">
      <Text className="text-base text-evergreen">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        className="min-h-12 rounded-sm border border-border-active bg-white px-3 text-lg text-evergreen"
        placeholderTextColor="#5D6C74"
        {...inputProps}
      />
    </View>
  );
}
