// 1. OPEN DATABASE
let db;
const req = indexedDB.open("ReflectorDB", 1);

req.onsuccess = (e) => {
  db = e.target.result;
  showCards();
};

req.onupgradeneeded = (e) => {
  db = e.target.result;
  db.createObjectStore("links", { keyPath: "id", autoIncrement: true });
};

// 2. DOM ELEMENT SELECTORS
const form = document.getElementById('resourceForm');
const list = document.getElementById('resourceList');
const titleBox = document.getElementById('title');
const contentBox = document.getElementById('content');
const typeBox = document.getElementById('type');
const tagsBox = document.getElementById('tags');
const searchBox = document.getElementById('search');

// 3. ALTERNATE VISIBILITY FOR FILE INPUT
typeBox.addEventListener('change', () => {
  const fileInput = document.getElementById('fileInput');
  if (typeBox.value === 'file') {
    contentBox.classList.add('hidden');
    fileInput.classList.remove('hidden');
    contentBox.required = false;
  } else {
    contentBox.classList.remove('hidden');
    fileInput.classList.add('hidden');
    contentBox.required = true;
    contentBox.placeholder = typeBox.value === 'link' ? "Paste URL..." : "Type note...";
  }
});

// 4. SMART CLIPBOARD PARSER FOR LINKHARVEST.PY
titleBox.addEventListener('paste', (e) => {
  const text = (e.clipboardData || window.clipboardData).getData('text');
  
  if (text.includes('Title:') && text.includes('URL:') && text.includes('Summary:')) {
    e.preventDefault();
    
    const lines = text.split('\n');
    let t = "", u = "", s = "";

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('Title:')) t = lines[i].replace('Title:', '').trim();
      if (lines[i].startsWith('URL:')) u = lines[i].replace('URL:', '').trim();
      if (lines[i].startsWith('Summary:')) s = lines[i].replace('Summary:', '').trim();
    }

    titleBox.value = t;
    typeBox.value = 'link';
    contentBox.classList.remove('hidden');
    document.getElementById('fileInput').classList.add('hidden');
    
    contentBox.value = u + "\n\n[Summary: " + s + "]";
    tagsBox.value = "harvested, link";
  }
});

// 5. SHOW CARDS ON SCREEN
function showCards(searchQuery = '') {
  if (!db) return;
  list.innerHTML = '';

  db.transaction(["links"], "readonly").objectStore("links").getAll().onsuccess = (e) => {
    const items = e.target.result;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) continue;

      const card = document.createElement('div');
      card.className = 'resource-card';

      card.innerHTML = `
        <div style="font-weight:bold;">${item.title} [${item.type.toUpperCase()}]</div>
        <div class="resource-content">${item.content}</div>
        <div class="resource-footer-row">
          <div>Tags: ${item.tags}</div>
          <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
        </div>
      `;
      list.appendChild(card);
    }
  };
}

// 6. DELETE ITEM
function deleteItem(id) {
  db.transaction(["links"], "readwrite").objectStore("links").delete(id).onsuccess = () => {
    showCards(searchBox.value);
  };
}

// 7. SUBMIT AND SAVE
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  let contentValue = contentBox.value;
  
  if (typeBox.value === 'file') {
    const fileFiles = document.getElementById('fileInput').files;
    contentValue = (fileFiles && fileFiles.length > 0) ? "Attached File: " + fileFiles[0].name : "No file attached";
  }

  const newRecord = {
    title: titleBox.value.trim(),
    type: typeBox.value,
    content: contentValue,
    tags: tagsBox.value.trim()
  };

  db.transaction(["links"], "readwrite").objectStore("links").add(newRecord).onsuccess = () => {
    form.reset();
    contentBox.classList.remove('hidden');
    document.getElementById('fileInput').classList.add('hidden');
    showCards(searchBox.value);
  };
});

// 8. LIVE SEARCH
searchBox.addEventListener('input', (e) => {
  showCards(e.target.value);
});

// 9. EXTRA: RAW BACKUP EXPORT
document.getElementById('exportBtn').addEventListener('click', () => {
  if (!db) return;
  db.transaction(["links"], "readonly").objectStore("links").getAll().onsuccess = (e) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(e.target.result, null, 2)], {type: "application/json"}));
    a.download = "reflector_backup.json";
    a.click();
  };
});

// 10. EXTRA: RAW BACKUP IMPORT
document.getElementById('importFile').addEventListener('change', (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const records = JSON.parse(event.target.result);
      const tx = db.transaction(["links"], "readwrite");
      const store = tx.objectStore("links");
      
      for (let i = 0; i < records.length; i++) {
        let item = records[i];
        if (item.id) delete item.id; // Allow IndexedDB to auto-increment smoothly
        store.add(item);
      }
      
      tx.oncomplete = () => {
        showCards(searchBox.value);
        e.target.value = ''; // Clear file input field
      };
    } catch (err) {
      console.error("JSON parsing fault hit.");
    }
  };
  reader.readAsText(files[0]);
});
