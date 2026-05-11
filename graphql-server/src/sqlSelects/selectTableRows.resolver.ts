import {
  Args,
  ArgsType,
  Field,
  InputType,
  Int,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { ColumnValueInput } from "../rows/rowMutation.resolver";
import { TableMaybeSchemaArgs } from "../utils/commonTypes";
import { SqlSelect, fromServerPaginatedRows } from "./sqlSelect.model";
import { SortDirection } from "./selectTableRows.enums";

@InputType()
export class OrderByClause {
  @Field()
  column: string;

  @Field(_type => SortDirection)
  direction: SortDirection;
}

@InputType()
export class PkRow {
  @Field(_type => [ColumnValueInput])
  values: ColumnValueInput[];
}

@ArgsType()
export class SelectTableRowsArgs extends TableMaybeSchemaArgs {
  @Field(_type => [OrderByClause], { nullable: true })
  orderBy?: OrderByClause[];

  @Field(_type => [ColumnValueInput], { nullable: true })
  where?: ColumnValueInput[];

  @Field(_type => [PkRow], { nullable: true })
  excludePks?: PkRow[];

  @Field(_type => [String], { nullable: true })
  projection?: string[];

  @Field(_type => Int, { nullable: true })
  offset?: number;
}

@Resolver()
export class SelectTableRowsResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(_returns => SqlSelect)
  async selectTableRows(
    @Args() args: SelectTableRowsArgs,
  ): Promise<SqlSelect> {
    const conn = this.conn.connection();
    const offset = args.offset ?? 0;
    const res = await conn.selectTableRows(args);
    return fromServerPaginatedRows(
      args.databaseName,
      args.refName,
      res.rows,
      res.executionMessage,
      res.queryString ?? "",
      offset,
      res.warnings,
    );
  }
}
