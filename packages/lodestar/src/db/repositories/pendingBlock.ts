import {IBeaconConfig} from "@chainsafe/lodestar-config";
import {Bucket, IDatabaseController, Repository} from "@chainsafe/lodestar-db";
import {allForks} from "@chainsafe/lodestar-types";
import {getSignedBlockType, getSignedBlockTypeFromBytes} from "../../util/multifork";

/**
 * Blocks by root
 *
 * Used to store pending blocks
 */
export class PendingBlockRepository extends Repository<Uint8Array, allForks.SignedBeaconBlock> {
  constructor(config: IBeaconConfig, db: IDatabaseController<Buffer, Buffer>) {
    const type = config.types.phase0.SignedBeaconBlock; // Pick some type but won't be used
    super(config, db, Bucket.allForks_pendingBlock, type);
  }

  /**
   * Id is hashTreeRoot of unsigned BeaconBlock
   */
  getId(value: allForks.SignedBeaconBlock): Uint8Array {
    return getSignedBlockType(this.config, value).fields["message"].hashTreeRoot(value.message);
  }

  encodeValue(value: allForks.SignedBeaconBlock): Buffer {
    return getSignedBlockType(this.config, value).serialize(value) as Buffer;
  }

  decodeValue(data: Buffer): allForks.SignedBeaconBlock {
    return getSignedBlockTypeFromBytes(this.config, data).deserialize(data);
  }
}