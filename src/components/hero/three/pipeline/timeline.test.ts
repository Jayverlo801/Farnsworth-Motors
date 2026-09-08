import assert from "node:assert/strict";
import { test } from "node:test";
import { PARTS, PART_NAMES } from "../parts";
import { physicalEase, partProgress, completionProgress, pushProgress, FrameHealth } from "../timeline";

test("all 44 contract names are unique and each is choreographed", () => {
  assert.equal(PART_NAMES.length, 44);
  assert.equal(new Set(PART_NAMES).size, 44);
  assert.equal(PARTS.length, 44);
});

test("the full reveal holds, assembles in staggered stages, and is home before the callback", () => {
  for (let i=0; i<PARTS.length; i++) {
    assert.equal(partProgress(i,.75,"full"),0);
    assert.equal(partProgress(i,7,"full"),1,PARTS[i].name);
  }
  assert.ok(partProgress(1,1.8,"full")>0);
  assert.equal(partProgress(PART_NAMES.indexOf("hood"),1.8,"full"),0);
  assert.equal(completionProgress(7,"full"),0);
  assert.equal(completionProgress(9,"full"),1);
});

test("repeat visits start at least 80% home and finish the entire beat in under two seconds", () => {
  for (let i=0; i<PARTS.length; i++) {
    assert.ok(partProgress(i,0,"short")>=.8);
    assert.equal(partProgress(i,1.18,"short"),1);
    assert.equal(partProgress(i,0,"static"),1);
  }
  assert.equal(completionProgress(1.95,"short"),1);
});

test("easing is monotonic with exact endpoints and no overshoot", () => {
  let previous=0;
  for (let i=0;i<=1000;i++) {
    const value=physicalEase(i/1000);
    assert.ok(value>=previous&&value<=1);
    previous=value;
  }
  assert.equal(physicalEase(-2),0);
  assert.equal(physicalEase(2),1);
});

test("the final fifth of the scroll moves only 1% and invalid values stay safe", () => {
  assert.equal(pushProgress(0),0);
  assert.equal(pushProgress(.8),.99);
  assert.equal(pushProgress(1),1);
  assert.equal(pushProgress(NaN),0);
});

test("FPS guard trips after sustained slowness but resets after healthy frames or pause", () => {
  const monitor = new FrameHealth();
  let unavailable=false;
  for(let i=0;i<50;i++) unavailable ||= monitor.sample(1/25)?.unavailable ?? false;
  // Half-second windows may need one additional sample to close the boundary.
  for(let i=0;i<4;i++) unavailable ||= monitor.sample(1/25)?.unavailable ?? false;
  assert.equal(unavailable,true);
  monitor.reset();
  for(let i=0;i<120;i++) assert.notEqual(monitor.sample(1/60)?.unavailable,true);
  for(let i=0;i<20;i++) assert.notEqual(monitor.sample(1/25)?.unavailable,true);
  for(let i=0;i<60;i++) assert.notEqual(monitor.sample(1/60)?.unavailable,true);
  for(let i=0;i<20;i++) assert.notEqual(monitor.sample(1/25)?.unavailable,true);
});
