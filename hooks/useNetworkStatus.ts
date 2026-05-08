import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

// Hook to track network connectivity.
// Uses NetInfo to subscribe to connection state changes.
// Returns isConnected: false when device has no internet.
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Fetch current state immediately
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected ?? true);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });

    return unsubscribe;
  }, []);

  return { isConnected };
}
