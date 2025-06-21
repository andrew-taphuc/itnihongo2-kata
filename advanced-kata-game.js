// Advanced Kata Game.js - Logic cho game nâng cao

class AdvancedKataGame {
  constructor() {
    this.settings = null;
    this.words = [];
    this.currentWordIndex = 0;
    this.currentWord = null;
    this.score = 0;
    this.totalQuestions = 0;
    this.answeredQuestions = 0;
    this.results = [];
    this.lessonStats = new Map();
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
    this.currentQuestionEl = document.getElementById("current-question");
    this.totalQuestionsEl = document.getElementById("total-questions");
    this.lessonBadgeEl = document.getElementById("lesson-badge");
    this.lessonsInfoEl = document.getElementById("lessons-info");

    this.init();
  }

  async init() {
    try {
      this.loadSettings();
      this.setupEventListeners();
      this.initializeGame();
      this.nextQuestion();
      this.updateUI();
    } catch (error) {
      console.error("Lỗi khởi tạo game:", error);
      this.showError("Không thể khởi tạo game!");
    }
  }

  loadSettings() {
    const settingsStr = localStorage.getItem("advancedKataSettings");
    if (!settingsStr) {
      throw new Error("Không tìm thấy cài đặt game");
    }

    this.settings = JSON.parse(settingsStr);
    this.words = this.settings.words || [];
    this.totalQuestions = this.words.length;

    console.log(
      `Game khởi tạo với ${this.totalQuestions} câu hỏi từ ${this.settings.selectedLessons.length} bài học`
    );

    // Khởi tạo stats cho từng bài
    this.settings.selectedLessons.forEach((lesson) => {
      this.lessonStats.set(lesson, { correct: 0, total: 0 });
    });
  }

  initializeGame() {
    // Hiển thị thông tin bài học
    const lessonsText = this.settings.selectedLessons.join(", ");
    this.lessonsInfoEl.textContent = `Bài: ${lessonsText}`;

    // Cập nhật tổng số câu hỏi
    this.totalQuestionsEl.textContent = this.totalQuestions;
    this.totalEl.textContent = this.totalQuestions;
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
        this.goBackToSetup();
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
  }

  nextQuestion() {
    if (this.currentWordIndex >= this.words.length) {
      this.showFinalResult();
      return;
    }

    this.currentWord = this.words[this.currentWordIndex];
    this.hasAnsweredIncorrectly = false; // Reset trạng thái cho câu mới

    // Cập nhật UI
    this.definitionEl.textContent = this.currentWord.definition;
    this.lessonBadgeEl.textContent = `Bài ${this.currentWord.lesson}`;

    // Reset input và feedback
    this.inputEl.value = "";
    this.inputEl.focus();
    this.feedbackSection.style.display = "none";
    this.submitBtn.disabled = false;
    this.submitBtn.textContent = "Kiểm tra";

    this.updateProgress();
  }

