const Header = ({ eyebrow, title, children }) => {
  return (
    <section className="page-header">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {children ? <div className="page-header__body">{children}</div> : null}
    </section>
  )
}

export default Header
