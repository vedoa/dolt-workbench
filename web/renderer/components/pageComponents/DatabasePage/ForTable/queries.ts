import { gql } from "@apollo/client";

export const PREVIEW_INSERT_ROW = gql`
  query PreviewInsertRow(
    $databaseName: String!
    $refName: String!
    $schemaName: String
    $tableName: String!
    $values: [ColumnValueInput!]!
  ) {
    previewInsertRow(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      tableName: $tableName
      values: $values
    )
  }
`;
