import React from 'react';
import AvatarManusia, { AvatarManusiaProps } from './AvatarManusia';

export type AvatarUGCProps = AvatarManusiaProps;

/**
 * Re-routes <AvatarUGC /> to the new Cartoon Human 3D Engine (<AvatarManusia />)
 */
export default function AvatarUGC(props: AvatarUGCProps) {
  return <AvatarManusia {...props} />;
}
