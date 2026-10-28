// Ensure db is only declared once here
if (typeof db === 'undefined') {
  var db;
}

const dbRequest = indexedDB.open("ResourceReflectorDB", 1);

dbRequest.onerror = (event) => console.error("Memory offline:", event.target.error);

dbRequest.onsuccess = (event) => {
  db = event.target.result;
  renderResources();
};

dbRequest.onupgradeneeded = (event) => {
  db = event.target.result;
  if (!db.objectStoreNames.contains("resources")) {
    db.createObjectStore("resources", { keyPath: "id", autoIncrement: true });
  }
};

const resourceList = document.getElementById('resourceList');
const form = document.getElementById('resourceForm');
const searchInput = document.getElementById('search');
const typeSelect = document.getElementById('type');
const contentInput = document.getElementById('content');
const fileInput = document.getElementById('fileInput');
const titleInput = document.getElementById('title');

// Handles field view transformations cleanly depending on format context selection
typeSelect.addEventListener('change', () => {
  if (typeSelect.value === 'file') {
    contentInput.classList.add('hidden');
    contentInput.required = false;
    fileInput.classList.remove('hidden');
  } else {
    contentInput.classList.remove('hidden');
    contentInput.required = true;
    fileInput.classList.add('hidden');
    
    if (typeSelect.value === 'link') {
      contentInput.placeholder = "Paste your link here (https://...)";
    } else {
      contentInput.placeholder = "Type out your note or thought here...";
    }
  }
});

// ⚡ COZY INTELLIGENT PAYLOAD BRIDGE INTERCEPTOR
// This captures data blocks emitted by verify_and_scrape.py when pasted into Title field
titleInput.addEventListener('paste', (e) => {
  const pastedText = (e.clipboardData || window.clipboardData).getData('text');
  
  if (pastedText.includes('Title:') && pastedText.includes('URL:') && pastedText.includes('Summary:')) {
    e.preventDefault(); // Halt standard paste injection text breakages
    
    const lines = pastedText.split('\n');
    let scrapedTitle = "";
    let scrapedUrl = "";
    let scrapedSummary = "";

    lines.forEach(line => {
      if (line.startsWith('Title:')) scrapedTitle = line.replace('Title:', '').trim();
      if (line.startsWith('URL:')) scrapedUrl = line.replace('URL:', '').trim();
      if (line.startsWith('Summary:')) scrapedSummary = line.replace('Summary:', '').trim();
    });

    // Auto-populate the active input interfaces and switch type explicitly to link
    titleInput.value = scrapedTitle;
    typeSelect.value = 'link';
    
    contentInput.classList.remove('hidden');
    fileInput.classList.add('hidden');
    contentInput.placeholder = "Paste your link here (https://...)";
    contentInput.value = scrapedUrl;
    
    // Cache the scraped meta summaries directly onto a temporary dataset attribute
    contentInput.setAttribute('data-scraped-summary', scrapedSummary);
    
    document.getElementById('tags').value = "verified, scraped";
    console.log("⚡ Handcrafted Bridge Activated: Unpacked verified Python payload cleanly.");
  }
});

