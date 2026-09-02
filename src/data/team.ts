export type TeamMember = {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  bio: string;
  linkedIn?: string;
};

/**
 * Public team profiles must represent real people who have approved publication.
 * Keep this empty until verified names, roles, biographies, and profile links are
 * supplied by the project owner.
 */
export const team: TeamMember[] = [];
