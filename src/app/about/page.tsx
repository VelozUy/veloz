'use client';

import { Users, Camera, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              About Veloz
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              We capture the unrepeatable through our unique team-based
              production model, delivering excellence, warmth, and agility in
              every shot.
            </p>
          </div>
        </div>
      </section>

      {/* Company Philosophy */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Our Philosophy
            </h2>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-primary">
                  Capturing What Can&apos;t Be Repeated
                </h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Every moment in life is unique and unrepeatable. At Veloz, we
                  understand that each event—whether it&apos;s a wedding,
                  corporate gathering, or cultural celebration— carries
                  emotions, connections, and stories that deserve to be
                  preserved with the highest quality and artistic vision.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our philosophy centers on the belief that professional event
                  documentation requires not just technical skill, but an
                  understanding of human emotions and the ability to anticipate
                  and capture those fleeting, precious moments that define our
                  most important experiences.
                </p>
              </div>

              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                  <Camera className="w-16 h-16 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Our Methodology
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Team-Based Approach</h3>
                <p className="text-muted-foreground">
                  Unlike traditional freelance models, we use specialized teams
                  where each member focuses on their expertise—shooting,
                  curation, editing, or delivery.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Faster Delivery</h3>
                <p className="text-muted-foreground">
                  Our workflow optimization allows us to deliver high-quality
                  results faster than traditional approaches, without
                  compromising on quality.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-4">Higher Quality</h3>
                <p className="text-muted-foreground">
                  Specialization means each team member is an expert in their
                  field, resulting in consistently higher quality outcomes.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 md:p-12">
              <h3 className="text-2xl font-bold mb-6 text-center">
                How It Works
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                    1
                  </div>
                  <h4 className="font-semibold mb-2">Client Intake</h4>
                  <p className="text-sm text-muted-foreground">
                    Understanding your vision and requirements
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                    2
                  </div>
                  <h4 className="font-semibold mb-2">Professional Shooting</h4>
                  <p className="text-sm text-muted-foreground">
                    Expert photographers capture your event
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                    3
                  </div>
                  <h4 className="font-semibold mb-2">Curation & Editing</h4>
                  <p className="text-sm text-muted-foreground">
                    Specialized team selects and enhances content
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                    4
                  </div>
                  <h4 className="font-semibold mb-2">Fast Delivery</h4>
                  <p className="text-sm text-muted-foreground">
                    Optimized delivery of your final content
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-16">
              Our Core Values
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Elegance',
                  description:
                    'Sophisticated approach to every project with attention to aesthetic detail',
                },
                {
                  title: 'Warmth',
                  description:
                    'Creating comfortable, authentic connections with our clients and their guests',
                },
                {
                  title: 'Effectiveness',
                  description:
                    'Delivering results that exceed expectations through proven methodologies',
                },
                {
                  title: 'Optimization',
                  description:
                    'Continuously improving our processes for better efficiency and quality',
                },
                {
                  title: 'Agility',
                  description:
                    'Adapting quickly to changing needs and unexpected moments',
                },
                {
                  title: 'Boldness',
                  description:
                    'Taking creative risks to capture unique and memorable content',
                },
              ].map((value, index) => (
                <div key={index} className="text-center">
                  <h3 className="text-xl font-bold mb-3 text-primary">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold">
                  What types of events do you cover?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We specialize in a wide range of events including weddings,
                  corporate events, live shows, cultural celebrations,
                  birthdays, and other special occasions. Our team-based
                  approach allows us to adapt to any event type and size.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold">
                  How does your team-based approach work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Unlike traditional freelance photographers, we use specialized
                  teams where different professionals handle client intake,
                  shooting, curation, editing, and delivery. This specialization
                  allows for higher quality results and faster turnaround times.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold">
                  What&apos;s included in your packages?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Our packages typically include professional photography,
                  videography (when requested), professional editing and
                  curation, and digital delivery of high-resolution content. We
                  also offer additional services like prints, albums, and
                  extended coverage based on your needs.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold">
                  How quickly can we receive our photos and videos?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Thanks to our optimized workflow, we typically deliver edited
                  content within 2-3 weeks for standard events. For urgent
                  requests, we offer expedited delivery options. Preview
                  galleries with highlights are usually available within 48-72
                  hours.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold">
                  Do you travel for destination events?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, we&apos;re available for destination events both locally
                  and internationally. Travel costs and logistics will be
                  discussed during the consultation phase, and we&apos;ll
                  provide a comprehensive quote that includes all associated
                  expenses.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold">
                  Can we schedule a consultation before booking?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutely! We encourage all potential clients to schedule a
                  consultation where we can discuss your vision, requirements,
                  and how our services can best meet your needs. Consultations
                  can be conducted in person, via video call, or phone based on
                  your preference.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Work with Us?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Let&apos;s discuss how we can capture your special moments with
              elegance and professionalism.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                asChild
              >
                <a href="/contact">Start Your Project</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/gallery">View Our Work</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
