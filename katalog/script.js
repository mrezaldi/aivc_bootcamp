let items = [];
let editingId = null;

const STORAGE_KEY = 'katalog_barang';

function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    items = JSON.parse(stored);
    renderTable();
  } else {
    fetch('data/items.json')
      .then(res => res.json())
      .then(data => {
        items = data;
        saveToStorage();
        renderTable();
      })
      .catch(() => {
        items = [];
        renderTable();
      });
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items, null, 2));
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  const empty = document.getElementById('emptyState');

  tbody.innerHTML = '';

  if (items.length === 0) {
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  items.forEach((item, index) => {
    const row = document.createElement('tr');
    row.className = 'border-b border-gray-200 hover:bg-gray-50';

    const hargaStr = 'Rp ' + item.harga.toLocaleString('id-ID');
    const stokStr = item.stok.toLocaleString('id-ID');

    row.innerHTML = `
      <td class="py-3 px-4">${index + 1}</td>
      <td class="py-3 px-4 font-medium">${escapeHtml(item.nama)}</td>
      <td class="py-3 px-4 text-right">${hargaStr}</td>
      <td class="py-3 px-4 text-right">${stokStr}</td>
      <td class="py-3 px-4 text-center">
        <button onclick="editItem(${item.id})"
          class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition text-xs mr-1">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="deleteItem(${item.id})"
          class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-xs">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.getElementById('itemForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const nama = document.getElementById('nama').value.trim();
  const harga = parseInt(document.getElementById('harga').value);
  const stok = parseInt(document.getElementById('stok').value);

  if (editingId) {
    const index = items.findIndex(i => i.id === editingId);
    if (index !== -1) {
      items[index] = { id: editingId, nama, harga, stok };
    }
    editingId = null;
    document.getElementById('formTitle').innerHTML = '<i class="fas fa-plus-circle mr-2 text-green-500"></i>Tambah Barang';
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save mr-1"></i> Simpan';
  } else {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    items.push({ id: newId, nama, harga, stok });
  }

  saveToStorage();
  renderTable();
  resetForm();
});

function editItem(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  editingId = id;
  document.getElementById('itemId').value = id;
  document.getElementById('nama').value = item.nama;
  document.getElementById('harga').value = item.harga;
  document.getElementById('stok').value = item.stok;

  document.getElementById('formTitle').innerHTML = '<i class="fas fa-edit mr-2 text-yellow-500"></i>Edit Barang';
  document.getElementById('submitBtn').innerHTML = '<i class="fas fa-pen mr-1"></i> Update';
  document.getElementById('nama').focus();
}

function deleteItem(id) {
  if (!confirm('Yakin ingin menghapus barang ini?')) return;

  items = items.filter(i => i.id !== id);
  saveToStorage();
  renderTable();

  if (editingId === id) resetForm();
}

function resetForm() {
  editingId = null;
  document.getElementById('itemForm').reset();
  document.getElementById('itemId').value = '';
  document.getElementById('formTitle').innerHTML = '<i class="fas fa-plus-circle mr-2 text-green-500"></i>Tambah Barang';
  document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save mr-1"></i> Simpan';
}

function exportJSON() {
  const dataStr = JSON.stringify(items, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'items.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

loadData();
