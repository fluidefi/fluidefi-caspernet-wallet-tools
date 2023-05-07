// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "liquidity_pool" })
export class LiquidityPool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "name" })
  poolName: string;

  @Column({ name: "full_name" })
  fullName: string;

  @Column({ name: "fee_taken" })
  feeTaken: number;

  @Column({ name: "fee_earned" })
  feeEarned: number;

  @Column()
  url: string;

  @Column({ name: "contract_address" })
  contractAddress: string;

  @Column({ name: "network_id" })
  networkId: number;

  @Column({ name: "platform_id" })
  platformId: number;

  @Column({ name: "created_at_block_number" })
  createdAtBlockNumber: number;

  @Column({ name: "created_at_timestamp_utc" })
  createdAtTimestampUtc: Date;

  @Column({ name: "token0_symbol" })
  token0Symbol: string;

  @Column({ name: "token1_symbol" })
  token1Symbol: string;

  @Column({ name: "token0_address" })
  token0Address: string;

  @Column({ name: "token1_address" })
  token1Address: string;

  @Column({ name: "token0_collateral" })
  token0Collateral: number;

  @Column({ name: "token1_collateral" })
  token1Collateral: number;

  @Column({ name: "lp_token0_id" })
  lpToken0Id: number;

  @Column({ name: "lp_token1_id" })
  lpToken1Id: number;

  @Column({ name: "lp_watchlevel" })
  lpWatchLevel: number;

  @Column()
  notes: string;

  @Column({ name: "last_processed" })
  lastProcessed: Date;
}
