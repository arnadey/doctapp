import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return <View style={styles.container}><SafeAreaView><Text style={styles.title}>Welcome to DocTapp</Text><Text>Find and manage your healthcare appointments.</Text></SafeAreaView></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
});
