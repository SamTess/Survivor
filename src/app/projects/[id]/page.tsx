import { notFound } from 'next/navigation';
import prisma from '@/infrastructure/persistence/prisma/client';
import LikeButton from '@/components/ui/LikeButton';
import BookmarkButton from '@/components/ui/BookmarkButton';
import FollowButton from '@/components/ui/FollowButton';
import PitchDeckButton from '@/components/ui/PitchDeckButton';
import { ContentType } from '@/domain/enums/Analytics';

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

type ProjectDetail = {
  id: number;
  description: string | null;
  startup_id: number;
  website_url: string | null;
  social_media_url: string | null;
  project_status: string | null;
  needs: string | null;
};

type ProjectFounder = {
  id: number;
  startup_id: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    address: string;
    phone: string | null;
    legal_status: string | null;
    description: string | null;
    image_data: Uint8Array | null;
    created_at: Date;
    role: string;
    followersCount: number;
  };
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    notFound();
  }

  const project = await prisma.s_STARTUP.findUnique({
    where: { id: projectId },
    include: {
      details: true,
      founders: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const detail = project.details[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto pt-20 pb-6 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <div className="flex gap-2">
              <LikeButton
                contentType={ContentType.STARTUP}
                contentId={project.id}
                initialLikeCount={project.likesCount || 0}
                userId={null} // TODO: Get from auth context
                sessionId={null} // TODO: Get from session context
                size="large"
                variant="default"
              />
              <BookmarkButton
                contentType={ContentType.STARTUP}
                contentId={project.id}
                initialBookmarkCount={project.bookmarksCount || 0}
                userId={null} // TODO: Get from auth context
                sessionId={null} // TODO: Get from session context
                size="large"
                variant="default"
              />
              <FollowButton
                contentType={ContentType.STARTUP}
                contentId={project.id}
                initialFollowerCount={project.followersCount || 0}
                userId={null} // TODO: Get from auth context
                sessionId={null} // TODO: Get from session context
                size="large"
                variant="default"
              />
            </div>
          </div>

          {/* Pitch Deck Button */}
          <div className="mb-6 flex justify-center">
            <PitchDeckButton
              project={{
                id: project.id,
                name: project.name,
                sector: project.sector,
                maturity: project.maturity,
                description: project.description,
                address: project.address,
                phone: project.phone,
                email: project.email,
                legal_status: project.legal_status,
                created_at: project.created_at,
                likesCount: project.likesCount || 0,
                bookmarksCount: project.bookmarksCount || 0,
                followersCount: project.followersCount || 0,
                details: project.details.map((detail: ProjectDetail) => ({
                  description: detail.description || undefined,
                  website_url: detail.website_url || undefined,
                  social_media_url: detail.social_media_url || undefined,
                  project_status: detail.project_status || undefined,
                  needs: detail.needs || undefined,
                })),
                founders: project.founders.map((founder: ProjectFounder) => ({
                  user: {
                    name: founder.user.name,
                    email: founder.user.email,
                    phone: founder.user.phone || undefined,
                  },
                })),
              }}
              className="text-lg px-6 py-3"
            />
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Description</h2>
            <p className="text-gray-700">{project.description}</p>
            {detail?.description && (
              <p className="text-gray-700 mt-2">{detail.description}</p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Legal Status:</strong> {project.legal_status}</p>
                <p><strong>Sector:</strong> {project.sector}</p>
                <p><strong>Maturity:</strong> {project.maturity}</p>
                {detail?.project_status && (
                  <p><strong>Project Status:</strong> {detail.project_status}</p>
                )}
              </div>
              <div>
                <p><strong>Address:</strong> {project.address}</p>
                <p><strong>Phone:</strong> {project.phone}</p>
                <p><strong>Email:</strong> {project.email}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Founders</h2>
            <div className="space-y-2">
              {project.founders.map((founder: ProjectFounder) => (
                <div key={founder.id} className="bg-gray-100 p-3 rounded">
                  <p className="font-medium">{founder.user.name}</p>
                  <p className="text-sm text-gray-600">{founder.user.email}</p>
                  {founder.user.phone && <p className="text-sm text-gray-600">{founder.user.phone}</p>}
                </div>
              ))}
            </div>
          </div>

          {detail?.needs && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Needs</h2>
              <p className="text-gray-700">{detail.needs}</p>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Links</h2>
            <div className="space-y-2">
              {detail?.website_url && (
                <a href={detail.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Website
                </a>
              )}
              {detail?.social_media_url && (
                <a href={detail.social_media_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Social Media
                </a>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Created at: {project.created_at.toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}