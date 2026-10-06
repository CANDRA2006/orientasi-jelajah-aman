import { Platform } from "react-native";
import type { HasilGeocoding } from "../types/geocoding";

const HISTORY_KEY = "jelajah-aman:search-history";

export async function bacaRiwayatKota(): Promise<HasilGeocoding[]> {
  try {
    const raw = Platform.OS === "web"
      ? globalThis.localStorage?.getItem(HISTORY_KEY)
      : await readNativeValue();
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as HasilGeocoding[] : [];
  } catch {
    return [];
  }
}

export async function simpanRiwayatKota(kota: HasilGeocoding): Promise<void> {
  const riwayat = await bacaRiwayatKota();
  const diperbarui = [kota, ...riwayat.filter((item) => item.id !== kota.id)].slice(0, 20);
  const raw = JSON.stringify(diperbarui);

  try {
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(HISTORY_KEY, raw);
    } else {
      await writeNativeValue(raw);
    }
  } catch {
    // Pencarian dan cuaca tetap berfungsi jika penyimpanan lokal tidak tersedia.
  }
}

async function readNativeValue(): Promise<string | null> {
  const FileSystem = await import("expo-file-system/legacy");
  if (!FileSystem.documentDirectory) return null;
  const fileUri = `${FileSystem.documentDirectory}${HISTORY_KEY}.json`;
  const info = await FileSystem.getInfoAsync(fileUri);
  return info.exists ? FileSystem.readAsStringAsync(fileUri) : null;
}

async function writeNativeValue(value: string): Promise<void> {
  const FileSystem = await import("expo-file-system/legacy");
  if (!FileSystem.documentDirectory) return;
  await FileSystem.writeAsStringAsync(
    `${FileSystem.documentDirectory}${HISTORY_KEY}.json`,
    value
  );
}
