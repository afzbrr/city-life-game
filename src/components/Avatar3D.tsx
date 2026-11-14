import React from 'react';
import AvatarManusia, { AvatarManusiaProps } from './AvatarManusia';

export type Avatar3DProps = AvatarManusiaProps;

/**
 * <Avatar3D /> - Renders the 100% Smooth Cartoon Human Avatar (<AvatarManusia />)
 */
export default function Avatar3D(props: Avatar3DProps) {
  return <AvatarManusia {...props} />;
}

export { default as AvatarManusia } from './AvatarManusia';
