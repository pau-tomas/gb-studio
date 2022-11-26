import { l10n } from "renderer/lib/api";
import type { SpriteAnimationType } from "renderer/project/store/features/entities/entitiesTypes";
import {
  AnimationType,
  filterAnimationsBySpriteType,
} from "shared/lib/sprites/helpers";

export const animationNameLookup: Record<AnimationType, string> = {
  idle: l10n("FIELD_IDLE"),
  moving: l10n("FIELD_MOVING"),
  idleLeft: l10n("FIELD_IDLE_DIR", { direction: l10n("FIELD_DIRECTION_LEFT") }),
  idleRight: l10n("FIELD_IDLE_DIR", {
    direction: l10n("FIELD_DIRECTION_RIGHT"),
  }),
  idleUp: l10n("FIELD_IDLE_DIR", { direction: l10n("FIELD_DIRECTION_UP") }),
  idleDown: l10n("FIELD_IDLE_DIR", { direction: l10n("FIELD_DIRECTION_DOWN") }),
  movingLeft: l10n("FIELD_MOVING_DIR", {
    direction: l10n("FIELD_DIRECTION_LEFT"),
  }),
  movingRight: l10n("FIELD_MOVING_DIR", {
    direction: l10n("FIELD_DIRECTION_RIGHT"),
  }),
  movingUp: l10n("FIELD_MOVING_DIR", { direction: l10n("FIELD_DIRECTION_UP") }),
  movingDown: l10n("FIELD_MOVING_DIR", {
    direction: l10n("FIELD_DIRECTION_DOWN"),
  }),
  jumpingLeft: l10n("FIELD_JUMPING_DIR", {
    direction: l10n("FIELD_DIRECTION_LEFT"),
  }),
  jumpingRight: l10n("FIELD_JUMPING_DIR", {
    direction: l10n("FIELD_DIRECTION_RIGHT"),
  }),
  climbing: l10n("FIELD_CLIMBING"),
  hover: l10n("FIELD_HOVER"),
};

const animationNames = [
  l10n("FIELD_IDLE_DIR", { direction: l10n("FIELD_DIRECTION_RIGHT") }),
  l10n("FIELD_IDLE_DIR", { direction: l10n("FIELD_DIRECTION_LEFT") }),
  l10n("FIELD_IDLE_DIR", { direction: l10n("FIELD_DIRECTION_UP") }),
  l10n("FIELD_IDLE_DIR", { direction: l10n("FIELD_DIRECTION_DOWN") }),
  l10n("FIELD_MOVING_DIR", { direction: l10n("FIELD_DIRECTION_RIGHT") }),
  l10n("FIELD_MOVING_DIR", { direction: l10n("FIELD_DIRECTION_LEFT") }),
  l10n("FIELD_MOVING_DIR", { direction: l10n("FIELD_DIRECTION_UP") }),
  l10n("FIELD_MOVING_DIR", { direction: l10n("FIELD_DIRECTION_DOWN") }),
];

const multiAnimationNames = [
  l10n("FIELD_DIRECTION_RIGHT"),
  l10n("FIELD_DIRECTION_LEFT"),
  l10n("FIELD_DIRECTION_UP"),
  l10n("FIELD_DIRECTION_DOWN"),
];

const fixedAnimationNames = [l10n("FIELD_IDLE"), l10n("FIELD_MOVING")];

const platformAnimationNames = [
  l10n("FIELD_IDLE_DIR", { direction: l10n("FIELD_DIRECTION_RIGHT") }),
  l10n("FIELD_IDLE_DIR", { direction: l10n("FIELD_DIRECTION_LEFT") }),
  l10n("FIELD_JUMPING_DIR", { direction: l10n("FIELD_DIRECTION_RIGHT") }),
  l10n("FIELD_JUMPING_DIR", { direction: l10n("FIELD_DIRECTION_LEFT") }),
  l10n("FIELD_MOVING_DIR", { direction: l10n("FIELD_DIRECTION_RIGHT") }),
  l10n("FIELD_MOVING_DIR", { direction: l10n("FIELD_DIRECTION_LEFT") }),
  l10n("FIELD_CLIMBING"),
];

export const getAnimationNameForType = (type: AnimationType) => {
  return animationNameLookup[type];
};

export const getAnimationNameByIndex = (
  type: SpriteAnimationType,
  flipLeft: boolean,
  animationIndex: number
) => {
  if (type === "fixed" || type === "fixed_movement") {
    return fixedAnimationNames[animationIndex];
  }
  if (type === "platform_player") {
    return filterAnimationsBySpriteType(platformAnimationNames, type, flipLeft)[
      animationIndex
    ];
  }
  if (type === "multi") {
    return filterAnimationsBySpriteType(multiAnimationNames, type, flipLeft)[
      animationIndex
    ];
  }
  return filterAnimationsBySpriteType(animationNames, type, flipLeft)[
    animationIndex
  ];
};

export const getAnimationNameById = (
  type: SpriteAnimationType,
  flipLeft: boolean,
  selectedId: string,
  animationIds: string[]
) => {
  const filteredIds =
    filterAnimationsBySpriteType(animationIds, type, flipLeft) || [];
  const animationIndex = filteredIds.indexOf(selectedId);
  return getAnimationNameByIndex(type, flipLeft, animationIndex);
};
