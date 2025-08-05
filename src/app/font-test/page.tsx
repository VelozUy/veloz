import React from 'react';

export default function FontTestPage() {
  return (
    <div className="min-h-screen bg-background p-8 md:p-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-6xl font-title font-bold uppercase tracking-wide leading-tight mb-4">
            Font Test Page
          </h1>
          <p className="text-xl font-body text-muted-foreground">
            Testing the new font hierarchy implementation
          </p>
        </div>

        {/* Font Hierarchy Demo */}
        <section className="space-y-8">
          <h2 className="text-3xl font-title font-bold uppercase tracking-wide">
            Font Hierarchy
          </h2>

          {/* Titles - Roboto Black Italic */}
          <div className="space-y-4">
            <h3 className="text-2xl font-subtitle font-bold text-primary">
              Titles (Roboto Black Italic)
            </h3>
            <div className="space-y-2">
              <h1 className="text-5xl font-title font-bold uppercase tracking-wide">
                Main Title
              </h1>
              <h2 className="text-4xl font-title font-bold uppercase tracking-wide">
                Section Title
              </h2>
              <h3 className="text-3xl font-title font-bold uppercase tracking-wide">
                Subsection Title
              </h3>
            </div>
          </div>

          {/* Subtitles - Roboto Medium Italic */}
          <div className="space-y-4">
            <h3 className="text-2xl font-subtitle font-bold text-primary">
              Subtitles (Roboto Medium Italic)
            </h3>
            <div className="space-y-2">
              <h4 className="text-2xl font-subtitle font-semibold">
                Large Subtitle
              </h4>
              <h5 className="text-xl font-subtitle font-semibold">
                Medium Subtitle
              </h5>
              <h6 className="text-lg font-subtitle font-semibold">
                Small Subtitle
              </h6>
            </div>
          </div>

          {/* Body Content - Roboto Medium */}
          <div className="space-y-4">
            <h3 className="text-2xl font-subtitle font-bold text-primary">
              Body Content (Roboto Medium)
            </h3>
            <div className="space-y-4">
              <p className="text-lg font-body leading-relaxed">
                This is a large paragraph using Roboto Medium font. It
                demonstrates how body text should appear throughout the
                application. The font is clean, readable, and maintains good
                contrast for optimal user experience.
              </p>
              <p className="text-base font-body leading-relaxed">
                This is a standard paragraph using Roboto Medium font. It&apos;s
                perfect for regular content, descriptions, and general text
                throughout the website. The font weight and style provide
                excellent readability.
              </p>
              <p className="text-sm font-body leading-relaxed">
                This is a smaller paragraph using Roboto Medium font. It&apos;s
                suitable for captions, footnotes, and secondary information. The
                font remains clear and legible even at smaller sizes.
              </p>
            </div>
          </div>
        </section>

        {/* Utility Classes Demo */}
        <section className="space-y-8">
          <h2 className="text-3xl font-title font-bold uppercase tracking-wide">
            Utility Classes
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-subtitle font-bold text-primary">
                Font Classes
              </h3>
              <div className="space-y-2">
                <p className="font-logo text-lg">font-logo (REDJOLA)</p>
                <p className="font-title text-lg">
                  font-title (Roboto Black Italic)
                </p>
                <p className="font-subtitle text-lg">
                  font-subtitle (Roboto Medium Italic)
                </p>
                <p className="font-body text-lg">font-body (Roboto Medium)</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-subtitle font-bold text-primary">
                Typography Classes
              </h3>
              <div className="space-y-2">
                <p className="text-heading-lg font-title">text-heading-lg</p>
                <p className="text-heading-md font-title">text-heading-md</p>
                <p className="text-heading-sm font-title">text-heading-sm</p>
                <p className="text-section-title-lg font-subtitle">
                  text-section-title-lg
                </p>
                <p className="text-section-title-md font-subtitle">
                  text-section-title-md
                </p>
                <p className="text-section-title-sm font-subtitle">
                  text-section-title-sm
                </p>
                <p className="text-body-lg font-body">text-body-lg</p>
                <p className="text-body-md font-body">text-body-md</p>
                <p className="text-body-sm font-body">text-body-sm</p>
                <p className="text-body-xs font-body">text-body-xs</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sample Content */}
        <section className="space-y-8">
          <h2 className="text-3xl font-title font-bold uppercase tracking-wide">
            Sample Content
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-subtitle font-bold mb-4">
                About Our Services
              </h3>
              <p className="text-body-md font-body leading-relaxed mb-4">
                We specialize in capturing life&apos;s most precious moments
                with unparalleled quality and attention to detail. Our team of
                experienced photographers and videographers ensures that every
                event is documented with creativity and professionalism.
              </p>
              <p className="text-body-md font-body leading-relaxed">
                From intimate family gatherings to grand celebrations, we bring
                our passion for storytelling to every project. Our commitment to
                excellence and customer satisfaction has made us the trusted
                choice for countless families and organizations.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-subtitle font-bold mb-4">
                Our Process
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-subtitle text-primary mb-2">
                    1
                  </div>
                  <h4 className="text-lg font-subtitle font-semibold mb-2">
                    Consultation
                  </h4>
                  <p className="text-sm font-body">
                    We discuss your vision and requirements
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-subtitle text-primary mb-2">
                    2
                  </div>
                  <h4 className="text-lg font-subtitle font-semibold mb-2">
                    Execution
                  </h4>
                  <p className="text-sm font-body">
                    Professional capture of your special moments
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-subtitle text-primary mb-2">
                    3
                  </div>
                  <h4 className="text-lg font-subtitle font-semibold mb-2">
                    Delivery
                  </h4>
                  <p className="text-sm font-body">
                    Beautiful, high-quality final products
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
