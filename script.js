// script.js - Lista de contactos con localStorage

const STORAGE_KEY = 'contacts';

// Helpers
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function readStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeStorage(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

// Generar id simple
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}

// Render tabla
function renderContacts() {
  const tbody = $('#contactsTable tbody');
  tbody.innerHTML = '';
  const contacts = readStorage();
  const emptyMessage = $('#emptyMessage');
  if (contacts.length === 0) {
    emptyMessage.style.display = 'block';
    return;
  }
  emptyMessage.style.display = 'none';

  contacts.forEach(contact => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(contact.name)}</td>
      <td>${escapeHtml(contact.phone)}</td>
      <td>${escapeHtml(contact.email)}</td>
      <td>
        <button class="action-btn edit" data-id="${contact.id}">Editar</button>
        <button class="action-btn delete" data-id="${contact.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// seguridad mínima para texto
function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// Agregar o actualizar
function saveContact(event) {
  event.preventDefault();
  const idField = $('#contactId').value;
  const name = $('#name').value.trim();
  const phone = $('#phone').value.trim();
  const email = $('#email').value.trim();

  if (!name || !phone || !email) {
    alert('Por favor completa todos los campos.');
    return;
  }

  const contacts = readStorage();

  if (idField) {
    // update
    const idx = contacts.findIndex(c => c.id === idField);
    if (idx !== -1) {
      contacts[idx].name = name;
      contacts[idx].phone = phone;
      contacts[idx].email = email;
      writeStorage(contacts);
      resetForm();
      renderContacts();
      alert('Contacto actualizado correctamente.');
      return;
    }
  }

  // create
  const newContact = { id: uid(), name, phone, email };
  contacts.push(newContact);
  writeStorage(contacts);
  resetForm();
  renderContacts();
  alert('Contacto agregado correctamente.');
}

function resetForm() {
  $('#contactForm').reset();
  $('#contactId').value = '';
  $('#btnSave').textContent = 'Guardar';
}

// Clicks en la tabla (delegation)
function tableClickHandler(e) {
  const editBtn = e.target.closest('.action-btn.edit');
  const delBtn = e.target.closest('.action-btn.delete');
  if (editBtn) {
    const id = editBtn.dataset.id;
    populateFormForEdit(id);
  } else if (delBtn) {
    const id = delBtn.dataset.id;
    if (confirm('¿Eliminar este contacto?')) {
      deleteContact(id);
    }
  }
}

function populateFormForEdit(id) {
  const contacts = readStorage();
  const c = contacts.find(cc => cc.id === id);
  if (!c) return;
  $('#contactId').value = c.id;
  $('#name').value = c.name;
  $('#phone').value = c.phone;
  $('#email').value = c.email;
  $('#btnSave').textContent = 'Actualizar';
}

function deleteContact(id) {
  let contacts = readStorage();
  contacts = contacts.filter(c => c.id !== id);
  writeStorage(contacts);
  renderContacts();
  alert('Contacto eliminado.');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderContacts();

  $('#contactForm').addEventListener('submit', saveContact);
  $('#btnClear').addEventListener('click', resetForm);
  $('#contactsTable').addEventListener('click', tableClickHandler);
});
