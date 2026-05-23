// Personal signature log
console.log("Crafted patiently by Nubaid — clarity first via IndexedDB.");

// 1. Initialize IndexedDB
let db;
const dbRequest = indexedDB.open("ResourceReflectorDB", 1);

dbRequest.onerror = (event) => console.error("Database error:", event.target.error);

dbRequest.onsuccess = (event) => {
  db = event.target.result;
  renderResources(); // Render data once DB is ready
};

// This runs only the first time the app loads (or during version upgrades)
dbRequest.onupgradeneeded = (event) => {
  db = event.target.result;
  if (!db.objectStoreNames.contains("resources")) {
    db.createObjectStore("resources", { keyPath: "id", autoIncrement: true });
  }
};

// DOM elements
const resourceList = document.getElementById('resourceList');
const form = document.getElementById('resourceForm');
const searchInput = document.getElementById('search');
const typeSelect = document.getElementById('type');
const contentInput = document.getElementById('content');
const fileInput = document.getElementById('fileInput');

// Show/hide content/file input based on type
typeSelect.addEventListener('change', () => {
  if(typeSelect.value === 'file') {
    contentInput.classList.add('hidden');
    fileInput.classList.remove('hidden');
  } else {
    contentInput.classList.remove('hidden');
    fileInput.classList.add('hidden');
  }
});

// 2. READ: Render resources with search filter
function renderResources(filter='') {
  if (!db) return; // Wait until database connection opens

  resourceList.innerHTML = '';
  
  const transaction = db.transaction(["resources"], "readonly");
  const store = transaction.objectStore("resources");
  const request = store.getAll();

  request.onsuccess = () => {
    const allResources = request.result;
    
    // Filter the items locally in memory for maximum speed
    const filtered = allResources.filter(r =>
      r.title.toLowerCase().includes(filter.toLowerCase()) ||
      r.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
    );

    if(filtered.length === 0){
      resourceList.innerHTML = '<p style="color: #6b7280;">No resources found.</p>';
      return;
    }

    filtered.forEach((res) => {
      const card = document.createElement('div');
      card.className = 'resource-card';

      let contentHTML = '';
      if(res.type === 'link'){
        contentHTML = `<a href="${res.content}" target="_blank">${res.content}</a>`;
      } else if(res.type === 'note'){
        contentHTML = res.content;
      } else if(res.type === 'file'){
        if(res.fileType && res.fileType.startsWith('image/')){
          contentHTML = `<img src="${res.content}" alt="${res.fileName}">`;
        } else {
          contentHTML = `<a href="${res.content}" download="${res.fileName}">${res.fileName}</a>`;
        }
      }

      // Pass the actual database unique 'id' to the delete function
      card.innerHTML = `
        <div>
          <h3>${res.title} <span style="font-size:0.85rem; color:#6b7280;">[${res.type}]</span></h3>
          <p>${contentHTML}</p>
          <p class="resource-tags">Tags: ${res.tags.join(', ')}</p>
        </div>
        <div>
          <span class="delete-btn" onclick="deleteResource(${res.id})">Delete</span>
        </div>
      `;
      resourceList.appendChild(card);
    });
  };
}

// 3. DELETE: Remove item by its unique ID
function deleteResource(id){
  if(confirm('Delete this resource?')){
    const transaction = db.transaction(["resources"], "readwrite");
    const store = transaction.objectStore("resources");
    const request = store.delete(id);

    request.onsuccess = () => {
      renderResources(searchInput.value);
    };
  }
}

// Helper function to save items to IndexedDB
function addResourceToDB(resourceObject) {
  const transaction = db.transaction(["resources"], "readwrite");
  const store = transaction.objectStore("resources");
  const request = store.add(resourceObject);

  request.onsuccess = () => {
    renderResources(searchInput.value);
    form.reset();
    contentInput.classList.remove('hidden');
    fileInput.classList.add('hidden');
  };
}

// 4. CREATE: Add Resource
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const title = document.getElementById('title').value;
  const type = typeSelect.value;
  const tags = document.getElementById('tags').value.split(',').map(t=>t.trim()).filter(t=>t);

  if(type === 'file'){
    const file = fileInput.files[0]; // Crucial Fix: targeted the singular active file descriptor
    if(!file){ alert('Please select a file'); return; }

    const reader = new FileReader();
    reader.onload = function(event){
      addResourceToDB({
        title, type, content: event.target.result,
        tags, fileName: file.name, fileType: file.type
      });
    }
    reader.readAsDataURL(file);
  } else {
    const content = contentInput.value;
    addResourceToDB({ title, type, content, tags });
  }
});

// 5. SEARCH: Live filter
searchInput.addEventListener('input', ()=>{
  renderResources(searchInput.value);
});
