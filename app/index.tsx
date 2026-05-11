import { Redirect } from 'expo-router'

export default function Index() {
  // TODO: Replace with Supabase auth check
  // Sementara langsung redirect ke tabs karena pakai mock data
  return <Redirect href="/(tabs)/beranda" />
}