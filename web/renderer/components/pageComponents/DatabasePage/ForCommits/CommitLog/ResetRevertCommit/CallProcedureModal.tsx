import DocsLink from "@components/links/DocsLink";
import { useApolloClient } from "@apollo/client";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button, Modal } from "@dolthub/react-components";
import { useCallProcedureMutation } from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { ModalProps } from "@lib/modalProps";
import { RefParams } from "@lib/params";
import { refetchUpdateDatabaseQueriesCacheEvict } from "@lib/refetchQueries";
import { ref } from "@lib/urls";
import { useRouter } from "next/router";
import { ReactNode } from "react";

type Props = ModalProps & {
  title: string;
  buttonLabel: string;
  procedureName: string;
  procedureArgs: string[];
  docsPath: string;
  params: RefParams;
  children: ReactNode;
};

export default function CallProcedureModal({
  title,
  buttonLabel,
  procedureName,
  procedureArgs,
  docsPath,
  children,
  ...props
}: Props) {
  const { setEditorString, setError, setExecutionMessage } =
    useSqlEditorContext();
  const { mutateFn: callProcedure, loading } = useMutation({
    hook: useCallProcedureMutation,
  });
  const client = useApolloClient();
  const router = useRouter();

  const onClick = async () => {
    const res = await callProcedure({
      variables: {
        databaseName: props.params.databaseName,
        refName: props.params.refName,
        name: procedureName,
        args: procedureArgs,
      },
    });
    if (res.success && res.data?.callProcedure) {
      setEditorString(res.data.callProcedure.queryString);
      setExecutionMessage(res.data.callProcedure.executionMessage);
      client
        .refetchQueries(refetchUpdateDatabaseQueriesCacheEvict)
        .catch(console.error);
      props.setIsOpen(false);
      const { href, as } = ref(props.params).withQuery({
        executedSql: res.data.callProcedure.queryString,
      });
      router.push(href, as).catch(console.error);
    } else if (res.error) {
      setError(res.error);
    }
  };

  return (
    <Modal
      {...props}
      onRequestClose={() => props.setIsOpen(false)}
      title={title}
      button={
        <Button onClick={onClick} disabled={loading}>
          {buttonLabel}
        </Button>
      }
    >
      {children}
      <p>
        Learn more <DocsLink path={docsPath}>here</DocsLink>.
      </p>
      <p>Are you sure you would like to proceed?</p>
    </Modal>
  );
}
