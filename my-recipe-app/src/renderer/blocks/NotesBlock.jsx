function NotesBlock({ block }) {
  return (
    <section className="recipe-section">
      <h2>Notes</h2>
      <ul className="note-list">
        {block.data.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export default NotesBlock
