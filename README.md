# PMS Office

Hệ thống quản lý tòa nhà & văn phòng (Property Management System) — giao diện web dành cho nhân viên vận hành, quản trị viên và ban quản lý dự án.

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng](#tính-năng)
- [Công nghệ](#công-nghệ)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt & Khởi chạy](#cài-đặt--khởi-chạy)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Biến môi trường](#biến-môi-trường)
- [Script NPM](#script-npm)

---

## Tổng quan

**PMS Office** là ứng dụng web SPA (Single Page Application) được xây dựng với React + TypeScript, phục vụ việc quản lý toàn diện các nghiệp vụ của một tòa nhà hoặc khu văn phòng, bao gồm: quản lý cư dân/thành viên, tài chính, đặt phòng, bảo trì, giao nhận hàng, bãi đỗ xe và nhiều hơn nữa.

Hệ thống tích hợp real-time thông qua **SignalR**, hỗ trợ thông báo đẩy qua **Firebase**, và sử dụng **MobX** để quản lý state toàn cục.

---

## Tính năng

| Nhóm | Chức năng |
|---|---|
| **Quản trị** | Quản lý người dùng, phân quyền, cấu hình hệ thống |
| **Dự án** | Quản lý đa dự án, chuyển đổi giữa các dự án |
| **Cư dân / Thành viên** | Hồ sơ thành viên, nhóm khách hàng, thủ tục bàn giao |
| **Tài chính** | Sao kê phí, phiếu thu, yêu cầu thanh toán, tỉ giá ngoại tệ |
| **Bán hàng & Cho thuê** | Hợp đồng mua bán, cho thuê, tổ chức bán hàng |
| **Đặt chỗ** | Đặt chỗ tiện ích, quản lý cơ sở vật chất |
| **Bảo trì & Vệ sinh** | Kế hoạch bảo dưỡng, vệ sinh, làm vườn |
| **Kho & Hàng hóa** | Quản lý kho, giao nhận hàng |
| **Bãi đỗ xe** | Quản lý thẻ xe, vị trí đỗ xe |
| **Giao tiếp** | Thông báo nội bộ, mẫu thông báo, lịch sử chatbot |
| **Quy trình** | Workflow phê duyệt, e-Form |
| **Đồng hồ điện/nước** | Ghi chỉ số, quản lý đồng hồ |
| **Báo cáo** | Dashboard tổng hợp, biểu đồ phân tích |

---

## Công nghệ

- **Framework:** [React 18](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Build tool:** [Vite 5](https://vitejs.dev/) với plugin `@vitejs/plugin-react-swc`
- **UI Library:** [Ant Design 5](https://ant.design/)
- **State Management:** [MobX 6](https://mobx.js.org/)
- **Routing:** [React Router DOM v6](https://reactrouter.com/)
- **Real-time:** [Microsoft SignalR](https://docs.microsoft.com/aspnet/core/signalr)
- **Biểu đồ:** [amCharts 4](https://www.amcharts.com/), [Chart.js 4](https://www.chartjs.org/), [DevExtreme](https://js.devexpress.com/)
- **Rich Text / Document:** [CKEditor 5](https://ckeditor.com/), [Syncfusion Document Editor](https://www.syncfusion.com/)
- **PDF:** [React PDF Viewer](https://react-pdf-viewer.dev/), [pdf.js](https://mozilla.github.io/pdf.js/)
- **Thông báo đẩy:** [Firebase 10](https://firebase.google.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Styling:** LESS + [Tailwind CSS](https://tailwindcss.com/)
- **Linting / Format:** ESLint + Prettier

---

## Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---|---|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| Trình duyệt | Chrome / Edge / Firefox (phiên bản mới nhất) |

---

## Cài đặt & Khởi chạy

### 1. Clone dự án

```bash
git clone <repository-url>
cd PMS_Office_New
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình biến môi trường

Sao chép file `.env` mẫu và điền thông tin phù hợp:

```bash
cp .env .env.local
```

Xem mục [Biến môi trường](#biến-môi-trường) để biết chi tiết các biến cần cấu hình.

### 4. Khởi chạy môi trường phát triển

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:3000**

### 5. Build production

```bash
npm run build
```

File output sẽ được tạo trong thư mục `dist/`.

---

## Cấu trúc thư mục

```
PMS_Office_New/
├── public/                 # Tài nguyên tĩnh
├── src/
│   ├── assets/             # Hình ảnh, icon, font
│   ├── components/         # Các component dùng chung (Layout, UI)
│   ├── lib/                # Hằng số, helper, SignalR, ABP
│   ├── models/             # Kiểu dữ liệu / interface
│   ├── scenes/             # Các màn hình / trang của ứng dụng
│   │   ├── accounts/
│   │   ├── administrator/
│   │   ├── booking/
│   │   ├── finance/
│   │   ├── member/
│   │   ├── parking/
│   │   └── ...             # ~40 module nghiệp vụ
│   ├── services/           # Gọi API theo từng nghiệp vụ
│   ├── stores/             # MobX stores (state management)
│   ├── utils/              # Hàm tiện ích dùng chung
│   ├── App.tsx             # Component gốc
│   └── index.tsx           # Entry point
├── .env                    # Biến môi trường
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Biến môi trường

Tạo file `.env.local` (hoặc chỉnh sửa `.env`) với các biến sau:

```env
# URL của API backend (ABP Framework)
VITE_APP_REMOTE_SERVICE_BASE_URL=https://api.example.com

# Tên ứng dụng hiển thị
VITE_APP_APPLICATION_NAME=PMS Office

# Firebase (thông báo đẩy)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Syncfusion license key (nếu dùng Syncfusion components)
VITE_SYNCFUSION_LICENSE=
```

> **Lưu ý:** Không commit file `.env.local` lên repository vì chứa thông tin nhạy cảm.

---

## Script NPM

| Script | Mô tả |
|---|---|
| `npm run dev` | Khởi chạy dev server tại port 3000 |
| `npm run build` | Build production (`tsc` + Vite) |
| `npm run preview` | Xem trước bản build production |
| `npm run lint:check` | Kiểm tra lỗi ESLint |
| `npm run lint:fix` | Tự động sửa lỗi ESLint |
| `npm run prettier:check` | Kiểm tra format code |
| `npm run prettier:write` | Tự động format code |

---

## Giấy phép

Dự án nội bộ — Bảo mật. Không phân phối ra bên ngoài.
