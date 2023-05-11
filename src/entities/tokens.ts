// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "erc20_token" })
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: "token_address" })
  tokenAddress: string;

  @Column({ name: "token_decimals" })
  tokenDecimals: number;

  @Column({ name: "token_name" })
  tokenName: string;

  @Column({ name: "token_symbol" })
  tokenSymbol: string;

  @Column({ name: "is_lp_token" })
  isLpToken: boolean;

  @Column({ name: "token_type" })
  tokenType: string;

  @Column({ name: "passed_qa" })
  passedQa: boolean;
}
