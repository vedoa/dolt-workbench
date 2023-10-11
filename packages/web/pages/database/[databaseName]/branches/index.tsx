import Page from "@components/util/Page";
import { DatabaseParams, MaybeRefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: MaybeRefParams;
};

const DatabaseBranchesPage: NextPage<Props> = ({ params }) => (
  <Page title={`Branches for ${params.databaseName}`} noIndex>
    <DatabasePage.ForBranches
      params={{
        ...params,
        refName: params.refName ?? undefined,
      }}
    />
  </Page>
);

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
}) => {
  return {
    props: {
      params: {
        ...(params as DatabaseParams),
        refName: query.refName ? String(query.refName) : null,
      },
    },
  };
};

export default DatabaseBranchesPage;
