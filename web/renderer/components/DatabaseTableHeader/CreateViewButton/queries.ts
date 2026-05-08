import { gql } from "@apollo/client";

export const CREATE_VIEW = gql`
  mutation CreateView(
    $databaseName: String!
    $refName: String!
    $schemaName: String
    $name: String!
    $queryString: String!
  ) {
    createView(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      name: $name
      queryString: $queryString
    ) {
      rowsAffected
      queryString
      executionMessage
    }
  }
`;
