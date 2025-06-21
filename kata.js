// Kata.js - Logic cho trò chơi Kata

class KataGame {
  constructor() {
    this.words = [];
    this.currentWord = null;
    this.score = 0;
    this.totalQuestions = 0;
    this.questionCount = 0;
    this.maxQuestions = 10; // Giới hạn số câu hỏi
    this.usedWords = new Set();
    this.hasAnsweredIncorrectly = false; // Theo dõi nếu đã trả lời sai

    // DOM elements
    this.definitionEl = document.getElementById("definition");
    this.inputEl = document.getElementById("japanese-input");
    this.submitBtn = document.getElementById("submit-btn");
    this.feedbackSection = document.getElementById("feedback-section");
    this.feedbackEl = document.getElementById("feedback");
    this.nextBtn = document.getElementById("next-btn");
    this.scoreEl = document.getElementById("score");
    this.totalEl = document.getElementById("total");
    this.accuracyEl = document.getElementById("accuracy");
    this.progressEl = document.getElementById("progress");

    this.init();
  }

  async init() {
    try {
      await this.loadWords();
      this.setupEventListeners();
      this.nextQuestion();
      this.updateUI();
    } catch (error) {
      console.error("Lỗi khởi tạo game:", error);
      this.showError("Không thể tải dữ liệu từ vựng!");
    }
  }

  async loadWords() {
    try {
      const data = await this.loadFromCSV();
      this.words = data;
      console.log(`Đã tải ${data.length} từ vựng từ CSV`);
    } catch (error) {
      console.error("Lỗi tải từ vựng:", error);
      // Fallback data nếu không tải được CSV
      this.words = [
        {
          id: 1,
          definition: "Risk assessment",
          japanese: "リスクアセスメント",
          romaji: "risuku asesumento",
        },
        {
          id: 2,
          definition: "Process",
          japanese: "プロセス",
          romaji: "purosesu",
        },
        {
          id: 3,
          definition: "Computer",
          japanese: "コンピューター",
          romaji: "konpyuta",
        },
      ];
      console.log("Sử dụng dữ liệu fallback");
    }
  }

  async loadFromCSV() {
    const response = await fetch("kata_word.csv");
    if (!response.ok) {
      throw new Error("Không thể tải file CSV");
    }

    const csvText = await response.text();
    return this.parseCSV(csvText);
  }

  parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    const words = [];

    // Bỏ qua header (dòng đầu tiên)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse CSV line - xử lý quotes
      const cols = this.parseCSVLine(line);

