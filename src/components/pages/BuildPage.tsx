import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { Button } from "ui/buttons/Button";
import l10n from "lib/helpers/l10n";
import editorActions from "store/features/editor/editorActions";
import consoleActions from "store/features/console/consoleActions";
import buildGameActions from "store/features/buildGame/buildGameActions";
import { FixedSpacer, FlexGrow } from "ui/spacing/Spacing";
import { RootState } from "store/configureStore";
import { ipcRenderer } from "electron";
import { NextIcon, PauseIcon, PlayIcon } from "ui/icons/Icons";
import ScriptEditor from "components/script/ScriptEditor";
import { ScriptEventParentType } from "store/features/entities/entitiesTypes";
import { ScriptMapItem } from "store/features/debugger/debuggerState";

const PIN_TO_BOTTOM_RANGE = 100;

const Wrapper = styled.div`
  width: 100%;
  height: calc(100vh - 38px);
  display: flex;
  flex-direction: column;
`;

const VerticalWrapper = styled.div`
  width: 100%;
  height: calc(100vh - 38px);
  display: flex;
  flex-direction: row;
`;

const Terminal = styled.div`
  flex-grow: 1;
  background: #111;
  color: #fff;
  padding: 20px;
  font-family: monospace;
  white-space: pre-wrap;
  overflow: auto;
  user-select: text;
`;

const Debugger = styled.div`
  display: flex;
  flex-direction: column;
  background: #111;
  color: #fff;
  padding: 20px;
  font-family: monospace;
  white-space: pre-wrap;
  overflow: auto;
  user-select: text;
`;

const DebuggerRow = styled.div`
  display: flex;
  flex-direction: row;
`;
const DebuggerColumn = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 300px;
  min-width: 300px;
`;

const ButtonToolbar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20px;

  > * {
    height: 36px;
    line-height: 36px;
  }

  > * ~ * {
    margin-left: 10px;
  }
`;