  checkAnswer() {
    const userAnswer = this.inputEl.value.trim();
    if (!userAnswer) {
      this.showMessage("Vui lòng nhập câu trả lời!", "warning");
      return;
    }

    const correctAnswer = this.currentWord.katakana;
    const isCorrect = this.compareAnswers(userAnswer, correctAnswer);

    if (!this.hasAnsweredIncorrectly) {
      // Lần đầu trả lời
      this.answeredQuestions++;
      this.currentQuestionEl.textContent = this.answeredQuestions;

      const lesson = this.currentWord.lesson;
      const lessonStat = this.lessonStats.get(lesson);
      lessonStat.total++;

      if (isCorrect) {
        this.score++;
        lessonStat.correct++;

        // Lưu kết quả
        this.results.push({
          question: this.currentWord.definition,
          correctAnswer: correctAnswer,
          userAnswer: userAnswer,
          isCorrect: isCorrect,
          lesson: lesson,
        });

        this.showFeedback(true, `Chính xác! 正解！`);
      } else {
        this.hasAnsweredIncorrectly = true;

        // Lưu kết quả (sai)
        this.results.push({
          question: this.currentWord.definition,
          correctAnswer: correctAnswer,
          userAnswer: userAnswer,
          isCorrect: false,
          lesson: lesson,
        });

        this.showFeedback(
          false,
          `Sai rồi! 間違い！<br>Đáp án đúng: <strong>${correctAnswer}</strong><br><br>💡 <em>Hãy nhập lại đáp án đúng để tiếp tục</em>`
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

    this.currentWordIndex++;
    this.updateUI();
  }

  compareAnswers(userAnswer, correctAnswer) {
    // Chuẩn hóa chuỗi để so sánh
    const normalize = (str) =>
      str
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[・･]/g, "")
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
    this.submitBtn.disabled = true;

    // Hiệu ứng
    this.feedbackSection.style.opacity = "0";
    this.feedbackSection.style.transform = "translateY(20px)";
    setTimeout(() => {
      this.feedbackSection.style.transition = "all 0.3s ease";
      this.feedbackSection.style.opacity = "1";
      this.feedbackSection.style.transform = "translateY(0)";
    }, 10);

    // Auto next sau 2 giây nếu đúng
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
      this.answeredQuestions > 0
        ? Math.round((this.score / this.answeredQuestions) * 100)
        : 0;
    this.accuracyEl.textContent = accuracy + "%";
  }

  updateProgress() {
    const progress = (this.answeredQuestions / this.totalQuestions) * 100;
    this.progressEl.style.width = progress + "%";
  }

  showFinalResult() {
    const accuracy =
      this.answeredQuestions > 0
        ? Math.round((this.score / this.answeredQuestions) * 100)
        : 0;

    // Cập nhật modal kết quả
    document.getElementById("final-score").textContent = this.score;
    document.getElementById("final-total").textContent = this.answeredQuestions;
    document.getElementById("final-accuracy").textContent = accuracy + "%";

    // Hiển thị thống kê theo bài
    this.showLessonSummary();

    // Hiển thị modal
    const modal = document.getElementById("result-modal");
    modal.style.display = "block";

    // Lưu kết quả
    this.saveResult(accuracy);
  }

  showLessonSummary() {
    const summaryEl = document.getElementById("lesson-summary");
    let summaryHTML = "<h4>📊 Thống kê theo bài:</h4>";

    this.lessonStats.forEach((stat, lesson) => {
      const lessonAccuracy =
        stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
      summaryHTML += `
                <div class="lesson-stat">
                    <span class="lesson-name">Bài ${lesson}:</span>
                    <span class="lesson-score">${stat.correct}/${stat.total}</span>
                    <span class="lesson-accuracy">(${lessonAccuracy}%)</span>
                </div>
            `;
    });

    summaryEl.innerHTML = summaryHTML;
  }

  saveResult(accuracy) {
    const result = {
      timestamp: new Date().toISOString(),
      score: this.score,
      total: this.answeredQuestions,
      accuracy: accuracy,
      settings: this.settings,
      lessonStats: Object.fromEntries(this.lessonStats),
      results: this.results,
    };

    // Lưu vào localStorage
    const savedResults = JSON.parse(
      localStorage.getItem("advancedKataResults") || "[]"
    );
    savedResults.push(result);

    // Giữ tối đa 50 kết quả
    if (savedResults.length > 50) {
      savedResults.splice(0, savedResults.length - 50);
    }

    localStorage.setItem("advancedKataResults", JSON.stringify(savedResults));
  }

  showHint() {
    if (!this.currentWord) return;

    const katakana = this.currentWord.katakana;
    const hintLength = Math.min(2, katakana.length);
    const hint = katakana.substring(0, hintLength) + "...";

    this.showMessage(`💡 Gợi ý: Bắt đầu bằng "${hint}"`, "info");
  }

  showMessage(message, type = "info") {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = message;

    const colors = {
      info: "#4299e1",
      warning: "#ed8936",
      error: "#f56565",
      success: "#48bb78",
    };

    messageDiv.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }

  showError(message) {
    this.showMessage(message, "error");
  }
}

// Khởi tạo game
let advancedGame;

document.addEventListener("DOMContentLoaded", () => {
  // Kiểm tra có settings không
  const settingsStr = localStorage.getItem("advancedKataSettings");
  if (!settingsStr) {
    alert("Không tìm thấy cài đặt game. Chuyển về trang cài đặt...");
    window.location.href = "advanced-kata.html";
    return;
  }

  advancedGame = new AdvancedKataGame();
});

// Các hàm được gọi từ HTML
function checkAnswer() {
  advancedGame.checkAnswer();
}

function nextQuestion() {
  advancedGame.nextQuestion();
}

function clearInput() {
  advancedGame.inputEl.value = "";
  advancedGame.inputEl.focus();
}

function skipQuestion() {
  // Tính như trả lời sai
  advancedGame.results.push({
    question: advancedGame.currentWord.definition,
    correctAnswer: advancedGame.currentWord.katakana,
    userAnswer: "(Bỏ qua)",
    isCorrect: false,
    lesson: advancedGame.currentWord.lesson,
  });

  // Cập nhật stats
  const lesson = advancedGame.currentWord.lesson;
  const lessonStat = advancedGame.lessonStats.get(lesson);
  lessonStat.total++;

  advancedGame.currentWordIndex++;
  advancedGame.answeredQuestions++;
  advancedGame.updateUI();
  advancedGame.nextQuestion();
}

function showHint() {
  advancedGame.showHint();
}

function restartAdvancedGame() {
  window.location.reload();
}

function goBackToSetup() {
  window.location.href = "advanced-kata.html";
}

function goHome() {
  window.location.href = "index.html";
}

// Thêm CSS cho animations
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .feedback-section.correct {
        border-left: 4px solid #48bb78;
        background-color: rgba(72, 187, 120, 0.1);
    }
    
    .feedback-section.incorrect {
        border-left: 4px solid #f56565;
        background-color: rgba(245, 101, 101, 0.1);
    }
    
    .lesson-stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .lesson-stat:last-child {
        border-bottom: none;
    }
    
    .lesson-name {
        font-weight: 500;
    }
    
    .lesson-accuracy {
        color: #4a5568;
        font-size: 0.9em;
    }
`;

document.head.appendChild(style);
