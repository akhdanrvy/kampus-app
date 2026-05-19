import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { APP_NAME, APP_VERSION } from "@constants/config";
import { Colors } from "@constants/colors";
import { FadeIn } from "@components/ui/Skeleton";

function SectionCard({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{content}</Text>
    </View>
  );
}

export default function AboutAppScreen() {
  const params = useLocalSearchParams<{ from?: string | string[] }>();
  const from = Array.isArray(params.from) ? params.from[0] : params.from;

  const handleBack = () => {
    if (from) {
      router.replace(from as any);
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/profil");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tentang Aplikasi</Text>
        <View style={{ width: 22 }} />
      </View>

      <FadeIn duration={220} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="information-circle-outline" size={30} color={Colors.white} />
          </View>
          <Text style={styles.heroTitle}>{APP_NAME}</Text>
          <Text style={styles.heroVersion}>Versi {APP_VERSION}</Text>
          <Text style={styles.heroBody}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
            feugiat, justo eu gravida vehicula, dui lorem ultricies tortor,
            vitae tincidunt lacus urna nec velit.
          </Text>
        </View>

        <SectionCard
          title="Deskripsi"
          content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nunc congue nisi vitae suscipit tellus mauris a diam maecenas."
        />

        <SectionCard
          title="Misi Produk"
          content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Egestas sed tempus urna et pharetra pharetra massa massa ultricies. Elit ullamcorper dignissim cras tincidunt lobortis feugiat vivamus."
        />

        <SectionCard
          title="Informasi Tambahan"
          content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elit ullamcorper dignissim cras tincidunt. Viverra nibh cras pulvinar mattis nunc sed blandit libero volutpat."
        />
        </ScrollView>
      </FadeIn>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.white,
  },
  heroVersion: {
    fontSize: 13,
    color: "rgba(255,255,255,0.78)",
    marginTop: 4,
  },
  heroBody: {
    fontSize: 13,
    lineHeight: 22,
    color: "rgba(255,255,255,0.92)",
    marginTop: 14,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 22,
    color: Colors.textMuted,
  },
});