const BuildPage = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const output = useSelector((state: RootState) => state.console.output);
  const warnings = useSelector((state: RootState) => state.console.warnings);
  const status = useSelector((state: RootState) => state.console.status);
  const profile = useSelector((state: RootState) => state.editor.profile);

  // Only show the latest 500 lines during build
  // show full output on complete
  const outputLines = status === "complete" ? output : output.slice(-500);

  const onBuild = useCallback(
    (type: "rom" | "web") => {
      dispatch(
        buildGameActions.buildGame({
          buildType: type,
          exportBuild: true,
        })
      );
    },
    [dispatch]
  );

  const onDeleteCache = useCallback(() => {
    dispatch(buildGameActions.deleteBuildCache());
  }, [dispatch]);

  const onRun = useCallback(() => {
    dispatch(buildGameActions.buildGame());
  }, [dispatch]);

  const onClear = useCallback(() => {
    dispatch(consoleActions.clearConsole());
  }, [dispatch]);

  const onToggleProfiling = useCallback(() => {
    dispatch(editorActions.setProfiling(!profile));
  }, [dispatch, profile]);

  useEffect(() => {
    // Pin scroll to bottom of console as new lines arrive if currently near bottom of scroll anyway
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      if (
        scrollEl.scrollTop >
        scrollEl.scrollHeight - scrollEl.clientHeight - PIN_TO_BOTTOM_RANGE
      ) {
        scrollEl.scrollTop = scrollEl.scrollHeight;
      }
    }
  }, [output]);

  useEffect(() => {
    // Pin scroll to bottom of console on initial load
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    }
  }, []);

  const globals = useSelector(
    (state: RootState) => state.debug.globalVariables
  );
  const memoryMap = useSelector((state: RootState) => state.debug.memoryMap);
  const memoryDict = useSelector((state: RootState) => state.debug.memoryDict);
  const scriptMap = useSelector((state: RootState) => state.debug.scriptMap);

  const [debugStd, setDebugStd] = useState<string>("");
  const [debugVram, setDebugVram] = useState<string>("");
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [currentScript, setCurrentScript] = useState<string>("");
  const [currentScriptEvents, setCurrentScriptEvents] =
    useState<ScriptMapItem>();

  const onDebug = useCallback(() => {
    ipcRenderer.send("emulator-message-send", {
      action: "add-breakpoint",
      data: {
        address: memoryMap["_VM_STEP"],
      },
    });
  }, [memoryMap]);

  const onPause = useCallback(() => {
    ipcRenderer.send("emulator-message-send", {
      action: isPaused ? "resume" : "pause",
    });
  }, [isPaused]);
  const onStep = useCallback(() => {
    ipcRenderer.send("emulator-message-send", {
      action: "step-frame",
    });
  }, []);

  useEffect(() => {
    const listener = (_event: any, d: any) => {
      switch (d.action) {
        case "debugger-ready":
          ipcRenderer.send("emulator-message-send", {
            action: "listener-ready",
            data: {
              address: memoryMap["_script_memory"],
              length: globals["MAX_GLOBAL_VARS"],
              executingCtxAddr: memoryMap["_executing_ctx"],
              firstCtxAddr: memoryMap["_first_ctx"],
            },
          });
          break;
        case "update-globals":
          const std = Object.keys(globals)
            .map((k, i) => {
              return `${k} = ${d.data[i]}`;
            })
            .join("\n");

          setDebugStd(std);
          setDebugVram(d.vram);
          setIsPaused(d.paused);

          const getClosestAddress = (bank: number, address: number) => {
            const bankScripts = memoryDict.get(bank);
            const currentAddress = address;
            let closestAddress = -1;
            if (bankScripts) {
              const addresses = Array.from(bankScripts.keys());
              for (let i = 0; i < addresses.length; i++) {
                if (addresses[i] > currentAddress) {
                  break;
                } else {
                  closestAddress = addresses[i];
                }
              }
            }

            return closestAddress;
          };

          // const address = getClosestAddress(d.currentBank, d.currentAddress);
          // setCurrentScript(
          //   `[${d.currentBank}] ${
          //     memoryDict.get(d.currentBank)?.get(address) ?? "NONE"
          //   }:${d.currentAddress}`
          // );

          let string = "";
          d.scriptContexts.forEach((c: any) => {
            string += `${c.current ? ">>>" : "   "} [${String(c.bank).padStart(
              3,
              "0"
            )}] ${
              memoryDict
                .get(c.bank)
                ?.get(getClosestAddress(c.bank, c.address)) ?? "NONE"
            }:${String(c.address).padStart(6, "0")}\n`;

            if (c.current) {
              const script = memoryDict
                .get(c.bank)
                ?.get(getClosestAddress(c.bank, c.address));

              console.log(script, scriptMap);

              if (script) {
                setCurrentScriptEvents(scriptMap[script.slice(1)]);
              }
            }
          });
          setCurrentScript(string);

          break;
        default:
          console.log(`Action ${d.action} not supported`);
      }
    };

    ipcRenderer.on("emulator-data", listener);

    return () => {
      ipcRenderer.removeListener("emulator-data", listener);
    };
  }, [globals, memoryDict, memoryMap, scriptMap, setDebugStd]);

  return (
    <Wrapper>
      <VerticalWrapper>
        <Terminal ref={scrollRef}>
          {outputLines.map((out, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              style={{ color: out.type === "err" ? "orange" : "white" }}
            >
              {out.text}
            </div>
          ))}
          {status === "cancelled" && (
            <div style={{ color: "orange" }}>{l10n("BUILD_CANCELLING")}...</div>
          )}
          {status === "complete" && warnings.length > 0 && (
            <div>
              <br />
              Warnings:
              {warnings.map((out, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={index} style={{ color: "orange" }}>
                  - {out.text}
                </div>
              ))}
            </div>
          )}
        </Terminal>
        <Debugger>
          <div>
            <Button onClick={onPause}>
              {isPaused ? <PlayIcon /> : <PauseIcon />}
            </Button>
            <Button onClick={onStep}>
              <NextIcon />
            </Button>

            <Button onClick={onDebug}>BREAKPOINT</Button>
          </div>
          <DebuggerRow>
            <DebuggerColumn>
              <div>
                <img src={debugVram} alt=""></img>
              </div>
              <strong>{currentScript}</strong>
              <p>------</p>
              <div>{debugStd}</div>
            </DebuggerColumn>
            <DebuggerColumn>
              {currentScriptEvents ? (
                <ScriptEditor
                  value={currentScriptEvents.script}
                  type={currentScriptEvents.entityType as ScriptEventParentType}
                  entityId={currentScriptEvents.entityId}
                  scriptKey={currentScriptEvents.scriptType}
                />
              ) : (
                ""
              )}
            </DebuggerColumn>
          </DebuggerRow>
        </Debugger>
      </VerticalWrapper>
      <ButtonToolbar>
        {status === "running" ? (
          <Button onClick={onRun}>{l10n("BUILD_CANCEL")}</Button>
        ) : (
          <>
            <Button onClick={onRun}>{l10n("BUILD_RUN")}</Button>
            <FixedSpacer width={10} />
            <Button onClick={() => onBuild("rom")}>
              {l10n("BUILD_EXPORT_ROM")}
            </Button>
            <Button onClick={() => onBuild("web")}>
              {l10n("BUILD_EXPORT_WEB")}
            </Button>
            <Button onClick={onDeleteCache}>
              {l10n("BUILD_EMPTY_BUILD_CACHE")}
            </Button>
            <FixedSpacer width={10} />
            <label htmlFor="enableProfile">
              <input
                id="enableProfile"
                type="checkbox"
                checked={profile}
                onChange={onToggleProfiling}
              />{" "}
              {l10n("FIELD_ENABLE_EMULICIOUS_DEBUGGING")}
            </label>
          </>
        )}

        <FlexGrow />
        <Button onClick={onClear}>{l10n("BUILD_CLEAR")}</Button>
      </ButtonToolbar>
    </Wrapper>
  );
};

export default BuildPage;
