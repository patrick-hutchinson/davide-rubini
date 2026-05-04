import styles from "./AboutPage.module.css";

const portableTextToPlainText = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";

  return value
    .map((block) => {
      if (typeof block === "string") return block;
      if (block?._type === "block" && Array.isArray(block.children)) {
        return block.children.map((child) => child?.text || "").join("");
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
};

const AboutPage = ({ about }) => {
  const descriptionText = portableTextToPlainText(about?.description);
  const selectedClientsText = portableTextToPlainText(about?.selectedClients);
  const selectedClients = selectedClientsText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const contacts = Array.isArray(about?.contact) ? about.contact : [];

  return (
    <main className={styles.main}>
      <section className={styles.block}>
        <h2 className={styles.label}>Description</h2>
        {descriptionText.trim() ? <p className={styles.paragraph}>{descriptionText}</p> : <p>No description available.</p>}
      </section>

      <section className={styles.block}>
        <h2 className={styles.label}>Clients</h2>
        {selectedClients.length > 0 ? (
          <ul className={styles.list}>
            {selectedClients.map((client, index) => (
              <li key={`${client}-${index}`}>{client}</li>
            ))}
          </ul>
        ) : (
          <p>No clients listed.</p>
        )}
      </section>

      <section className={styles.block}>
        <h2 className={styles.label}>Contact</h2>
        {contacts.length > 0 ? (
          <ul className={styles.list}>
            {contacts.map((item, index) => {
              const linkLabel =
                typeof item?.link === "string"
                  ? item.link.replace(/^https?:\/\//, "").replace(/^mailto:/, "")
                  : item?.platform;

              return (
                <li key={`${item?.platform || "contact"}-${index}`}>
                  {item?.platform ? `${item.platform}: ` : ""}
                  {item?.link ? (
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      {linkLabel || "Link"}
                    </a>
                  ) : (
                    "No link"
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No contact info listed.</p>
        )}
      </section>
    </main>
  );
};

export default AboutPage;
