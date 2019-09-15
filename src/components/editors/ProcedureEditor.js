/* eslint-disable jsx-a11y/label-has-for */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ScriptEditor from "../script/ScriptEditor";
import * as actions from "../../actions";
import { FormField } from "../library/Forms";
import l10n from "../../lib/helpers/l10n";
import Sidebar, { SidebarColumn, SidebarHeading } from "./Sidebar";
import castEventValue from "../../lib/helpers/castEventValue";
import { ProcedureShape } from "../../reducers/stateShape";
import { DropdownButton } from "../library/Button";
import { MenuItem } from "../library/Menu";

class ProcedureEditor extends Component {
  constructor() {
    super();
    this.state = {
    };
  }

  onEdit = key => e => {
    const { editProcedure, procedure } = this.props;
    editProcedure(procedure.id, {
      [key]: castEventValue(e)
    });
  };
    
  render() {
    const { procedure, selectSidebar } = this.props;

    return (
      <Sidebar onMouseDown={selectSidebar}>
        <SidebarColumn>
          <SidebarHeading
            title={procedure.name}
            buttons={
              <DropdownButton
                small
                transparent
                right
                onMouseDown={this.readClipboard}
              >
                <MenuItem onClick={this.onRemoveScript}>
                  {l10n("MENU_DELETE_SCRIPT")}
                </MenuItem>
              </DropdownButton>
            }
          />
          <FormField>
            <label htmlFor="projectName">
              {l10n("FIELD_NAME")}
              <input
                id="projectName"
                value={procedure.name || ""}
                placeholder="Procedure Name"
                onChange={this.onEdit("name")}
              />
            </label>
          </FormField>
          <FormField halfWidth>
            <label htmlFor="numVariables">
              Number of Variables
              <input 
                id="numVariables"
                type="number"
                value={Object.values(procedure.variables).length}
                min="0"
                max="10"
              />
            </label>
          </FormField>
          <FormField halfWidth>
            <label htmlFor="numActors">
              Number of Actors
              <input 
                id="numActors"
                value={Object.values(procedure.actors).length}
                type="number"
                min="0"
                max="10"
              />
            </label>
          </FormField>
          <FormField>
            <label>Variable list</label>
          </FormField>
          {Object.values(procedure.variables)
            .map((variable, i) => {
              return (
                <FormField>
                  <input
                    id="parameterId"
                    value={variable.name || `Variable ${i + 1}`}
                    placeholder="Variable Name"
                    onChange={this.onEdit("variable")}
                  /> 
                </FormField>     
              );
            }
          )}
          <FormField>
            <label>Actor list</label>
          </FormField>
          {Object.values(procedure.actors)
            .map((actor, i) => {
              return (
                <FormField>
                  <input
                    id="parameterId"
                    value={actor.name || `Actor ${i + 1}`}
                    placeholder="Actor Name"
                    onChange={this.onEdit("actor")}
                  />    
                </FormField>
              );
            }
          )}
        </SidebarColumn>
        <SidebarColumn>
          <ScriptEditor
            value={procedure.script}
            title={procedure.name}
            type="procedure"
            variableIds={Object.values(procedure.variables).map(v => v.id)}
            actorIds={Object.values(procedure.actors).map((a, i) => a.name  || `Actor ${i + 1}`)}
            onChange={this.onEdit("script")}
          />
        </SidebarColumn>
      </Sidebar>
    );
  };
}

ProcedureEditor.propTypes = {
  procedure: PropTypes.shape(ProcedureShape),
  editProcedure: PropTypes.func.isRequired,
  selectSidebar: PropTypes.func.isRequired,
};

ProcedureEditor.defaultProps = {
  procedure: null,
};

function mapStateToProps(state, props) {
  const procedure = state.entities.present.entities.procedures[props.id];
  return {
    procedure
  };
}

const mapDispatchToProps = {
  editProcedure: actions.editProcedure,
  selectSidebar: actions.selectSidebar
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProcedureEditor);
  