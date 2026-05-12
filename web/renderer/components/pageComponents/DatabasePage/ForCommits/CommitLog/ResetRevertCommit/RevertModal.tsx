import { CommitForHistoryFragment } from "@gen/graphql-types";
import { ModalProps } from "@lib/modalProps";
import { RefParams } from "@lib/params";
import CallProcedureModal from "./CallProcedureModal";

type Props = ModalProps & {
  commit: CommitForHistoryFragment;
  params: RefParams;
};

export default function RevertModal(props: Props) {
  return (
    <CallProcedureModal
      {...props}
      title="Revert Commit"
      buttonLabel="Revert commit"
      procedureName="DOLT_REVERT"
      procedureArgs={[props.commit.commitId]}
      docsPath="/sql-reference/version-control/dolt-sql-procedures#dolt_revert"
    >
      <p>
        Reverts the changes introduced in this commit by creating a new commit
        from the current HEAD that reverses the changes in this commit.
      </p>
    </CallProcedureModal>
  );
}
