import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '@colheita/design-tokens';
import { ActivityIndicator, View } from 'react-native';
import { useSession } from '../features/auth/session-context';
import { FarmSummaryScreen } from '../screens/farm-summary-screen';
import { HarvestLotsScreen } from '../screens/harvest-lots-screen';
import { LoginScreen } from '../screens/login-screen';
import { NewHarvestLotScreen } from '../screens/new-harvest-lot-screen';
import { OrdersScreen } from '../screens/orders-screen';
import { ProducerSignupScreen } from '../screens/producer-signup-screen';

export type ProducerStackParamList = {
  ProducerTabs: undefined;
  NewHarvestLot: undefined;
};

const Stack = createNativeStackNavigator<ProducerStackParamList>();
const Tabs = createBottomTabNavigator();

function ProducerTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.greenDark,
        tabBarLabelStyle: { fontSize: 14 },
      }}
    >
      <Tabs.Screen name="HarvestLots" component={HarvestLotsScreen} options={{ title: 'Colheitas' }} />
      <Tabs.Screen name="Orders" component={OrdersScreen} options={{ title: 'Pedidos' }} />
      <Tabs.Screen name="FarmSummary" component={FarmSummaryScreen} options={{ title: 'Gestão' }} />
    </Tabs.Navigator>
  );
}

/** Sem sessão → login; sem perfil de produtor → cadastro; produtor → abas. */
export function AppNavigation() {
  const { session, isLoading, hasRole } = useSession();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={colors.greenDark} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!session ? (
        <LoginScreen />
      ) : !hasRole('producer') ? (
        <ProducerSignupScreen />
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="ProducerTabs" component={ProducerTabs} options={{ headerShown: false }} />
          <Stack.Screen name="NewHarvestLot" component={NewHarvestLotScreen} options={{ title: 'Nova colheita' }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
