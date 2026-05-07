import { gql } from "@apollo/client";

export const DELETE_ROW = gql`
  mutation DeleteRow(
    $databaseName: String!
    $refName: String!
    $schemaName: String
    $tableName: String!
    $where: [ColumnValueInput!]!
  ) {
    deleteRow(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      tableName: $tableName
      where: $where
    ) {
      rowsAffected
      queryString
      executionMessage
    }
  }
`;

export const INSERT_ROW = gql`
  mutation InsertRow(
    $databaseName: String!
    $refName: String!
    $schemaName: String
    $tableName: String!
    $values: [ColumnValueInput!]!
  ) {
    insertRow(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      tableName: $tableName
      values: $values
    ) {
      rowsAffected
      queryString
      executionMessage
    }
  }
`;
