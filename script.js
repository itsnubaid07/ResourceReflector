// Personal signature log
console.log("Crafted patiently by Nubaid — clarity first.");

// Initialize resources
let resources = JSON.parse(localStorage.getItem('resources')) || [];

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

// Save to localStorage
function saveResources() {
  localStorage.setItem('resources', JSON.stringify(resources));
}

// Render resources
function renderResources(filter='') {
  resourceList.innerHTML = '';
  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(filter.toLowerCase()) ||
    r.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
  );

  if(filtered.length === 0){
    resourceList.innerHTML = '<p style="color: #6b7280;">No resources found.</p>';
    return;
  }

  filtered.forEach((res, index) => {
    const card = document.createElement('div');
    card.className = 'resource-card';

    let contentHTML = '';
    if(res.type === 'link'){
      contentHTML = `<a href="${res.content}" target="_blank">${res.content}</a>`;
    } else if(res.type === 'note'){
      contentHTML = res.content;
    } else if(res.type === 'file'){
      if(res.fileType.startsWith('image/')){
        contentHTML = `<img src="${res.content}" alt="${res.fileName}">`;
      } else {
        contentHTML = `<a href="${res.content}" download="${res.fileName}">${res.fileName}</a>`;
      }
    }

    card.innerHTML = `
      <div>
        <h3>${res.title} <span style="font-size:0.85rem; color:#6b7280;">[${res.type}]</span></h3>
        <p>${contentHTML}</p>
        <p class="resource-tags">Tags: ${res.tags.join(', ')}</p>
      </div>
      <div>
        <span class="delete-btn" onclick="deleteResource(${index})">Delete</span>
      </div>
    `;
    resourceList.appendChild(card);
  });
}

// Delete resource
function deleteResource(index){
  if(confirm('Delete this resource?')){
    resources.splice(index,1);
    saveResources();
    renderResources(searchInput.value);
  }
}

// Add Resource
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const title = document.getElementById('title').value;
  const type = typeSelect.value;
  const tags = document.getElementById('tags').value.split(',').map(t=>t.trim()).filter(t=>t);

  if(type === 'file'){
    const file = fileInput.files[0];
    if(!file){ alert('Please select a file'); return; }

    const reader = new FileReader();
    reader.onload = function(event){
      resources.push({
        title, type, content: event.target.result,
        tags, fileName: file.name, fileType: file.type
      });
      saveResources();
      renderResources(searchInput.value);
      form.reset();
      contentInput.classList.remove('hidden');
      fileInput.classList.add('hidden');
    }
    reader.readAsDataURL(file);
  } else {
    const content = contentInput.value;
    resources.push({ title, type, content, tags });
    saveResources();
    renderResources(searchInput.value);
    form.reset();
  }
});

// Search
searchInput.addEventListener('input', ()=>{
  renderResources(searchInput.value);
});

// Initial render
renderResources();
