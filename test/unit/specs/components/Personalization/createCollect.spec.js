/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import createCollect from "../../../../../src/components/Personalization/createCollect";

describe("Personalization::createCollect", () => {
  let eventManager;
  let mergeMeta;
  const meta = {
    id: 1,
    decisionId: "foo"
  };
  const event = { type: "blah" };

  beforeEach(() => {
    eventManager = jasmine.createSpyObj("eventManager", {
      sendEvent: undefined,
      createEvent: event
    });
    mergeMeta = jasmine.createSpy("mergeMeta").and.returnValue(meta);
  });

  it("collects and sends event with metadata", () => {
    const collect = createCollect({ eventManager, mergeMeta });
    collect(meta);
    expect(eventManager.createEvent).toHaveBeenCalled();
    expect(mergeMeta).toHaveBeenCalledWith(event, meta);
    expect(eventManager.sendEvent).toHaveBeenCalled();
  });
});