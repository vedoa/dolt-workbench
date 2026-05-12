import DocsLink from "@components/links/DocsLink";
import { Button, Modal } from "@dolthub/react-components";
import useCallProcedure from "@hooks/useCallProcedure";
import { ModalProps } from "@lib/modalProps";
import { RefParams } from "@lib/params";
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
  const { callProcedure, loading } = useCallProcedure(props.params);

  const onClick = async () => {
    const { success } = await callProcedure(procedureName, procedureArgs);
    if (success) props.setIsOpen(false);
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
