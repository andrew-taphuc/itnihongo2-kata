// Main.js - Xử lý logic cho trang chủ

// Chuyển đến trang Kata Game
function goToKata() {
  window.location.href = "kata.html";
}

// Chuyển đến trang Kata Game Nâng Cao
function goToAdvancedKata() {
  window.location.href = "advanced-kata.html";
}

// Chuyển đến trang Xem Từ Vựng
function goToVocabulary() {
  window.location.href = "vocabulary.html";
}

// Hiển thị modal "Coming Soon"
function showComingSoon(featureName) {
  const modal = document.getElementById("modal");
  const modalText = document.getElementById("modal-text");
  modalText.textContent = `Tính năng "${featureName}" sẽ được phát triển trong tương lai!`;
  modal.style.display = "block";

  // Thêm hiệu ứng fade in
  modal.style.opacity = "0";
  modal.style.display = "block";
  setTimeout(() => {
    modal.style.opacity = "1";
  }, 10);
}

// Đóng modal
function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.opacity = "0";
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}

// Xử lý sự kiện bàn phím
document.addEventListener("keydown", function (event) {
  // Đóng modal bằng phím ESC
  if (event.key === "Escape") {
    closeModal();
  }

  // Chuyển đến Kata Game bằng phím Enter khi focus vào nút Kata
  if (event.key === "Enter" && document.activeElement.id === "kata-btn") {
    goToKata();
  }
});

// Đóng modal khi click bên ngoài
window.addEventListener("click", function (event) {
  const modal = document.getElementById("modal");
  if (event.target === modal) {
    closeModal();
  }
});

// Thêm hiệu ứng hover cho các nút
document.addEventListener("DOMContentLoaded", function () {
  const menuButtons = document.querySelectorAll(".menu-btn");

  menuButtons.forEach((button) => {
    // Thêm hiệu ứng ripple khi click
    button.addEventListener("click", function (e) {
      if (!button.classList.contains("disabled")) {
        const ripple = document.createElement("span");
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = x + "px";
        ripple.style.top = y + "px";
        ripple.classList.add("ripple");

        button.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      }
    });

    // Thêm hiệu ứng focus
    button.addEventListener("focus", function () {
      button.style.outline = "3px solid rgba(66, 153, 225, 0.5)";
      button.style.outlineOffset = "2px";
    });

    button.addEventListener("blur", function () {
      button.style.outline = "none";
    });
  });

  // Thêm animation khi load trang
  const container = document.querySelector(".container");
  container.style.opacity = "0";
  container.style.transform = "translateY(30px)";

  setTimeout(() => {
    container.style.transition = "all 0.8s ease";
    container.style.opacity = "1";
    container.style.transform = "translateY(0)";
  }, 100);

  // Hiệu ứng particles (tùy chọn)
  createParticles();
});

// Tạo hiệu ứng particles nền (tùy chọn)
function createParticles() {
  const particlesContainer = document.createElement("div");
  particlesContainer.className = "particles";
  particlesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    `;

  document.body.appendChild(particlesContainer);

  // Tạo các particles
  for (let i = 0; i < 20; i++) {
    createParticle(particlesContainer);
  }
}

function createParticle(container) {
  const particle = document.createElement("div");
  particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        animation: float ${Math.random() * 10 + 10}s linear infinite;
    `;

  particle.style.left = Math.random() * 100 + "%";
  particle.style.top = Math.random() * 100 + "%";
  particle.style.animationDelay = Math.random() * 10 + "s";

  container.appendChild(particle);
}

// Thêm CSS cho hiệu ứng
const style = document.createElement("style");
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: rippleEffect 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes rippleEffect {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
        }
        50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.8;
        }
    }
    
    .menu-btn:focus {
        transform: translateY(-8px) !important;
    }
`;

document.head.appendChild(style);

// PWA Support (tùy chọn)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    // Có thể thêm service worker ở đây
    console.log("App ready for PWA features");
  });
}

// Console log chào mừng
console.log(`
🎌 Chào mừng đến với ứng dụng Học Tiếng Nhật!
📝 Phiên bản: 1.0.0
🚀 Tạo bởi AI Assistant
がんばって！(Ganbatte!)
`);

// Export functions for testing (nếu cần)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    goToKata,
    goToAdvancedKata,
    goToVocabulary,
    showComingSoon,
    closeModal,
  };
}
