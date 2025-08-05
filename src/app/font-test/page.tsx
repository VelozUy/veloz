import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Font Test - Roboto Fonts | Veloz',
  description: 'Test page to showcase all available Roboto fonts',
};

// Font definitions with their file paths and weights
const robotoFonts = [
  // Regular Roboto fonts
  {
    name: 'Roboto-Thin',
    file: 'Roboto-Thin.ttf',
    weight: 100,
    style: 'normal',
  },
  {
    name: 'Roboto-ThinItalic',
    file: 'Roboto-ThinItalic.ttf',
    weight: 100,
    style: 'italic',
  },
  {
    name: 'Roboto-ExtraLight',
    file: 'Roboto-ExtraLight.ttf',
    weight: 200,
    style: 'normal',
  },
  {
    name: 'Roboto-ExtraLightItalic',
    file: 'Roboto-ExtraLightItalic.ttf',
    weight: 200,
    style: 'italic',
  },
  {
    name: 'Roboto-Light',
    file: 'Roboto-Light.ttf',
    weight: 300,
    style: 'normal',
  },
  {
    name: 'Roboto-LightItalic',
    file: 'Roboto-LightItalic.ttf',
    weight: 300,
    style: 'italic',
  },
  {
    name: 'Roboto-Regular',
    file: 'Roboto-Regular.ttf',
    weight: 400,
    style: 'normal',
  },
  {
    name: 'Roboto-Italic',
    file: 'Roboto-Italic.ttf',
    weight: 400,
    style: 'italic',
  },
  {
    name: 'Roboto-Medium',
    file: 'Roboto-Medium.ttf',
    weight: 500,
    style: 'normal',
  },
  {
    name: 'Roboto-MediumItalic',
    file: 'Roboto-MediumItalic.ttf',
    weight: 500,
    style: 'italic',
  },
  {
    name: 'Roboto-SemiBold',
    file: 'Roboto-SemiBold.ttf',
    weight: 600,
    style: 'normal',
  },
  {
    name: 'Roboto-SemiBoldItalic',
    file: 'Roboto-SemiBoldItalic.ttf',
    weight: 600,
    style: 'italic',
  },
  {
    name: 'Roboto-Bold',
    file: 'Roboto-Bold.ttf',
    weight: 700,
    style: 'normal',
  },
  {
    name: 'Roboto-BoldItalic',
    file: 'Roboto-BoldItalic.ttf',
    weight: 700,
    style: 'italic',
  },
  {
    name: 'Roboto-ExtraBold',
    file: 'Roboto-ExtraBold.ttf',
    weight: 800,
    style: 'normal',
  },
  {
    name: 'Roboto-ExtraBoldItalic',
    file: 'Roboto-ExtraBoldItalic.ttf',
    weight: 800,
    style: 'italic',
  },
  {
    name: 'Roboto-Black',
    file: 'Roboto-Black.ttf',
    weight: 900,
    style: 'normal',
  },
  {
    name: 'Roboto-BlackItalic',
    file: 'Roboto-BlackItalic.ttf',
    weight: 900,
    style: 'italic',
  },

  // Condensed Roboto fonts
  {
    name: 'Roboto_Condensed-Thin',
    file: 'Roboto_Condensed-Thin.ttf',
    weight: 100,
    style: 'normal',
  },
  {
    name: 'Roboto_Condensed-ThinItalic',
    file: 'Roboto_Condensed-ThinItalic.ttf',
    weight: 100,
    style: 'italic',
  },
  {
    name: 'Roboto_Condensed-ExtraLight',
    file: 'Roboto_Condensed-ExtraLight.ttf',
    weight: 200,
    style: 'normal',
  },
  {
    name: 'Roboto_Condensed-ExtraLightItalic',
    file: 'Roboto_Condensed-ExtraLightItalic.ttf',
    weight: 200,
    style: 'italic',
  },
  {
    name: 'Roboto_Condensed-Light',
    file: 'Roboto_Condensed-Light.ttf',
    weight: 300,
    style: 'normal',
  },
  {
    name: 'Roboto_Condensed-LightItalic',
    file: 'Roboto_Condensed-LightItalic.ttf',
    weight: 300,
    style: 'italic',
  },
  {
    name: 'Roboto_Condensed-Regular',
    file: 'Roboto_Condensed-Regular.ttf',
    weight: 400,
    style: 'normal',
  },
  {
    name: 'Roboto_Condensed-Italic',
    file: 'Roboto_Condensed-Italic.ttf',
    weight: 400,
    style: 'italic',
  },
  {
    name: 'Roboto_Condensed-Medium',
    file: 'Roboto_Condensed-Medium.ttf',
    weight: 500,
    style: 'normal',
  },
  {
    name: 'Roboto_Condensed-MediumItalic',
    file: 'Roboto_Condensed-MediumItalic.ttf',
    weight: 500,
    style: 'italic',
  },
  {
    name: 'Roboto_Condensed-SemiBold',
    file: 'Roboto_Condensed-SemiBold.ttf',
    weight: 600,
    style: 'normal',
  },
  {
    name: 'Roboto_Condensed-SemiBoldItalic',
    file: 'Roboto_Condensed-SemiBoldItalic.ttf',
    weight: 600,
    style: 'italic',
  },
  {
    name: 'Roboto_Condensed-Bold',
    file: 'Roboto_Condensed-Bold.ttf',
    weight: 700,
    style: 'normal',
  },
  {
    name: 'Roboto_Condensed-BoldItalic',
    file: 'Roboto_Condensed-BoldItalic.ttf',
    weight: 700,
    style: 'italic',
  },
  {
    name: 'Roboto_Condensed-ExtraBold',
    file: 'Roboto_Condensed-ExtraBold.ttf',
    weight: 800,
    style: 'normal',
  },
  {
    name: 'Roboto_Condensed-ExtraBoldItalic',
    file: 'Roboto_Condensed-ExtraBoldItalic.ttf',
    weight: 800,
    style: 'italic',
  },
  {
    name: 'Roboto_Condensed-Black',
    file: 'Roboto_Condensed-Black.ttf',
    weight: 900,
    style: 'normal',
  },
  {
    name: 'Roboto_Condensed-BlackItalic',
    file: 'Roboto_Condensed-BlackItalic.ttf',
    weight: 900,
    style: 'italic',
  },

  // SemiCondensed Roboto fonts
  {
    name: 'Roboto_SemiCondensed-Thin',
    file: 'Roboto_SemiCondensed-Thin.ttf',
    weight: 100,
    style: 'normal',
  },
  {
    name: 'Roboto_SemiCondensed-ThinItalic',
    file: 'Roboto_SemiCondensed-ThinItalic.ttf',
    weight: 100,
    style: 'italic',
  },
  {
    name: 'Roboto_SemiCondensed-ExtraLight',
    file: 'Roboto_SemiCondensed-ExtraLight.ttf',
    weight: 200,
    style: 'normal',
  },
  {
    name: 'Roboto_SemiCondensed-ExtraLightItalic',
    file: 'Roboto_SemiCondensed-ExtraLightItalic.ttf',
    weight: 200,
    style: 'italic',
  },
  {
    name: 'Roboto_SemiCondensed-Light',
    file: 'Roboto_SemiCondensed-Light.ttf',
    weight: 300,
    style: 'normal',
  },
  {
    name: 'Roboto_SemiCondensed-LightItalic',
    file: 'Roboto_SemiCondensed-LightItalic.ttf',
    weight: 300,
    style: 'italic',
  },
  {
    name: 'Roboto_SemiCondensed-Regular',
    file: 'Roboto_SemiCondensed-Regular.ttf',
    weight: 400,
    style: 'normal',
  },
  {
    name: 'Roboto_SemiCondensed-Italic',
    file: 'Roboto_SemiCondensed-Italic.ttf',
    weight: 400,
    style: 'italic',
  },
  {
    name: 'Roboto_SemiCondensed-Medium',
    file: 'Roboto_SemiCondensed-Medium.ttf',
    weight: 500,
    style: 'normal',
  },
  {
    name: 'Roboto_SemiCondensed-MediumItalic',
    file: 'Roboto_SemiCondensed-MediumItalic.ttf',
    weight: 500,
    style: 'italic',
  },
  {
    name: 'Roboto_SemiCondensed-SemiBold',
    file: 'Roboto_SemiCondensed-SemiBold.ttf',
    weight: 600,
    style: 'normal',
  },
  {
    name: 'Roboto_SemiCondensed-SemiBoldItalic',
    file: 'Roboto_SemiCondensed-SemiBoldItalic.ttf',
    weight: 600,
    style: 'italic',
  },
  {
    name: 'Roboto_SemiCondensed-Bold',
    file: 'Roboto_SemiCondensed-Bold.ttf',
    weight: 700,
    style: 'normal',
  },
  {
    name: 'Roboto_SemiCondensed-BoldItalic',
    file: 'Roboto_SemiCondensed-BoldItalic.ttf',
    weight: 700,
    style: 'italic',
  },
  {
    name: 'Roboto_SemiCondensed-ExtraBold',
    file: 'Roboto_SemiCondensed-ExtraBold.ttf',
    weight: 800,
    style: 'normal',
  },
  {
    name: 'Roboto_SemiCondensed-ExtraBoldItalic',
    file: 'Roboto_SemiCondensed-ExtraBoldItalic.ttf',
    weight: 800,
    style: 'italic',
  },
  {
    name: 'Roboto_SemiCondensed-Black',
    file: 'Roboto_SemiCondensed-Black.ttf',
    weight: 900,
    style: 'normal',
  },
  {
    name: 'Roboto_SemiCondensed-BlackItalic',
    file: 'Roboto_SemiCondensed-BlackItalic.ttf',
    weight: 900,
    style: 'italic',
  },
];

