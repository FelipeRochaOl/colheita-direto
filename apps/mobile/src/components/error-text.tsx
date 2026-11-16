import { Text } from 'react-native';

export function ErrorText({ error }: { error: Error | null }) {
  if (!error) return null;
  return <Text className="text-base text-danger">{error.message}</Text>;
}
