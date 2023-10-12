import Button from "@components/Button";
import Link from "@components/links/Link";
import { RefParams } from "@lib/params";
import { newDoc } from "@lib/urls";
import { FiPlus } from "@react-icons/all-files/fi/FiPlus";
import css from "./index.module.css";

type Props = {
  params: RefParams;
};

export default function NewDocButton(props: Props) {
  return (
    <Link {...newDoc(props.params)} className={css.newDoc}>
      <Button data-cy="add-doc-button">
        <div>
          <FiPlus />
          Add README/LICENSE
        </div>
      </Button>
    </Link>
  );
}