function renderResources(filter = '') {
  if (!db) return;

  resourceList.innerHTML = '';
  
  const transaction = db.transaction(["resources"], "readonly");
  const store = transaction.objectStore("resources");
  const request = store.getAll();

  request.onsuccess = () => {
    const allResources = request.result;
    
    const filtered = allResources.filter(r =>
      r.title.toLowerCase().includes(filter.toLowerCase()) ||
      (r.tags && r.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase())))
    );

    if (filtered.length === 0) {
      resourceList.innerHTML = '<p class="subtitle" style="text-align: center; padding: 1rem 0;">No reflections matched your criteria.</p>';
      return;
    }

    filtered.forEach((res) => {
      const card = document.createElement('div');
      card.className = 'resource-card';

      let displayContent = '';
      if (res.type === 'link') {
        const summaryMarkup = res.summary ? `<div class="resource-summary-text" style="font-size:0.9rem; color:var(--text-muted); margin-top:0.5rem; font-style:italic;">"${res.summary}"</div>` : '';
        displayContent = `
          <div class="resource-content">
            <a href="${res.content}" target="_blank">${res.content}</a>
            ${summaryMarkup}
          </div>`;
      } else if (res.type === 'note') {
        displayContent = `<div class="resource-content">${res.content}</div>`;
      } else if (res.type === 'file') {
        if (res.fileType && res.fileType.startsWith('image/')) {
          displayContent = `<img src="${res.content}" alt="${res.fileName}">`;
        } else {
          displayContent = `<div class="resource-content"><a href="${res.content}" download="${res.fileName}">💾 ${res.fileName}</a></div>`;
        }
      }

      const formatIcons = { link: '🔗', note: '✍️', file: '📁' };
      const icon = formatIcons[res.type] || '📄';

      const tagElements = res.tags ? res.tags.map(t => `<span class="tag-badge">#${t}</span>`).join(' ') : '';

      card.innerHTML = `
        <div class="resource-card-header">
          <h3>${res.title} <span style="font-size: 0.85rem; font-weight: normal; color: var(--text-muted); margin-left: 0.25rem;">${icon}</span></h3>
        </div>
        ${displayContent}
        <div class="resource-footer-row">
          <div class="resource-tags">${tagElements}</div>
          <button class="delete-btn" data-id="${res.id}">Remove</button>
        </div>
      `;

      card.querySelector('.delete-btn').addEventListener('click', (e) => {
        const idToDelete = parseInt(e.target.getAttribute('data-id'));
        removeResource(idToDelete);
      });

      resourceList.appendChild(card);
    });
  };
}

function removeResource(id) {
  const transaction = db.transaction(["resources"], "readwrite");
  const store = transaction.objectStore("resources");
  store.delete(id).onsuccess = () => {
    renderResources(searchInput.value);
  };
}

function commitToMemory(resourceObject) {
  const transaction = db.transaction(["resources"], "readwrite");
  const store = transaction.objectStore("resources");
  
  store.add(resourceObject).onsuccess = () => {
    renderResources(searchInput.value);
    form.reset();
    contentInput.removeAttribute('data-scraped-summary');
    contentInput.classList.remove('hidden');
    contentInput.placeholder = "Paste your link or type out your note here...";
    contentInput.required = false;
    fileInput.classList.add('hidden');
  };
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const title = titleInput.value.trim();
  const type = typeSelect.value;
  const rawTags = document.getElementById('tags').value;
  const tags = rawTags.split(',').map(t => t.replace(/,/g, '').trim().toLowerCase()).filter(t => t);

  if (!type) {
    typeSelect.style.borderColor = 'var(--danger)';
    return;
  }
  typeSelect.style.borderColor = '';

  if (type === 'file') {
    const file = fileInput.files[0];
    if (!file) {
      fileInput.style.outline = '1px solid var(--danger)';
      return;
    }
    fileInput.style.outline = '';

    const reader = new FileReader();
    reader.onload = function(event) {
      commitToMemory({
        title, type, content: event.target.result,
        tags, fileName: file.name, fileType: file.type
      });
    };
    reader.readAsDataURL(file);
  } else {
    const content = contentInput.value.trim();
    const summary = contentInput.getAttribute('data-scraped-summary') || '';
    commitToMemory({ title, type, content, tags, summary });
  }
});

searchInput.addEventListener('input', () => {
  renderResources(searchInput.value);
});

// --- DATA VAULT BACKUP ENGINE LOGIC ---
document.getElementById('exportBtn').addEventListener('click', () => {
  if (!db) return;
  const transaction = db.transaction(["resources"], "readonly");
  const store = transaction.objectStore("resources");
  const request = store.getAll();

  request.onsuccess = () => {
    const dataStr = JSON.stringify(request.result, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = "resourcereflector_live_vault.json";
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  };
});

document.getElementById('importFile').addEventListener('change', (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  const file = files[0];

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const importedData = JSON.parse(event.target.result);
      if (!Array.isArray(importedData)) throw new Error("Invalid structure format");

      const transaction = db.transaction(["resources"], "readwrite");
      const store = transaction.objectStore("resources");

      importedData.forEach(item => {
        if (item.id) delete item.id;
        store.add(item);
      });

      transaction.oncomplete = () => {
        renderResources(searchInput.value);
        e.target.value = '';
      };
    } catch (err) {
      console.error("Failed importing database state:", err);
      document.getElementById('importFile').style.outline = '1px solid var(--danger)';
    }
  };
  reader.readAsText(file);
});

console.log("Handcrafted out of personal necessity by Nubaid. Clarity first.");
