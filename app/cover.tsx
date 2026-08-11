// The holding cover shown over the registration page before launch.
//
// Deliberately translucent rather than an opaque white page: the conference wanted visitors to
// still see that the form exists and is ready, just not to use it. The page scrolls normally
// behind this -- a fixed, non-scrollable overlay passes wheel and touch scroll through to the
// document -- so the speakers and the form remain browsable while every click is intercepted.
export default function Cover() {
  return (
    <div className="cover-scrim" role="dialog" aria-modal="true" aria-labelledby="cover-title">
      <section className="cover-card">
        <p className="eyebrow gold">Word In Action Global Conference</p>
        <h1 id="cover-title">Registration opens soon</h1>
        <p className="cover-lead">
          The conference office is finalising delegate packages and fees. Registration is not open
          yet, and details entered on this page are not being recorded.
        </p>
        <dl className="cover-facts">
          <div><dt>Dates</dt><dd>17–19 September 2026</dd></div>
          <div><dt>Venue</dt><dd>Gallagher Convention Centre</dd></div>
          <div><dt>Location</dt><dd>Midrand, Gauteng</dd></div>
        </dl>
        <p className="cover-contact">
          To reserve a place before registration opens, contact the office
          <a href="tel:+27670439548">067 043 9548</a>
          <a href="mailto:wiaglobal1@gmail.com">wiaglobal1@gmail.com</a>
        </p>
      </section>
    </div>
  );
}