      if (cols.length >= 2) {
        words.push({
          id: i,
          definition: cols[1].replace(/^"|"$/g, ""), // Bỏ quotes
          japanese: cols[2].replace(/^"|"$/g, ""), // Bỏ quotes
          romaji: this.generateRomaji(cols[1].replace(/^"|"$/g, "")),
        });
      }
    }

    return words;
  }

  parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    // Thêm phần cuối
    if (current) {
      result.push(current.trim());
    }

    return result;
  }

  generateRomaji(japanese) {
    // Mapping cơ bản katakana -> romaji (có thể mở rộng)
    const kataToRomaji = {
      リスク: "risuku",
      アセスメント: "asesumento",
      プロセス: "purosesu",
      レベル: "reberu",
      ファイナンシング: "fainanshingu",
      コントロール: "kontororu",
      マネジメント: "manejimento",
      システム: "shisutemu",
      セキュリティ: "sekyuriti",
      バイ: "bai",
      デザイン: "dezain",
      コンピューター: "konpyuta",
      インターネット: "intanetto",
      ソフトウェア: "sofutowea",
      データベース: "detabesu",
      ネットワーク: "nettowaku",
      アプリケーション: "apurikeshon",
      サーバー: "saba",
      アイエスエムエス: "ai esu emu esu",
    };

    // Tìm romaji tương ứng hoặc trả về chuỗi gốc
    for (const [kata, romaji] of Object.entries(kataToRomaji)) {
      if (japanese.includes(kata)) {
        return japanese.replace(kata, romaji);
      }
    }

    // Nếu không tìm thấy, tạo romaji đơn giản
    return japanese.toLowerCase().replace(/[^\w\s]/g, "");
  }

  setupEventListeners() {
    // Submit button
    this.submitBtn.addEventListener("click", () => this.checkAnswer());

    // Enter key để submit
    this.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.checkAnswer();
      }
    });

    // Next button
    this.nextBtn.addEventListener("click", () => this.nextQuestion());

    // Phím tắt
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.goBack();
      } else if (
        e.key === " " &&
        this.feedbackSection.style.display !== "none"
      ) {
        e.preventDefault();
        this.nextQuestion();
      }
    });

    // Auto-focus input
    this.inputEl.focus();

    // Xử lý paste
    this.inputEl.addEventListener("paste", (e) => {
      // Cho phép paste text tiếng Nhật
      setTimeout(() => {
        console.log("Đã paste:", this.inputEl.value);
      }, 10);
    });
  }

  getRandomWord() {
    // Lấy từ ngẫu nhiên chưa sử dụng
    const availableWords = this.words.filter(
      (word) => !this.usedWords.has(word.id)
    );

    if (availableWords.length === 0) {
      // Reset nếu đã hết từ
      this.usedWords.clear();
      return this.words[Math.floor(Math.random() * this.words.length)];
    }

    return availableWords[Math.floor(Math.random() * availableWords.length)];
  }

  nextQuestion() {
    if (this.questionCount >= this.maxQuestions) {
      this.showFinalResult();
      return;
    }

    this.currentWord = this.getRandomWord();
    this.usedWords.add(this.currentWord.id);
    this.questionCount++;
    this.hasAnsweredIncorrectly = false; // Reset trạng thái cho câu mới

    // Cập nhật UI
    this.definitionEl.textContent = this.currentWord.definition;
    this.inputEl.value = "";
    this.inputEl.disabled = false;
    this.submitBtn.disabled = false;
    this.feedbackSection.style.display = "none";

    // Focus input
    this.inputEl.focus();

    // Hiệu ứng fade in
    this.definitionEl.style.opacity = "0";
    setTimeout(() => {
      this.definitionEl.style.transition = "opacity 0.3s ease";
      this.definitionEl.style.opacity = "1";
    }, 10);

    this.updateProgress();
    console.log("Câu hỏi:", this.currentWord);
  }

  checkAnswer() {
    const userAnswer = this.inputEl.value.trim();
    const correctAnswer = this.currentWord.japanese;

    if (!userAnswer) {
      this.showMessage("Vui lòng nhập câu trả lời!", "warning");
      return;
    }

    const isCorrect = this.compareAnswers(userAnswer, correctAnswer);

    if (!this.hasAnsweredIncorrectly) {
      // Lần đầu trả lời
      this.totalQuestions++;

      if (isCorrect) {
        this.score++;
        this.showFeedback(
          true,
          `Chính xác! 正解！ (${this.currentWord.romaji})`
        );
      } else {
        this.hasAnsweredIncorrectly = true;
        this.showFeedback(
          false,
          `Sai rồi! 間違い！<br>Đáp án đúng: <strong>${correctAnswer}</strong><br>Romaji: ${this.currentWord.romaji}<br><br>💡 <em>Hãy nhập lại đáp án đúng để tiếp tục</em>`
        );
        // Xóa input để người dùng nhập lại
        this.inputEl.value = "";
        this.inputEl.focus();
        this.updateUI();
        return;
      }
    } else {
      // Đã trả lời sai trước đó, kiểm tra xem nhập đúng chưa
      if (isCorrect) {
        this.showFeedback(true, `Chính xác! Bây giờ có thể tiếp tục!`);
      } else {
        this.showMessage("Vui lòng nhập đúng đáp án để tiếp tục!", "warning");
        this.inputEl.value = "";
        this.inputEl.focus();
        return;
      }
    }

    // Disable input
    this.inputEl.disabled = true;
    this.submitBtn.disabled = true;

    this.updateUI();

    // Log kết quả
    console.log(
      `Câu trả lời: ${userAnswer} | Đáp án: ${correctAnswer} | ${
        isCorrect ? "Đúng" : "Sai"
      }`
    );
  }

  compareAnswers(userAnswer, correctAnswer) {
    // Chuẩn hóa chuỗi để so sánh
    const normalize = (str) =>
      str
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[・・]/g, "")
        .replace(/[ー－]/g, "");

    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(correctAnswer);

    // So sánh chính xác
    if (normalizedUser === normalizedCorrect) {
      return true;
    }

    // Kiểm tra nếu có nhiều đáp án (phân tách bằng /, ／)
    const alternatives = correctAnswer
      .split(/[\/／]/)
      .map((alt) => normalize(alt.trim()));
    return alternatives.some((alt) => alt === normalizedUser);
  }

  showFeedback(isCorrect, message) {
    this.feedbackEl.innerHTML = message;
    this.feedbackEl.className = `feedback ${
      isCorrect ? "correct" : "incorrect"
    }`;
    this.feedbackSection.style.display = "block";

    // Hiệu ứng
    this.feedbackSection.style.opacity = "0";
    this.feedbackSection.style.transform = "translateY(20px)";
    setTimeout(() => {
      this.feedbackSection.style.transition = "all 0.3s ease";
      this.feedbackSection.style.opacity = "1";
      this.feedbackSection.style.transform = "translateY(0)";
    }, 10);

    // Auto next sau 3 giây nếu đúng
    if (isCorrect) {
      setTimeout(() => {
        if (this.feedbackSection.style.display !== "none") {
          this.nextQuestion();
        }
      }, 2000);
    }
  }

  updateUI() {
    this.scoreEl.textContent = this.score;
    this.totalEl.textContent = this.totalQuestions;

    const accuracy =
      this.totalQuestions > 0
        ? ((this.score / this.totalQuestions) * 100).toFixed(1)
        : 0;
    this.accuracyEl.textContent = `${accuracy}%`;
  }

  updateProgress() {
    const progress = (this.questionCount / this.maxQuestions) * 100;
    this.progressEl.style.width = `${progress}%`;
  }

  showFinalResult() {
    const accuracy =
      this.totalQuestions > 0
        ? ((this.score / this.totalQuestions) * 100).toFixed(1)
        : 0;

    // Cập nhật modal kết quả
    document.getElementById("final-score").textContent = this.score;
    document.getElementById("final-total").textContent = this.totalQuestions;
    document.getElementById("final-accuracy").textContent = `${accuracy}%`;

    // Hiển thị modal
    const modal = document.getElementById("result-modal");
    modal.style.display = "block";

    // Hiệu ứng
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.style.transition = "opacity 0.3s ease";
      modal.style.opacity = "1";
    }, 10);

    // Lưu kết quả vào localStorage
    this.saveResult(accuracy);

    console.log(
      `Kết thúc game: ${this.score}/${this.totalQuestions} (${accuracy}%)`
    );
  }

  saveResult(accuracy) {
    try {
      const results = JSON.parse(localStorage.getItem("kataResults") || "[]");
      results.push({
        score: this.score,
        total: this.totalQuestions,
        accuracy: parseFloat(accuracy),
        date: new Date().toISOString(),
        timestamp: Date.now(),
      });

      // Chỉ lưu 10 kết quả gần nhất
      if (results.length > 10) {
        results.splice(0, results.length - 10);
      }

      localStorage.setItem("kataResults", JSON.stringify(results));
    } catch (error) {
      console.error("Lỗi lưu kết quả:", error);
    }
  }

  showMessage(message, type = "info") {
    // Tạo toast message
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "warning" ? "#f56565" : "#4299e1"};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

    document.body.appendChild(toast);

    // Slide in
    setTimeout(() => {
      toast.style.transform = "translateX(0)";
    }, 10);

    // Remove sau 3 giây
    setTimeout(() => {
      toast.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  showError(message) {
    this.definitionEl.innerHTML = `
            <div style="color: #e53e3e; text-align: center;">
                <h3>❌ Lỗi</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #4299e1; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Thử lại
                </button>
            </div>
        `;
  }
}

// Global functions
function goBack() {
  if (confirm("Bạn có chắc muốn quay lại menu chính? Tiến trình sẽ bị mất!")) {
    window.location.href = "index.html";
  }
}

function restartGame() {
  location.reload();
}

function clearInput() {
  const input = document.getElementById("japanese-input");
  input.value = "";
  input.focus();
}

function skipQuestion() {
  if (confirm("Bạn có chắc muốn bỏ qua câu này?")) {
    game.totalQuestions++;
    game.updateUI();
    game.nextQuestion();
  }
}

// Khởi tạo game khi DOM loaded
let game;
document.addEventListener("DOMContentLoaded", function () {
  console.log("🎮 Khởi tạo Kata Game...");
  game = new KataGame();

  // Hiệu ứng loading
  const container = document.querySelector(".container");
  container.style.opacity = "0";
  container.style.transform = "translateY(20px)";

  setTimeout(() => {
    container.style.transition = "all 0.5s ease";
    container.style.opacity = "1";
    container.style.transform = "translateY(0)";
  }, 100);
});

// Ngăn chặn accidental page refresh
window.addEventListener("beforeunload", function (e) {
  if (game && game.totalQuestions > 0) {
    e.preventDefault();
    e.returnValue = "Bạn có chắc muốn rời khỏi trang? Tiến trình sẽ bị mất!";
  }
});

// Export cho testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = { KataGame };
}
