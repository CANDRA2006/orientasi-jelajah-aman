// components/SearchBox.tsx
import { useState } from "react";
import { View, TextInput, Button } from "react-native";

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
    <View style={{ flexDirection: "row", gap: 8 }}>
      <TextInput
        placeholder="Nama kota"
        value={teks}
        onChangeText={setTeks}
        onSubmitEditing={handleCari}
        style={{ flex: 1, borderWidth: 1, padding: 8 }}
      />
      <Button title="Cari" onPress={handleCari} />
    </View>
  );
}