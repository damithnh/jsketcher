import React, {useContext, useEffect} from 'react';
import {useStream} from "ui/effects";
import {Status} from "ui/components/Status";
import Folder from "ui/components/Folder";
import {Constraints3D} from "../constraints3d";
import {AppContext} from "../../dom/components/AppContext";
import cx from 'classnames';
import {NoIcon} from "../../../sketcher/icons/NoIcon";
import ls from "../../../sketcher/components/ConstraintExplorer.less";
import Fa from "ui/components/Fa";
import {AssemblyConstraintDefinition} from "../assemblyConstraintDefinition";
import {ApplicationContext} from "context";


export function AssemblyView() {

  const ctx = useContext(AppContext);
  const constraints = useStream(ctx => ctx.assemblyService.constraints$);
  const status = useStream(ctx => ctx.assemblyService.status$);


  return <div>
    <div>
      Status: <Status success={status.success} />
    </div>
    {constraints.map((stage, i) => <Folder key={i} title={'Stage' + (i + 1)}>
      {stage.map((constr, j) => <AssemblyConstraintButton key={j} prefix={j + '.'} constraint={constr} />) }
    </Folder>)}
  </div>

}

export function AssemblyConstraintButton({prefix='', constraint: c, ...props}: {
  prefix: string,
  constraint: AssemblyConstraintDefinition,
  props?: React.HTMLAttributes<HTMLDivElement>
}) {

  const ctx: ApplicationContext = useContext(AppContext);

  const edit = (constraint) => {
    if (constraint.editable) {
      //...
    }
  };

  const remove = constr => {
    ctx.assemblyService.removeConstraint(constr);
  };

  const highlight = constr => {
    ctx.services.marker.clear();
    constr.objects.forEach(id => {
      const entity = ctx.cadRegistry.find(id);
      if (entity) {
        ctx.services.marker.markAdding(entity.TYPE, id);
      }
    });
  };

  const withdraw = () => {
    ctx.services.marker.clear();
  };

  useEffect(() => withdraw, [c]);

  const schema = Constraints3D[c.typeId];
  if (schema === null) {
    return <div className='warning-text'>Invalid Constraint {c.typeId} </div>
  }

  const entities = c.objects.map(ctx.cadRegistry.find);

  const invalid = !!entities.find(x => !x);

  const Icon = schema.icon || NoIcon;

  return <div className={cx(ls.objectItem, invalid&&ls.conflicting)}
              onClick={() => schema.constants && edit(c)}
              onMouseEnter={() => highlight(c)}
              onMouseLeave={() => withdraw()}
              {...props}>
    <span className={ls.objectIcon}><Icon size={16} /></span>
    <span className={ls.objectTag}>
        {prefix} {schema.name}
      </span>
    <span className={ls.removeButton} onClick={() => remove(c)}><Fa icon='times'/></span>

  </div>

}