"use client";

import styles from "./AboutPage.module.css";

import Text from "@/components/Text/Text";

const AboutPage = ({ about }) => {
  const contacts = Array.isArray(about?.contact) ? about.contact : [];

  return (
    <main className={styles.main}>
      <section>
        <Text text={about?.description} />
      </section>

      <section>
        <div className={styles.label}>Clients</div>
        <Text text={about?.selectedClients} />
      </section>

      <section>
        <div className={styles.label}>Contact</div>
        {contacts.length > 0 ? (
          <ul className={styles.list}>
            {contacts.map((item, index) => {
              return (
                <li key={index}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.platform}
                  </a>
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
