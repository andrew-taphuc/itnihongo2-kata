// Advanced Kata.js - Logic cho trang cài đặt Kata nâng cao

class AdvancedKataSetup {
  constructor() {
    this.allWords = [];
    this.selectedLessons = new Set();
    this.selectedWords = [];
    this.availableLessons = [];

    // DOM elements
    this.lessonsGrid = document.getElementById("lessons-grid");
    this.allLessonsCheckbox = document.getElementById("all-lessons");
    this.totalWordsEl = document.getElementById("total-words");
    this.selectedWordsEl = document.getElementById("selected-words");
    this.selectedLessonsEl = document.getElementById("selected-lessons");
    this.limitInputEl = document.getElementById("limit-input");
    this.wordLimitEl = document.getElementById("word-limit");
    this.startBtn = document.getElementById("start-game-btn");

    this.init();
  }

  async init() {
    try {
      await this.loadWords();
      this.setupEventListeners();
      this.renderLessons();
      this.updateStats();
    } catch (error) {
      console.error("Lỗi khởi tạo:", error);
      this.showError("Không thể tải dữ liệu từ vựng!");
    }
  }

  async loadWords() {
    try {
      const response = await fetch("kata_word.csv");
      if (!response.ok) {
        throw new Error("Không thể tải file CSV");
      }

      const csvText = await response.text();
      this.allWords = this.parseCSV(csvText);
      this.availableLessons = this.getAvailableLessons();

      console.log(
        `Đã tải ${this.allWords.length} từ vựng từ ${this.availableLessons.length} bài học`
      );
    } catch (error) {
      console.error("Lỗi tải từ vựng:", error);
      // Fallback data
      this.allWords = [
        { lesson: 3, definition: "Security", katakana: "セキュリティ" },
        {
          lesson: 4,
          definition: "Computer virus",
          katakana: "コンピュータウイルス",
        },
        {
          lesson: 5,
          definition: "Risk assessment",
          katakana: "リスクアセスメント",
        },
      ];
      this.availableLessons = [3, 4, 5];
    }
  }

  parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    const words = [];

    // Bỏ qua header (dòng đầu tiên)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = this.parseCSVLine(line);
      if (cols.length >= 3) {
        words.push({
          lesson: parseInt(cols[0]) || 0,
          definition: cols[1].replace(/^"|"$/g, ""),
          katakana: cols[2].replace(/^"|"$/g, ""),
          id: i,
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
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    if (current) {
      result.push(current.trim());
    }

    return result;
  }

  getAvailableLessons() {
    const lessons = new Set();
    this.allWords.forEach((word) => {
      if (word.lesson > 0) {
        lessons.add(word.lesson);
      }
    });
    return Array.from(lessons).sort((a, b) => a - b);
  }

  renderLessons() {
    this.lessonsGrid.innerHTML = "";

    this.availableLessons.forEach((lesson) => {
      const wordsInLesson = this.allWords.filter(
        (word) => word.lesson === lesson
      );

      const lessonDiv = document.createElement("div");
      lessonDiv.className = "lesson-option";
      lessonDiv.innerHTML = `
                <input type="checkbox" id="lesson-${lesson}" value="${lesson}" onchange="setupManager.toggleLesson(${lesson})">
                <label for="lesson-${lesson}">
                    Bài ${lesson} <span class="word-count">(${wordsInLesson.length} từ)</span>
                </label>
            `;

      this.lessonsGrid.appendChild(lessonDiv);
    });
  }

  setupEventListeners() {
    // Xử lý tùy chọn giới hạn số từ
    document.querySelectorAll('input[name="limit"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.value === "limited") {
          this.limitInputEl.style.display = "block";
        } else {
          this.limitInputEl.style.display = "none";
        }
        this.updateStats();
      });
    });

    // Xử lý thay đổi số từ giới hạn
    this.wordLimitEl.addEventListener("input", () => {
      this.updateStats();
    });

    // Cập nhật stats khi thay đổi lesson
    this.allLessonsCheckbox.addEventListener("change", () => {
      this.updateStats();
    });
  }

  toggleAllLessons() {
    const isChecked = this.allLessonsCheckbox.checked;

    this.availableLessons.forEach((lesson) => {
      const checkbox = document.getElementById(`lesson-${lesson}`);
      checkbox.checked = isChecked;

      if (isChecked) {
        this.selectedLessons.add(lesson);
      } else {
        this.selectedLessons.delete(lesson);
      }
    });

    this.updateStats();
  }

  toggleLesson(lesson) {
    const checkbox = document.getElementById(`lesson-${lesson}`);

    if (checkbox.checked) {
      this.selectedLessons.add(lesson);
    } else {
      this.selectedLessons.delete(lesson);
    }

    // Cập nhật checkbox "Tất cả bài học"
    this.allLessonsCheckbox.checked =
      this.selectedLessons.size === this.availableLessons.length;

    this.updateStats();
  }

  updateStats() {
    // Tính toán từ đã chọn
    this.selectedWords = this.allWords.filter((word) =>
      this.selectedLessons.has(word.lesson)
    );

    // Cập nhật UI
    this.totalWordsEl.textContent = this.allWords.length;
    this.selectedWordsEl.textContent = this.selectedWords.length;
    this.selectedLessonsEl.textContent = this.selectedLessons.size;

    // Kiểm tra có thể bắt đầu game không
    const canStart =
      this.selectedLessons.size > 0 && this.selectedWords.length > 0;
    this.startBtn.disabled = !canStart;

    if (!canStart) {
      this.startBtn.textContent = "Vui lòng chọn ít nhất 1 bài học";
    } else {
      this.startBtn.textContent = "🚀 Bắt Đầu Game";
    }
  }

  getGameSettings() {
    const orderRadio = document.querySelector('input[name="order"]:checked');
    const limitRadio = document.querySelector('input[name="limit"]:checked');

    let selectedWords = [...this.selectedWords];

    // Xáo trộn nếu chọn ngẫu nhiên
    if (orderRadio.value === "random") {
      selectedWords = this.shuffleArray(selectedWords);
    }

    // Giới hạn số từ nếu cần
    if (limitRadio.value === "limited") {
      const limit = parseInt(this.wordLimitEl.value) || 10;
      selectedWords = selectedWords.slice(0, limit);
    }

    return {
      words: selectedWords,
      order: orderRadio.value,
      limit: limitRadio.value,
      totalSelected: this.selectedWords.length,
      selectedLessons: Array.from(this.selectedLessons),
    };
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
        `;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}

// Khởi tạo setup manager
let setupManager;

document.addEventListener("DOMContentLoaded", () => {
  setupManager = new AdvancedKataSetup();
});

// Các hàm được gọi từ HTML
function toggleAllLessons() {
  setupManager.toggleAllLessons();
}

function toggleLesson(lesson) {
  setupManager.toggleLesson(lesson);
}

function startAdvancedGame() {
  const settings = setupManager.getGameSettings();

  if (settings.words.length === 0) {
    setupManager.showError("Vui lòng chọn ít nhất 1 bài học!");
    return;
  }

  // Lưu settings vào localStorage để trang game có thể sử dụng
  localStorage.setItem("advancedKataSettings", JSON.stringify(settings));

  // Chuyển đến trang game
  window.location.href = "advanced-kata-game.html";
}

function goBack() {
  window.location.href = "index.html";
}
