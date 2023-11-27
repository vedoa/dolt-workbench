import Button from "@components/Button";
import ErrorMsg from "@components/ErrorMsg";
import {
  DatabaseConnectionFragment,
  useAddDatabaseConnectionMutation,
} from "@gen/graphql-types";
import { maybeDatabase } from "@lib/urls";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { useRouter } from "next/router";
import css from "./index.module.css";

type Props = {
  conn: DatabaseConnectionFragment;
  onDeleteClicked: (n: string) => void;
};

export default function Item({ conn, onDeleteClicked }: Props) {
  const router = useRouter();
  const [addDb, res] = useAddDatabaseConnectionMutation();

  const onClick = async () => {
    try {
      const db = await addDb({ variables: conn });
      await res.client.clearStore();
      if (!db.data) {
        return;
      }
      const { href, as } = maybeDatabase(db.data.addDatabaseConnection);
      router.push(href, as).catch(console.error);
    } catch (_) {
      // Handled by res.error
    }
  };

  return (
    <>
      <li key={conn.name} className={css.connection}>
        <Button.Link onClick={onClick}>{conn.name}</Button.Link>
        <Button.Link onClick={() => onDeleteClicked(conn.name)}>
          <IoMdClose />
        </Button.Link>
      </li>
      <ErrorMsg err={res.error} className={css.err} />
    </>
  );
}
