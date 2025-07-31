let originalContent = "";

export function captureInitialState() {
  const main = document.querySelector(".div-main");
  if (main) {
    originalContent = main.innerHTML;
  }
}

export function resetAll() {
  const modal = document.getElementById("reset-modal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

export function setupResetModalListeners() {
  const modal = document.getElementById("reset-modal");
  const cancelBtn = document.getElementById("cancel-reset-btn");
  const confirmBtn = document.getElementById("confirm-reset-btn");

  if (!modal || !cancelBtn || !confirmBtn) return;

  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  confirmBtn.addEventListener("click", () => {
    localStorage.removeItem("resumeData");
    modal.classList.add("hidden");
    location.reload();
  });
}
