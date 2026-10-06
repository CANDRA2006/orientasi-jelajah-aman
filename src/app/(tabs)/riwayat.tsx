// app/(tabs)/riwayat.tsx

import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import RiwayatList from "../../components/riwayatlist";
import { bacaRiwayatKota } from "../../services/searchHistory";
import type { HasilGeocoding } from "../../types/geocoding";

export default function TabRiwayat() {
  const [daftarKota, setDaftarKota] = useState<HasilGeocoding[]>([]);

  useFocusEffect(
    useCallback(() => {
      let masihAktif = true;
      bacaRiwayatKota().then((riwayat) => {
        if (masihAktif) setDaftarKota(riwayat);
      });

      return () => {
        masihAktif = false;
      };
    }, [])
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 16,
      }}
    >
      <RiwayatList daftarKota={daftarKota} />
    </SafeAreaView>
  );
}
