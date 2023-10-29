import "jest-extended";
import middleware from "renderer/project/store/features/clipboard/clipboardMiddleware";
import actions from "renderer/project/store/features/clipboard/clipboardActions";
import { RootState } from "renderer/project/store/configureStore";
import { dummyActor } from "../../../dummydata";
import { MiddlewareAPI, Dispatch, AnyAction } from "@reduxjs/toolkit";
import { mocked } from "ts-jest/utils";
import { ClipboardTypeActors } from "renderer/project/store/features/clipboard/clipboardTypes";
import { remote } from "../../../__mocks__/electronMock";

jest.mock("electron");

const mockedRemote = mocked(remote, true);
const mockedClipboard = mockedRemote.clipboard;

test("Should be able to copy actor to clipboard", async () => {
  mockedClipboard.writeBuffer.mockClear();

  const store = {
    getState: () => ({
      project: {
        present: {
          entities: {
            actors: {
              entities: {
                [dummyActor.id]: dummyActor,
              },
              ids: [dummyActor.id],
            },
            customEvents: {
              entities: {},
              ids: [],
            },
            variables: {
              entities: {},
              ids: [],
            },
            scriptEvents: {
              entities: {},
              ids: [],
            },
          },
        },
      },
    }),
    dispatch: jest.fn(),
  } as unknown as MiddlewareAPI<Dispatch<AnyAction>, RootState>;

  const next = jest.fn();
  const action = actions.copyActors({
    actorIds: [dummyActor.id],
  });

  middleware(store)(next)(action);

  expect(next).toHaveBeenCalledWith(action);
  expect(mockedClipboard.writeBuffer).toHaveBeenCalledWith(
    ClipboardTypeActors,
    Buffer.from(
      JSON.stringify({
        actors: [dummyActor],
        customEvents: [],
        variables: [],
        scriptEvents: [],
      }),
      "utf8"
    )
  );
});

test("Should include referenced variables when copying actor", async () => {
  mockedClipboard.writeBuffer.mockClear();

  const store = {
    getState: () => ({
      project: {
        present: {
          entities: {
            actors: {
              entities: {
                [dummyActor.id]: dummyActor,
              },
              ids: [dummyActor.id],
            },
            customEvents: {
              entities: {},
              ids: [],
            },
            variables: {
              entities: {
                [`${dummyActor.id}_L0`]: {
                  id: `${dummyActor.id}_L0`,
                  name: "Actor Local",
                },
                // eslint-disable-next-line camelcase
                actor2_L0: {
                  id: "actor2_L0",
                  name: "Actor Local",
                },
              },
              ids: [`${dummyActor.id}_L0`, "actor2_L0"],
            },
            scriptEvents: {
              entities: {},
              ids: [],
            },
          },
        },
      },
    }),
    dispatch: jest.fn(),
  } as unknown as MiddlewareAPI<Dispatch<AnyAction>, RootState>;

  const next = jest.fn();
  const action = actions.copyActors({
    actorIds: [dummyActor.id],
  });

  middleware(store)(next)(action);

  expect(next).toHaveBeenCalledWith(action);
  expect(mockedClipboard.writeBuffer).toHaveBeenCalledWith(
    ClipboardTypeActors,
    Buffer.from(
      JSON.stringify({
        actors: [dummyActor],
        customEvents: [],
        variables: [
          {
            id: `${dummyActor.id}_L0`,
            name: "Actor Local",
          },
        ],
        scriptEvents: [],
      }),
      "utf8"
    )
  );
});
