import { useDataTableContext } from "@contexts/dataTable";
import { Button } from "@dolthub/react-components";
import { parseStackingParams, pushStack } from "@lib/dataTableParams";
import { useRouter } from "next/router";
import css from "./index.module.css";

export default function ShowAllColumns() {
  const router = useRouter();
  const { params, tableShape } = useDataTableContext();
  const stack = parseStackingParams(router.query);

  if (!params.tableName || !tableShape) return null;
  if (!stack.projection || stack.projection.length === 0) return null;

  const onClick = () => {
    pushStack(router, { ...stack, projection: undefined });
  };

  return (
    <Button.Link underlined className={css.colsButton} onClick={onClick}>
      Show all columns
    </Button.Link>
  );
}
