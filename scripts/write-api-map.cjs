const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'shared/api/contract.json'), 'utf8'));
const controllerRoot = path.join(root, 'BE/src/main/java/com/troday/api/controller');
const routes = [];
const normalize = p => p.replace(/\{[^}]+\}/g, '{}');
for (const file of fs.readdirSync(controllerRoot).filter(f => f.endsWith('.java'))) {
  const source = fs.readFileSync(path.join(controllerRoot, file), 'utf8');
  for (const match of source.matchAll(/@(Get|Post|Put|Patch|Delete)Mapping\(\s*(?:value\s*=\s*)?"([^"]+)"/g))
    routes.push({method:match[1].toUpperCase(),path:match[2],file,line:source.slice(0,match.index).split('\n').length});
}
const lines = ['# Đối chiếu chức năng – API đang nối', '',
  'Nguồn chuẩn: controller/service BE hiện tại. Catalogue dùng chung: `shared/api/contract.json`.',
  'Đã nối request/response không đồng nghĩa đã nghiệm thu transaction hoặc toàn bộ nghiệp vụ với DB thật. Xem [hướng dẫn và giới hạn](../../docs/API-CONNECTION.md).', '',
  '| API | Chức năng | Method | Đường dẫn | Controller BE | Trạng thái FE |',
  '| --- | --- | --- | --- | --- | --- |'];
for (const e of catalog.endpoints) {
  const route = routes.find(r => r.method === e.method && normalize(r.path) === normalize(e.path));
  if (!route) throw new Error('Missing BE route: '+e.id);
  lines.push(`| ${e.id} | ${e.title} | ${e.method} | \`/api/v1${e.path}\` | ${route.file}:${route.line} | ${e.blockedReason ? 'Chưa khả dụng: '+e.blockedReason : 'Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB'} |`);
}
fs.writeFileSync(path.join(root,'FE_Mobile/docs/feature-api-map.md'),lines.join('\n')+'\n');
console.log(`Wrote ${catalog.endpoints.length} verified route mappings.`);
