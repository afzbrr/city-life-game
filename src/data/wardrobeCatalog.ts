export type WardrobeCategory =
  | 'atasan'
  | 'bawahan'
  | 'sepatu'
  | 'aksesoris'
  | 'dress_setelan'
  | 'rambut'
  | 'muka'
  | 'kulit';

export interface WardrobeItem {
  id: string;
  name: string;
  category: WardrobeCategory;
  price: number;
  isDefault?: boolean;
  color: string;
  secondaryColor?: string;
  gender?: 'unisex' | 'cewek' | 'cowok';
  isSultan?: boolean;
  isCouple?: boolean;
  tag?: string;
}

export const WARDROBE_ITEMS: WardrobeItem[] = [
  // =========================================================================
  // 1. ATASAN (Tops)
  // =========================================================================
  // Default Gratis:
  {
    id: 'kaos_polos_putih',
    name: 'Kaos Polos Putih',
    category: 'atasan',
    price: 0,
    isDefault: true,
    color: '#ffffff',
    gender: 'unisex',
    tag: 'Gratis Awal',
  },
  // Biasa:
  { id: 'kaos_oversize', name: 'Kaos Oversize', category: 'atasan', price: 60, color: '#e2e8f0', gender: 'unisex' },
  { id: 'kaos_grafis', name: 'Kaos Grafis', category: 'atasan', price: 75, color: '#334155', secondaryColor: '#f43f5e', gender: 'unisex' },
  { id: 'hoodie_basic', name: 'Hoodie', category: 'atasan', price: 90, color: '#64748b', gender: 'unisex' },
  { id: 'hoodie_oversize', name: 'Hoodie Oversize', category: 'atasan', price: 110, color: '#475569', gender: 'unisex' },
  { id: 'crewneck', name: 'Crewneck', category: 'atasan', price: 80, color: '#94a3b8', gender: 'unisex' },
  { id: 'sweater_rajut', name: 'Sweater Rajut', category: 'atasan', price: 95, color: '#d97706', gender: 'unisex' },
  { id: 'flanel_kotak', name: 'Kemeja Flanel', category: 'atasan', price: 85, color: '#dc2626', secondaryColor: '#1e293b', gender: 'unisex' },
  { id: 'kemeja_putih_formal', name: 'Kemeja Putih Formal', category: 'atasan', price: 90, color: '#f8fafc', gender: 'unisex' },
  { id: 'blazer', name: 'Blazer', category: 'atasan', price: 120, color: '#0f172a', gender: 'unisex' },
  { id: 'jaket_denim', name: 'Jaket Denim', category: 'atasan', price: 110, color: '#2563eb', gender: 'unisex' },
  { id: 'jaket_bomber', name: 'Jaket Bomber', category: 'atasan', price: 115, color: '#15803d', gender: 'unisex' },
  { id: 'jaket_kulit', name: 'Jaket Kulit', category: 'atasan', price: 130, color: '#18181b', gender: 'unisex' },
  { id: 'jaket_varsity', name: 'Jaket Varsity', category: 'atasan', price: 125, color: '#7c3aed', secondaryColor: '#ffffff', gender: 'unisex' },
  { id: 'cardigan_cream', name: 'Cardigan', category: 'atasan', price: 95, color: '#fed7aa', gender: 'unisex' },
  { id: 'tank_top', name: 'Tank Top', category: 'atasan', price: 50, color: '#38bdf8', gender: 'unisex' },
  { id: 'crop_top', name: 'Crop Top', category: 'atasan', price: 70, color: '#f43f5e', gender: 'cewek' },
  { id: 'blouse', name: 'Blouse', category: 'atasan', price: 85, color: '#fbcfe8', gender: 'cewek' },
  { id: 'dress_simple', name: 'Dress', category: 'atasan', price: 110, color: '#a855f7', gender: 'cewek' },
  { id: 'dress_pesta', name: 'Dress Pesta', category: 'atasan', price: 150, color: '#ec4899', gender: 'cewek' },
  { id: 'dress_pantai', name: 'Dress Pantai', category: 'atasan', price: 95, color: '#06b6d4', gender: 'cewek' },
  { id: 'seragam_sekolah', name: 'Seragam Sekolah', category: 'atasan', price: 80, color: '#ffffff', secondaryColor: '#64748b', gender: 'unisex' },
  { id: 'seragam_kerja', name: 'Seragam Kerja', category: 'atasan', price: 85, color: '#0284c7', gender: 'unisex' },
  { id: 'baju_koki', name: 'Baju Koki', category: 'atasan', price: 90, color: '#ffffff', secondaryColor: '#dc2626', gender: 'unisex' },
  { id: 'baju_dokter', name: 'Baju Dokter', category: 'atasan', price: 95, color: '#f1f5f9', gender: 'unisex' },
  { id: 'piyama', name: 'Piyama', category: 'atasan', price: 75, color: '#93c5fd', gender: 'unisex' },
  { id: 'baju_renang', name: 'Baju Renang', category: 'atasan', price: 80, color: '#0ea5e9', gender: 'unisex' },
  { id: 'baju_olahraga', name: 'Baju Olahraga', category: 'atasan', price: 75, color: '#10b981', gender: 'unisex' },
  { id: 'jersey_bola', name: 'Jersey Bola', category: 'atasan', price: 85, color: '#dc2626', secondaryColor: '#ffffff', gender: 'unisex' },
  { id: 'jersey_basket', name: 'Jersey Basket', category: 'atasan', price: 85, color: '#eab308', secondaryColor: '#6b21a8', gender: 'unisex' },

  // KOLEKSI PINK CEWE (Semua Pink 150-300 Koin):
  { id: 'hoodie_pink_pastel', name: 'Hoodie Pink Pastel', category: 'atasan', price: 180, color: '#fbcfe8', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'hoodie_pink_bubblegum', name: 'Hoodie Pink Bubblegum', category: 'atasan', price: 200, color: '#f472b6', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'kaos_oversize_pink', name: 'Kaos Oversize Pink', category: 'atasan', price: 160, color: '#f9a8d4', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'kaos_pink_hati', name: 'Kaos Pink Hati', category: 'atasan', price: 175, color: '#fbcfe8', secondaryColor: '#f43f5e', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'crop_top_pink', name: 'Crop Top Pink', category: 'atasan', price: 170, color: '#ec4899', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'cardigan_pink', name: 'Cardigan Pink', category: 'atasan', price: 210, color: '#f472b6', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'sweater_rajut_pink', name: 'Sweater Rajut Pink', category: 'atasan', price: 195, color: '#f472b6', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'blouse_pink_pita', name: 'Blouse Pink Pita', category: 'atasan', price: 220, color: '#fce7f3', secondaryColor: '#ec4899', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'kemeja_pink', name: 'Kemeja Pink', category: 'atasan', price: 185, color: '#fbcfe8', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'jaket_denim_pink', name: 'Jaket Denim Pink', category: 'atasan', price: 240, color: '#f472b6', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'jaket_bomber_pink', name: 'Jaket Bomber Pink', category: 'atasan', price: 250, color: '#db2777', gender: 'cewek', tag: 'Koleksi Pink' },

  // KOLEKSI BIRU COWO (Semua Biru 150-300 Koin):
  { id: 'hoodie_biru_navy', name: 'Hoodie Biru Navy', category: 'atasan', price: 190, color: '#1e3a8a', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'hoodie_biru_elektrik', name: 'Hoodie Biru Elektrik', category: 'atasan', price: 210, color: '#2563eb', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'hoodie_biru_langit', name: 'Hoodie Biru Langit', category: 'atasan', price: 180, color: '#38bdf8', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'kaos_oversize_biru', name: 'Kaos Oversize Biru', category: 'atasan', price: 160, color: '#60a5fa', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'kaos_biru_grafis', name: 'Kaos Biru Grafis', category: 'atasan', price: 175, color: '#1e40af', secondaryColor: '#38bdf8', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'crewneck_biru', name: 'Crewneck Biru', category: 'atasan', price: 170, color: '#3b82f6', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'sweater_rajut_biru', name: 'Sweater Rajut Biru', category: 'atasan', price: 195, color: '#1d4ed8', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'kemeja_biru', name: 'Kemeja Biru', category: 'atasan', price: 185, color: '#93c5fd', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'flanel_biru', name: 'Flanel Biru', category: 'atasan', price: 190, color: '#1e3a8a', secondaryColor: '#60a5fa', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'jaket_denim_biru', name: 'Jaket Denim Biru', category: 'atasan', price: 230, color: '#2563eb', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'jaket_bomber_biru', name: 'Jaket Bomber Biru', category: 'atasan', price: 240, color: '#1e40af', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'jaket_varsity_biru', name: 'Jaket Varsity Biru', category: 'atasan', price: 260, color: '#1e3a8a', secondaryColor: '#ffffff', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'jaket_kulit_biru', name: 'Jaket Kulit Biru', category: 'atasan', price: 280, color: '#0f172a', secondaryColor: '#3b82f6', gender: 'cowok', tag: 'Koleksi Biru' },

  // =========================================================================
  // 2. BAWAHAN (Bottoms)
  // =========================================================================
  // Default Gratis:
  {
    id: 'celana_pendek_biru_muda',
    name: 'Celana Pendek',
    category: 'bawahan',
    price: 0,
    isDefault: true,
    color: '#7dd3fc',
    gender: 'unisex',
    tag: 'Gratis Awal',
  },
  // Biasa:
  { id: 'celana_jeans', name: 'Celana Jeans', category: 'bawahan', price: 85, color: '#1e3a8a', gender: 'unisex' },
  { id: 'jeans_robek', name: 'Jeans Robek', category: 'bawahan', price: 95, color: '#2563eb', gender: 'unisex' },
  { id: 'cargo', name: 'Cargo', category: 'bawahan', price: 90, color: '#475569', gender: 'unisex' },
  { id: 'chino', name: 'Chino', category: 'bawahan', price: 80, color: '#b45309', gender: 'unisex' },
  { id: 'training', name: 'Training', category: 'bawahan', price: 70, color: '#334155', gender: 'unisex' },
  { id: 'jogger', name: 'Jogger', category: 'bawahan', price: 75, color: '#1e293b', gender: 'unisex' },
  { id: 'rok_mini', name: 'Rok Mini', category: 'bawahan', price: 70, color: '#e11d48', gender: 'cewek' },
  { id: 'rok_panjang', name: 'Rok Panjang', category: 'bawahan', price: 85, color: '#4f46e5', gender: 'cewek' },
  { id: 'rok_plisket', name: 'Rok Plisket', category: 'bawahan', price: 90, color: '#93c5fd', gender: 'cewek' },
  { id: 'legging', name: 'Legging', category: 'bawahan', price: 65, color: '#0f172a', gender: 'cewek' },
  { id: 'formal_pants', name: 'Formal', category: 'bawahan', price: 95, color: '#09090b', gender: 'unisex' },
  { id: 'pantai_shorts', name: 'Pantai', category: 'bawahan', price: 60, color: '#f59e0b', gender: 'unisex' },

  // KOLEKSI PINK CEWE (Semua Pink):
  { id: 'rok_mini_pink', name: 'Rok Mini Pink', category: 'bawahan', price: 160, color: '#f472b6', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'rok_panjang_pink', name: 'Rok Panjang Pink', category: 'bawahan', price: 180, color: '#ec4899', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'rok_plisket_pink', name: 'Rok Plisket Pink', category: 'bawahan', price: 190, color: '#fbcfe8', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'celana_pink', name: 'Celana Pink', category: 'bawahan', price: 175, color: '#f472b6', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'celana_pendek_pink', name: 'Celana Pendek Pink', category: 'bawahan', price: 150, color: '#f9a8d4', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'legging_pink', name: 'Legging Pink', category: 'bawahan', price: 165, color: '#db2777', gender: 'cewek', tag: 'Koleksi Pink' },

  // KOLEKSI BIRU COWO (Semua Biru):
  { id: 'jeans_biru', name: 'Jeans Biru', category: 'bawahan', price: 170, color: '#1d4ed8', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'jeans_robek_biru', name: 'Jeans Robek Biru', category: 'bawahan', price: 185, color: '#2563eb', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'cargo_biru', name: 'Cargo Biru', category: 'bawahan', price: 180, color: '#1e3a8a', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'chino_biru', name: 'Chino Biru', category: 'bawahan', price: 175, color: '#3b82f6', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'pendek_biru', name: 'Pendek Biru', category: 'bawahan', price: 150, color: '#60a5fa', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'training_biru', name: 'Training Biru', category: 'bawahan', price: 160, color: '#1e40af', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'jogger_biru', name: 'Jogger Biru', category: 'bawahan', price: 165, color: '#1e3a8a', gender: 'cowok', tag: 'Koleksi Biru' },

  // =========================================================================
  // 3. SEPATU (Shoes)
  // =========================================================================
  // Default Gratis:
  {
    id: 'sendal_jepit_coklat',
    name: 'Sendal Jepit',
    category: 'sepatu',
    price: 0,
    isDefault: true,
    color: '#78350f',
    gender: 'unisex',
    tag: 'Gratis Awal',
  },
  // Biasa:
  { id: 'sneakers_putih', name: 'Sneakers Putih', category: 'sepatu', price: 75, color: '#ffffff', gender: 'unisex' },
  { id: 'sneakers_hitam', name: 'Sneakers Hitam', category: 'sepatu', price: 75, color: '#18181b', gender: 'unisex' },
  { id: 'converse', name: 'Converse', category: 'sepatu', price: 85, color: '#b91c1c', secondaryColor: '#ffffff', gender: 'unisex' },
  { id: 'vans', name: 'Vans', category: 'sepatu', price: 90, color: '#09090b', secondaryColor: '#ffffff', gender: 'unisex' },
  { id: 'boots', name: 'Boots', category: 'sepatu', price: 110, color: '#451a03', gender: 'unisex' },
  { id: 'pantofel', name: 'Pantofel', category: 'sepatu', price: 95, color: '#0f172a', gender: 'unisex' },
  { id: 'sekolah_shoes', name: 'Sekolah', category: 'sepatu', price: 65, color: '#18181b', gender: 'unisex' },
  { id: 'olahraga_shoes', name: 'Olahraga', category: 'sepatu', price: 80, color: '#059669', gender: 'unisex' },
  { id: 'sepatu_roda', name: 'Sepatu Roda', category: 'sepatu', price: 130, color: '#f59e0b', gender: 'unisex' },
  { id: 'sendal_rumah_bulu', name: 'Sendal Rumah Bulu', category: 'sepatu', price: 70, color: '#fed7aa', gender: 'unisex' },
  { id: 'slide', name: 'Slide', category: 'sepatu', price: 60, color: '#334155', gender: 'unisex' },
  { id: 'heels', name: 'Heels', category: 'sepatu', price: 105, color: '#be123c', gender: 'cewek' },
  { id: 'flat_shoes', name: 'Flat Shoes', category: 'sepatu', price: 75, color: '#0284c7', gender: 'cewek' },

  // KOLEKSI PINK CEWE (Semua Pink):
  { id: 'sneakers_pink', name: 'Sneakers Pink', category: 'sepatu', price: 170, color: '#f472b6', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'sepatu_pink', name: 'Sepatu Pink', category: 'sepatu', price: 160, color: '#fbcfe8', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'sendal_bulu_pink', name: 'Sendal Bulu Pink', category: 'sepatu', price: 155, color: '#f9a8d4', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'heels_pink', name: 'Heels Pink', category: 'sepatu', price: 185, color: '#db2777', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'flat_shoes_pink', name: 'Flat Shoes Pink', category: 'sepatu', price: 165, color: '#f472b6', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'sepatu_roda_pink', name: 'Sepatu Roda Pink', category: 'sepatu', price: 210, color: '#ec4899', gender: 'cewek', tag: 'Koleksi Pink' },

  // KOLEKSI BIRU COWO (Semua Biru):
  { id: 'sneakers_biru', name: 'Sneakers Biru', category: 'sepatu', price: 170, color: '#2563eb', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'sneakers_biru_putih', name: 'Sneakers Biru Putih', category: 'sepatu', price: 180, color: '#38bdf8', secondaryColor: '#ffffff', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'converse_biru', name: 'Converse Biru', category: 'sepatu', price: 175, color: '#1e3a8a', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'vans_biru', name: 'Vans Biru', category: 'sepatu', price: 185, color: '#1d4ed8', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'olahraga_biru', name: 'Olahraga Biru', category: 'sepatu', price: 165, color: '#0284c7', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'slide_biru', name: 'Slide Biru', category: 'sepatu', price: 150, color: '#60a5fa', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'boots_biru', name: 'Boots Biru', category: 'sepatu', price: 200, color: '#0f172a', secondaryColor: '#2563eb', gender: 'cowok', tag: 'Koleksi Biru' },

  // =========================================================================
  // 4. AKSESORIS (Accessories)
  // =========================================================================
  { id: 'topi_baseball', name: 'Topi Baseball', category: 'aksesoris', price: 65, color: '#334155', gender: 'unisex' },
  { id: 'topi_bucket', name: 'Bucket', category: 'aksesoris', price: 70, color: '#d97706', gender: 'unisex' },
  { id: 'topi_pantai', name: 'Pantai Hat', category: 'aksesoris', price: 75, color: '#fef08a', gender: 'unisex' },
  { id: 'beanie', name: 'Beanie', category: 'aksesoris', price: 60, color: '#475569', gender: 'unisex' },
  { id: 'topi_ultah', name: 'Ulang Tahun', category: 'aksesoris', price: 50, color: '#ef4444', gender: 'unisex' },
  { id: 'topi_koki', name: 'Koki Hat', category: 'aksesoris', price: 70, color: '#ffffff', gender: 'unisex' },
  { id: 'topi_wisuda', name: 'Wisuda', category: 'aksesoris', price: 85, color: '#09090b', gender: 'unisex' },
  { id: 'bandana', name: 'Bandana', category: 'aksesoris', price: 55, color: '#dc2626', gender: 'unisex' },
  { id: 'bando', name: 'Bando', category: 'aksesoris', price: 50, color: '#a855f7', gender: 'cewek' },
  { id: 'pita', name: 'Pita', category: 'aksesoris', price: 50, color: '#f43f5e', gender: 'cewek' },
  { id: 'jepit_rambut', name: 'Jepit Rambut', category: 'aksesoris', price: 45, color: '#f59e0b', gender: 'cewek' },
  { id: 'mahkota', name: 'Mahkota', category: 'aksesoris', price: 150, color: '#facc15', gender: 'unisex' },
  { id: 'tiara', name: 'Tiara', category: 'aksesoris', price: 140, color: '#e0e7ff', gender: 'cewek' },
  { id: 'helm', name: 'Helm', category: 'aksesoris', price: 90, color: '#e11d48', gender: 'unisex' },
  { id: 'kacamata_bulat', name: 'Kacamata Bulat', category: 'aksesoris', price: 60, color: '#09090b', gender: 'unisex' },
  { id: 'kacamata_hitam', name: 'Kacamata Hitam', category: 'aksesoris', price: 75, color: '#09090b', gender: 'unisex' },
  { id: 'kacamata_hati', name: 'Kacamata Hati', category: 'aksesoris', price: 80, color: '#f43f5e', gender: 'cewek' },
  { id: 'kacamata_bintang', name: 'Kacamata Bintang', category: 'aksesoris', price: 80, color: '#facc15', gender: 'unisex' },
  { id: 'kacamata_renang', name: 'Kacamata Renang', category: 'aksesoris', price: 65, color: '#0ea5e9', gender: 'unisex' },
  { id: 'jam_tangan', name: 'Jam Tangan', category: 'aksesoris', price: 75, color: '#64748b', gender: 'unisex' },
  { id: 'jam_pink', name: 'Jam Pink', category: 'aksesoris', price: 85, color: '#f472b6', gender: 'cewek' },
  { id: 'jam_biru', name: 'Jam Biru', category: 'aksesoris', price: 85, color: '#38bdf8', gender: 'cowok' },
  { id: 'jam_sultan', name: 'Jam Sultan', category: 'aksesoris', price: 180, color: '#facc15', gender: 'unisex' },
  { id: 'gelang', name: 'Gelang', category: 'aksesoris', price: 50, color: '#f97316', gender: 'unisex' },
  { id: 'gelang_persahabatan', name: 'Gelang Persahabatan', category: 'aksesoris', price: 60, color: '#10b981', gender: 'unisex' },
  { id: 'gelang_couple', name: 'Gelang Couple', category: 'aksesoris', price: 90, color: '#ec4899', isCouple: true, gender: 'unisex' },
  { id: 'kalung', name: 'Kalung', category: 'aksesoris', price: 70, color: '#cbd5e1', gender: 'unisex' },
  { id: 'kalung_hati', name: 'Kalung Hati', category: 'aksesoris', price: 85, color: '#f43f5e', gender: 'cewek' },
  { id: 'kalung_bintang', name: 'Kalung Bintang', category: 'aksesoris', price: 85, color: '#facc15', gender: 'unisex' },
  { id: 'cincin', name: 'Cincin', category: 'aksesoris', price: 75, color: '#e2e8f0', gender: 'unisex' },
  { id: 'anting', name: 'Anting', category: 'aksesoris', price: 60, color: '#facc15', gender: 'cewek' },
  { id: 'sarung_tangan', name: 'Sarung Tangan', category: 'aksesoris', price: 55, color: '#475569', gender: 'unisex' },
  { id: 'tas_ransel', name: 'Tas Ransel', category: 'aksesoris', price: 85, color: '#2563eb', gender: 'unisex' },
  { id: 'tas_selempang', name: 'Tas Selempang', category: 'aksesoris', price: 80, color: '#7c3aed', gender: 'unisex' },
  { id: 'tas_tangan', name: 'Tas Tangan', category: 'aksesoris', price: 90, color: '#b45309', gender: 'cewek' },
  { id: 'dompet', name: 'Dompet', category: 'aksesoris', price: 50, color: '#78350f', gender: 'unisex' },
  { id: 'payung', name: 'Payung', category: 'aksesoris', price: 65, color: '#06b6d4', gender: 'unisex' },
  { id: 'kipas', name: 'Kipas', category: 'aksesoris', price: 50, color: '#ec4899', gender: 'cewek' },

  // KOLEKSI PINK CEWE AKSESORIS:
  { id: 'pita_pink_besar', name: 'Pita Pink Besar', category: 'aksesoris', price: 160, color: '#f43f5e', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'bando_pink', name: 'Bando Pink', category: 'aksesoris', price: 150, color: '#f472b6', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'jepit_rambut_pink', name: 'Jepit Rambut Pink', category: 'aksesoris', price: 145, color: '#f9a8d4', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'tas_ransel_pink', name: 'Tas Ransel Pink', category: 'aksesoris', price: 190, color: '#ec4899', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'tas_selempang_pink', name: 'Tas Selempang Pink', category: 'aksesoris', price: 180, color: '#f472b6', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'topi_bucket_pink', name: 'Topi Bucket Pink', category: 'aksesoris', price: 165, color: '#fbcfe8', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'beanie_pink', name: 'Beanie Pink', category: 'aksesoris', price: 155, color: '#f472b6', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'kacamata_hati_pink', name: 'Kacamata Hati Pink', category: 'aksesoris', price: 175, color: '#ec4899', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'jam_tangan_pink', name: 'Jam Tangan Pink', category: 'aksesoris', price: 170, color: '#f472b6', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'gelang_pink', name: 'Gelang Pink', category: 'aksesoris', price: 150, color: '#f9a8d4', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'kalung_hati_pink', name: 'Kalung Hati Pink', category: 'aksesoris', price: 180, color: '#f43f5e', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'payung_pink', name: 'Payung Pink', category: 'aksesoris', price: 160, color: '#fbcfe8', gender: 'cewek', tag: 'Koleksi Pink' },
  { id: 'kipas_pink', name: 'Kipas Pink', category: 'aksesoris', price: 150, color: '#f472b6', gender: 'cewek', tag: 'Koleksi Pink' },

  // KOLEKSI BIRU COWO AKSESORIS:
  { id: 'topi_baseball_biru', name: 'Topi Baseball Biru', category: 'aksesoris', price: 160, color: '#1e3a8a', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'bucket_biru', name: 'Bucket Biru', category: 'aksesoris', price: 165, color: '#2563eb', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'beanie_biru', name: 'Beanie Biru', category: 'aksesoris', price: 155, color: '#1d4ed8', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'tas_ransel_biru', name: 'Tas Ransel Biru', category: 'aksesoris', price: 190, color: '#1e40af', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'tas_selempang_biru', name: 'Tas Selempang Biru', category: 'aksesoris', price: 180, color: '#3b82f6', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'jam_tangan_biru', name: 'Jam Tangan Biru', category: 'aksesoris', price: 170, color: '#1e3a8a', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'jam_digital_biru', name: 'Jam Digital Biru', category: 'aksesoris', price: 175, color: '#0284c7', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'gelang_biru', name: 'Gelang Biru', category: 'aksesoris', price: 150, color: '#38bdf8', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'kalung_bintang_biru', name: 'Kalung Bintang Biru', category: 'aksesoris', price: 180, color: '#2563eb', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'kacamata_bulat_biru', name: 'Kacamata Bulat Biru', category: 'aksesoris', price: 170, color: '#1e40af', gender: 'cowok', tag: 'Koleksi Biru' },
  { id: 'payung_biru', name: 'Payung Biru', category: 'aksesoris', price: 160, color: '#38bdf8', gender: 'cowok', tag: 'Koleksi Biru' },

  // =========================================================================
  // 5. DRESS & SETELAN (Dresses, Sets, Couple & Sultan)
  // =========================================================================
  // Dress Cewe Pink:
  { id: 'dress_pink_pastel', name: 'Dress Pink Pastel', category: 'dress_setelan', price: 280, color: '#fbcfe8', gender: 'cewek', tag: 'Dress Pink' },
  { id: 'dress_princess', name: 'Dress Princess', category: 'dress_setelan', price: 380, color: '#f472b6', secondaryColor: '#fef08a', gender: 'cewek', tag: 'Dress Pink' },
  { id: 'dress_pesta_pita', name: 'Dress Pesta (Pita + Sparkle)', category: 'dress_setelan', price: 420, color: '#ec4899', isSultan: true, gender: 'cewek', tag: 'Dress Mewah' },
  { id: 'dress_pantai_pink', name: 'Dress Pantai Pink', category: 'dress_setelan', price: 260, color: '#f9a8d4', gender: 'cewek', tag: 'Dress Pink' },
  { id: 'dress_hello_kitty', name: 'Dress Hello Kitty', category: 'dress_setelan', price: 320, color: '#ffffff', secondaryColor: '#f43f5e', gender: 'cewek', tag: 'Dress Lucu' },
  { id: 'dress_strawberry', name: 'Dress Strawberry', category: 'dress_setelan', price: 310, color: '#fb7185', secondaryColor: '#22c55e', gender: 'cewek', tag: 'Dress Lucu' },
  { id: 'dress_bunga', name: 'Dress Bunga', category: 'dress_setelan', price: 290, color: '#fed7aa', secondaryColor: '#f472b6', gender: 'cewek', tag: 'Dress Manis' },

  // Setelan Pink Cewe (300-500 Koin):
  { id: 'setelan_pink_gemoy', name: 'Setelan Pink Gemoy', category: 'dress_setelan', price: 350, color: '#f472b6', gender: 'cewek', tag: 'Setelan Pink' },
  { id: 'setelan_princess', name: 'Setelan Princess', category: 'dress_setelan', price: 450, color: '#fbcfe8', secondaryColor: '#facc15', isSultan: true, gender: 'cewek', tag: 'Setelan Mewah' },
  { id: 'setelan_piyama_pink', name: 'Setelan Piyama Pink', category: 'dress_setelan', price: 310, color: '#fce7f3', gender: 'cewek', tag: 'Setelan Pink' },
  { id: 'setelan_olahraga_pink', name: 'Setelan Olahraga Pink', category: 'dress_setelan', price: 330, color: '#ec4899', gender: 'cewek', tag: 'Setelan Pink' },
  { id: 'setelan_sekolah_pink', name: 'Setelan Sekolah Pink', category: 'dress_setelan', price: 340, color: '#ffffff', secondaryColor: '#f472b6', gender: 'cewek', tag: 'Setelan Pink' },

  // Setelan Biru Cowo (300-500 Koin):
  { id: 'setelan_biru_keren', name: 'Setelan Biru Keren', category: 'dress_setelan', price: 350, color: '#2563eb', gender: 'cowok', tag: 'Setelan Biru' },
  { id: 'setelan_piyama_biru', name: 'Setelan Piyama Biru', category: 'dress_setelan', price: 310, color: '#93c5fd', gender: 'cowok', tag: 'Setelan Biru' },
  { id: 'setelan_olahraga_biru', name: 'Setelan Olahraga Biru', category: 'dress_setelan', price: 330, color: '#1d4ed8', gender: 'cowok', tag: 'Setelan Biru' },
  { id: 'setelan_sekolah_biru', name: 'Setelan Sekolah Biru', category: 'dress_setelan', price: 340, color: '#ffffff', secondaryColor: '#1e3a8a', gender: 'cowok', tag: 'Setelan Biru' },
  { id: 'setelan_gaming_biru', name: 'Setelan Gaming Biru', category: 'dress_setelan', price: 380, color: '#0f172a', secondaryColor: '#38bdf8', gender: 'cowok', tag: 'Setelan Biru' },

  // OUTFIT COUPLE:
  { id: 'hoodie_couple_pink_biru', name: 'Hoodie Couple Pink+Biru', category: 'dress_setelan', price: 390, color: '#f472b6', secondaryColor: '#38bdf8', isCouple: true, gender: 'unisex', tag: 'Couple Gemoy 💕' },
  { id: 'kaos_couple', name: 'Kaos Couple', category: 'dress_setelan', price: 320, color: '#ffffff', secondaryColor: '#f43f5e', isCouple: true, gender: 'unisex', tag: 'Couple Gemoy 💕' },
  { id: 'piyama_couple', name: 'Piyama Couple', category: 'dress_setelan', price: 340, color: '#e0e7ff', isCouple: true, gender: 'unisex', tag: 'Couple Gemoy 💕' },
  { id: 'jaket_couple', name: 'Jaket Couple', category: 'dress_setelan', price: 420, color: '#1e293b', secondaryColor: '#ec4899', isCouple: true, gender: 'unisex', tag: 'Couple Gemoy 💕' },

  // OUTFIT SULTAN (500 Koin + Efek Sparkle Emas):
  { id: 'setelan_sultan_emas', name: 'Setelan Sultan Emas', category: 'dress_setelan', price: 500, color: '#facc15', secondaryColor: '#ca8a04', isSultan: true, gender: 'unisex', tag: 'Sultan Mewah ✨' },
  { id: 'dress_princess_pink_sultan', name: 'Dress Princess Pink', category: 'dress_setelan', price: 500, color: '#f472b6', secondaryColor: '#facc15', isSultan: true, gender: 'cewek', tag: 'Sultan Mewah ✨' },
  { id: 'setelan_kpop_idol_biru', name: 'Setelan K-Pop Idol Biru', category: 'dress_setelan', price: 500, color: '#2563eb', secondaryColor: '#facc15', isSultan: true, gender: 'cowok', tag: 'Sultan Mewah ✨' },
  { id: 'setelan_youtuber', name: 'Setelan Youtuber', category: 'dress_setelan', price: 500, color: '#dc2626', secondaryColor: '#facc15', isSultan: true, gender: 'unisex', tag: 'Sultan Mewah ✨' },

  // =========================================================================
  // 6. RAMBUT (8 Model Cowo + 8 Model Cewe, semua 3D & unik!)
  // =========================================================================
  // --- 8 RAMBUT COWO ---
  { id: 'cowo_two_block', name: 'Two Block', category: 'rambut', price: 0, isDefault: true, color: '#18181b', gender: 'cowok', tag: 'Cowo • Default' },
  { id: 'cowo_mullet', name: 'Mullet', category: 'rambut', price: 0, color: '#18181b', gender: 'cowok', tag: 'Cowo • Belakang Panjang' },
  { id: 'cowo_comma', name: 'Comma Hair', category: 'rambut', price: 0, color: '#18181b', gender: 'cowok', tag: 'Cowo • Poni Koma' },
  { id: 'cowo_taper_fade', name: 'Taper Fade', category: 'rambut', price: 0, color: '#18181b', gender: 'cowok', tag: 'Cowo • Fade Halus' },
  { id: 'cowo_french_crop', name: 'French Crop', category: 'rambut', price: 0, color: '#18181b', gender: 'cowok', tag: 'Cowo • Poni Lurus' },
  { id: 'cowo_curtain', name: 'Curtain Hair', category: 'rambut', price: 0, color: '#18181b', gender: 'cowok', tag: 'Cowo • Belah Tengah' },
  { id: 'cowo_low_fade', name: 'Low Fade', category: 'rambut', price: 0, color: '#18181b', gender: 'cowok', tag: 'Cowo • Fade Bawah' },
  { id: 'cowo_perm', name: 'Perm / Wavy Two Block', category: 'rambut', price: 0, color: '#18181b', gender: 'cowok', tag: 'Cowo • Ikal Volume' },

  // --- 8 RAMBUT CEWE ---
  { id: 'cewe_long_hair', name: 'Long Hair', category: 'rambut', price: 0, isDefault: true, color: '#18181b', gender: 'cewek', tag: 'Cewe • Default' },
  { id: 'cewe_wolf_cut', name: 'Wolf Cut Long', category: 'rambut', price: 0, color: '#18181b', gender: 'cewek', tag: 'Cewe • Layer Shaggy' },
  { id: 'cewe_curtain_bangs', name: 'Curtain Bangs', category: 'rambut', price: 0, color: '#18181b', gender: 'cewek', tag: 'Cewe • Poni Gorden' },
  { id: 'cewe_side_part', name: 'Side Part', category: 'rambut', price: 0, color: '#18181b', gender: 'cewek', tag: 'Cewe • Belah Samping' },
  { id: 'cewe_long_layers', name: 'Long Layers', category: 'rambut', price: 0, color: '#18181b', gender: 'cewek', tag: 'Cewe • Layer Bertingkat' },
  { id: 'cewe_butterfly_cut', name: 'Butterfly Cut', category: 'rambut', price: 0, color: '#18181b', gender: 'cewek', tag: 'Cewe • Sayap Kupu-kupu' },
  { id: 'cewe_hush_cut', name: 'Hush Cut', category: 'rambut', price: 0, color: '#18181b', gender: 'cewek', tag: 'Cewe • Poni Tipis Kalem' },
  { id: 'cewe_curtain_hair', name: 'Curtain Hair (Cewe)', category: 'rambut', price: 0, color: '#18181b', gender: 'cewek', tag: 'Cewe • Gorden Tebal' },

  // =========================================================================
  // 7. MUKA (13 Ekspresi Wajah Interaktif — Mata + Alis + Mulut + Pipi)
  // =========================================================================
  { id: 'muka_senyum', name: 'Senyum Biasa', category: 'muka', price: 0, isDefault: true, color: '#f43f5e', tag: 'Default' },
  { id: 'muka_senyum_lebar', name: 'Senyum Lebar', category: 'muka', price: 0, color: '#fb7185', tag: 'Gigi Keliatan 😁' },
  { id: 'muka_ketawa', name: 'Ketawa Ngakak', category: 'muka', price: 0, color: '#f97316', tag: 'Ceria 😂' },
  { id: 'muka_kedip_satu', name: 'Kedip 1 Mata', category: 'muka', price: 0, color: '#ec4899', tag: 'Wink 😉' },
  { id: 'muka_berbinar', name: 'Mata Berbinar', category: 'muka', price: 0, color: '#eab308', tag: 'Bintang ✨' },
  { id: 'muka_malu', name: 'Malu Merona', category: 'muka', price: 0, color: '#f472b6', tag: 'Pipi Merah 😳' },
  { id: 'muka_kaget', name: 'Kaget Mulut O', category: 'muka', price: 0, color: '#38bdf8', tag: 'Kaget 😮' },
  { id: 'muka_sedih', name: 'Sedih', category: 'muka', price: 0, color: '#0284c7', tag: 'Murung 🥺' },
  { id: 'muka_ngantuk', name: 'Ngantuk', category: 'muka', price: 0, color: '#64748b', tag: 'Mengantuk 😴' },
  { id: 'muka_love', name: 'Mata Love', category: 'muka', price: 0, color: '#e11d48', tag: 'Jatuh Cinta 😍' },
  { id: 'muka_nangis', name: 'Nangis Lucu', category: 'muka', price: 0, color: '#0ea5e9', tag: 'Air Mata 😭' },
  { id: 'muka_marah', name: 'Marah Cemberut', category: 'muka', price: 0, color: '#dc2626', tag: 'Gemes 😠' },
  { id: 'muka_lirik', name: 'Lirik Kiri Kanan', category: 'muka', price: 0, color: '#7c3aed', tag: 'Melirik 👀' },

  // =========================================================================
  // 8. WARNA KULIT (Skin Tones - Mulus Halus)
  // =========================================================================
  { id: 'kulit_putih_cerah', name: 'Putih Cerah', category: 'kulit', price: 0, isDefault: true, color: '#fff0ea', tag: 'Default' },
  { id: 'kulit_kuning_langsat', name: 'Kuning Langsat', category: 'kulit', price: 0, color: '#ffe0b2' },
  { id: 'kulit_sawo_matang', name: 'Sawo Matang', category: 'kulit', price: 0, color: '#e0a96d' },
  { id: 'kulit_warm_tan', name: 'Warm Tan', category: 'kulit', price: 0, color: '#c68642' },
  { id: 'kulit_pastel_peach', name: 'Pastel Peach', category: 'kulit', price: 0, color: '#ffd1b3' },
];
