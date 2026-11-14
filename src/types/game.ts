export type Gender = 'cewek' | 'cowok';

export type ScreenState = 'splash' | 'avatar_creator' | 'pet_selector' | 'game';

export type MainTab = 'rumah' | 'kota' | 'sekolah' | 'toko' | 'profil';

export type CityLocation = 'taman' | 'pantai' | 'cafe' | 'bioskop' | 'pasar_malam' | 'aquarium';

export interface TelegramUser {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export interface AvatarState {
  name: string;
  gender: Gender;
  skinColor: string; // 'putih' | 'kuning_langsat' | 'sawo_matang' | 'coklat_muda' | 'coklat_gelap'
  faceShape: string; // 'bulat' | 'oval' | 'tirus'
  eyeType: string; // 'gemoy' | 'sipit' | 'bintang' | 'hati'
  eyeColor: string; // 'hitam' | 'coklat' | 'biru' | 'hijau' | 'pink'
  hairStyle: string; // 'ponytail' | 'kepang2' | 'bob' | 'panjang' | 'wolf_cut' | 'twoblock' | 'messy' | 'pendek' | 'mohawk'
  hairColor: string;
  eyebrows: string; // 'tipis' | 'tebal' | 'naik'
  mouth: string; // 'senyum' | 'kucing_w' | 'tertawa' | 'malu'
  blush: string; // 'pink' | 'freckles' | 'none'
  height: 'pendek' | 'normal' | 'tinggi';
  outfitId: string;
  outfitName: string;
  outfitType: 'pink_cewe' | 'biru_cowo' | 'couple' | 'sultan' | 'basic';
  accessoryId: string;
  shoesId: string;
}

export type PetType = 'kucing' | 'hiu' | 'kelinci' | 'ayam';

export interface PetState {
  id: string;
  name: string;
  type: PetType;
  level: number;
  xp: number;
  favoriteFood: string;
  hunger: number; // 0-100
  happiness: number; // 0-100
  energy: number; // 0-100
  hygiene: number; // 0-100
  love: number; // 0-100
  accessory?: string;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: 'kamar' | 'ruang_tamu' | 'dapur' | 'kamar_mandi' | 'elektronik' | 'cat';
  emoji: string;
  price: number;
  x: number;
  y: number;
  room: 'kamar' | 'ruang_tamu' | 'dapur';
  rotation: number; // 0, 90, 180, 270
}

export interface ChatMessage {
  id: string;
  channelId?: string; // 'room' or friendId
  senderName: string;
  senderAvatar: AvatarState;
  text: string;
  time: string;
  isOwner?: boolean;
  reactions: { [emoji: string]: number };
  myReaction?: string;
  replyTo?: { id?: string; senderName: string; text: string };
  isMe: boolean;
  deleted?: boolean;
  deletedForEveryone?: boolean;
  read?: boolean;
}

export interface FriendEntry {
  id: string;
  name: string;
  username: string;
  avatar: AvatarState;
  status: 'online' | 'playing' | 'offline';
  worldId?: 'taman' | 'pantai' | 'cafe' | 'aquarium' | 'pasar_malam';
  worldTitle?: string;
  activity?: string;
  lastSeen?: string;
}

export interface FriendRequest {
  id: string;
  name: string;
  username: string;
  avatar: AvatarState;
  mutualFriends: number;
  note?: string;
}

export interface SchoolState {
  grade: 'TK' | 'SD' | 'SMP' | 'SMA' | 'Kuliah';
  studyPoints: number;
  lastExamScore: number;
  jobTitle?: string;
  salary: number;
}
