import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  actorPrefabSelectors,
  actorSelectors,
  customEventSelectors,
  sceneSelectors,
  scriptEventSelectors,
  triggerPrefabSelectors,
  triggerSelectors,
  variableSelectors,
} from "store/features/entities/entitiesState";
import { DropdownButton } from "ui/buttons/DropdownButton";
import { EditableText } from "ui/form/EditableText";
import {
  FormContainer,
  FormDivider,
  FormHeader,
  FormRow,
} from "ui/form/layout/FormLayout";
import { MenuItem } from "ui/menu/Menu";
import entitiesActions from "store/features/entities/entitiesActions";
import editorActions from "store/features/editor/editorActions";
import clipboardActions from "store/features/clipboard/clipboardActions";
import { Sidebar, SidebarColumn } from "ui/sidebars/Sidebar";
import { FlatList } from "ui/lists/FlatList";
import { EntityListItem } from "ui/lists/EntityListItem";
import useDimensions from "react-cool-dimensions";
import styled from "styled-components";
import { SplitPaneHeader } from "ui/splitpane/SplitPaneHeader";
import { SymbolEditorWrapper } from "components/forms/symbols/SymbolEditorWrapper";
import { VariableReference } from "components/forms/ReferencesSelect";
import VariableUsesWorker, {
  VariableUse,
  VariableUseResult,
} from "./VariableUses.worker";
import {
  globalVariableCode,
  globalVariableDefaultName,
} from "shared/lib/variables/variableNames";
import l10n, { getL10NData } from "shared/lib/lang/l10n";
import { selectScriptEventDefs } from "store/features/scriptEventDefs/scriptEventDefsState";
import { useAppDispatch, useAppSelector } from "store/hooks";
import { CodeIcon } from "ui/icons/Icons";
import { CheckboxField } from "ui/form/CheckboxField";
import { NumberField } from "ui/form/NumberField";
import {
  castEventToBool,
  castEventToInt,
} from "renderer/lib/helpers/castEventValue";
import useWindowSize from "ui/hooks/use-window-size";
import { Variable } from "shared/lib/resources/types";

const worker = new VariableUsesWorker();

interface VariableEditorProps {
  id: string;
}
interface UsesWrapperProps {
  $showSymbols: boolean;
}

const UsesWrapper = styled.div<UsesWrapperProps>`
  flex-grow: 1;
  border-top: 1px solid ${(props) => props.theme.colors.input.border};
`;

const UseMessage = styled.div`
  padding: 5px 10px;
  font-size: 11px;
`;

