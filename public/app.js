const $ = id => document.getElementById(id)

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

function renderNotes(notes) {
  const ul = $('notes-list'); ul.innerHTML = ''
  notes.forEach(n => {
    const li = document.createElement('li'); li.className = 'note'
    const left = document.createElement('div'); left.textContent = n.text
    const right = document.createElement('div')
    const del = document.createElement('button'); del.className='small-btn'; del.textContent='Delete'
    del.onclick = async () => {
      await fetch(`/api/notes/${n.id}`, { method: 'DELETE' })
      await loadNotes()
    }
    right.appendChild(del)
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

document.addEventListener('DOMContentLoaded', () => {
  loadQuote()
  loadNotes()
  $('new-quote').onclick = loadQuote
  $('add-note').onclick = addNote
})
