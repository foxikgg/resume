const inputTimers = {};

export function updateLanguageLine(langId, value) {
  const line = document.getElementById(`line-${langId}`);
  if (!line) return;
  line.style.width = `${value}%`;
}

export function handleLanguageInput(e) {
  const el = e.target;
  const id = el.id.replace("number-", "");
  clearTimeout(inputTimers[id]);
  inputTimers[id] = setTimeout(() => {
    let num = parseInt(el.textContent.replace(/[^\d]/g, ""), 10);
    if (isNaN(num)) num = 0;
    num = Math.min(num, 100);
    el.textContent = num;
    updateLanguageLine(id, num);
  }, 300);
}

export function handlePaste(e) {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData("text/plain");
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  sel.deleteFromDocument();
  sel.getRangeAt(0).insertNode(document.createTextNode(text));
  sel.collapseToEnd();
}

export function handleListEditKey(e) {
  const li = e.target;
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const newLi = document.createElement("li");
    newLi.classList.add("job-responsibility-item", "edit", "editing-highlight");
    newLi.contentEditable = true;
    newLi.textContent = "";
    li.parentNode.insertBefore(newLi, li.nextSibling);
    placeCaretAtEnd(newLi);
    newLi.addEventListener("keydown", handleListEditKey);
  }
  if (e.key === "Backspace") {
    const text = li.textContent.trim();
    if (text === "") {
      const ul = li.parentNode;
      const items = ul.querySelectorAll("li.job-responsibility-item");
      if (items.length > 1) {
        e.preventDefault();
        const prev = li.previousElementSibling || li.nextElementSibling;
        li.remove();
        if (prev) placeCaretAtEnd(prev);
      }
    }
  }
}

export function placeCaretAtEnd(el) {
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}
