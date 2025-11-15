# GIẢI THÍCH CODE SVG EDITOR

## 📋 TỔNG QUAN

Ứng dụng SVG Editor cho phép chỉnh sửa SVG với các tính năng:

- ✅ Chỉnh màu background
- ✅ Upload và thay logo
- ✅ Chỉnh sửa text (header và subhead)
- ✅ Thay đổi font, màu, kích thước text
- ✅ Kéo thả text để di chuyển vị trí
- ✅ Hỗ trợ cả desktop (mouse) và mobile (touch)

---

## 🗂️ CẤU TRÚC STATE

### EditorState Interface

```typescript
interface EditorState {
  backgroundColor: string; // Màu nền
  logoUrl: string; // URL hoặc base64 của logo
  brandingText: string; // Nội dung header
  brandingColor: string; // Màu chữ header
  brandingFont: string; // Font chữ header
  brandingFontSize: number; // Kích thước font header
  brandingPosition: TextPosition; // Vị trí header trong SVG
  sloganText: string; // Nội dung subhead
  sloganColor: string; // Màu chữ subhead
  sloganFont: string; // Font chữ subhead
  sloganFontSize: number; // Kích thước font subhead
  sloganPosition: TextPosition; // Vị trí subhead trong SVG
}
```

**Mục đích**: Lưu trữ toàn bộ trạng thái của editor. Mọi thay đổi đều được lưu ở đây và tự động cập nhật vào SVG.

---

### State Variables

```typescript
const [state, setState] = useState<EditorState>({...});  // State chính
const [dragging, setDragging] = useState<string | null>(null);  // Text đang được kéo
const [dragOffset, setDragOffset] = useState<TextPosition>({ x: 0, y: 0 });  // Offset khi kéo
const svgRef = useRef<SVGSVGElement>(null);  // Reference đến SVG element
```

---

## 🔧 CÁC TÍNH NĂNG CHÍNH

### 1. Upload Logo

```typescript
const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      setState((prev) => ({
        ...prev,
        logoUrl: event.target?.result as string, // Lưu base64
      }));
    };
    reader.readAsDataURL(file); // Chuyển file thành base64
  }
};
```

**Cách hoạt động**: Đọc file ảnh, chuyển thành base64 string, lưu vào state. SVG tự động hiển thị logo mới.

---

### 2. Kéo Thả Text

**Desktop (Mouse)**:

- `onMouseDown` → Bắt đầu kéo
- `mousemove` → Di chuyển text
- `mouseup` → Kết thúc kéo

**Mobile (Touch)**:

- `onTouchStart` → Bắt đầu kéo
- `touchmove` → Di chuyển text
- `touchend` → Kết thúc kéo

**Cách hoạt động**:

1. User click/touch vào text
2. Tính `dragOffset` (khoảng cách từ điểm click đến vị trí text)
3. Khi di chuyển, tính vị trí mới = vị trí chuột/touch - dragOffset
4. Cập nhật state → React re-render → text di chuyển

---

### 3. Chỉnh Sửa Text

Mỗi text (branding và slogan) có 4 controls:

- **Text Input**: Thay đổi nội dung
- **Color Picker**: Thay đổi màu chữ
- **Font Select**: Chọn font
- **Font Size**: Thay đổi kích thước

Tất cả đều dùng `onChange` để cập nhật state, SVG tự động cập nhật.

---

## 🎨 UI COMPONENTS

### Layout

```
┌─────────────────────────────────────┐
│         SVG Editor (Title)          │
├──────────────┬──────────────────────┤
│              │                      │
│  Controls    │    SVG Preview       │
│  Panel       │                      │
│              │                      │
│  - Background│    [SVG Canvas]      │
│  - Logo      │                      │
│  - Header    │                      │
│  - Subhead   │                      │
│              │                      │
└──────────────┴──────────────────────┘
```

**Desktop**: Controls bên trái, Preview bên phải  
**Mobile/Tablet**: Controls trên, Preview dưới (responsive)

---

### Controls Panel

