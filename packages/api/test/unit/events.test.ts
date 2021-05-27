import {AbortController} from "abort-controller";
import {sleep} from "@chainsafe/lodestar-utils";
import {config} from "@chainsafe/lodestar-config/minimal";
import {Api, routesData, EventType, BeaconEvent} from "../../src/routes/events";
import {getClient} from "../../src/client/events";
import {getRoutes} from "../../src/server/events";
import {getMockApi, getTestServer} from "../utils/utils";
import {registerRoutesGroup} from "../../src/server";
import {expect} from "chai";

const root = Buffer.alloc(32, 1);

describe("events", () => {
  const {baseUrl, server} = getTestServer();
  const mockApi = getMockApi<Api>(routesData);
  const routes = getRoutes(config, mockApi);
  registerRoutesGroup(server, routes);

  let controller: AbortController;
  beforeEach(() => (controller = new AbortController()));
  afterEach(() => controller.abort());

  it("Receive events", async () => {
    const eventHead1: BeaconEvent = {
      type: EventType.head,
      message: {
        slot: 1,
        block: root,
        state: root,
        epochTransition: false,
        previousDutyDependentRoot: root,
        currentDutyDependentRoot: root,
      },
    };
    const eventHead2: BeaconEvent = {
      type: EventType.head,
      message: {
        slot: 2,
        block: root,
        state: root,
        epochTransition: true,
        previousDutyDependentRoot: root,
        currentDutyDependentRoot: root,
      },
    };
    const eventChainReorg: BeaconEvent = {
      type: EventType.chainReorg,
      message: {
        slot: 3,
        depth: 2,
        oldHeadBlock: root,
        newHeadBlock: root,
        oldHeadState: root,
        newHeadState: root,
        epoch: 1,
      },
    };

    const eventsToSend: BeaconEvent[] = [eventHead1, eventHead2, eventChainReorg];
    const eventsReceived: BeaconEvent[] = [];

    await new Promise<void>((resolve) => {
      mockApi.eventstream.callsFake(async (topics, signal, onEvent) => {
        for (const event of eventsToSend) {
          onEvent(event);
          await sleep(5);
        }
      });

      // Capture them on the client
      const client = getClient(config, baseUrl);
      client.eventstream([EventType.head, EventType.chainReorg], controller.signal, (event) => {
        eventsReceived.push(event);
        if (eventsReceived.length >= eventsToSend.length) resolve();
      });
    });

    expect(eventsReceived).to.deep.equal(eventsToSend, "Wrong received events");
  });
});