export const VariableEditor: FC<VariableEditorProps> = ({ id }) => {
  const [fetching, setFetching] = useState(true);
  const { observe, entry } = useDimensions();
  const { height: winHeight } = useWindowSize();
  const variable = useAppSelector((state) =>
    variableSelectors.selectById(state, id),
  );
  const [variableUses, setVariableUses] = useState<VariableUse[]>([]);
  const scenes = useAppSelector((state) => sceneSelectors.selectAll(state));
  const actorsLookup = useAppSelector((state) =>
    actorSelectors.selectEntities(state),
  );
  const triggersLookup = useAppSelector((state) =>
    triggerSelectors.selectEntities(state),
  );
  const scriptEventsLookup = useAppSelector((state) =>
    scriptEventSelectors.selectEntities(state),
  );
  const customEventsLookup = useAppSelector((state) =>
    customEventSelectors.selectEntities(state),
  );
  const actorPrefabsLookup = useAppSelector(
    actorPrefabSelectors.selectEntities,
  );
  const triggerPrefabsLookup = useAppSelector(
    triggerPrefabSelectors.selectEntities,
  );
  const [showSymbols, setShowSymbols] = useState(false);

  const scriptEventDefs = useAppSelector((state) =>
    selectScriptEventDefs(state),
  );

  const dispatch = useAppDispatch();

  const onWorkerComplete = useCallback(
    (e: MessageEvent<VariableUseResult>) => {
      if (e.data.id === id) {
        setFetching(false);
        setVariableUses(e.data.uses);
      }
    },
    [id],
  );

  const usesHeight = useMemo(() => {
    const top = entry?.target.getBoundingClientRect().top;
    if (top === undefined || winHeight === undefined) {
      return 0;
    }
    return winHeight - top - 32;
  }, [entry?.target, winHeight]);

  useEffect(() => {
    worker.addEventListener("message", onWorkerComplete);
    return () => {
      worker.removeEventListener("message", onWorkerComplete);
    };
  }, [onWorkerComplete]);

  useEffect(() => {
    setFetching(true);
    worker.postMessage({
      id,
      variableId: id,
      scenes,
      actorsLookup,
      triggersLookup,
      actorPrefabsLookup,
      triggerPrefabsLookup,
      scriptEventsLookup,
      scriptEventDefs,
      customEventsLookup,
      l10NData: getL10NData(),
    });
  }, [
    scenes,
    actorsLookup,
    triggersLookup,
    id,
    scriptEventsLookup,
    scriptEventDefs,
    customEventsLookup,
    actorPrefabsLookup,
    triggerPrefabsLookup,
  ]);

  const onRename = (e: React.ChangeEvent<HTMLInputElement>) => {
    const editValue = e.currentTarget.value;
    dispatch(
      entitiesActions.renameVariable({
        variableId: id,
        name: editValue,
      }),
    );
  };

  const onChangeFieldInput = <T extends keyof Variable>(
    key: T,
    value: Variable[T],
  ) => {
    console.log(">>>", key, value);
    dispatch(
      entitiesActions.editVariable({
        variableId: id,
        changes: {
          [key]: value,
        },
      }),
    );
  };

  const onCopyVar = () => {
    dispatch(clipboardActions.copyText(`$${globalVariableCode(id)}$`));
  };

  const onCopyChar = () => {
    dispatch(clipboardActions.copyText(`#${globalVariableCode(id)}#`));
  };

  const setSelectedId = (id: string, item: VariableUse) => {
    if (item.type === "scene") {
      dispatch(editorActions.selectScene({ sceneId: id }));
      dispatch(editorActions.setFocusSceneId(item.sceneId));
    } else if (item.type === "actor") {
      dispatch(
        editorActions.selectActor({ actorId: id, sceneId: item.sceneId }),
      );
      dispatch(editorActions.setFocusSceneId(item.sceneId));
    } else if (item.type === "trigger") {
      dispatch(
        editorActions.selectTrigger({ triggerId: id, sceneId: item.sceneId }),
      );
      dispatch(editorActions.setFocusSceneId(item.sceneId));
    } else if (item.type === "custom") {
      dispatch(editorActions.selectCustomEvent({ customEventId: id }));
    }
  };

  const selectSidebar = () => {
    dispatch(editorActions.selectSidebar());
  };

  return (
    <Sidebar onClick={selectSidebar}>
      <FormHeader>
        <EditableText
          name="name"
          placeholder={globalVariableDefaultName(id)}
          value={variable?.name || ""}
          onChange={onRename}
        />
        <DropdownButton
          size="small"
          variant="transparent"
          menuDirection="right"
        >
          {!showSymbols && (
            <MenuItem onClick={() => setShowSymbols(true)}>
              {l10n("FIELD_VIEW_GBVM_SYMBOLS")}
            </MenuItem>
          )}
          <MenuItem onClick={onCopyVar}>
            {l10n("MENU_VARIABLE_COPY_EMBED")}
          </MenuItem>
          <MenuItem onClick={onCopyChar}>
            {l10n("MENU_VARIABLE_COPY_EMBED_CHAR")}
          </MenuItem>
        </DropdownButton>
      </FormHeader>

      <SidebarColumn>
        <FormContainer>
          {showSymbols && (
            <>
              <SymbolEditorWrapper>
                <VariableReference id={id} />
              </SymbolEditorWrapper>
              <FormDivider />
            </>
          )}
          <FormRow>
            <CheckboxField
              name="animated"
              label={l10n("FIELD_IS_ARRAY")}
              checked={variable?.isArray ?? false}
              onChange={(e) =>
                onChangeFieldInput("isArray", castEventToBool(e))
              }
            />
          </FormRow>
          {variable?.isArray && (
            <FormRow>
              <NumberField
                name="size"
                label={l10n("FIELD_ARRAY_SIZE")}
                value={variable?.size}
                placeholder="1"
                min={1}
                max={255}
                onChange={(e) =>
                  onChangeFieldInput(
                    "size",
                    // Math.min(1, Math.max(255, castEventToInt(e, 1)))
                    castEventToInt(e, 1),
                  )
                }
              />
            </FormRow>
          )}
        </FormContainer>

        <UsesWrapper ref={observe} $showSymbols={showSymbols}>
          <SplitPaneHeader collapsed={false}>
            {l10n("SIDEBAR_VARIABLE_USES")}
          </SplitPaneHeader>
          {fetching ? (
            <UseMessage>...</UseMessage>
          ) : (
            <>
              {variableUses.length > 0 ? (
                <FlatList
                  items={variableUses}
                  height={usesHeight}
                  setSelectedId={setSelectedId}
                  children={({ item }) => {
                    switch (item.type) {
                      case "scene":
                        return <EntityListItem item={item} type={item.type} />;
                      case "custom":
                        return (
                          <EntityListItem
                            item={item}
                            type={item.type}
                            icon={<CodeIcon />}
                          />
                        );
                      default:
                        return (
                          <EntityListItem
                            item={item}
                            type={item.type}
                            nestLevel={1}
                          />
                        );
                    }
                  }}
                />
              ) : (
                <UseMessage>{l10n("FIELD_VARIABLE_NOT_USED")}</UseMessage>
              )}
            </>
          )}
        </UsesWrapper>
      </SidebarColumn>
    </Sidebar>
  );
};
