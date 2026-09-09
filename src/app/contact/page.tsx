import type { Metadata } from "next";
import { Navigation } from "@/components/navigation/Navigation";
import { Footer } from "@/components/sections/Footer";
import { DIVISIONS, DIVISION_ORDER } from "@/lib/brand";
import { CONTACTS } from "@/lib/contacts";
import { site } from "@/lib/site";
import styles from "./contact.module.css";

const description =
  "Contact Farnsworth Motors for vehicle sales, Farnsworth Collision for autobody and paint, or Farnsworth Service for mechanical repairs in Salt Lake City, Utah.";

export const metadata: Metadata = {
  title: "Contact",
  description,
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact Farnsworth", description, url: "/contact" },
};

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <>
      <Navigation />
      <main id="main" className={styles.page}>
        <div className="wrap">
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Contact Farnsworth</p>
              <h1 className={styles.title}>LET’S TALK.</h1>
            </div>
            <p className={styles.intro}>
              Buying a car. Repairing the body. Keeping it running.
              <span>Get in touch with the right Farnsworth team.</span>
            </p>
          </header>

          <div className={styles.contacts}>
            {DIVISION_ORDER.map((key, index) => {
              const division = DIVISIONS[key];
              const contact = CONTACTS[key];
              const emailHref = `mailto:${contact.email}?subject=${encodeURIComponent(`Farnsworth ${contact.label} inquiry`)}`;

              return (
                <section key={key} id={key} aria-labelledby={`${key}-title`} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <p className={styles.division}>{division.name}</p>
                    <span className={styles.index} aria-hidden="true">0{index + 1}</span>
                  </div>
                  <div className={styles.overview}>
                    <h2 id={`${key}-title`} className={styles.cardTitle}>{contact.label}</h2>
                    <p className={styles.description}>{contact.description}</p>
                    <ul className={styles.topics} aria-label={`${contact.label} inquiries`}>
                      {contact.topics.map((topic) => <li key={topic}>{topic}</li>)}
                    </ul>
                  </div>

                  <div className={styles.details}>
                    <h3 className={styles.detailLabel}>Contact the {contact.label.toLowerCase()}</h3>
                    <a
                      className={styles.phone}
                      href={contact.phoneHref}
                      aria-label={`Call Farnsworth ${division.word.toLowerCase()} at ${contact.phone}`}
                    >
                      {contact.phone}<Arrow />
                    </a>
                    <a className={styles.email} href={emailHref}>
                      {contact.email}<Arrow />
                    </a>
                    <a className={styles.emailButton} href={emailHref}>
                      Email the {contact.label.toLowerCase()}<Arrow />
                    </a>
                  </div>
                  <p className={styles.preparation}>{contact.preparation}</p>
                </section>
              );
            })}
          </div>

          <aside className={styles.location} aria-label="Location and languages">
            <p>{site.location}</p>
            <p>English <span aria-hidden="true">/</span> <span lang="es">{site.languages}</span></p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
