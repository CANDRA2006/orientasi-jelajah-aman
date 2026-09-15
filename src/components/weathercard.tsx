// components/WeatherCard.tsx

import { View, Text } from "react-native";

import { WeatherCardProps } from "../types/cuaca";
import { typeScale, spacing } from "../constants/styles";

export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
}: WeatherCardProps) {
  const warnaAQI = tingkatAQI === "BAIK" ? "green" : "orange";

  return (
    <View
      accessible
      accessibilityLabel={`Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${tingkatAQI}`}
      style={{
        padding: spacing.sedang,
        borderRadius: 8,
        backgroundColor: "#F4F7FA",
      }}
    >
      {/* Isi WeatherCard tetap seperti sebelumnya */}
    </View>
  );
}