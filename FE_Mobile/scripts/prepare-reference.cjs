// One-time, read-only survey of the supplied demo. The app never imports demo code.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const demo = path.resolve(root, "../troday-demo");
const catalog = JSON.parse(
  fs.readFileSync(path.join(demo, "docs/api-catalog.json"), "utf8"),
);
const files = [];
function survey(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      ["node_modules", ".git", ".tmp", ".expo", "dist", "build"].includes(
        entry.name,
      )
    )
      continue;
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) survey(target);
    else {
      const bytes = fs.readFileSync(target);
      files.push({
        path: path.relative(demo, target).replaceAll("\\", "/"),
        bytes: bytes.length,
        sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
      });
    }
  }
}
survey(demo);
for (const folder of ["docs", "src/api", "src/assets"])
  fs.mkdirSync(path.join(root, folder), { recursive: true });
fs.writeFileSync(
  path.join(root, "docs/reference-manifest.json"),
  JSON.stringify(files, null, 2),
);
// Preserve only contract metadata, never seed/example data in the executable app.
const contract = {
  basePath: catalog.basePath,
  version: catalog.version,
  date: catalog.date,
  groups: catalog.groups,
  schemas: catalog.schemas,
  endpoints: catalog.endpoints.map(
    ({
      id,
      method,
      path,
      title,
      access,
      input,
      inputFields,
      output,
      headers,
      query,
      pagination,
      logic,
      flowIds,
      group,
      errorCodes,
      status,
      dependencies,
    }) => ({
      id,
      method,
      path,
      title,
      access,
      input,
      inputFields,
      output,
      headers,
      query,
      pagination,
      logic,
      flowIds,
      group,
      errorCodes,
      status,
      dependencies,
    }),
  ),
};
fs.writeFileSync(
  path.join(root, "src/api/contract.json"),
  JSON.stringify(contract, null, 2),
);
fs.writeFileSync(
  path.join(root, "docs/backend-decisions.json"),
  JSON.stringify(catalog.decisions, null, 2),
);
fs.writeFileSync(
  path.join(root, "docs/api-standards.json"),
  JSON.stringify(
    {
      standards: catalog.standards,
      errors: catalog.errors,
      jobs: catalog.jobs,
      qa: catalog.qa,
    },
    null,
    2,
  ),
);
const screen = {
  account: "Tài khoản / Đăng nhập / Xác minh",
  property: "Nhà & phòng / Xác minh nhà",
  posts: "Khám phá / Tin đăng / Đã lưu",
  roommates: "Ở ghép / Kết nối",
  messages: "Tin nhắn / Thông báo",
  viewings: "Lịch xem",
  contracts: "Hợp đồng",
  residents: "Người ở / Đại diện",
  changes: "Thay đổi thuê",
  billing: "Dịch vụ / Hóa đơn",
  moderation: "Quản trị / Báo cáo / Mẫu hợp đồng",
  integrity: "Tệp / Tổng quan",
};
const rows = catalog.endpoints.map(
  (e) =>
    `| ${e.id} — ${e.title} | ${screen[e.group]} | \`${catalog.basePath}${e.path}\` | ${e.method} | Có đặc tả nháp; chưa có backend, chưa xác minh |`,
);
fs.writeFileSync(
  path.join(root, "docs/feature-api-map.md"),
  `# Đối chiếu toàn bộ chức năng – API\n\nNguồn: docs/api-catalog.json của demo, ${catalog.version}, ${catalog.date}.\n\n**176 endpoint là đặc tả đề xuất, không phải 176 API đang hoạt động.** Cần đối chiếu OpenAPI thực tế khi backend sẵn sàng. Không dùng responseExample {id} chung làm DTO tài nguyên. Màn hình không tự tạo các field response chưa được mô tả.\n\n| Chức năng | Màn hình | API sử dụng | Method | Trạng thái backend |\n| --- | --- | --- | --- | --- |\n${rows.join("\n")}\n\n## Luồng demo chưa đủ điều kiện tích hợp\n\n${catalog.decisions.map((d) => `- **${d.id} ${d.title}:** ${d.detail}`).join("\n")}\n\n- Chưa có danh mục tỉnh/phường đã chốt, DTO ảnh tin đăng, nhãn hành động allowedActions và các projection tổng hợp. Không sao chép dữ liệu mẫu demo.\n- Không tự thêm API thanh toán online, sửa email/mật khẩu đang đăng nhập, xóa nhà/phòng, hoặc khôi phục lịch bị đóng.\n`,
);
const inspections = [
  "app.js",
  "house-rights.js",
  "house-proof-store.js",
  "business-guide.js",
  "mobile/App.tsx",
  "mobile/src/engine.ts",
  "mobile/src/ui/NativeWorkflow.tsx",
];
const report = inspections
  .map((name) => {
    const source = fs.readFileSync(path.join(demo, name), "utf8");
    const functions = [
      ...source.matchAll(/(?:async\s+)?function\s+(\w+)/g),
    ].map((m) => m[1]);
    const forms = [
      ...new Set(
        [...source.matchAll(/data-form="([\w-]+)"/g)].map((m) => m[1]),
      ),
    ];
    return `## ${name}\n\n${source.split("\n").length} dòng.\n\nHàm: ${functions.join(", ") || "Component / adapter TypeScript"}.\n\nForm: ${forms.join(", ") || "Không khai báo form HTML"}.\n`;
  })
  .join("\n");
fs.writeFileSync(
  path.join(root, "docs/source-survey.md"),
  `# Khảo sát nguồn demo\n\nĐã lập SHA-256 cho ${files.length} tệp nguồn/tài liệu/tài sản, loại trừ cache/build/dependencies. Mọi thao tác với demo chỉ đọc.\n\n${report}`,
);
console.log(
  `Surveyed ${files.length} files; mapped ${catalog.endpoints.length} endpoints across ${catalog.flows.length} flows.`,
);
