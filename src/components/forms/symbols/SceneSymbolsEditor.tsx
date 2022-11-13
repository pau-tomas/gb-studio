import React from "react";
import { useDispatch } from "react-redux";
import { sceneSelectors } from "project/store/features/entities/entitiesState";
import entitiesActions from "project/store/features/entities/entitiesActions";
import { initScriptSymbol } from "lib/helpers/symbols";
import { addBankRef, AssetReference } from "../ReferencesSelect";

interface SceneSymbolsEditorProps {
  id: string;
}

export const SceneSymbolsEditor = ({ id }: SceneSymbolsEditorProps) => {
  const dispatch = useDispatch();
  return (
    <AssetReference
      id={id}
      selector={(state) => sceneSelectors.selectById(state, id)}
      onRename={(symbol) => {
        dispatch(
          entitiesActions.setSceneSymbol({
            sceneId: id,
            symbol,
          })
        );
      }}
      copyTransform={addBankRef}
      extraSymbols={(symbol) => [initScriptSymbol(symbol)]}
    />
  );
};
