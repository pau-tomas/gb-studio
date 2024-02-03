import React, { Dispatch } from "react";
import { UnknownAction } from "redux";
import l10n from "shared/lib/lang/l10n";
import entitiesActions from "store/features/entities/entitiesActions";
import { MenuDivider, MenuItem } from "ui/menu/Menu";

interface ActorContextMenuProps {
  dispatch: Dispatch<UnknownAction>;
  actorId: string;
  sceneId: string;
  onRename?: () => void;
}

const renderActorContextMenu = ({
  actorId,
  sceneId,
  onRename,
  dispatch,
}: ActorContextMenuProps) => {
  return [
    ...(onRename
      ? [
          <MenuItem key="rename" onClick={onRename}>
            {l10n("FIELD_RENAME")}
          </MenuItem>,
          <MenuDivider key="div-rename" />,
        ]
      : []),
    <MenuItem
      onClick={() => {
        dispatch(
          entitiesActions.reorderSceneActor({ sceneId, actorId, offset: 1 })
        );
      }}
    >
      {l10n("MENU_ACTOR_BRING_FORWARD")}
    </MenuItem>,
    <MenuItem
      onClick={() => {
        dispatch(
          entitiesActions.reorderSceneActor({ sceneId, actorId, offset: -1 })
        );
      }}
    >
      {l10n("MENU_ACTOR_SEND_BACKWARD")}
    </MenuItem>,
    <MenuDivider />,
    <MenuItem
      key="delete"
      onClick={() =>
        dispatch(entitiesActions.removeActor({ sceneId, actorId }))
      }
    >
      {l10n("MENU_DELETE_ACTOR")}
    </MenuItem>,
  ];
};

export default renderActorContextMenu;
