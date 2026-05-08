import { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  type ViewToken,
} from "react-native";
import { Colors } from "@constants/colors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_url?: string;
  image_url?: string;
  background_color?: string;
}

interface BannerCarouselProps {
  banners?: BannerItem[];
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_HEIGHT = 140;
// Auto-scroll interval in ms
const AUTO_SCROLL_INTERVAL = 4000;

// ---------------------------------------------------------------------------
// Default (fallback) banners — shown when no data passed in
// ---------------------------------------------------------------------------

const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: "default-1",
    title: "Selamat Datang di KampusGo",
    subtitle: "Ekosistem digital untuk civitas akademika",
    cta_text: "Jelajahi",
    background_color: Colors.primary,
  },
  {
    id: "default-2",
    title: "Scan QR Kehadiran",
    subtitle: "Catat absensi kuliah lebih mudah dan akurat",
    cta_text: "Scan Sekarang",
    background_color: "#92400E",
  },
  {
    id: "default-3",
    title: "E-Card Digital Mahasiswa",
    subtitle: "Akses kartu identitas kapan saja, bahkan offline",
    cta_text: "Lihat E-Card",
    background_color: "#065F46",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * BannerCarousel — horizontal paging banner with auto-scroll.
 *
 * Auto-scroll menggunakan setInterval yang di-reset setiap kali user swipe
 * secara manual — agar tidak terjadi konflik antara gesture user dan timer.
 * FlatList dengan pagingEnabled memberikan snapping per item gratis.
 */
export function BannerCarousel({ banners }: BannerCarouselProps) {
  const items = banners && banners.length > 0 ? banners : DEFAULT_BANNERS;
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<BannerItem>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track visible item for dot indicator
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index !== null && viewableItems[0]?.index !== undefined) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  // Scroll to next banner, wrapping back to first after the last one
  const scrollToNext = useCallback(() => {
    setActiveIndex((prev) => {
      const next = (prev + 1) % items.length;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      return next;
    });
  }, [items.length]);

  // Start/restart auto-scroll timer
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(scrollToNext, AUTO_SCROLL_INTERVAL);
  }, [scrollToNext]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const renderItem = ({ item }: { item: BannerItem }) => (
    <View
      style={{
        width: SCREEN_WIDTH - 32,
        height: BANNER_HEIGHT,
        borderRadius: 16,
        backgroundColor: item.background_color ?? Colors.primary,
        padding: 20,
        justifyContent: "space-between",
        marginHorizontal: 0,
        overflow: "hidden",
      }}
    >
      {/* Decorative circle for visual depth */}
      <View
        style={{
          position: "absolute",
          right: -30,
          top: -30,
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: "rgba(255,255,255,0.06)",
        }}
      />
      <View
        style={{
          position: "absolute",
          right: 40,
          bottom: -40,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: "rgba(255,255,255,0.06)",
        }}
      />

      {/* Text content */}
      <View>
        <Text
          style={{
            color: Colors.white,
            fontSize: 16,
            fontWeight: "700",
            lineHeight: 22,
          }}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        {item.subtitle && (
          <Text
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 12,
              marginTop: 4,
              lineHeight: 17,
            }}
            numberOfLines={2}
          >
            {item.subtitle}
          </Text>
        )}
      </View>

      {item.cta_text && (
        <TouchableOpacity
          style={{
            alignSelf: "flex-start",
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 8,
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.3)",
          }}
        >
          <Text style={{ color: Colors.white, fontSize: 12, fontWeight: "600" }}>
            {item.cta_text}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View>
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH - 32}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        // Reset auto-scroll timer when user manually swipes
        onScrollBeginDrag={() => {
          if (timerRef.current) clearInterval(timerRef.current);
        }}
        onScrollEndDrag={startTimer}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH - 32,
          offset: (SCREEN_WIDTH - 32) * index,
          index,
        })}
      />

      {/* Dot indicator */}
      {items.length > 1 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 10,
            gap: 5,
          }}
        >
          {items.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === activeIndex ? 18 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  i === activeIndex ? Colors.primary : Colors.border,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
