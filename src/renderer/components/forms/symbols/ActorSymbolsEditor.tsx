import React from "react";
import { useDispatch } from "react-redux";
import { actorSelectors } from "renderer/project/store/features/entities/entitiesState";
import entitiesActions from "renderer/project/store/features/entities/entitiesActions";
import {
  interactScriptSymbol,
  updateScriptSymbol,
} from "shared/lib/compiler/symbols";
import { addBankRef, AssetReference } from "components/forms/ReferencesSelect";

interface ActorSymbolsEditorProps {
  id: string;
}

export const ActorSymbolsEditor = ({ id }: ActorSymbolsEditorProps) => {
  const dispatch = useDispatch();
  return (
    <AssetReference
      id={id}
      selector={(state) => actorSelectors.selectById(state, id)}
      onRename={(symbol) => {
        dispatch(
          entitiesActions.setActorSymbol({
            actorId: id,
            symbol,
          })
        );
      }}
      copyTransform={addBankRef}
      extraSymbols={(symbol) => [
        interactScriptSymbol(symbol),
        updateScriptSymbol(symbol),
      ]}
    />
  );
};
