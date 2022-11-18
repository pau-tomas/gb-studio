import { FadeSpeedSelect } from "renderer/components/forms/FadeSpeedSelect";
import { DropdownButton } from "renderer/components/ui/buttons/DropdownButton";
import { MenuItem } from "renderer/components/ui/menu/Menu";
import { l10n } from "renderer/lib/api";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "renderer/project/store/configureStore";
import entitiesActions from "renderer/project/store/features/entities/entitiesActions";
import { sceneSelectors } from "renderer/project/store/features/entities/entitiesState";
import { ArrowIcon } from "renderer/components/ui/icons/Icons";
import {
  ScriptEventWrapper,
  ScriptEventHeader,
  ScriptEventHeaderCaret,
  ScriptEventFormWrapper,
  ScriptEventField,
  ScriptEventFields as ScriptEventFieldsWrapper,
  ScriptEventHeaderTitle,
  ScriptEventWarning,
} from "renderer/components/ui/scripting/ScriptEvents";
import { OffscreenSkeletonInput } from "renderer/components/ui/skeleton/Skeleton";
import { FixedSpacer } from "renderer/components/ui/spacing/Spacing";
import { Button } from "renderer/components/ui/buttons/Button";

export const ScriptEventAutoFade = () => {
  const dispatch = useDispatch();
  const type = useSelector((state: RootState) => state.editor.type);
  const sceneId = useSelector((state: RootState) => state.editor.scene);
  const scene = useSelector((state: RootState) =>
    sceneSelectors.selectById(state, sceneId)
  );
  const value =
    scene?.autoFadeSpeed === null ? null : scene?.autoFadeSpeed ?? 1;
  const autoFadeEventCollapse = scene?.autoFadeEventCollapse;
  const isOpen = !autoFadeEventCollapse;

  const onChangeField = useCallback(
    (newValue: number | null) => {
      console.log(newValue);
      dispatch(
        entitiesActions.editScene({
          sceneId,
          changes: {
            autoFadeSpeed: newValue,
          },
        })
      );
    },
    [dispatch, sceneId]
  );

  const onDisable = useCallback(() => {
    dispatch(
      entitiesActions.editScene({
        sceneId,
        changes: {
          autoFadeSpeed: null,
        },
      })
    );
  }, [dispatch, sceneId]);

  const toggleOpen = useCallback(() => {
    dispatch(
      entitiesActions.editScene({
        sceneId,
        changes: {
          autoFadeEventCollapse: !autoFadeEventCollapse,
        },
      })
    );
  }, [autoFadeEventCollapse, dispatch, sceneId]);

  if (type !== "scene" || value === null || !scene) {
    return null;
  }

  return (
    <ScriptEventWrapper conditional={false} nestLevel={0}>
      <ScriptEventHeader
        conditional={false}
        comment={false}
        nestLevel={0}
        altBg={false}
        style={{
          cursor: "not-allowed",
        }}
      >
        <ScriptEventHeaderTitle onClick={toggleOpen}>
          <ScriptEventHeaderCaret open={isOpen}>
            <ArrowIcon />
          </ScriptEventHeaderCaret>
          <FixedSpacer width={5} />
          {l10n("EVENT_FADE_IN")} ({l10n("FIELD_AUTOMATIC")})
        </ScriptEventHeaderTitle>

        <DropdownButton
          size="small"
          variant="transparent"
          menuDirection="right"
        >
          <MenuItem onClick={onDisable}>
            {l10n("FIELD_DISABLE_AUTOMATIC_FADE_IN")}
          </MenuItem>
        </DropdownButton>
      </ScriptEventHeader>
      {isOpen && (
        <ScriptEventFormWrapper conditional={false} nestLevel={0} altBg={false}>
          <ScriptEventFieldsWrapper>
            <ScriptEventField>
              <OffscreenSkeletonInput>
                <FadeSpeedSelect
                  name="sceneAutoFade"
                  value={Number(value ?? 2)}
                  onChange={onChangeField}
                />
              </OffscreenSkeletonInput>
            </ScriptEventField>
          </ScriptEventFieldsWrapper>
        </ScriptEventFormWrapper>
      )}
    </ScriptEventWrapper>
  );
};

export const ScriptEventAutoFadeDisabledWarning = () => {
  const dispatch = useDispatch();
  const type = useSelector((state: RootState) => state.editor.type);
  const sceneId = useSelector((state: RootState) => state.editor.scene);
  const scene = useSelector((state: RootState) =>
    sceneSelectors.selectById(state, sceneId)
  );

  const onEnable = useCallback(() => {
    dispatch(
      entitiesActions.editScene({
        sceneId,
        changes: {
          autoFadeSpeed: 1,
        },
      })
    );
  }, [dispatch, sceneId]);

  if (type !== "scene" || !scene) {
    return null;
  }

  return (
    <ScriptEventWarning>
      <strong> {l10n("FIELD_AUTOMATIC_FADE_IN_DISABLED")}</strong>
      <br />
      {l10n("FIELD_AUTOMATIC_FADE_IN_DISABLED_INFO", {
        eventName: l10n("EVENT_FADE_IN"),
      })}
      <FixedSpacer height={5} />
      <Button size="small" onClick={onEnable}>
        {l10n("FIELD_ENABLE_AUTOMATIC_FADE_IN")}
      </Button>
    </ScriptEventWarning>
  );
};
