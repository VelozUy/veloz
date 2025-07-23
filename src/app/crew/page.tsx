import { Metadata } from 'next';
import { crewMemberService } from '@/services/crew-member';
import CrewListing from '@/components/crew/CrewListing';

// Force static generation at build time
export const dynamic = 'force-static';

// Disable automatic revalidation - content updates require manual build trigger
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Nuestro Equipo - Veloz',
  description:
    'Conoce a nuestro equipo de fotógrafos y videógrafos profesionales. Cada miembro tiene su estilo único y especialidades.',
  openGraph: {
    title: 'Nuestro Equipo - Veloz',
    description:
      'Conoce a nuestro equipo de fotógrafos y videógrafos profesionales.',
  },
};

export default async function CrewPage() {
  try {
    const result = await crewMemberService.getAllCrewMembers();
    if (!result.success || !result.data) {
      return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Nuestro Equipo</h1>
              <p className="text-muted-foreground">
                No hay miembros del equipo disponibles en este momento.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return <CrewListing crewMembers={result.data} />;
  } catch (error) {
    console.error('Error loading crew members:', error);
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Nuestro Equipo</h1>
            <p className="text-muted-foreground">
              Error al cargar los miembros del equipo. Por favor, intenta de
              nuevo más tarde.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
