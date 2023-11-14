import "../setup.js";
import {assert, expect} from "chai";
import {intToBytes, bytesToInt, toHex, fromHex, toHexString} from "../../src/index.js";

describe("intToBytes", () => {
  const zeroedArray = (length: number): number[] => Array.from({length}, () => 0);
  const testCases: {input: [bigint | number, number]; output: Buffer}[] = [
    {input: [255, 1], output: Buffer.from([255])},
    {input: [1, 4], output: Buffer.from([1, 0, 0, 0])},
    {input: [BigInt(255), 1], output: Buffer.from([255])},
    {input: [65535, 2], output: Buffer.from([255, 255])},
    {input: [BigInt(65535), 2], output: Buffer.from([255, 255])},
    {input: [16777215, 3], output: Buffer.from([255, 255, 255])},
    {input: [BigInt(16777215), 3], output: Buffer.from([255, 255, 255])},
    {input: [4294967295, 4], output: Buffer.from([255, 255, 255, 255])},
    {input: [BigInt(4294967295), 4], output: Buffer.from([255, 255, 255, 255])},
    {input: [65535, 8], output: Buffer.from([255, 255, ...zeroedArray(8 - 2)])},
    {input: [BigInt(65535), 8], output: Buffer.from([255, 255, ...zeroedArray(8 - 2)])},
    {input: [65535, 32], output: Buffer.from([255, 255, ...zeroedArray(32 - 2)])},
    {input: [BigInt(65535), 32], output: Buffer.from([255, 255, ...zeroedArray(32 - 2)])},
    {input: [65535, 48], output: Buffer.from([255, 255, ...zeroedArray(48 - 2)])},
    {input: [BigInt(65535), 48], output: Buffer.from([255, 255, ...zeroedArray(48 - 2)])},
    {input: [65535, 96], output: Buffer.from([255, 255, ...zeroedArray(96 - 2)])},
    {input: [BigInt(65535), 96], output: Buffer.from([255, 255, ...zeroedArray(96 - 2)])},
  ];
  for (const {input, output} of testCases) {
    const type = typeof input;
    const length = input[1];
    it(`should correctly serialize ${type} to bytes length ${length}`, () => {
      assert(intToBytes(input[0], input[1]).equals(output));
    });
  }
});

describe("bytesToInt", () => {
  const testCases: {input: Buffer; output: number}[] = [
    {input: Buffer.from([3]), output: 3},
    {input: Buffer.from([20, 0]), output: 20},
    {input: Buffer.from([3, 20]), output: 5123},
    {input: Buffer.from([255, 255]), output: 65535},
    {input: Buffer.from([255, 255, 255]), output: 16777215},
    {input: Buffer.from([255, 255, 255, 255]), output: 4294967295},
  ];
  for (const {input, output} of testCases) {
    it(`should produce ${output}`, () => {
      expect(bytesToInt(input)).to.be.equal(output);
    });
  }
});

describe("toHex function", () => {
  it("should convert a Buffer to hex string", () => {
    const buffer = Buffer.from("Hello, World!", "utf-8");
    const result = toHex(buffer);
    const expected = "0x48656c6c6f2c20576f726c6421";

    expect(result).to.equal(expected);
  });

  it("should convert a Uint8Array to hex string", () => {
    const uint8Array = new Uint8Array([72, 101, 108, 108, 111]);
    const result = toHex(uint8Array);
    const expected = "0x48656c6c6f";

    expect(result).to.equal(expected);
  });

  it("should convert an array to hex string", () => {
    const array = Buffer.from([72, 101, 108, 108, 111]);
    const result = toHex(array);
    const expected = "0x48656c6c6f";

    expect(result).to.equal(expected);
  });

  it("should handle an empty input", () => {
    const result = toHex(Buffer.from([]));
    const expected = "0x";

    expect(result).to.equal(expected);
  });

  it("should handle invalid input", () => {
    const result = toHex("invalidInput");
    const expected = "0x";

    expect(result).to.equal(expected);
  });
});

describe("fromHex function", () => {
  it("should convert hex string to Uint8Array", () => {
    const hexString = "0x48656c6c6f2c20576f726c6421";
    const result = fromHex(hexString);
    const expected = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]);

    expect(result).to.deep.equal(expected);
  });

  it("should handle hex string without 0x prefix", () => {
    const hexString = "48656c6c6f2c20576f726c6421";
    const result = fromHex(hexString);
    const expected = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]);

    expect(result).to.deep.equal(expected);
  });

  it("should handle empty hex string", () => {
    const hexString = "0x";
    const result = fromHex(hexString);
    const expected = new Uint8Array([]);

    expect(result).to.deep.equal(expected);
  });

  it("should throw an error for invalid hex string", () => {
    const hexString = "invalidHex";
    expect(() => fromHex(hexString)).to.throw();
  });
});

describe("toHexString function", () => {
  it("should convert Uint8Array to hex string", () => {
    const bytes = new Uint8Array([72, 101, 108, 108, 111]);
    const result = toHexString(bytes);
    const expected = "0x48656c6c6f";

    expect(result).to.equal(expected);
  });

  it("should handle Uint8Array with single-digit bytes", () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const result = toHexString(bytes);
    const expected = "0x010203";

    expect(result).to.equal(expected);
  });

  it("should handle Uint8Array with zero-length", () => {
    const bytes = new Uint8Array([]);
    const result = toHexString(bytes);
    const expected = "0x";

    expect(result).to.equal(expected);
  });

  it("should handle Uint8Array with all zeros", () => {
    const bytes = new Uint8Array([0, 0, 0, 0]);
    const result = toHexString(bytes);
    const expected = "0x00000000";

    expect(result).to.equal(expected);
  });

  it("should handle Uint8Array with mixed single and double-digit bytes", () => {
    const bytes = new Uint8Array([15, 255, 16, 0, 127]);
    const result = toHexString(bytes);
    const expected = "0x0fff10007f";

    expect(result).to.equal(expected);
  });

  it("should handle large Uint8Array", () => {
    const bytes = new Uint8Array(1000).fill(255);
    const result = toHexString(bytes);
    const expected = "0xff".repeat(1000);

    expect(result).to.equal(expected);
  });
});
