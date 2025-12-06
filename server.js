const express = require('express')
const path = require('path')
const fs = require('fs-extra')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000
const DATA_DIR = path.join(__dirname, 'data')
const NOTES_FILE = path.join(DATA_DIR, 'notes.json')

// Ensure data folder & file exist (creates data/ and notes.json with [] if missing)
fs.ensureDirSync(DATA_DIR)
if (!fs.existsSync(NOTES_FILE)) fs.writeJsonSync(NOTES_FILE, [])

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

// Simple quotes array
const quotes = [
  "Start small. Finish strong.",
  "Progress > perfection.",
  "Make today count.",
  "Keep learning, keep building.",
  "Small steps every day."
]

// GET /api/quote -> random quote
app.get('/api/quote', (req, res) => {
  const q = quotes[Math.floor(Math.random() * quotes.length)]
  res.json({ quote: q, time: new Date().toISOString() })
})

// GET /api/notes -> return notes array
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await fs.readJson(NOTES_FILE)
    res.json({ notes })
  } catch (err) {
    res.status(500).json({ error: 'Could not read notes' })
  }
})

// POST /api/notes -> add a new note { text: "..." }
app.post('/api/notes', async (req, res) => {
  const { text } = req.body
  if (!text || !text.trim()) return res.status(400).json({ error: 'Empty note' })
  try {
    const notes = await fs.readJson(NOTES_FILE)
    const newNote = { id: Date.now(), text: text.trim(), createdAt: new Date().toISOString() }
    notes.unshift(newNote)
    await fs.writeJson(NOTES_FILE, notes, { spaces: 2 })
    res.json({ note: newNote })
  } catch (err) {
    res.status(500).json({ error: 'Could not write note' })
  }
})

// DELETE /api/notes/:id -> delete note
app.delete('/api/notes/:id', async (req, res) => {
  const id = Number(req.params.id)
  try {
    const notes = await fs.readJson(NOTES_FILE)
    const filtered = notes.filter(n => n.id !== id)
    await fs.writeJson(NOTES_FILE, filtered, { spaces: 2 })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' })
  }
})

// Serve index.html for any other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`QuickNote Pro listening at http://localhost:${PORT}`)
})
