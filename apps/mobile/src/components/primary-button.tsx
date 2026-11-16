// Import direto do módulo: o índice do pacote carrega o Drawer, incompatível com gesture-handler 3.
import Button from '@ant-design/react-native/lib/button';

/** Botão principal (Ant Design RN, tema do design system). */
export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
}) {
  return (
    <Button type={variant} onPress={onPress} loading={loading} disabled={disabled || loading}>
      {title}
    </Button>
  );
}
