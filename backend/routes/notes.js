








// In-memory database (for demo purposes)
// In a real app, this would be MongoDB
const notesDatabase = [];

// GET /api/notes - Get all notes
export const getNotes = (_req, res) => {
  try {
    // Sort by newest first
    const sortedNotes = [...notesDatabase].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json({ notes: sortedNotes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

// POST /api/notes - Create a new note
export const createNote = (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: "Title and content are required" });
      return;
    }

    const newNote = {
      _id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
    };

    notesDatabase.push(newNote);
    res.status(201).json({ note: newNote });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
};

// DELETE /api/notes/:id - Delete a note
export const deleteNote = (req, res) => {
  try {
    const { id } = req.params;

    const index = notesDatabase.findIndex((note) => note._id === id);
    if (index === -1) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    notesDatabase.splice(index, 1);
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
};
