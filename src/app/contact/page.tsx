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
      <path d="M6 18 18 6M6 6h12v12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function Phone() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m8.5 3 2 5-2.5 2a15 15 0 0 0 6 6l2-2.5 5 2v3a2.5 2.5 0 0 1-2.7 2.5A18.5 18.5 0 0 1 3 5.7 2.5 2.5 0 0 1 5.5 3h3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <>
      <Navigation />
      <main id="main" className={styles.page}>
        <div className={`wrap ${styles.layout}`}>
          <header className={styles.header}>
            <p className={styles.eyebrow}><span aria-hidden="true" />Contact</p>
            <h1 className={styles.title}>Let’s<br /><span>talk.</span></h1>
            <p className={styles.intro}>
              Reach our dealership, body shop,<br className={styles.desktopBreak} /> or service team directly.
            </p>

            <div className={styles.location}>
              <p>{site.location}</p>
              <p lang="es">{site.languages}</p>
            </div>
          </header>

          <div className={styles.directory}>
            <p className={styles.directoryLabel}>Three teams. One Farnsworth.</p>
            {DIVISION_ORDER.map((key, index) => {
              const division = DIVISIONS[key];
              const contact = CONTACTS[key];
              const emailHref = `mailto:${contact.email}?subject=${encodeURIComponent(`Farnsworth ${contact.label} inquiry`)}`;
              const divisionName = division.word[0] + division.word.slice(1).toLowerCase();

              return (
                <section key={key} id={key} aria-labelledby={`${key}-title`} className={styles.contact}>
                  <div className={styles.identity}>
                    <p className={styles.department}>
                      <span className={styles.index} aria-hidden="true">0{index + 1}</span>
                      {contact.label}
                    </p>
                    <h2 id={`${key}-title`} className={styles.business}>
                      <span className={styles.brandName}>Farnsworth</span>{" "}
                      {divisionName}
                    </h2>
                  </div>

                  <address className={styles.methods}>
                    <a
                      className={styles.phone}
                      href={contact.phoneHref}
                      aria-label={`Call Farnsworth ${divisionName} at ${contact.phone}`}
                    >
                      <span>{contact.phone}</span>
                      <span className={styles.callIcon}><Phone /></span>
                    </a>
                    <a
                      className={styles.email}
                      href={emailHref}
                      aria-label={`Email Farnsworth ${divisionName}: ${contact.email}`}
                    >
                      <span>{contact.email}</span><Arrow />
                    </a>
                  </address>
                </section>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
