import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { crewMemberService } from '@/services/crew-member';
import CrewProfile from '@/components/crew/CrewProfile';
import type { CrewMember } from '@/types';

interface CrewProfilePageProps {
  params: {
    'name-slug': string;
  };
}

export async function generateMetadata({
  params,
}: CrewProfilePageProps): Promise<Metadata> {
  const { 'name-slug': nameSlug } = params;

  try {
    const result = await crewMemberService.getAllCrewMembers();
    if (!result.success || !result.data) {
      return {
        title: 'Crew Member Not Found',
      };
    }

    const crewMember = result.data.find(
      member =>
        member.name.es?.toLowerCase().replace(/\s+/g, '-') === nameSlug ||
        member.name.en?.toLowerCase().replace(/\s+/g, '-') === nameSlug
    );

    if (!crewMember) {
      return {
        title: 'Crew Member Not Found',
      };
    }

    return {
      title: `${crewMember.name.es} - Veloz Crew`,
      description:
        crewMember.bio.es ||
        `Meet ${crewMember.name.es}, ${crewMember.role.es} at Veloz`,
      openGraph: {
        title: `${crewMember.name.es} - Veloz Crew`,
        description:
          crewMember.bio.es ||
          `Meet ${crewMember.name.es}, ${crewMember.role.es} at Veloz`,
        images: crewMember.portrait ? [crewMember.portrait] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Crew Member - Veloz',
    };
  }
}

export default async function CrewProfilePage({
  params,
}: CrewProfilePageProps) {
  const { 'name-slug': nameSlug } = params;

  try {
    const result = await crewMemberService.getAllCrewMembers();
    if (!result.success || !result.data) {
      notFound();
    }

    const crewMember = result.data.find(
      member =>
        member.name.es?.toLowerCase().replace(/\s+/g, '-') === nameSlug ||
        member.name.en?.toLowerCase().replace(/\s+/g, '-') === nameSlug
    );

    if (!crewMember) {
      notFound();
    }

    return <CrewProfile crewMember={crewMember} />;
  } catch (error) {
    console.error('Error loading crew member:', error);
    notFound();
  }
}
