import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "renderer/project/store/configureStore";
import { calculateAutoFadeEventIdNormalised } from "renderer/project/store/features/entities/entitiesHelpers";
import {
  customEventSelectors,
  scriptEventSelectors,
} from "renderer/project/store/features/entities/entitiesState";
import { ScriptEventParentType } from "renderer/project/store/features/entities/entitiesTypes";
import { selectScriptEventDefsLookups } from "renderer/project/store/features/scriptEventDefs/scriptEventDefsState";
import { useAppSelector } from "renderer/project/store/hooks";
import styled from "styled-components";
import AddButton from "./AddButton";
import ScriptEditorEvent from "./ScriptEditorEvent";
import { ScriptEventAutoFade } from "./ScriptEventAutoFade";

interface ScriptEditorProps {
  value: string[];
  type: ScriptEventParentType;
  entityId: string;
  scriptKey: string;
  showAutoFadeIndicator?: boolean;
}

const ScriptEditorWrapper = styled.div`
  position: relative;
`;

const ScriptEditor = React.memo(
  ({
    value,
    type,
    entityId,
    scriptKey,
    showAutoFadeIndicator,
  }: ScriptEditorProps) => {
    const [renderTo, setRenderTo] = useState(0);
    const timerRef = useRef<number>(0);
    const scriptEventsLookup = useSelector((state: RootState) =>
      scriptEventSelectors.selectEntities(state)
    );
    const customEventsLookup = useSelector((state: RootState) =>
      customEventSelectors.selectEntities(state)
    );
    const scriptEventDefsLookups = useAppSelector(selectScriptEventDefsLookups);

    const autoFadeEventId = useMemo(() => {
      return showAutoFadeIndicator
        ? calculateAutoFadeEventIdNormalised(
            value,
            scriptEventsLookup,
            customEventsLookup,
            scriptEventDefsLookups.eventsLookup
          )
        : "";
    }, [
      customEventsLookup,
      scriptEventDefsLookups.eventsLookup,
      scriptEventsLookup,
      showAutoFadeIndicator,
      value,
    ]);

    // Reset renderTo on script tab change
    useEffect(() => {
      setRenderTo(0);
    }, [scriptKey]);

    // Load long scripts asynchronously
    useEffect(() => {
      if (value.length >= renderTo) {
        timerRef.current = window.setTimeout(() => {
          setRenderTo(renderTo + 1);
        }, 1);
        return () => {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
        };
      }
    }, [renderTo, value.length]);

    return (
      <ScriptEditorWrapper>
        {value.map(
          (id, index) =>
            index < renderTo && (
              <>
                {showAutoFadeIndicator && id === autoFadeEventId && (
                  <ScriptEventAutoFade />
                )}
                <ScriptEditorEvent
                  key={`${id}_${index}`}
                  id={id}
                  index={index}
                  parentType={type}
                  parentId={entityId}
                  parentKey={scriptKey}
                  entityId={entityId}
                />
              </>
            )
        )}
        {showAutoFadeIndicator && autoFadeEventId === "" && (
          <ScriptEventAutoFade />
        )}
        <AddButton
          parentType={type}
          parentId={entityId}
          parentKey={scriptKey}
        />
      </ScriptEditorWrapper>
    );
  }
);

export default ScriptEditor;
