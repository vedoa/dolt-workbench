import { FormModal, FormInput, Textarea } from "@dolthub/react-components";
import { useEffectAsync } from "@dolthub/react-hooks";
import { Maybe } from "@dolthub/web-utils";
import { StatusFragment } from "@gen/graphql-types";
import useCallProcedure from "@hooks/useCallProcedure";
import { useUserHeaders } from "@hooks/useUserHeaders";
import { ModalProps } from "@lib/modalProps";
import { RefParams } from "@lib/params";
import { SyntheticEvent, useState } from "react";
import css from "./index.module.css";

type Props = ModalProps & {
  params: RefParams;
  status: StatusFragment[];
};

const isElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";

export default function CommitModal(props: Props) {
  const defaultMsg = getDefaultCommitMsg(props.params.refName, props.status);
  const [msg, setMsg] = useState(defaultMsg);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const userHeaders = useUserHeaders();
  const { callProcedure, loading } = useCallProcedure(props.params);

  const headerName = userHeaders?.user;
  const headerEmail = userHeaders?.email;
  const hasHeaders = !!headerName || !!headerEmail;

  useEffectAsync(async () => {
    if (hasHeaders) {
      setAuthorName(headerName ?? "");
      setAuthorEmail(headerEmail ?? "");
      return;
    }
    if (isElectron) {
      const stored = await window.ipc.getCommitAuthor();
      if (stored) {
        setAuthorName(stored.name);
        setAuthorEmail(stored.email);
      }
    }
  }, [userHeaders]);

  const onClose = () => {
    props.setIsOpen(false);
    setMsg(defaultMsg);
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (isElectron && !hasHeaders && authorName && authorEmail) {
      await window.ipc.setCommitAuthor({
        name: authorName,
        email: authorEmail,
      });
    }
    const { success } = await callProcedure("DOLT_COMMIT", [
      "-Am",
      msg,
      ...getAuthorArgs(authorName, authorEmail),
    ]);
    if (success) onClose();
  };

  return (
    <FormModal
      onSubmit={onSubmit}
      title="Create commit"
      isOpen={props.isOpen}
      onRequestClose={onClose}
      disabled={!msg.length || loading}
      btnText="Commit"
    >
      <div>
        <p>
          Stages all tables and commits to{" "}
          <span className={css.bold}>{props.params.refName}</span> with the
          provided message.
        </p>
        <Textarea
          label="Message"
          placeholder="Your commit message here"
          value={msg}
          onChangeString={setMsg}
          rows={4}
          required
          light
        />
        <div className={css.authorFields}>
          <FormInput
            value={authorName}
            label="Author Name"
            onChangeString={setAuthorName}
            placeholder="Author Name"
            disabled={hasHeaders}
            light
          />
          <FormInput
            value={authorEmail}
            label="Author Email"
            onChangeString={setAuthorEmail}
            placeholder="author@example.com"
            disabled={hasHeaders}
            light
          />
        </div>
      </div>
    </FormModal>
  );
}

function getDefaultCommitMsg(
  refName: string,
  status: StatusFragment[],
): string {
  return `Changes to ${status
    .map(s => s.tableName)
    .join(", ")} from ${refName}`;
}

function getAuthorArgs(name: Maybe<string>, email: Maybe<string>): string[] {
  if (!name && !email) return [];
  return ["--author", `${name} <${email}>`];
}
