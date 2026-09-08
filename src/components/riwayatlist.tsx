// components/RiwayatList.tsx
import { View, Text } from "react-native";

interface RiwayatListProps {
  daftarKota: string[];
}

export default function RiwayatList({ daftarKota }: RiwayatListProps) {
  return (
    <View>
      {daftarKota.map((kota, index) => (
        <Text key={`${kota}-${index}`}>{kota}</Text>
      ))}
    </View>
  );
}