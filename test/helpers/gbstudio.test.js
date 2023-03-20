import { spriteTypeFromNumFrames } from "../../src/lib/helpers/gbstudio";

test("Should be able to find sprite type from number of frames in sprite", () => {
  expect(spriteTypeFromNumFrames(6)).toBe("actor_animated");
  expect(spriteTypeFromNumFrames(3)).toBe("actor");
  expect(spriteTypeFromNumFrames(1)).toBe("static");
  expect(spriteTypeFromNumFrames(2)).toBe("animated");
  expect(spriteTypeFromNumFrames(4)).toBe("animated");
  expect(spriteTypeFromNumFrames(7)).toBe("animated");
});
