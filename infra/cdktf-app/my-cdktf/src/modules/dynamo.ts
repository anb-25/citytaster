/** Purpose: Small DynamoDB table (on-demand) for sessions/state. */
import { Construct } from "constructs";
import { DynamodbTable } from "@cdktf/provider-aws/lib/dynamodb-table";

export interface DynamoProps { tableName: string; }

export class DynamoModule extends Construct {
  readonly tableName: string;
  constructor(scope: Construct, id: string, p: DynamoProps) {
    super(scope, id);
    const t = new DynamodbTable(this, "table", {
      name: p.tableName,
      billingMode: "PAY_PER_REQUEST",
      hashKey: "pk",
      attribute: [{ name: "pk", type: "S" }],
      pointInTimeRecovery: { enabled: true }
    });
    this.tableName = t.name;
  }
}
