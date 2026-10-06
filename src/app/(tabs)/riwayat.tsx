// src/app/(tabs)/riwayat.tsx
import { useState, useCallback } from "react";
import { Alert, View, Text, Button, FlatList, Platform, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import type { KotaFavorit } from "../../types/favorit";

export default function TabRiwayat() {
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);

  useFocusEffect(
    useCallback(() => {
      // Mengambil data setiap kali tab ini dibuka/fokus
      ambilSemuaFavorit()
        .then(setDaftarFavorit)
        .catch((error) => console.error("Gagal memuat favorit:", error));
    }, [])
  );

  async function hapusFavoritTersimpan(id: number) {
    try {
      await hapusFavorit(id);
      // Update UI langsung setelah berhasil dihapus dari storage
      setDaftarFavorit((prev) => prev.filter((k) => k.id !== id));
    } catch (error) {
      console.error("Gagal menghapus favorit:", error);
    }
  }

  function konfirmasiHapus(kota: KotaFavorit) {
    const pesan = `Yakin hapus ${kota.nama}?`;

    if (Platform.OS === "web") {
      if (globalThis.confirm(pesan)) {
        void hapusFavoritTersimpan(kota.id);
      }
      return;
    }

    Alert.alert(pesan, undefined, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => void hapusFavoritTersimpan(kota.id),
      },
    ]);
  }

  // Komponen untuk me-render setiap item (baris) pada daftar
  const renderItem = ({ item }: { item: KotaFavorit }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.namaKota}>{item.nama}</Text>
      <Button title="Hapus" color="red" onPress={() => konfirmasiHapus(item)} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Kota Favorit</Text>
      <Text style={styles.jumlahFavorit}>Tersimpan {daftarFavorit.length} kota</Text>
      
      <FlatList
        data={daftarFavorit}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ gap: 12 }}
        ListEmptyComponent={
          <Text style={styles.teksKosong}>Belum ada kota favorit</Text>
        }
      />
    </SafeAreaView>
  );
}

// Memisahkan style ke StyleSheet agar lebih rapi dan mudah dibaca
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  jumlahFavorit: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  namaKota: {
    fontSize: 16,
  },
  teksKosong: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
    fontStyle: "italic",
  },
});
