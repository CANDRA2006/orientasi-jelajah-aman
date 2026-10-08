import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Button, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";

import AtribusiCuaca from "../../components/atribusiCuaca";
import SearchBox from "../../components/searchbox";
import WeatherCard from "../../components/weathercard";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useDebounce } from "../../hooks/use-debounce";
import { ambilKualitasUdara } from "../../services/airQualityServices";
import { cariKota } from "../../services/geocodingService";
import { ambilKoordinatSaatIni, mintaIzinLokasi } from "../../services/locationServices";
import { simpanRiwayatKota } from "../../services/searchHistory";
import { ambilCuaca } from "../../services/weatherServices";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import type { KotaFavorit } from "../../types/favorit";
import type { HasilGeocoding } from "../../types/geocoding";
import type { DataCuacaLengkap, DataKualitasUdara } from "../../types/weather";

export default function HalamanUtama() {
  // State tampilan dan data
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [cuaca, setCuaca] = useState<DataCuacaLengkap | null>(null);
  const [kualitasUdara, setKualitasUdara] = useState<DataKualitasUdara | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [favoritSudahDimuat, setFavoritSudahDimuat] = useState(false);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      let masihAktif = true;
      setFavoritSudahDimuat(false);

      ambilSemuaFavorit().then((favorit) => {
        if (masihAktif) {
          setDaftarFavorit(favorit);
          setFavoritSudahDimuat(true);
        }
      });

      return () => {
        masihAktif = false;
      };
    }, [])
  );

  // Cari kota setelah pengguna berhenti mengetik.
  useEffect(() => {
    let masihAktif = true;
    const kueri = teksTertunda.trim();

    if (!kueri) {
      setHasilPencarian([]);
      return () => {
        masihAktif = false;
      };
    }

    cariKota(kueri)
      .then((hasil) => {
        if (masihAktif) setHasilPencarian(hasil);
      })
      .catch(() => {
        if (masihAktif) setHasilPencarian([]);
      });

    return () => {
      masihAktif = false;
    };
  }, [teksTertunda]);

  // Ambil cuaca dan kualitas udara kota terpilih, lalu simpan ke riwayat.
  async function pilihKota(kota: HasilGeocoding) {
    const idPermintaan = ++requestIdRef.current;
    setKotaTerpilih(kota);
    setSedangMemuat(true);
    setPesanError(null);

    try {
      const [dataCuaca, dataKualitasUdara] = await Promise.all([
        ambilCuaca(kota.latitude, kota.longitude),
        ambilKualitasUdara(kota.latitude, kota.longitude),
      ]);

      if (idPermintaan !== requestIdRef.current) return;

      setCuaca(dataCuaca);
      setKualitasUdara(dataKualitasUdara);
      await simpanRiwayatKota(kota);
    } catch {
      if (idPermintaan === requestIdRef.current) {
        setPesanError("Gagal memuat data cuaca. Periksa koneksi internet Anda.");
      }
    } finally {
      if (idPermintaan === requestIdRef.current) setSedangMemuat(false);
    }
  }

  // Minta izin lokasi dan gunakan koordinat perangkat sebagai pencarian.
  async function gunakanLokasiSaatIni() {
    try {
      const statusIzin = await mintaIzinLokasi();

      if (statusIzin === "denied") {
        setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual di atas.");
        return;
      }

      if (statusIzin === "unavailable") {
        setPesanLokasi("Layanan lokasi tidak aktif. Silakan cari kota secara manual.");
        return;
      }

      setPesanLokasi(null);
      const koordinat = await ambilKoordinatSaatIni();
      await pilihKota({
        id: -1,
        name: "Lokasi Saat Ini",
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: "",
      });
    } catch {
      setPesanLokasi("Lokasi tidak dapat diambil. Silakan cari kota secara manual.");
    }
  }

  // Tampilan
  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 16 }}>
      <SearchBox onCari={setTeksCari} />

      <Button title="Gunakan Lokasi Saat Ini" onPress={gunakanLokasiSaatIni} />
      {pesanLokasi && <Text>{pesanLokasi}</Text>}

      {hasilPencarian.map((kota) => (
        <TouchableOpacity key={kota.id} onPress={() => pilihKota(kota)}>
          <Text>{kota.name}</Text>
        </TouchableOpacity>
      ))}

      {sedangMemuat && <ActivityIndicator />}

      {pesanError && (
        <View>
          <Text>{pesanError}</Text>
          <Button title="Coba Lagi" onPress={() => kotaTerpilih && pilihKota(kotaTerpilih)} />
        </View>
      )}

      {cuaca && kualitasUdara && kotaTerpilih && !sedangMemuat && (
        <>
          <WeatherCard
            kota={kotaTerpilih.name}
            suhu={cuaca.saatIni.suhu}
            tingkatAQI={konversiTingkatAQI(kualitasUdara.indeksAQI)}
            indeksAQI={kualitasUdara.indeksAQI}
            kondisiCuaca={labelKodeCuaca(cuaca.saatIni.kodeCuaca)}
            kecepatanAngin={cuaca.saatIni.kecepatanAngin}
          />
          {favoritSudahDimuat &&
            !daftarFavorit.some((favorit) => favorit.id === kotaTerpilih.id) && (
              <Button
                title="Tambahkan ke Favorit"
                onPress={() =>
                  router.push({
                    pathname: "/tambah-favorit",
                    params: {
                      id: String(kotaTerpilih.id),
                      nama: kotaTerpilih.name,
                      lat: String(kotaTerpilih.latitude),
                      lon: String(kotaTerpilih.longitude),
                    },
                  })
                }
              />
            )}
        </>
      )}


      <AtribusiCuaca />
    </SafeAreaView>
  );
}
