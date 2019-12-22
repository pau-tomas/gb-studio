export const id = "EVENT_PLAYER_SET_SPRITE";

export const fields = [
  {
    label: "Actors sharing a sprite will also change!",
    key: "actorId",
    type: "actor",
    defaultValue: "player",
    postUpdate: (args) => {
      return {
        ...args,
        spriteSheetId: args.actorId
      }
    }
  },
  {
    label: "Sprite Animation, Keep equal or less length!",
    key: "spriteSheetId",
    type: "sprite",
    filter: {
      for: "actor",
      id: "actorId"
    },
    defaultValue: "LAST_SPRITE"
  }
];

export const compile = (input, helpers) => {
  const { playerSetSprite, actorSetActive} = helpers;
  actorSetActive(input.actorId);
  playerSetSprite(input.spriteSheetId);
};
