import Button from "@components/Button";
import { Database404 } from "@components/Database404";
import DeleteModal from "@components/DeleteModal";
import FormSelect from "@components/FormSelect";
import Loader from "@components/Loader";
import Link from "@components/links/Link";
import QueryHandler from "@components/util/QueryHandler";
import {
  BranchFragment,
  SortBranchesBy,
  useDeleteBranchMutation,
} from "@gen/graphql-types";
import { gqlDepNotFound } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import { OptionalRefParams } from "@lib/params";
import { refetchBranchQueries } from "@lib/refetchQueries";
import { newBranch, ref } from "@lib/urls";
import { useState } from "react";
import BranchList from "./BranchList";
import css from "./index.module.css";
import { useBranchList } from "./useBranchList";

type Props = {
  params: OptionalRefParams;
};

type InnerProps = {
  branches: BranchFragment[];
  sortBranches: (sortBy?: SortBranchesBy) => Promise<void>;
  sortBy?: SortBranchesBy;
} & Props;

function Inner(props: InnerProps): JSX.Element {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [branchNameToDelete, setBranchNameToDelete] = useState("");
  const createUrl = newBranch({
    ...props.params,
    refName:
      branchNameToDelete === props.params.refName
        ? undefined
        : props.params.refName,
  });

  const onDeleteClicked = (branch: BranchFragment) => {
    setBranchNameToDelete(branch.branchName);
    setDeleteModalOpen(true);
  };

  return (
    <div className={css.container}>
      <div className={css.top}>
        <h1>Branches</h1>
        <div className={css.topRight}>
          <FormSelect
            className={css.sortSelect}
            val={props.sortBy}
            onChangeValue={props.sortBranches}
            options={[
              {
                value: SortBranchesBy.LastUpdated,
                label: "sort by last updated",
              },
            ]}
            placeholder="sort by default"
            isClearable
            horizontal
          />
          <Link {...createUrl} className={css.white}>
            <Button>Create Branch</Button>
          </Link>
        </div>
      </div>
      <div>
        {props.branches.length ? (
          <BranchList {...props} onDeleteClicked={onDeleteClicked} />
        ) : (
          <p className={css.noBranches}>No branches found</p>
        )}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          setIsOpen={setDeleteModalOpen}
          title="Delete Branch"
          btnText="Delete branch"
          mutationProps={{
            hook: useDeleteBranchMutation,
            variables: { ...props.params, branchName: branchNameToDelete },
            refetchQueries: refetchBranchQueries(props.params),
          }}
        >
          <p>
            Are you sure you want to delete the{" "}
            <Link {...ref({ ...props.params, refName: branchNameToDelete })}>
              {branchNameToDelete}{" "}
            </Link>
            branch?
            <br />
            This cannot be undone.
          </p>
        </DeleteModal>
      </div>
    </div>
  );
}

export default function BranchesPage({ params }: Props): JSX.Element {
  const res = useBranchList(params);
  if (res.loading) return <Loader loaded={false} />;
  if (errorMatches(gqlDepNotFound, res.error)) {
    return <Database404 params={params} />;
  }

  return (
    <QueryHandler
      result={{ ...res, data: res.branches }}
      render={data => (
        <Inner
          params={params}
          branches={data}
          sortBranches={res.sortBranches}
          sortBy={res.sortBy}
        />
      )}
    />
  );
}
