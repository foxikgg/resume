import {
  handleLanguageInput,
  handlePaste,
  handleListEditKey,
  updateLanguageLine,
} from "./edit-text.js";

import {
  resetAll,
  captureInitialState,
  setupResetModalListeners,
} from "./reset.js";


function saveToLocalStorage() {
  const data = {};

  document.querySelectorAll(".edit").forEach((elem, index) => {
    const key = elem.dataset.storageKey || `edit-${index}`;
    data[key] = elem.innerHTML;
    elem.dataset.storageKey = key;
  });

  document.querySelectorAll("ul[data-storage-group]").forEach((ul) => {
    const group = ul.dataset.storageGroup;
    const items = Array.from(
      ul.querySelectorAll("li.job-responsibility-item")
    ).map((li) => li.innerHTML);
    data[`ul-${group}`] = items;
  });

  localStorage.setItem("resumeData", JSON.stringify(data));
}

function loadFromLocalStorage() {
  const raw = localStorage.getItem("resumeData");
  if (!raw) return;
  const data = JSON.parse(raw);

  document.querySelectorAll(".edit").forEach((elem, index) => {
    const key = elem.dataset.storageKey || `edit-${index}`;
    if (data[key] != null) {
      elem.innerHTML = data[key];
      elem.dataset.storageKey = key;
      if (elem.classList.contains("text-language-quality")) {
        const id = elem.id.replace("number-", "");
        const n = parseInt(data[key].replace(/[^\d]/g, ""), 10);
        if (!isNaN(n)) updateLanguageLine(id, n);
      }
    }
  });

  document.querySelectorAll("ul[data-storage-group]").forEach((ul) => {
    const group = ul.dataset.storageGroup;
    const items = data[`ul-${group}`];
    if (Array.isArray(items)) {
      ul.innerHTML = "";
      items.forEach((html) => {
        const li = document.createElement("li");
        li.classList.add("job-responsibility-item", "edit");
        li.innerHTML = html;
        ul.appendChild(li);
      });
    }
  });
}

function initializeListEditing() {
  const isEditing =
    document.getElementById("edit-toggle-btn").textContent === "Применить";
  document.querySelectorAll("li.job-responsibility-item").forEach((li) => {
    li.contentEditable = isEditing;
    li.classList.toggle("editing-highlight", isEditing);
    if (isEditing) {
      li.addEventListener("keydown", handleListEditKey);
    } else {
      li.removeEventListener("keydown", handleListEditKey);
    }
  });
}

function applyDesktopStylesForPDF() {
  const style = document.createElement('style');
  style.id = 'pdf-styles';
  style.innerHTML = `
    @page {
      size: A4;
      margin: 0;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        visibility: visible !important;
      }
      .div-main {
        width: 595px !important;
        max-width: 595px !important;
        min-height: auto !important;
      }
      .div-skills, .div-highlights {
        flex-direction: row !important;
      }
      .experience {
        width: 78% !important;
      }
      .tools {
        width: 20% !important;
      }
      .education {
        max-width: 268px !important;
      }
      .div-interests-contacts {
        max-width: 267px !important;
      }
      .h1, text-hello, user-name, text-professiom, .title-job, .text-experience-data, .title-tools-group,  {
      visibility: visible !important;
      opacity: 1 !important;
      color: #000 !important;
    }
    }
  `;
  document.head.appendChild(style);
}

function restoreOriginalStyles() {
  const pdfStyles = document.getElementById('pdf-styles');
  if (pdfStyles) {
    pdfStyles.remove();
  }
}

function generatePDF() {
  const loader = document.createElement('div');
  loader.style.position = 'fixed';
  loader.style.top = '0';
  loader.style.left = '0';
  loader.style.width = '100%';
  loader.style.height = '100%';
  loader.style.backgroundColor = 'rgba(0,0,0,0.5)';
  loader.style.display = 'flex';
  loader.style.justifyContent = 'center';
  loader.style.alignItems = 'center';
  loader.style.zIndex = '9999';
  loader.innerHTML = '<div style="color: white; font-size: 24px;">Generating PDF...</div>';
  document.body.appendChild(loader);

  const element = document.getElementById('resume-content');

  const opt = {
    margin: 10,
    filename: 'resume.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      allowTaint: true
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break',
      after: ['#page2el', '#page3el'],
      avoid: ['img', '.photo', '.non-break']
    }
  };

  applyDesktopStylesForPDF();

  html2pdf()
    .set(opt)
    .from(element)
    .toPdf()
    .get('pdf')
    .then(function(pdf) {
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(150);
        pdf.text(`Page ${i} of ${totalPages}`,
          pdf.internal.pageSize.getWidth() - 30,
          pdf.internal.pageSize.getHeight() - 10);
      }
    })
    .save()
    .then(() => {
      restoreOriginalStyles();
      document.body.removeChild(loader);
    })
    .catch((error) => {
      console.error('PDF generation error:', error);
      document.body.removeChild(loader);
      alert('Error generating PDF. Please try again.');
    });
}


document.addEventListener("DOMContentLoaded", () => {
  loadFromLocalStorage();
  captureInitialState();
  setupResetModalListeners();
  initializeListEditing();

  const editBtn = document.getElementById("edit-toggle-btn");
  let isEditing = false;

  document.getElementById('save-pdf-btn').addEventListener('click', generatePDF);

  editBtn.addEventListener("click", () => {
    isEditing = !isEditing;
    editBtn.textContent = isEditing ? "Применить" : "Редактировать";

    document.querySelectorAll(".edit").forEach((elem) => {
      elem.contentEditable = isEditing;
      elem.classList.toggle("editing-highlight", isEditing);

      if (isEditing) {
        elem.addEventListener("paste", handlePaste);
        if (elem.classList.contains("text-language-quality")) {
          elem.addEventListener("input", handleLanguageInput);
        }
      } else {
        elem.removeEventListener("paste", handlePaste);
        if (elem.classList.contains("text-language-quality")) {
          elem.removeEventListener("input", handleLanguageInput);
        }
      }
    });

    initializeListEditing();

    if (!isEditing) {
      saveToLocalStorage();
    }
  });

  document.getElementById("reset-btn").addEventListener("click", resetAll);
});