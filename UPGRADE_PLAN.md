# KẾ HOẠCH UPGRADE DỰ ÁN PMS OFFICE

> **Ngày tạo:** 21/05/2026  
> **Mục tiêu:** Upgrade toàn bộ thư viện lên phiên bản mới nhất, đảm bảo tương thích và ổn định.

---

## TỔNG QUAN THAY ĐỔI

| Thư viện | Phiên bản cũ | Phiên bản mới | Ghi chú |
|---|---|---|---|
| react | 17.0.2 | 18.3.x | Breaking changes: createRoot API |
| react-dom | 17.0.2 | 18.3.x | Đổi từ ReactDOM.render sang createRoot |
| typescript | 4.x | 5.5.x | Strict mode mới |
| vite | (mới) | 5.4.x | Thay thế CRA (react-scripts) |
| @vitejs/plugin-react-swc | (mới) | 3.7.x | SWC thay Babel |
| antd | 5.1.0 | 5.24.x | Minor update, ít breaking |
| mobx | 6.3.6 | 6.12.x | Minor update |
| mobx-react | 7.2.1 | 9.1.x | API thay đổi nhỏ |
| axios | 0.24.0 | 1.7.x | Breaking: response interceptor |
| firebase | 8.7.0 | 10.13.x | Modular API (tree-shaking) |
| dayjs | 1.11.7 | 1.11.13 | Thay thế moment |
| react-router-dom | 6.4.5 | 6.28.x | Minor update |
| react-big-calendar | 0.40.1 | 1.13.x | Breaking: API mới |
| chart.js | 3.7.1 | 4.4.x | Breaking: config changes |
| react-chartjs-2 | 4.1.0 | 5.2.x | Theo chart.js v4 |
| react-dnd | 11.1.3 | 16.0.x | Breaking: hooks API |
| uuid | 8.3.2 | 10.0.x | Minor |
| eslint | 7.x | 8.57.x | Config format mới |
| prettier | 2.x | 3.3.x | Trailing comma default |
| tailwindcss | (mới) | 3.4.x | Thêm mới |

---

## PHASE 1: CHUẨN BỊ (Ước tính: 1 ngày)

### 1.1 Backup & Branch

```bash
git checkout -b upgrade/latest-libs
git stash  # nếu có thay đổi chưa commit
```

### 1.2 Xóa thư viện không còn dùng

Các package cần **xóa** (đã deprecated hoặc thay thế):

```bash
npm uninstall \
  @craco/craco \
  craco-antd \
  craco-less \
  react-scripts \
  moment \
  moment-timezone \
  @types/moment \
  @types/moment-timezone \
  react-beautiful-dnd \
  @aspnet/signalr \
  office-ui-fabric-react \
  @uifabric/utilities \
  source-map-explorer \
  xlsx \
  yarn \
  @types/jest \
  @types/react-router-dom \
  @types/recharts \
  copy-webpack-plugin \
  eslint-config-airbnb-typescript \
  eslint-plugin-import \
  eslint-plugin-jest \
  eslint-plugin-jsx-a11y \
  husky \
  pretty-quick \
  ts-import-plugin
```

### 1.3 Thay thế tương ứng

| Xóa | Thay bằng | Lý do |
|---|---|---|
| `@craco/craco`, `craco-antd`, `craco-less`, `react-scripts` | `vite`, `@vitejs/plugin-react-swc` | CRA → Vite |
| `moment`, `moment-timezone` | `dayjs` | Nhẹ hơn, tree-shakeable |
| `react-beautiful-dnd` | `@hello-pangea/dnd` | Fork maintained |
| `@aspnet/signalr` | `@microsoft/signalr` | Package mới chính thức |
| `office-ui-fabric-react`, `@uifabric/utilities` | (xóa nếu không dùng) | Deprecated |
| `xlsx` | (giữ nếu cần, hoặc dùng SheetJS community) | License thay đổi |

---

## PHASE 2: UPGRADE CORE (Ước tính: 2-3 ngày)

### 2.1 React 17 → 18

```bash
npm install react@^18.3.1 react-dom@^18.3.1
npm install -D @types/react@^18.3.3 @types/react-dom@^18.3.0
```

**Thay đổi code:**

```tsx
// src/index.tsx - CŨ
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// src/index.tsx - MỚI
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

### 2.2 CRA → Vite

```bash
npm install -D vite@^5.4.1 @vitejs/plugin-react-swc@^3.7.0
```

Tạo file `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { src: '/src' },
  },
  css: {
    preprocessorOptions: {
      less: { javascriptEnabled: true },
    },
  },
  server: { port: 3000 },
});
```

Tạo `index.html` ở root (di chuyển từ `public/index.html`), thêm:
```html
<script type="module" src="/src/index.tsx"></script>
```

Cập nhật `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### 2.3 TypeScript 4 → 5

```bash
npm install -D typescript@^5.5.4
```

Cập nhật `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": { "src/*": ["src/*"] }
  },
  "include": ["src"]
}
```

---

## PHASE 3: UPGRADE DEPENDENCIES (Ước tính: 3-5 ngày)

