// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Entity, Column, PrimaryColumn, Index } from "typeorm";

@Entity("all_pairs")
export class AllPairs {
  @Index(["factoryAddress", "pairCreationIndex"], { unique: true, name: "unique_factory_address_creation_index" })
  @PrimaryColumn("integer", { generated: true })
  id?: number;

  @Column({ name: "contract_address", type: "varchar", length: 100, unique: true })
  contractAddress: string;

  @Column({ name: "factory_address", type: "varchar", length: 100 })
  factoryAddress: string;

  @Column({ name: "pair_creation_index", type: "integer" })
  pairCreationIndex: number;

  @Column({ name: "added_datetime_utc", type: "timestamptz" })
  addedDatetimeUTC: Date;

  @Column({ name: "added_to_platform", type: "boolean" })
  addedToPlatfrom: boolean;

  @Column({ name: "token0_decimals", type: "integer" })
  token0Decimals: string;

  @Column({ name: "token1_decimals", type: "integer" })
  token1Decimals: string;

  @Column({ name: "token0_address", type: "varchar", length: 100 })
  token0Address: string;

  @Column({ name: "token1_address", type: "varchar", length: 100 })
  token1Address: string;

  @Column({ name: "first_mint_event_block_number", type: "integer", nullable: true })
  firstMintEventBlockNumber: number | null;

  @Column({ name: "first_mint_event_timestamp_utc", type: "timestamptz", nullable: true })
  firstMintEventTimestampUTC: Date | null;
}
