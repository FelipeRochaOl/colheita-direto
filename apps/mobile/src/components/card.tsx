import { ReactNode } from 'react';
import { View } from 'react-native';

export function Card({ children }: { children: ReactNode }) {
  return <View className="gap-2 rounded-md border border-muted bg-white p-4">{children}</View>;
}
