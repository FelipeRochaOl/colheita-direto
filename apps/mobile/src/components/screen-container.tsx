import { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ScreenContainer({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ScrollView contentContainerClassName="p-4 gap-4" keyboardShouldPersistTaps="handled">
        {title && <Text className="text-2xl font-semibold text-evergreen">{title}</Text>}
        <View className="gap-4">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
