/**
 * @jest-environment jsdom
 */

import { mocked } from "ts-jest/utils";
import actions from "renderer/project/store/features/music/musicActions";
import navigationActions from "renderer/project/store/features/navigation/navigationActions";
import { RootState } from "renderer/project/store/configureStore";
import { dummyBackground, dummyMusic } from "../../../dummydata";
import { MiddlewareAPI, Dispatch, AnyAction } from "@reduxjs/toolkit";
import ScripTracker from "renderer/lib/vendor/scriptracker/scriptracker";

jest.mock("../../../../src/lib/vendor/scriptracker/scriptracker");
const mockedScripTracker = mocked(ScripTracker, true);

beforeEach(() => {
  jest.resetModules();
});

test("Should trigger call to play music", async () => {
  const musicModule = await import(
    "renderer/project/store/features/music/musicMiddleware"
  );
  const middleware = musicModule.default;

  mockedScripTracker.mockClear();

  const modPlayer = musicModule.initMusic();

  const loadSpy = jest.spyOn(modPlayer, "loadModule");

  const store = {
    getState: () => ({
      document: {
        root: "/root/path/",
      },
      music: {
        backgrounds: {},
      },
      project: {
        present: {
          entities: {
            music: {
              entities: {
                track1: {
                  ...dummyMusic,
                  id: "track1",
                  filename: "track1.mod",
                },
              },
              ids: ["track1"],
            },
            backgrounds: {
              entities: {
                bg1: {
                  ...dummyBackground,
                  id: "bg1",
                },
              },
              ids: ["bg1"],
            },
          },
        },
      },
    }),
    dispatch: jest.fn(),
  } as unknown as MiddlewareAPI<Dispatch<AnyAction>, RootState>;

  const next = jest.fn();
  const action = actions.playMusic({ musicId: "track1" });

  middleware(store)(next)(action);

  expect(loadSpy).toBeCalledWith(
    "file:///root/path/assets/music/track1.mod",
    false
  );
});

test("Should trigger a call to pause music", async () => {
  const musicModule = await import(
    "renderer/project/store/features/music/musicMiddleware"
  );
  const middleware = musicModule.default;

  mockedScripTracker.mockClear();

  const modPlayer = musicModule.initMusic();

  Object.defineProperty(modPlayer, "isPlaying", {
    get: jest.fn(() => true),
    set: jest.fn(),
  });

  const stopSpy = jest.spyOn(modPlayer, "stop");

  const store = {
    getState: () => ({
      document: {
        root: "/root/path/",
      },
      music: {
        backgrounds: {},
      },
      project: {
        present: {
          entities: {
            backgrounds: {
              entities: {
                bg1: {
                  ...dummyBackground,
                  id: "bg1",
                },
              },
              ids: ["bg1"],
            },
          },
        },
      },
    }),
    dispatch: jest.fn(),
  } as unknown as MiddlewareAPI<Dispatch<AnyAction>, RootState>;

  const next = jest.fn();
  const action = actions.pauseMusic();

  middleware(store)(next)(action);

  expect(stopSpy).toBeCalledWith();
});

test("Should pause music when switching section", async () => {
  const musicModule = await import(
    "renderer/project/store/features/music/musicMiddleware"
  );
  const middleware = musicModule.default;

  const store = {
    getState: () => ({
      editor: {
        section: "world",
      },
    }),
    dispatch: jest.fn(),
  } as unknown as MiddlewareAPI<Dispatch<AnyAction>, RootState>;

  const next = jest.fn();
  const action = navigationActions.setSection("build");

  middleware(store)(next)(action);

  expect(store.dispatch).toBeCalledWith(actions.pauseMusic());
});