### 3.1 Axios 0.24 → 1.7

```bash
npm install axios@^1.7.9
```

**Breaking changes cần sửa:**
- `axios.defaults.baseURL` vẫn hoạt động
- Response error interceptor: `error.response` có thể undefined
- Header access: `response.headers['content-type']` → dùng `AxiosHeaders`

### 3.2 Firebase 8 → 10 (Modular)

```bash
npm install firebase@^10.13.0
```

**Breaking changes:**
```ts
// CŨ (compat/namespaced)
import firebase from 'firebase/app';
import 'firebase/messaging';
const messaging = firebase.messaging();

// MỚI (modular)
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
const app = initializeApp(config);
const messaging = getMessaging(app);
```

### 3.3 MobX 6.3 → 6.12 & mobx-react 7 → 9

```bash
npm install mobx@^6.12.4 mobx-react@^9.1.1
```

**Thay đổi:** Hầu như không có breaking change. `mobx-react` v9 yêu cầu React 18.

### 3.4 Chart.js 3 → 4 & react-chartjs-2 4 → 5

```bash
npm install chart.js@^4.4.7 react-chartjs-2@^5.2.0 chartjs-plugin-datalabels@^2.2.0
```

**Breaking changes:**
- `Chart.register(...)` vẫn cần thiết
- Một số option đổi vị trí (scales config)

### 3.5 react-big-calendar 0.40 → 1.13

```bash
npm install react-big-calendar@^1.13.0
```

**Breaking changes:**
- Localizer: dùng `dayjsLocalizer(dayjs)` thay `momentLocalizer`
- Một số props đổi tên

### 3.6 react-dnd 11 → 16

```bash
npm install react-dnd@^16.0.1 react-dnd-html5-backend@^16.0.1
```

**Breaking changes:**
- Bắt buộc dùng hooks API (`useDrag`, `useDrop`)
- `DndProvider` wrapper vẫn giữ nguyên

### 3.7 Moment → DayJS (đã thực hiện 1 phần)

File `src/lib/dayjs.ts` đã được tạo. Cần:
- Tìm tất cả `import moment` → thay bằng `import dayjs from 'src/lib/dayjs'`
- Thay `moment()` → `dayjs()`
- Thay `moment.format()` → `dayjs().format()`
- Thay `moment.tz()` → `dayjs().tz()`

### 3.8 ESLint 7 → 8

```bash
npm install -D \
  eslint@^8.57.0 \
  @typescript-eslint/eslint-plugin@^7.18.0 \
  @typescript-eslint/parser@^7.18.0 \
  eslint-config-prettier@^9.1.0 \
  eslint-plugin-prettier@^5.2.1 \
  eslint-plugin-react@^7.35.0 \
  eslint-plugin-react-hooks@^4.6.2
```

### 3.9 Prettier 2 → 3

```bash
npm install -D prettier@^3.3.3
```

**Lưu ý:** Default trailing comma đổi thành `"all"`. Chạy `npx prettier --write src` sau upgrade.

### 3.10 Thêm TailwindCSS

```bash
npm install -D tailwindcss@^3.4.10 postcss@^8.4.41 autoprefixer@^10.4.20
npx tailwindcss init -p
```

### 3.11 Các thư viện khác

```bash
npm install \
  @ant-design/colors@^7.1.0 \
  @ant-design/compatible@^5.1.2 \
  @ant-design/icons@^5.4.0 \
  @hello-pangea/dnd@^16.6.0 \
  @microsoft/signalr@^8.0.7 \
  antd@^5.24.0 \
  classnames@^2.5.1 \
  file-saver@^2.0.5 \
  qrcode.react@^3.1.0 \
  query-string@^7.1.3 \
  react-infinite-scroller@^1.2.6 \
  react-router-dom@^6.28.0 \
  react-to-print@^2.15.1 \
  use-merge-value@^1.2.0 \
  uuid@^10.0.0 \
  qs@^6.15.2
```

---

## PHASE 4: SỬA LỖI & KIỂM TRA (Ước tính: 3-5 ngày)

### 4.1 Fix TypeScript errors

```bash
npx tsc --noEmit
```

Sửa lần lượt theo từng module. Ưu tiên:
1. `src/services/` - API layer
2. `src/stores/` - State layer
3. `src/components/` - Shared components
4. `src/scenes/` - Pages

### 4.2 Fix ESLint

```bash
npm run lint:fix
```

### 4.3 Test build

```bash
npm run build
```

### 4.4 Test runtime

```bash
npm run dev
```

Kiểm tra các chức năng chính:
- [ ] Login/Logout
- [ ] Dashboard
- [ ] CRUD operations (tạo/sửa/xóa)
- [ ] Calendar (react-big-calendar)
- [ ] Charts (chart.js)
- [ ] File upload/download
- [ ] Notifications (Firebase)
- [ ] SignalR realtime
- [ ] PDF viewer
- [ ] Print functionality
- [ ] Drag & Drop

---

## PHASE 5: CLEANUP & OPTIMIZE (Ước tính: 1 ngày)

### 5.1 Xóa file không dùng

