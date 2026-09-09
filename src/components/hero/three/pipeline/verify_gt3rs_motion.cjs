// Validate the encoded preview against the Blender render report and source.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const source = path.join(process.cwd(), 'assets/3d/source/gt3rs-study');
const reportPath = path.join(source, 'motion-verification.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
assert.equal(report.sourceSha256, hash(path.join(source, 'gt3rs-study.blend')), 'Preview uses an older source');
assert.equal(report.renderedPoses + report.identicalHoldFrames, 270);
const video = path.join(source, 'assembly-preview.mp4');
const metadata = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,duration', '-of', 'json', video], { encoding: 'utf8' }));
assert.equal(metadata.streams.length, 1, 'Expected one video stream without audio');
const stream = metadata.streams[0];
assert.equal(stream.codec_type, 'video');
assert.equal(stream.codec_name, 'h264');
assert.equal(stream.width, 1280);
assert.equal(stream.height, 800);
assert.equal(stream.r_frame_rate, '30/1');
assert.equal(Number(stream.nb_frames), 270);
assert.equal(Number(stream.duration), 9);
// Decode all frames, not only the container header.
execFileSync('ffmpeg', ['-v', 'error', '-i', video, '-f', 'null', '-'], { stdio: ['ignore', 'ignore', 'pipe'] });
report.passed = true;
report.encoded = { codec: stream.codec_name, bytes: fs.statSync(video).size, sha256: hash(video), decodedAllFrames: true };
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
