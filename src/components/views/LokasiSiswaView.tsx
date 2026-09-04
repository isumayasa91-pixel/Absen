import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Navigation,
  Compass,
  Map,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Activity,
  Trash2,
  Send,
  Info
} from 'lucide-react';

interface SimulatedStudent {
  id: string;
  name: string;
  className: string;
  nisn: string;
  lat: number;
  lng: number;
  lastUpdate: string;
}

export const LokasiSiswaView: React.FC = () => {
  const { students, settings, currentUser, saveCollectionItem } = useApp();

  const schoolLat = settings?.schoolLat || -6.2088;
  const schoolLng = settings?.schoolLng || 106.8456;
  const geofenceRadius = settings?.geofenceRadius || 150; // default 150m

  // Live device GPS states
  const [deviceCoords, setDeviceCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Map state
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'inside' | 'outside'>('all');
  const [logs, setLogs] = useState<any[]>([]);

  // Simulation coordinates (centered around school)
  const [simulatedStudents, setSimulatedStudents] = useState<SimulatedStudent[]>([
    { id: 'std-1', name: 'Aditya Pratama', className: 'X IPA 1', nisn: '0078912341', lat: schoolLat + 0.0004, lng: schoolLng - 0.0003, lastUpdate: '10 Menit yang lalu' },
    { id: 'std-2', name: 'Anisa Rahmawati', className: 'X IPA 1', nisn: '0078912342', lat: schoolLat - 0.0002, lng: schoolLng + 0.0005, lastUpdate: '5 Menit yang lalu' },
    { id: 'std-3', name: 'Bagas Kurniawan', className: 'X IPA 1', nisn: '0078912343', lat: schoolLat + 0.0015, lng: schoolLng - 0.0018, lastUpdate: '15 Menit yang lalu' },
    { id: 'std-4', name: 'Citra Dewi', className: 'X IPA 2', nisn: '0078912344', lat: schoolLat - 0.0012, lng: schoolLng + 0.0016, lastUpdate: '1 Jam yang lalu' },
    { id: 'std-5', name: 'Daffa Rizky', className: 'XI IPS 1', nisn: '0078912345', lat: schoolLat + 0.0002, lng: schoolLng + 0.0003, lastUpdate: 'Baru saja' },
  ]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const schoolMarkerRef = useRef<any>(null);
  const geofenceCircleRef = useRef<any>(null);
  const deviceMarkerRef = useRef<any>(null);
  const studentMarkersRef = useRef<{ [key: string]: any }>({});

  // Mathematical Haversine Distance Helper (in meters)
  const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Radius of Earth in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  };

  // 1. Fetch current live location via browser's navigator.geolocation
  const fetchLiveGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Sensor GPS Geolocation tidak didukung di browser ini.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setDeviceCoords({ lat: latitude, lng: longitude });
        setGpsAccuracy(accuracy);
        setGpsLoading(false);

        // If map is loaded, pan/zoom to student position
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16);
        }
      },
      (error) => {
        console.error('GPS Geolocation Error:', error);
        let errorMsg = 'Gagal mengakses sensor GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Akses GPS ditolak. Silakan izinkan lokasi di pengaturan browser Anda.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Sinyal GPS tidak tersedia atau tidak terdeteksi.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Waktu permintaan GPS habis.';
        }
        setGpsError(errorMsg);
        setGpsLoading(false);

        // Fallback to simulated location near school if actual GPS is blocked/fails
        if (!deviceCoords) {
          setDeviceCoords({ lat: schoolLat + 0.0003, lng: schoolLng + 0.0004 });
          setGpsAccuracy(15);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Fetch location automatically on load
  useEffect(() => {
    fetchLiveGPS();
  }, []);

  // 2. Load Leaflet CDN Assets dynamically
  useEffect(() => {
    let leafletCss = document.getElementById('leaflet-css');
    if (!leafletCss) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    let leafletJs = document.getElementById('leaflet-js');
    if (!leafletJs) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        setMapLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // 3. Initialize/Update Leaflet Map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !(window as any).L) return;

    const L = (window as any).L;

    const centerLat = deviceCoords?.lat || schoolLat;
    const centerLng = deviceCoords?.lng || schoolLng;

    // Initialize map if not exists
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([centerLat, centerLng], 15);

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Map click handler to relocate device coords for simulator
      mapInstanceRef.current.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        setDeviceCoords({ lat, lng });
        setGpsAccuracy(10); // Simulated high accuracy
      });
    }

    const map = mapInstanceRef.current;

    // Draw School Location and Geofencing Circle
    if (schoolMarkerRef.current) {
      schoolMarkerRef.current.setLatLng([schoolLat, schoolLng]);
    } else {
      const schoolHtmlIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-10 h-10 bg-indigo-500/30 rounded-full animate-ping"></div>
            <div class="w-8 h-8 bg-indigo-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-school"><path d="M12 22v-4"/><path d="M14 22v-4"/><path d="M10 22v-4"/><path d="M2 17h20"/><path d="M6 17v-5a6 6 0 1 1 12 0v5"/><path d="m12 2-8 3v3c0 1 1 2 2 2h12c1 0 2-1 2-2V5z"/></svg>
            </div>
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      schoolMarkerRef.current = L.marker([schoolLat, schoolLng], { icon: schoolHtmlIcon })
        .addTo(map)
        .bindPopup(`
          <div class="font-sans p-1">
            <p class="font-extrabold text-xs text-indigo-700 uppercase">GEOFENCING SEKOLAH</p>
            <p class="text-[11px] text-slate-700 font-bold mt-1">Radius: ${geofenceRadius} Meter</p>
          </div>
        `);
    }

    if (geofenceCircleRef.current) {
      geofenceCircleRef.current.setLatLng([schoolLat, schoolLng]);
      geofenceCircleRef.current.setRadius(geofenceRadius);
    } else {
      geofenceCircleRef.current = L.circle([schoolLat, schoolLng], {
        color: '#6366f1',
        fillColor: '#818cf8',
        fillOpacity: 0.15,
        radius: geofenceRadius,
        weight: 1.5,
        dashArray: '5, 5'
      }).addTo(map);
    }

    // Draw Live / Active Device Marker (Student Position)
    if (deviceCoords) {
      if (deviceMarkerRef.current) {
        deviceMarkerRef.current.setLatLng([deviceCoords.lat, deviceCoords.lng]);
      } else {
        const liveHtmlIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-12 h-12 bg-rose-500/30 rounded-full animate-ping"></div>
              <div class="w-7 h-7 bg-rose-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              </div>
            </div>
          `,
          className: 'custom-div-icon',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        deviceMarkerRef.current = L.marker([deviceCoords.lat, deviceCoords.lng], { icon: liveHtmlIcon })
          .addTo(map)
          .bindPopup(`
            <div class="font-sans p-1">
              <p class="font-extrabold text-xs text-rose-600">POSISI LIVE SAYA</p>
              <p class="text-[10px] text-slate-500 mt-1">Klik peta di posisi mana saja untuk mensimulasikan pergerakan.</p>
            </div>
          `);
      }
    }

    // Draw Simulated Students on Map (Only for teachers/admin)
    const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'guru';
    if (isStaff) {
      // Clear previous student markers
      Object.values(studentMarkersRef.current).forEach((marker: any) => marker.remove());
      studentMarkersRef.current = {};

      simulatedStudents.forEach((st) => {
        const studentDist = getDistanceInMeters(st.lat, st.lng, schoolLat, schoolLng);
        const inBounds = studentDist <= geofenceRadius;

        const isSelected = selectedStudentId === st.id;
        const markerColor = inBounds ? 'bg-emerald-500' : 'bg-amber-500';

        const studentHtmlIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center">
              ${isSelected ? '<div class="absolute w-12 h-12 bg-indigo-500/20 rounded-full animate-pulse"></div>' : ''}
              <div class="w-6 h-6 ${markerColor} rounded-full border border-white shadow-md flex items-center justify-center text-[10px] font-black text-white ${isSelected ? 'scale-125 border-indigo-600' : ''}">
                ${st.name.charAt(0)}
              </div>
            </div>
          `,
          className: 'custom-div-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker([st.lat, st.lng], { icon: studentHtmlIcon })
          .addTo(map)
          .bindPopup(`
            <div class="font-sans text-xs p-1">
              <p class="font-bold text-slate-800">${st.name}</p>
              <p class="text-[10px] text-slate-500">Kelas: ${st.className} | NISN: ${st.nisn}</p>
              <p class="text-[10px] font-bold mt-1 ${inBounds ? 'text-emerald-600' : 'text-amber-600'}">
                ${inBounds ? '🟢 Dalam Sekolah' : '🔴 Luar Sekolah'} (${studentDist}m)
              </p>
            </div>
          `);

        studentMarkersRef.current[st.id] = marker;
      });
    }

  }, [mapLoaded, deviceCoords, simulatedStudents, selectedStudentId, schoolLat, schoolLng, geofenceRadius, currentUser]);

  // Handle student tracking select
  const handleSelectStudent = (st: SimulatedStudent) => {
    setSelectedStudentId(st.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([st.lat, st.lng], 16);
      studentMarkersRef.current[st.id]?.openPopup();
    }
  };

  // Submit live checked-in coordinate log to firestore
  const handleSubmitCheckIn = async () => {
    if (!deviceCoords) return;

    const myDistance = getDistanceInMeters(deviceCoords.lat, deviceCoords.lng, schoolLat, schoolLng);
    const inBounds = myDistance <= geofenceRadius;

    const newLog = {
      id: `loc-${Date.now()}`,
      studentId: currentUser?.id || 'std-guest',
      studentName: currentUser?.name || 'Siswa Tamu',
      class: (currentUser as any)?.currentClass || 'Demo',
      latitude: deviceCoords.lat,
      longitude: deviceCoords.lng,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      distanceInMeters: myDistance,
      status: inBounds ? 'Dalam Radius' : 'Luar Radius'
    };

    try {
      await saveCollectionItem('locationLogs', newLog);
      setLogs([newLog, ...logs]);
      alert(`Sukses! Koordinat lokasi berhasil diverifikasi dan disinkronkan ke sistem. Jarak ke sekolah: ${myDistance} meter.`);
    } catch (e) {
      console.error(e);
      alert('Gagal menyinkronkan lokasi ke server.');
    }
  };

  // Filter students
  const filteredStudents = simulatedStudents.filter((st) => {
    const distance = getDistanceInMeters(st.lat, st.lng, schoolLat, schoolLng);
    const isInside = distance <= geofenceRadius;

    if (filterType === 'inside' && !isInside) return false;
    if (filterType === 'outside' && isInside) return false;

    return (
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.nisn.includes(searchQuery)
    );
  });

  const totalDeviceDistance = deviceCoords
    ? getDistanceInMeters(deviceCoords.lat, deviceCoords.lng, schoolLat, schoolLng)
    : 0;
  const isDeviceInside = deviceCoords ? totalDeviceDistance <= geofenceRadius : false;

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </span>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Geofencing & Deteksi GPS Siswa</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium max-w-2xl">
            Sistem Geolocation otomatis melacak dan mengunci koordinat fisik presisi siswa saat melakukan tap kehadiran, disinkronkan dengan geofence sekolah.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchLiveGPS}
            disabled={gpsLoading}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-2 cursor-pointer transition-all border border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
            <span>{gpsLoading ? 'Mengunci Sinyal...' : 'Refresh Live GPS'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAP COLUMN */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs relative">
            <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Map className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-extrabold text-slate-700">Peta Live Geofencing Sekolah</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-[10px] font-black border border-indigo-100">
                <Activity className="w-3 h-3 text-indigo-500 animate-pulse" />
                <span>Interaktif: Klik Peta Untuk Pindah Lokasi</span>
              </div>
            </div>

            {/* Map Canvas */}
            <div
              id="map-leaflet"
              ref={mapContainerRef}
              className="w-full h-[400px] bg-slate-100 z-0"
              style={{ minHeight: '400px' }}
            />

            {!mapLoaded && (
              <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center space-y-3 z-10">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-slate-600">Mengunduh aset peta interaktif...</p>
              </div>
            )}
          </div>

          {/* SENSOR GPS DETAILS CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold text-slate-800 flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-rose-500" />
                <span>Status Sensor GPS Perangkat Anda</span>
              </span>
              <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                Live Geolocation
              </span>
            </div>

            {gpsError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-2 text-rose-700 text-xs font-semibold">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{gpsError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Latitude</span>
                <span className="text-xs font-mono font-black text-slate-700 block">
                  {deviceCoords ? deviceCoords.lat.toFixed(6) : '-'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Longitude</span>
                <span className="text-xs font-mono font-black text-slate-700 block">
                  {deviceCoords ? deviceCoords.lng.toFixed(6) : '-'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Akurasi GPS</span>
                <span className="text-xs font-black text-slate-700 block">
                  {gpsAccuracy ? `± ${gpsAccuracy.toFixed(1)} Meter` : 'Mendeteksi...'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border bg-gradient-to-r from-slate-50 to-indigo-50/20 border-slate-200">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${isDeviceInside ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                  {isDeviceInside ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">STATUS GEOFENCING</span>
                  <span className={`text-xs font-extrabold ${isDeviceInside ? 'text-emerald-700' : 'text-amber-700'} block`}>
                    {isDeviceInside ? 'BERADA DI DALAM RADIUS SEKOLAH' : 'DI LUAR JANGKAUAN SEKOLAH'} ({totalDeviceDistance}m)
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmitCheckIn}
                disabled={!deviceCoords}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 text-white disabled:text-slate-400 font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-100 cursor-pointer transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Lokasi Terverifikasi</span>
              </button>
            </div>
          </div>
        </div>

        {/* LIST COLUMN */}
        <div className="space-y-4">
          {currentUser?.role === 'siswa' ? (
            // STUDENT PRIVATE INFO PANEL
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Verifikasi Lokasi Mandiri</span>
              </h3>

              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Sebagai siswa, lokasi Anda diverifikasi otomatis oleh GPS kami. Pastikan Anda berada dalam radius <strong>{geofenceRadius} Meter</strong> dari sekolah untuk melakukan Tap Kehadiran Mandiri.
                </p>

                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                  <span className="text-xs font-black text-indigo-800 block">Koordinat Sekolah:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono font-bold text-slate-600">
                    <div>Lat: {schoolLat}</div>
                    <div>Lng: {schoolLng}</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 block">Riwayat Verifikasi Saya:</span>
                    {logs.length > 0 && currentUser?.role !== 'siswa' && (
                      <button
                        onClick={() => {
                          if (window.confirm('Kosongkan riwayat verifikasi lokasi?')) {
                            setLogs([]);
                          }
                        }}
                        className="text-[10px] font-bold text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Kosongkan</span>
                      </button>
                    )}
                  </div>
                  {logs.length === 0 ? (
                    <span className="text-[11px] text-slate-400 block italic">Belum ada verifikasi terkirim hari ini.</span>
                  ) : (
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                      {logs.map((lg) => (
                        <div key={lg.id} className="p-2 bg-white rounded-lg border border-slate-100 flex items-center justify-between text-[11px]">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-700 block">Sukses Terkirim</span>
                            <span className="text-[10px] text-slate-400 block">{lg.timestamp} • {lg.distanceInMeters}m</span>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${lg.status === 'Dalam Radius' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                            {lg.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // STAFF ACTIVE TRACKING MONITOR
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col h-[584px]">
              <div className="border-b border-slate-100 pb-3 mb-4 space-y-1">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Daftar Presensi GPS Siswa</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Pemantauan Sinyal Koordinat
                </p>
              </div>

              {/* SEARCH & FILTER */}
              <div className="space-y-2 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari siswa, kelas, NISN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {(['all', 'inside', 'outside'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`py-1.5 text-[10px] font-black rounded-lg uppercase cursor-pointer border transition-all ${
                        filterType === type
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {type === 'all' ? 'Semua' : type === 'inside' ? 'Dalam' : 'Luar'}
                    </button>
                  ))}
                </div>
              </div>

              {/* STUDENT LIST */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Info className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-400">Siswa tidak ditemukan.</p>
                  </div>
                ) : (
                  filteredStudents.map((st) => {
                    const studentDist = getDistanceInMeters(st.lat, st.lng, schoolLat, schoolLng);
                    const inBounds = studentDist <= geofenceRadius;
                    const isSelected = selectedStudentId === st.id;

                    return (
                      <div
                        key={st.id}
                        onClick={() => handleSelectStudent(st)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-50/60 border-indigo-200 shadow-xs'
                            : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-extrabold text-slate-800 line-clamp-1">{st.name}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold">
                            <span>{st.className}</span>
                            <span>•</span>
                            <span className="font-mono">{st.nisn}</span>
                          </div>
                          <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {st.lastUpdate}
                          </span>
                        </div>

                        <div className="text-right space-y-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            inBounds
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {inBounds ? 'DALAM' : 'LUAR'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 block">
                            {studentDist} m
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
