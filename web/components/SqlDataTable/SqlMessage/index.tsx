import { ApolloError } from "@apollo/client";
import ErrorMsg from "@components/ErrorMsg";
import { QueryExecutionStatus } from "@gen/graphql-types";
import { isTimeoutError } from "@lib/errors/helpers";
import { SqlQueryParams } from "@lib/params";
import { isMultipleQueries } from "@lib/parseSqlQuery";
import SuccessMsg from "./SuccessMsg";
import TimeoutMessage from "./TimeoutMsg";
import css from "./index.module.css";
import { improveGqlError } from "./utils";

type TimeoutProps = {
  rowsLen: number;
  params: SqlQueryParams;
};

type Props = TimeoutProps & {
  gqlError?: ApolloError;
  executionStatus?: QueryExecutionStatus;
  executionMessage?: string;
};

export default function SqlMessage(props: Props) {
  if (props.gqlError) {
    if (
      isTimeoutError(props.gqlError.message) ||
      props.gqlError.message === ""
    ) {
      return <TimeoutMessage {...props} />;
    }
    return (
      <ErrorMsg
        className={css.status}
        errString={
          improveGqlError(props.gqlError)?.message || "INTERNAL_SERVER_ERROR"
        }
      />
    );
  }

  switch (props.executionStatus) {
    case QueryExecutionStatus.Success:
      return <SuccessMsg {...props} />;
    case QueryExecutionStatus.Timeout:
      return <TimeoutMessage {...props} />;
    case QueryExecutionStatus.Error:
    default:
      if (props.executionMessage && isTimeoutError(props.executionMessage)) {
        return <TimeoutMessage {...props} />;
      }
      if (isMultipleQueries(props.params.q)) {
        return (
          <ErrorMsg errString="The SQL workbench doesn't support multiple queries" />
        );
      }
      return (
        <ErrorMsg className={css.status} errString={props.executionMessage} />
      );
  }
}