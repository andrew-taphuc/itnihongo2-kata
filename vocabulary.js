// Vocabulary.js - Logic cho trang xem từ vựng

class VocabularyViewer {
  constructor() {
    this.allWords = [];
    this.filteredWords = [];
    this.currentPage = 1;
    this.itemsPerPage = 20;
    this.currentDetailWord = null;

    // DOM elements
    this.searchInput = document.getElementById("search-input");
    this.lessonSelect = document.getElementById("lesson-select");
    this.sortSelect = document.getElementById("sort-select");
    this.tbody = document.getElementById("vocabulary-tbody");
    this.pagination = document.getElementById("pagination");
    this.vocabCountEl = document.getElementById("vocab-count");
    this.lessonCountEl = document.getElementById("lesson-count");
    this.filteredCountEl = document.getElementById("filtered-count");

    // Detail modal
    this.detailModal = document.getElementById("detail-modal");
    this.detailLesson = document.getElementById("detail-lesson");
    this.detailDefinition = document.getElementById("detail-definition");
    this.detailKatakana = document.getElementById("detail-katakana");
    this.detailReading = document.getElementById("detail-reading");

    this.init();
  }

  async init() {
    try {
      await this.loadWords();
      this.setupLessonFilter();
      this.setupEventListeners();
      this.filterVocabulary();
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
      this.filteredWords = [...this.allWords];

      console.log(`Đã tải ${this.allWords.length} từ vựng`);
    } catch (error) {
      console.error("Lỗi tải từ vựng:", error);
      // Fallback data
      this.allWords = [
        { lesson: 3, definition: "Security", katakana: "セキュリティ", id: 1 },
        {
          lesson: 4,
          definition: "Computer virus",
          katakana: "コンピュータウイルス",
          id: 2,
        },
        {
          lesson: 5,
          definition: "Risk assessment",
          katakana: "リスクアセスメント",
          id: 3,
        },
      ];
      this.filteredWords = [...this.allWords];
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
          reading: this.generateReading(cols[2].replace(/^"|"$/g, "")),
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

  generateReading(katakana) {
    // Cố gắng tạo cách đọc đơn giản từ katakana
    // Đây là bản mapping cơ bản, có thể mở rộng
    const readings = {
      セキュリティ: "se-kyu-ri-ti",
      ウェブサイト: "we-bu-sa-i-to",
      ログイン: "ro-gu-i-n",
      インターネット: "i-n-ta-ne-t-to",
      クレジットカード: "ku-re-ji-t-to ka-do",
      アクセス: "a-ku-se-su",
      ディジタル: "di-ji-ta-ru",
      デジタル: "de-ji-ta-ru",
      バックアップ: "ba-k-ku a-p-pu",
      バグ: "ba-gu",
      タイムスタンプ: "ta-i-mu su-ta-n-pu",
      オリジナル: "o-ri-ji-na-ru",
      コンピュータウイルス: "ko-n-pyu-ta u-i-ru-su",
      フィッシング: "fi-s-shi-n-gu",
      キャッシュポイズニング: "kya-s-shu po-i-zu-ni-n-gu",
      マルウェア: "ma-ru-we-a",
      インジェクション: "i-n-je-ku-sho-n",
      リスクアセスメント: "ri-su-ku a-se-su-me-n-to",
      プロセス: "pu-ro-se-su",
      リスクレベル: "ri-su-ku re-be-ru",
    };

    return readings[katakana] || katakana;
  }

  setupLessonFilter() {
    const lessons = [...new Set(this.allWords.map((word) => word.lesson))].sort(
      (a, b) => a - b
    );

    lessons.forEach((lesson) => {
      const option = document.createElement("option");
      option.value = lesson;
      option.textContent = `Bài ${lesson}`;
      this.lessonSelect.appendChild(option);
    });
  }

  setupEventListeners() {
    // Tìm kiếm realtime
    this.searchInput.addEventListener("input", () => {
      this.currentPage = 1;
      this.filterVocabulary();
    });

    // Lọc theo bài
    this.lessonSelect.addEventListener("change", () => {
      this.currentPage = 1;
      this.filterVocabulary();
    });

    // Sắp xếp
    this.sortSelect.addEventListener("change", () => {
      this.sortVocabulary();
    });

    // Đóng modal khi click bên ngoài
    window.addEventListener("click", (event) => {
      if (event.target === this.detailModal) {
        this.closeDetailModal();
      }
    });

    // Phím tắt
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeDetailModal();
      }
    });
  }

  filterVocabulary() {
    const searchTerm = this.searchInput.value.toLowerCase().trim();
    const selectedLesson = this.lessonSelect.value;

    this.filteredWords = this.allWords.filter((word) => {
      // Lọc theo bài học
      if (selectedLesson && word.lesson.toString() !== selectedLesson) {
        return false;
      }

      // Lọc theo từ khóa tìm kiếm
      if (searchTerm) {
        return (
          word.definition.toLowerCase().includes(searchTerm) ||
          word.katakana.includes(searchTerm) ||
          word.reading.toLowerCase().includes(searchTerm)
        );
      }

      return true;
    });

    this.sortVocabulary();
    this.renderTable();
    this.renderPagination();
    this.updateStats();
  }

  sortVocabulary() {
    const sortBy = this.sortSelect.value;

    this.filteredWords.sort((a, b) => {
      switch (sortBy) {
        case "lesson":
          return (
            a.lesson - b.lesson || a.definition.localeCompare(b.definition)
          );
        case "definition":
          return a.definition.localeCompare(b.definition);
        case "katakana":
          return a.katakana.localeCompare(b.katakana);
        default:
          return 0;
      }
    });

    this.renderTable();
  }

  renderTable() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageWords = this.filteredWords.slice(startIndex, endIndex);

    if (pageWords.length === 0) {
      this.tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="no-data">
                        ${
                          this.filteredWords.length === 0
                            ? "Không tìm thấy từ vựng nào"
                            : "Trang này không có dữ liệu"
                        }
                    </td>
                </tr>
            `;
      return;
    }

    this.tbody.innerHTML = pageWords
      .map(
        (word) => `
            <tr class="vocab-row" data-word-id="${word.id}">
                <td class="lesson-cell">
                    <span class="lesson-badge">Bài ${word.lesson}</span>
                </td>
                <td class="definition-cell">
                    <div class="definition-text">${word.definition}</div>
                </td>
                <td class="katakana-cell">
                    <div class="japanese-text">${word.katakana}</div>
                    <div class="reading-text">${word.reading}</div>
                </td>
                <td class="actions-cell">
                    <button class="action-btn detail-btn" onclick="vocabularyViewer.showDetail(${word.id})" title="Xem chi tiết">
                        👁️
                    </button>
                    <button class="action-btn copy-btn" onclick="vocabularyViewer.copyToClipboard('${word.katakana}')" title="Sao chép">
                        📋
                    </button>
                    <button class="action-btn test-btn" onclick="vocabularyViewer.testSingleWord(${word.id})" title="Kiểm tra từ này">
                        🎯
                    </button>
                </td>
            </tr>
        `
      )
      .join("");
  }

  renderPagination() {
    const totalPages = Math.ceil(this.filteredWords.length / this.itemsPerPage);

    if (totalPages <= 1) {
      this.pagination.innerHTML = "";
      return;
    }

    let paginationHTML = '<div class="pagination-controls">';

    // Nút Previous
    if (this.currentPage > 1) {
      paginationHTML += `<button class="page-btn" onclick="vocabularyViewer.changePage(${
        this.currentPage - 1
      })">‹ Trước</button>`;
    }

    // Các nút trang
    const maxVisiblePages = 7;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      paginationHTML += `<button class="page-btn" onclick="vocabularyViewer.changePage(1)">1</button>`;
      if (startPage > 2) {
        paginationHTML += '<span class="page-dots">...</span>';
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const activeClass = i === this.currentPage ? "active" : "";
      paginationHTML += `<button class="page-btn ${activeClass}" onclick="vocabularyViewer.changePage(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += '<span class="page-dots">...</span>';
      }
      paginationHTML += `<button class="page-btn" onclick="vocabularyViewer.changePage(${totalPages})">${totalPages}</button>`;
    }

    // Nút Next
    if (this.currentPage < totalPages) {
      paginationHTML += `<button class="page-btn" onclick="vocabularyViewer.changePage(${
        this.currentPage + 1
      })">Sau ›</button>`;
    }

    paginationHTML += "</div>";
    paginationHTML += `<div class="page-info">Trang ${this.currentPage} / ${totalPages}</div>`;

    this.pagination.innerHTML = paginationHTML;
  }

  changePage(page) {
    this.currentPage = page;
    this.renderTable();
    this.renderPagination();

    // Scroll to top
    document
      .querySelector(".vocabulary-area")
      .scrollIntoView({ behavior: "smooth" });
  }

  updateStats() {
    const lessons = new Set(this.allWords.map((word) => word.lesson));

    this.vocabCountEl.textContent = this.allWords.length;
    this.lessonCountEl.textContent = lessons.size;
    this.filteredCountEl.textContent = this.filteredWords.length;
  }

  showDetail(wordId) {
    const word = this.allWords.find((w) => w.id === wordId);
    if (!word) return;

    this.currentDetailWord = word;

    this.detailLesson.textContent = `Bài ${word.lesson}`;
    this.detailDefinition.textContent = word.definition;
    this.detailKatakana.textContent = word.katakana;
    this.detailReading.textContent = word.reading;

    this.detailModal.style.display = "block";
  }

  closeDetailModal() {
    this.detailModal.style.display = "none";
    this.currentDetailWord = null;
  }

  copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.showMessage("Đã sao chép vào clipboard!", "success");
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          this.showMessage("Đã sao chép vào clipboard!", "success");
        } catch (err) {
          this.showMessage("Không thể sao chép!", "error");
        }
        document.body.removeChild(textArea);
      });
  }

  testSingleWord(wordId) {
    const word = this.allWords.find((w) => w.id === wordId);
    if (!word) return;

    // Tạo settings cho 1 từ
    const settings = {
      words: [word],
      order: "sequential",
      limit: "all",
      totalSelected: 1,
      selectedLessons: [word.lesson],
    };

    localStorage.setItem("advancedKataSettings", JSON.stringify(settings));
    window.location.href = "advanced-kata-game.html";
  }

  showMessage(message, type = "info") {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    const colors = {
      info: "#4299e1",
      warning: "#ed8936",
      error: "#f56565",
      success: "#48bb78",
    };

    messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
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

// Khởi tạo vocabulary viewer
let vocabularyViewer;

document.addEventListener("DOMContentLoaded", () => {
  vocabularyViewer = new VocabularyViewer();
});

// Các hàm được gọi từ HTML
function filterVocabulary() {
  vocabularyViewer.filterVocabulary();
}

function sortVocabulary() {
  vocabularyViewer.sortVocabulary();
}

function closeDetailModal() {
  vocabularyViewer.closeDetailModal();
}

function copyKatakana() {
  if (vocabularyViewer.currentDetailWord) {
    vocabularyViewer.copyToClipboard(
      vocabularyViewer.currentDetailWord.katakana
    );
  }
}

function testWord() {
  if (vocabularyViewer.currentDetailWord) {
    vocabularyViewer.testSingleWord(vocabularyViewer.currentDetailWord.id);
  }
}

function goBack() {
  window.location.href = "index.html";
}

// Thêm CSS cho animations và styling
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
    
    .vocab-row:hover {
        background-color: rgba(66, 153, 225, 0.05);
    }
    
    .japanese-text {
        font-family: 'Noto Sans JP', sans-serif;
        font-size: 1.1em;
        font-weight: 500;
    }
    
    .reading-text {
        font-size: 0.8em;
        color: #718096;
        font-style: italic;
    }
    
    .lesson-badge {
        background: #4299e1;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        font-weight: 500;
    }
    
    .action-btn {
        background: none;
        border: none;
        padding: 4px 8px;
        margin: 0 2px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1em;
        transition: all 0.2s ease;
    }
    
    .action-btn:hover {
        background-color: rgba(66, 153, 225, 0.1);
        transform: scale(1.1);
    }
    
    .no-data {
        text-align: center;
        color: #718096;
        font-style: italic;
        padding: 40px;
    }
    
    .loading {
        text-align: center;
        color: #4299e1;
        padding: 40px;
    }
    
    .page-btn {
        background: white;
        border: 1px solid #e2e8f0;
        padding: 8px 12px;
        margin: 0 2px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .page-btn:hover {
        background-color: #f7fafc;
        border-color: #4299e1;
    }
    
    .page-btn.active {
        background-color: #4299e1;
        color: white;
        border-color: #4299e1;
    }
    
    .page-dots {
        padding: 8px 4px;
        color: #718096;
    }
    
    .page-info {
        text-align: center;
        margin-top: 10px;
        color: #718096;
        font-size: 0.9em;
    }
`;

document.head.appendChild(style);
