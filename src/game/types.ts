export type Gender = 'cewek' | 'cowok';

export type GameWorldLocation = 'taman' | 'pantai' | 'cafe' | 'aquarium' | 'pasar_malam';
export type GameLocation = GameWorldLocation | 'rumah';

export type AvatarAnimState = 'idle' | 'walk' | 'sit' | 'sleep' | 'wave' | 'dance' | 'eat' | 'swim';

export type SitPoseMode = 'bench' | 'cafe_cup' | 'swing' | 'ferris' | 'carousel' | 'bumper' | 'sand';

export interface SitPoseConfig {
  mode: SitPoseMode;
  seatRelY: number; // Height of seat top above floor/foot support plane
  swingPhase?: number; // Current pendulum angle for swing leg/torso inertia
  steerAngle?: number; // Steering input for bumper car
}

export interface HeldFoodItem {
  id: string;
  name: string;
  icon: string;
  remainingPercent: number; // 100 -> 75 -> 50 -> 25 -> 0
  actionType: 'makan' | 'minum';
}

export type CharacterType = 'cewe_anak' | 'cewe_dewasa' | 'cowo_anak' | 'cowo_dewasa';
export type AgeGroup = 'anak' | 'dewasa';

export type FaceExpression =
  | 'senyum'
  | 'senyum_lebar'
  | 'ketawa'
  | 'kedip_satu'
  | 'berbinar'
  | 'malu'
  | 'kaget'
  | 'sedih'
  | 'ngantuk'
  | 'love'
  | 'nangis'
  | 'marah'
  | 'lirik'
  | 'cool';

export interface AvatarConfig {
  gender: Gender;
  characterType?: CharacterType;
  ageGroup: AgeGroup;
  skinColor: string;
  hairStyle: string;
  hairColor: string;
  top: string;
  bottom: string;
  shoes: string;
  hat: string;
  glasses: string;
  accessory: string;
  activeAccessories?: string[];
  outfitId?: string;
  shirtColor?: string;
  pantsColor?: string;
  shoesColor?: string;
  accessoryId?: string;
  heldItem?: string;
  faceExpression?: FaceExpression;
  isSultan?: boolean;
  isCouple?: boolean;
  dressOrSetelan?: string;
}

export interface WardrobeOption {
  id: string;
  name: string;
  type: 'skin' | 'hairStyle' | 'hairColor' | 'top' | 'bottom' | 'shoes' | 'hat' | 'glasses' | 'accessory';
  gender?: Gender;
  color?: string;
  price: number;
  isFree: boolean;
  icon: string;
}

export interface InteractionTarget {
  id: string;
  name: string;
  prompt: string;
  icon: string;
  actionType: 'sleep' | 'sit' | 'tv' | 'icecream' | 'fountain' | 'pet' | 'sunbathe';
  x: number;
  z: number;
  radius: number;
  data?: Record<string, unknown>;
}
