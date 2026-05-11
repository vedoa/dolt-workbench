import { useDataTableContext } from "@contexts/dataTable";
import { Button } from "@dolthub/react-components";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import {
  parseStackingParams,
  pushStack,
  removeFromProjection,
} from "@lib/dataTableParams";
import { useRouter } from "next/router";
import css from "./index.module.css";

type Props = {
  col: ColumnForDataTableFragment;
  columns: ColumnForDataTableFragment[];
};

export default function HideColumnButton({ col, columns }: Props) {
  const router = useRouter();
  const { tableShape } = useDataTableContext();

  if (!tableShape) return null;

  const onClick = () => {
    const stack = parseStackingParams(router.query);
    pushStack(router, {
      ...stack,
      projection: removeFromProjection(
        stack.projection,
        col.name,
        columns.map(c => c.name),
      ),
    });
  };

  return (
    <Button.Link onClick={onClick} className={css.button}>
      Hide column
    </Button.Link>
  );
}
