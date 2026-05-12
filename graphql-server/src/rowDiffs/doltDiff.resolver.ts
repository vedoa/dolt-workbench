import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { ColumnValueInput } from "../rows/rowMutation.resolver";
import { TableMaybeSchemaArgs } from "../utils/commonTypes";

@ArgsType()
export class DoltCellLookupArgs extends TableMaybeSchemaArgs {
  @Field(_type => [ColumnValueInput])
  pkValues: ColumnValueInput[];

  @Field({ nullable: true })
  columnName?: string;
}

@Resolver()
export class DoltDiffResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(_returns => String)
  async doltCellDiff(@Args() args: DoltCellLookupArgs): Promise<string> {
    const conn = this.conn.connection();
    return conn.doltCellDiff(args);
  }

  @Query(_returns => String)
  async doltCellHistory(@Args() args: DoltCellLookupArgs): Promise<string> {
    const conn = this.conn.connection();
    return conn.doltCellHistory(args);
  }
}
