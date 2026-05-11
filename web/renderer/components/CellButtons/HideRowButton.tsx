import { useDataTableContext } from "@contexts/dataTable";
import { Button } from "@dolthub/react-components";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import {
  appendExcludePk,
  parseStackingParams,
  pushStack,
} from "@lib/dataTableParams";
import { useRouter } from "next/router";
import css from "./index.module.css";
import { toPKWhereClauses } from "./utils";

type Props = {
  row: RowForDataTableFragment;
  columns: ColumnForDataTableFragment[];
};

export default function HideRowButton(props: Props) {
  const router = useRouter();
  const { params, columns, tableShape } = useDataTableContext();
  const { tableName } = params;

  if (!tableName || !tableShape) return null;

  const onClick = () => {
    const values = toPKWhereClauses(props.row, props.columns, columns);
    const stack = parseStackingParams(router.query);
    pushStack(router, {
      ...stack,
      excludePks: appendExcludePk(stack.excludePks, { values }),
    });
  };

  return (
    <Button.Link onClick={onClick} className={css.button}>
      Hide row
    </Button.Link>
  );
}