1. **Background Section**

   - Color picker để chọn màu nền

2. **Logo Section**

   - File input để upload logo
   - Preview logo đã upload

3. **Header (Branding) Section**

   - Text input
   - Color picker
   - Font selector
   - Font size input

4. **Subhead (Slogan) Section**
   - Text input
   - Color picker
   - Font selector
   - Font size input

---

### SVG Preview

```typescript
<svg ref={svgRef} viewBox="0 0 1281 1281" width="600" height="600">
  <path id="background" style={{ fill: state.backgroundColor }} />
  <image href={state.logoUrl} />
  <text x={state.brandingPosition.x} y={state.brandingPosition.y}>
    {state.brandingText}
  </text>
  <text x={state.sloganPosition.x} y={state.sloganPosition.y}>
    {state.sloganText}
  </text>
</svg>
```

Tất cả các thuộc tính đều lấy từ `state`, khi state thay đổi → SVG tự động cập nhật.

---

## 🎨 CSS STYLING

### Layout

- **Flexbox**: Controls và Preview nằm cạnh nhau
- **Responsive**: Tự động xếp dọc trên màn hình nhỏ
- **Touch Optimization**: `touch-action: none` để ngăn scroll khi kéo text

### Media Queries

- **≤1024px**: Xếp dọc (tablet)
- **≤768px**: Tối ưu cho mobile (giảm padding, font size)

---

## 🔄 LUỒNG HOẠT ĐỘNG

### Khi User Chỉnh Sửa

1. User thay đổi input (text, color, font, size)
2. `onChange` được gọi
3. `setState` cập nhật giá trị
4. React re-render component
5. SVG cập nhật với giá trị mới

**Ví dụ**: User thay đổi màu background

```
Chọn màu → onChange → setState({ backgroundColor: "#ff0000" })
→ React re-render → SVG path style={{ fill: "#ff0000" }} → Background đổi màu
```

---

### Khi User Kéo Text

1. **Bắt đầu**: Click/touch vào text → Tính dragOffset → Set dragging
2. **Di chuyển**: Theo dõi mousemove/touchmove → Cập nhật vị trí → Re-render
3. **Kết thúc**: Thả chuột/nhấc tay → Set dragging = null

---

## 🎯 ĐIỂM QUAN TRỌNG

### 1. State Management

- Tất cả trạng thái được lưu trong một object `state`
- Mọi thay đổi đều qua `setState`
- React tự động re-render khi state thay đổi

### 2. Coordinate Transformation

- `clientX/clientY` là tọa độ màn hình
- SVG có hệ tọa độ riêng (viewBox)
- Cần chuyển đổi để đặt text đúng vị trí

### 3. Event Handling

- Desktop: Mouse events (`mousedown`, `mousemove`, `mouseup`)
- Mobile: Touch events (`touchstart`, `touchmove`, `touchend`)
- Event listeners đăng ký trên `window` để theo dõi khi kéo ra ngoài SVG

### 4. File Handling

- Dùng `FileReader` API để đọc file
- Chuyển file thành base64 để hiển thị trực tiếp trong SVG
- Không cần upload lên server

---

## 📝 TÓM TẮT

Ứng dụng sử dụng:

- **React Hooks**: `useState`, `useRef`, `useEffect`, `useCallback`
- **Event Handling**: Mouse và Touch events
- **State Management**: Centralized state với `useState`
- **File Handling**: FileReader API
- **Responsive Design**: CSS media queries

Tất cả tính năng được implement từ đầu, không dùng thư viện bên ngoài.

---

## 🚀 CÁCH SỬ DỤNG

1. **Chỉnh màu background**: Click vào color picker, chọn màu
2. **Upload logo**: Click "Upload logo", chọn file ảnh
3. **Chỉnh text**: Thay đổi text, màu, font, kích thước trong controls
4. **Di chuyển text**: Click và kéo text (desktop) hoặc chạm và kéo (mobile)

---

**Tác giả**: AI Assistant  
**Ngày tạo**: 2024
