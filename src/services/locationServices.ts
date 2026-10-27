// src/services/locationService.ts
import * as Location from "expo-location";
import { Platform } from "react-native";

export type StatusIzinLokasi = "granted" | "denied" | "unavailable";

export async function mintaIzinLokasi(): Promise<StatusIzinLokasi> {
  if (Platform.OS === "web") {
    return typeof navigator !== "undefined" && "geolocation" in navigator
      ? "granted"
      : "unavailable";
  }

  const layananAktif = await Location.hasServicesEnabledAsync();
  if (!layananAktif) {
    return "unavailable";
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted" ? "granted" : "denied";
}

export async function ambilKoordinatSaatIni() {
  if (Platform.OS === "web") {
    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        reject(new Error("Geolokasi tidak tersedia di browser ini"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
        reject,
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
      );
    });
  }

  const lokasi = await Location.getCurrentPositionAsync({});
  return {
    latitude: lokasi.coords.latitude,
    longitude: lokasi.coords.longitude,
  };
}
