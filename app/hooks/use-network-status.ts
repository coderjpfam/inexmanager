/**
 * Network Status Hook
 * Monitors network connectivity and provides network status information
 */

import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetInfoStateType;
  details: NetInfoState['details'] | null;
}

/**
 * Custom hook to monitor network status
 * @returns Network status information
 */
export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true, // Optimistically assume connected
    isInternetReachable: null,
    type: Platform.OS === 'ios' ? 'wifi' : 'cellular',
    details: null,
  });

  useEffect(() => {
    // Get initial network state
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details,
      });
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return networkStatus;
}

/**
 * Check if device is currently online
 * @returns Promise that resolves to true if online, false otherwise
 */
export const checkNetworkStatus = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
};
