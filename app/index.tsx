import { View } from "react-native";

// index.tsx — titik masuk awal app.
// Tidak melakukan redirect manual di sini; biarkan redirect guard
// di app/_layout.tsx yang mengatur navigasi berdasarkan status auth.
export default function Index() {
  return <View />;
}