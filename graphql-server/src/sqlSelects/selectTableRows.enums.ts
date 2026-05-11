import { registerEnumType } from "@nestjs/graphql";

export enum SortDirection {
  Asc = "ASC",
  Desc = "DESC",
}

registerEnumType(SortDirection, { name: "SortDirection" });
