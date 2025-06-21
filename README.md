# 🎌 Ứng Dụng Web Học Tiếng Nhật

Ứng dụng web hiện đại để học từ vựng tiếng Nhật với giao diện đẹp và responsive, được xây dựng bằng HTML, CSS, và JavaScript thuần.

## ✨ Tính Năng

### 🏠 Menu Chính

- **Kata Game** - Trò chơi học từ vựng (Hoạt động)
- **Vocabulary Practice** - Luyện tập từ vựng (Sắp ra mắt)
- **Grammar Lessons** - Bài học ngữ pháp (Sắp ra mắt)
- **Reading Practice** - Luyện đọc hiểu (Sắp ra mắt)

### 📝 Kata Game

- Hiển thị định nghĩa tiếng Anh
- Yêu cầu nhập từ tiếng Nhật (Katakana/Hiragana)
- Hệ thống chấm điểm và thống kê
- 10 câu hỏi mỗi lượt chơi
- Tự động lưu kết quả vào localStorage
- Hỗ trợ copy-paste tiếng Nhật
- Hiệu ứng và animation mượt mà

## 🚀 Cách Sử Dụng

### 1. Mở Ứng Dụng

```bash
# Mở file index.html trong trình duyệt
open index.html
# Hoặc
firefox index.html
# Hoặc
chrome index.html
```

### 2. Chạy Local Server (Khuyến nghị)

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (nếu có http-server)
npx http-server

# Sau đó mở: http://localhost:8000
```

### 3. Sử Dụng Live Server (VS Code)

- Cài extension "Live Server"
- Right-click vào `index.html` → "Open with Live Server"

## 📁 Cấu Trúc File

```
├── index.html          # Trang chủ với menu chính
├── kata.html           # Trang trò chơi Kata
├── styles.css          # CSS cho toàn bộ ứng dụng
├── main.js             # Logic trang chủ
├── kata.js             # Logic trò chơi Kata
├── kata_word.csv       # Dữ liệu từ vựng
└── README.md           # Hướng dẫn này
```

## ⌨️ Cách Nhập Tiếng Nhật

### Trên Windows:

1. **Cài đặt IME tiếng Nhật:**
   - `Settings` → `Time & Language` → `Language`
   - Thêm `Japanese (日本語)`
2. **Sử dụng:**
   - `Windows + Space` để chuyển đổi
   - Gõ romaji → tự chuyển thành katakana/hiragana

### Trên macOS:

1. **Cài đặt:**
   - `System Preferences` → `Keyboard` → `Input Sources`
   - Thêm `Japanese - Hiragana`
2. **Sử dụng:**
   - `Cmd + Space` hoặc click biểu tượng ngôn ngữ
   - Gõ romaji để chuyển thành tiếng Nhật

### Trên Linux:

```bash
# Ubuntu/Debian
sudo apt-get install ibus-anthy
# Hoặc
sudo apt-get install fcitx-mozc
```

### Phương án thay thế:

- **Copy-paste từ Google Translate**
- **Sử dụng bàn phím ảo online**
- **Từ điển online có katakana/hiragana**

## 🎮 Phím Tắt

### Menu Chính:

- `Enter` - Vào Kata Game (khi focus)
- `ESC` - Đóng modal

### Kata Game:

- `Enter` - Kiểm tra đáp án
- `Space` - Câu tiếp theo (sau khi trả lời)
- `ESC` - Quay lại menu chính
- `Ctrl+V` - Paste text tiếng Nhật

## 📊 Dữ Liệu Từ Vựng

Ứng dụng đọc dữ liệu từ file CSV đơn giản:

### **CSV Format** (Tự động tạo romaji):

```csv
definition,japanese
"Risk assessment","リスクアセスメント"
"Process","プロセス"
"Computer","コンピューター"
"Hello","こんにちは"
"Thank you","ありがとう"
```

### **Cách thêm từ vựng:**

1. Mở file `kata_word.csv`
2. Thêm dòng mới với format: `"Định nghĩa","Từ tiếng Nhật"`
3. Lưu file và refresh trang web

## 🎨 Tính Năng Giao Diện

- **Responsive Design** - Hoạt động tốt trên mọi thiết bị
- **Dark Mode Support** - Tự động theo hệ thống
- **Smooth Animations** - Hiệu ứng mượt mà
- **Glass Morphism** - Thiết kế hiện đại với backdrop-filter
- **Progress Tracking** - Thanh tiến trình và thống kê
- **Toast Notifications** - Thông báo đẹp mắt

## 🔧 Tùy Chỉnh

### Thay đổi số câu hỏi:

```javascript
// Trong kata.js, dòng 11:
this.maxQuestions = 15; // Thay đổi từ 10 thành 15
```

### Thay đổi màu sắc:

```css
/* Trong styles.css, tìm và thay đổi: */
:root {
  --primary-color: #4299e1;
  --success-color: #48bb78;
  --error-color: #f56565;
}
```

## 🐛 Khắc Phục Sự Cố

### Font không hiển thị tiếng Nhật:

- Đảm bảo trình duyệt hỗ trợ font `Noto Sans JP`
- Kiểm tra kết nối internet để tải Google Fonts

### Không tải được từ vựng:

- Sử dụng local server thay vì mở file trực tiếp
- Kiểm tra file `kata_word.csv` có tồn tại không
- Đảm bảo format CSV đúng: header và dữ liệu

### Không thể nhập tiếng Nhật:

- Bật IME tiếng Nhật trên hệ thống
- Thử copy-paste từ Google Translate
- Kiểm tra trình duyệt có hỗ trợ Unicode không

## 📱 PWA Support

Ứng dụng có thể được mở rộng thành Progressive Web App:

- Thêm `manifest.json`
- Thêm Service Worker
- Hỗ trợ offline mode

## 🛠️ Phát Triển

### Thêm tính năng mới:

1. Tạo HTML page mới
2. Thêm CSS styles
3. Viết JavaScript logic
4. Cập nhật navigation trong `main.js`

### Testing:

```javascript
// Mở Developer Console và test:
console.log(game.words); // Xem dữ liệu từ vựng
game.score = 10; // Thay đổi điểm số
game.updateUI(); // Cập nhật giao diện
```

## 🌟 Roadmap

- [ ] **Vocabulary Practice** - Flashcards và spaced repetition
- [ ] **Grammar Lessons** - Bài học ngữ pháp tương tác
- [ ] **Reading Practice** - Đọc hiểu với furigana
- [ ] **Audio Support** - Phát âm từ vựng
- [ ] **User Accounts** - Đăng nhập và sync tiến trình
- [ ] **Multiplayer Mode** - Thi đấu online
- [ ] **Mobile App** - React Native/Flutter version

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa

## 🤝 Đóng Góp

Mở issue hoặc tạo pull request để đóng góp!

---

**Chúc bạn học tiếng Nhật vui vẻ! がんばって！** 🌸

Made with ❤️ by AI Assistant
