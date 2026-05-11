import { CommitForHistoryFragment } from "@gen/graphql-types";
import { ModalProps } from "@lib/modalProps";
import { RefParams } from "@lib/params";
import CallProcedureModal from "./CallProcedureModal";

type Props = ModalProps & {
  commit: CommitForHistoryFragment;
  params: RefParams;
};

export default function ResetModal(props: Props) {
  return (
    <CallProcedureModal
      {...props}
      title="Reset Commit"
      buttonLabel="Reset commit"
      procedureName="DOLT_RESET"
      procedureArgs={["--hard", props.commit.commitId]}
      docsPath="/sql-reference/version-control/dolt-sql-procedures#dolt_reset"
    >
      <p>Resets the database to this commit.</p>
    </CallProcedureModal>
  );
}