export default function FontTestPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-8 px-4 sm:px-8 lg:px-16">
        <div className="max-w-border-64 mx-auto">
          <div className="text-left space-y-6 text-foreground">
            <h1 className="text-section-title-lg font-body font-bold uppercase">
              Roboto Font Test
            </h1>
            <p className="text-body-lg max-w-3xl">
              Explore all available Roboto font variants to choose the perfect
              typography for your project.
            </p>

            {/* Current Default Font Display */}
            <div className="mt-8 p-6 bg-card border border-border rounded-lg">
              <h2 className="text-lg font-semibold mb-4">
                Current Default Font Configuration
              </h2>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Primary Font:</strong>{' '}
                  <span className="font-primary">
                    Roboto-MediumItalic (Weight: 500, Style: italic)
                  </span>
                </div>
                <div>
                  <strong>Secondary Font:</strong>{' '}
                  <span className="font-secondary">
                    Roboto-Regular (Weight: 400, Style: normal)
                  </span>
                </div>
                <div>
                  <strong>Accent Font:</strong>{' '}
                  <span className="font-accent">
                    Roboto-Medium (Weight: 500, Style: normal)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Font Showcase */}
      <section className="py-8 px-4 sm:px-8 lg:px-16">
        <div className="max-w-border-64 mx-auto space-y-12">
          {robotoFonts.map((font, index) => (
            <div
              key={index}
              className="border border-border rounded-lg p-6 bg-card"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  {font.name}
                </h3>
                <div className="text-sm text-muted-foreground">
                  Weight: {font.weight} | Style: {font.style}
                </div>
              </div>

              <div
                className="space-y-4"
                style={{
                  fontFamily: `'${font.name}', sans-serif`,
                  fontWeight: font.weight,
                  fontStyle: font.style,
                }}
              >
                {/* Title Examples */}
                <div>
                  <h2 className="text-3xl mb-2">This is a Large Title</h2>
                  <h3 className="text-2xl mb-2">This is a Medium Title</h3>
                  <h4 className="text-xl mb-2">This is a Small Title</h4>
                </div>

                {/* Body Text Examples */}
                <div className="space-y-2">
                  <p className="text-lg">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                  <p className="text-base">
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur.
                  </p>
                  <p className="text-sm">
                    Excepteur sint occaecat cupidatat non proident, sunt in
                    culpa qui officia deserunt mollit anim id est laborum. Sed
                    ut perspiciatis unde omnis iste natus error sit voluptatem
                    accusantium doloremque laudantium.
                  </p>
                </div>

                {/* Special Characters */}
                <div className="text-base">
                  <p>Numbers: 0123456789</p>
                  <p>
                    Special chars: @#$%^&*()_+-=[]{}|;&apos;:&quot;,.&lt;&gt;?
                  </p>
                  <p>Accents: áéíóú ñ ü ç à è ì ò ù</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
