import { Button, ErrorMsg, Loader } from "@dolthub/react-components";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import {
  DatabaseConnectionFragment,
  DatabaseType,
  useResetDatabaseMutation,
} from "@gen/graphql-types";
import useAddConnection from "@components/pageComponents/ConnectionsPage/ExistingConnections/useAddConnection";
import useMutation from "@hooks/useMutation";
import { useRouter } from "next/router";
import { database } from "@lib/urls";
import css from "./index.module.css";

type Props = {
  db: string;
  conn: DatabaseConnectionFragment;
};

export default function DatabaseItem({ db, conn }: Props) {
  const { onAdd } = useAddConnection(conn);
  const {
    mutateFn: resetDB,
    loading,
    err,
  } = useMutation({
    hook: useResetDatabaseMutation,
  });
  const router = useRouter();

  const onClick = async (databaseName: string) => {
    await onAdd();
    if (conn.type === DatabaseType.Postgres) {
      await resetDB({ variables: { newDatabase: databaseName } });
    }
    const { href, as } = database({ databaseName });
    router.push(href, as).catch(console.error);
  };

  if (loading) {
    return <Loader loaded={!loading} />;
  }

  if (err) {
    return <ErrorMsg err={err} />;
  }

  return (
    <Button.Link className={css.item} onClick={async () => onClick(db)}>
      <span>{db}</span>
      <FaChevronRight />
    </Button.Link>
  );
}
