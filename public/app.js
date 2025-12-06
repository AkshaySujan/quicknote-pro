const $ = id => document.getElementById(id)

// state for edit modal
let editingId = null

// fetch and display a quote from backend
async function loadQuote() {
  try {
    const res = await fetch('/api/quote')
    const json = await res.json()
    $('quote').textContent = json.quote
  } catch (e) {
    $('quote').textContent = 'Could not load quote'
  }
}

// load notes from server and render
async function loadNotes() {
  try {
    const res = await fetch('/api/notes')
    const json = await res.json()
    renderNotes(json.notes || [])
  } catch (e) {
    renderNotes([])
  }
}

function formatDate(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch { return iso }
}

function renderNotes(notes) {
  const ul = $('notes-list'); ul.innerHTML = ''
  notes.forEach(n => {
    const li = document.createElement('li'); li.className = 'note'
    const left = document.createElement('div'); left.className = 'note-left'
    const textDiv = document.createElement('div'); textDiv.className = 'note-text'; textDiv.textContent = n.text
    const metaDiv = document.createElement('div'); metaDiv.className = 'note-meta'
    const created = n.createdAt ? `Created: ${formatDate(n.createdAt)}` : ''
    const updated = n.updatedAt ? ` • Updated: ${formatDate(n.updatedAt)}` : ''
    metaDiv.textContent = created + updated

    left.appendChild(textDiv); left.appendChild(metaDiv)

    const right = document.createElement('div'); right.className = 'note-actions'
    const edit = document.createElement('button'); edit.className='small-btn'; edit.textContent='Edit'
    edit.onclick = () => openEditModal(n.id, n.text)
    const del = document.createElement('button'); del.className='small-btn'; del.textContent='Delete'
    del.onclick = async () => {
      if (!confirm('Delete this note?')) return
      await fetch(`/api/notes/${n.id}`, { method: 'DELETE' })
      await loadNotes()
    }

    right.appendChild(edit); right.appendChild(del)
    li.appendChild(left); li.appendChild(right)
    ul.appendChild(li)
  })
}

// add a new note via POST
async function addNote() {
  const text = $('note-input').value
  if (!text || !text.trim()) return
  await fetch('/api/notes', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ text })
  })
  $('note-input').value = ''
  await loadNotes()
}

// edit flow
function openEditModal(id, text) {
  editingId = id
  $('edit-text').value = text
  const m = $('edit-modal'); m.setAttribute('aria-hidden', 'false')
}
function closeEditModal() {
  editingId = null
  const m = $('edit-modal'); m.setAttribute('aria-hidden', 'true')
}
async function saveEdit() {
  const newText = $('edit-text').value
  if (!newText || !newText.trim()) { alert('Cannot save empty note'); return }
  await fetch(`/api/notes/${editingId}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ text: newText })
  })
  closeEditModal()
  await loadNotes()
}

// theme toggle
function loadTheme() {
  const t = localStorage.getItem('qnp-theme') || 'light'
  if (t === 'dark') document.body.classList.add('dark')
  updateThemeIcon()
}
function toggleTheme() {
  document.body.classList.toggle('dark')
  const now = document.body.classList.contains('dark') ? 'dark' : 'light'
  localStorage.setItem('qnp-theme', now)
  updateThemeIcon()
}
function updateThemeIcon() {
  const btn = $('theme-toggle')
  btn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙'
}

document.addEventListener('DOMContentLoaded', () => {
  loadQuote()
  loadNotes()
  $('new-quote').onclick = loadQuote
  $('add-note').onclick = addNote

  // edit modal buttons
  $('cancel-edit').onclick = closeEditModal
  $('save-edit').onclick = saveEdit

  // theme toggle
  $('theme-toggle').onclick = toggleTheme
  loadTheme()
})