- `craco.config.js` (nếu còn)
- `config-overrides.js` (nếu còn)
- Các file config CRA

### 5.2 Cập nhật .env

```env
# Vite dùng prefix VITE_ thay REACT_APP_
VITE_APP_BASE_URL=...
VITE_REMOTE_SERVICE_BASE_URL=...
```

**Lưu ý:** Tất cả `process.env.REACT_APP_*` → `import.meta.env.VITE_*`

### 5.3 Format lại code

```bash
npm run prettier:write
```

---

## LỆNH UPGRADE NHANH (1 lần chạy)

```bash
# Xóa packages cũ
npm uninstall @craco/craco craco-antd craco-less react-scripts moment moment-timezone \
  @types/moment @types/moment-timezone react-beautiful-dnd @aspnet/signalr \
  office-ui-fabric-react @uifabric/utilities source-map-explorer xlsx yarn \
  @types/jest @types/recharts copy-webpack-plugin eslint-config-airbnb-typescript \
  eslint-plugin-import eslint-plugin-jest eslint-plugin-jsx-a11y husky pretty-quick \
  ts-import-plugin @ant-design/codemod-v4 @types/react-resizable

# Cài dependencies mới
npm install \
  react@^18.3.1 react-dom@^18.3.1 \
  @ant-design/colors@^7.1.0 @ant-design/compatible@^5.1.2 @ant-design/icons@^5.4.0 \
  @hello-pangea/dnd@^16.6.0 @microsoft/signalr@^8.0.7 \
  antd@^5.24.0 axios@^1.7.9 chart.js@^4.4.7 chartjs-plugin-datalabels@^2.2.0 \
  classnames@^2.5.1 dayjs@^1.11.13 file-saver@^2.0.5 firebase@^10.13.0 \
  mobx@^6.12.4 mobx-react@^9.1.1 qrcode.react@^3.1.0 qs@^6.15.2 \
  query-string@^7.1.3 react-big-calendar@^1.13.0 react-chartjs-2@^5.2.0 \
  react-dnd@^16.0.1 react-dnd-html5-backend@^16.0.1 react-router-dom@^6.28.0 \
  react-to-print@^2.15.1 use-merge-value@^1.2.0 uuid@^10.0.0 \
  react-infinite-scroller@^1.2.6

# Cài devDependencies mới
npm install -D \
  @types/react@^18.3.3 @types/react-dom@^18.3.0 @types/node@^20.16.1 \
  @types/classnames@^2.3.1 @types/file-saver@^2.0.7 @types/lodash@^4.17.24 \
  @types/qs@^6.15.1 @types/react-loadable@^5.5.8 @types/uuid@^10.0.0 \
  @typescript-eslint/eslint-plugin@^7.18.0 @typescript-eslint/parser@^7.18.0 \
  @vitejs/plugin-react-swc@^3.7.0 autoprefixer@^10.4.20 \
  eslint@^8.57.0 eslint-config-prettier@^9.1.0 eslint-plugin-prettier@^5.2.1 \
  eslint-plugin-react@^7.35.0 eslint-plugin-react-hooks@^4.6.2 \
  less@^4.2.0 postcss@^8.4.41 prettier@^3.3.3 \
  tailwindcss@^3.4.10 typescript@^5.5.4 vite@^5.4.1
```

---

## RỦI RO & LƯU Ý

| Rủi ro | Mức độ | Giải pháp |
|---|---|---|
| Firebase modular migration | Cao | Có thể dùng `firebase/compat` tạm thời |
| react-big-calendar breaking | Trung bình | Test kỹ calendar module |
| Antd 5 CSS-in-JS | Thấp | Đã ở v5.1, chỉ minor update |
| DevExtreme version lock | Thấp | Giữ nguyên 23.1.5 (license) |
| @syncfusion version | Thấp | Giữ nguyên (license) |
| Less → CSS Modules | Trung bình | Đổi `.less` → `.module.less` dần |

---

## TIMELINE ƯỚC TÍNH

| Phase | Thời gian | Người thực hiện |
|---|---|---|
| Phase 1: Chuẩn bị | 1 ngày | Dev |
| Phase 2: Core upgrade | 2-3 ngày | Dev |
| Phase 3: Dependencies | 3-5 ngày | Dev |
| Phase 4: Fix & Test | 3-5 ngày | Dev + QA |
| Phase 5: Cleanup | 1 ngày | Dev |
| **Tổng** | **10-15 ngày** | |

---

## CHECKLIST HOÀN THÀNH

- [ ] Xóa packages deprecated
- [ ] React 18 + createRoot
- [ ] Vite thay CRA
- [ ] TypeScript 5
- [ ] Moment → DayJS hoàn tất
- [ ] Firebase modular
- [ ] Axios v1
- [ ] Chart.js v4
- [ ] react-big-calendar v1
- [ ] react-dnd v16
- [ ] ESLint 8 + Prettier 3
- [ ] TailwindCSS
- [ ] REACT_APP_ → VITE_
- [ ] Build thành công
- [ ] Tất cả chức năng hoạt động
- [ ] Code format chuẩn
