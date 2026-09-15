// components/SearchBox.tsx

import { useState } from "react";
import { View, TextInput, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SearchBoxProps {
  onCari: (kota: string) => void;
}

export default function SearchBox({ onCari }: SearchBoxProps) {
  const [teks, setTeks] = useState("");

  const handleCari = () => {
    if (!teks.trim()) return;

    onCari(teks.trim());
    setTeks("");
  };

  return (
    // SafeAreaView memberikan inset atas otomatis
    // agar komponen tidak tertutup status bar atau notch.
    <SafeAreaView
      edges={["top"]}
      style={{ paddingHorizontal: 16 }}
    >
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          placeholder="Nama kota"
          value={teks}
          onChangeText={setTeks}
          onSubmitEditing={handleCari}
          style={{
            flex: 1,
            borderWidth: 1,
            padding: 8,
            borderRadius: 6,
          }}
        />

        <Button
          title="Cari"
          onPress={() => onCari(teks)}
          accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        />
      </View>
    </SafeAreaView>
  );
}