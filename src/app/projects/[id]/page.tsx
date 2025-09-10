import { notFound } from 'next/navigation';
import prisma from '@/infrastructure/persistence/prisma/client';
import LikeButton from '@/components/ui/LikeButton';
import BookmarkButton from '@/components/ui/BookmarkButton';
import FollowButton from '@/components/ui/FollowButton';
import PitchDeckButton from '@/components/ui/PitchDeckButton';
import { ContentType } from '@/domain/enums/Analytics';
import ContactStartupButton from '@/components/chat/ContactStartupButton';
import UserAvatar from '@/components/ui/UserAvatar';

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
  user_id: number | null;
  user: {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    address: string | null;
    phone: string | null;
    legal_status: string | null;
    description: string | null;
    image_data: Uint8Array | null;
    created_at: Date;
    role: string;
    followersCount: number;
  } | null;
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
  const founderUserIds = (project.founders || [])
    .filter((f: ProjectFounder) => f.user && Number.isFinite(f.user.id))
    .map((f: ProjectFounder) => f.user!.id);

  const generateCoverImage = (sector: string, id: number) => {
    const sectorImages: Record<string, string> = {
      'Software Technology': `https://picsum.photos/1200/400?random=${id}&tech`,
      'Clean Energy': `https://picsum.photos/1200/400?random=${id}&green`,
      'Artificial Intelligence': `https://picsum.photos/1200/400?random=${id}&ai`,
      'FinTech': `https://picsum.photos/1200/400?random=${id}&finance`,
      'HealthTech': `https://picsum.photos/1200/400?random=${id}&health`,
      'EdTech': `https://picsum.photos/1200/400?random=${id}&education`,
      'BioTech': `https://picsum.photos/1200/400?random=${id}&biotech`,
      'Mobility': `https://picsum.photos/1200/400?random=${id}&transport`,
      'default': `https://picsum.photos/1200/400?random=${id}`
    };
    return sectorImages[sector] || sectorImages.default;
  };

  const coverImage = generateCoverImage(project.sector, project.id);

  return (
    <div className="h-screen bg-background pt-14 overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
        {/* Header with cover image */}
        <div className="relative h-96 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${coverImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-transparent opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-30" />

          {/* Header content */}
          <div className="relative h-full flex items-end">
            <div className="w-full max-w-7xl mx-auto px-6 pb-8">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                {/* Title and main information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-indigo-200">
                    <div className="flex items-center gap-2 bg-indigo-600 bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full border border-indigo-300 border-opacity-30">
                      <span className="text-lg">🚀</span>
                      <span className="text-sm font-medium">{project.sector}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-600 bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full border border-purple-300 border-opacity-30">
                      <span className="text-lg">📈</span>
                      <span className="text-sm font-medium">{project.maturity}</span>
                    </div>
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                    {project.name}
                  </h1>
                  <p className="text-xl text-indigo-100 max-w-2xl leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-end gap-3 self-end w-full lg:w-auto">
                  <div className="flex flex-wrap items-end gap-3 self-end">
                    <LikeButton
                      contentType={ContentType.STARTUP}
                      contentId={project.id}
                      initialLikeCount={project.likesCount || 0}
                      size="large"
                      variant="default"
                    />
                    <BookmarkButton
                      contentType={ContentType.STARTUP}
                      contentId={project.id}
                      initialBookmarkCount={project.bookmarksCount || 0}
                      size="large"
                      variant="default"
                    />
                    <FollowButton
                      contentType={ContentType.STARTUP}
                      contentId={project.id}
                      initialFollowerCount={project.followersCount || 0}
                      size="large"
                      variant="default"
                    />
                  </div>
                  <div className="ml-auto self-end">
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
                        founders: (project.founders || [])
                          .filter((founder: ProjectFounder) => founder.user !== null)
                          .map((founder: ProjectFounder) => ({
                            user: {
                              name: founder.user!.name,
                              email: founder.user!.email,
                              phone: founder.user!.phone || undefined,
                            },
                          })),
                      }}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main column (2/3) */}
            <div className="lg:col-span-2 space-y-8">

              {/* Detailed description */}
              {detail?.description && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📝</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Detailed Description</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">{detail.description}</p>
                </div>
              )}

              {/* Needs */}
              {detail?.needs && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Our Needs</h2>
                  </div>
                  <div className="bg-purple-50 border-l-4 border-purple-400 p-6 rounded-lg">
                    <p className="text-gray-800 leading-relaxed text-lg">{detail.needs}</p>
                  </div>
                </div>
              )}

              {/* Founders */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Founding Team</h2>
                </div>

                {(project.founders || []).filter((founder: ProjectFounder) => founder.user).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(project.founders || [])
                      .filter((founder: ProjectFounder) => founder.user)
                      .map((founder: ProjectFounder) => (
                        <div key={founder.id} className="bg-gradient-to-br from-gray-50 to-indigo-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <UserAvatar uid={founder.user!.id} name={founder.user!.name} size={56} />
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">{founder.user!.name}</h3>
                              <p className="text-indigo-600 font-medium">{founder.user!.email}</p>
                              {founder.user!.phone && (
                                <p className="text-gray-600 text-sm mt-1">📞 {founder.user!.phone}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">👤</span>
                    </div>
                    <p className="text-gray-500 text-lg">No information about the founders available.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar (1/3) */}
            <div className="space-y-8">

              {/* Key information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">ℹ️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Information</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">🏢</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Legal status</p>
                      <p className="text-gray-600">{project.legal_status || 'Not specified'}</p>
                    </div>
                  </div>

                  {detail?.project_status && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">📊</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Project status</p>
                        <p className="text-gray-600">{detail.project_status}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">📅</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Created on</p>
                      <p className="text-gray-600">{project.created_at.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact details */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📞</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Contact</h2>
                </div>

                <div className="space-y-4">
                  {project.address && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <span className="text-xl">📍</span>
                      <div>
                        <p className="font-semibold text-gray-900">Address</p>
                        <p className="text-gray-600">{project.address}</p>
                      </div>
                    </div>
                  )}

                  {project.phone && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <span className="text-xl">📱</span>
                      <div>
                        <p className="font-semibold text-gray-900">Phone</p>
                        <p className="text-gray-600">{project.phone}</p>
                      </div>
                    </div>
                  )}

                  {project.email && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <span className="text-xl">📧</span>
                      <div>
                        <p className="font-semibold text-gray-900">Email</p>
                        <p className="text-gray-600">{project.email}</p>
                      </div>
                    </div>
                  )}

                  {/* Contact founders via chat */}
                  <div className="pt-2">
                    <ContactStartupButton
                      startupId={project.id}
                      startupName={project.name}
                      founderUserIds={founderUserIds}
                      className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Liens */}
      {/* Links */}
              {(detail?.website_url || detail?.social_media_url) && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🔗</span>
                    </div>
        <h2 className="text-2xl font-bold text-gray-900">Links</h2>
                  </div>

                  <div className="space-y-4">
                    {detail?.website_url && (
                      <a
                        href={detail.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 group"
                      >
                        <span className="text-xl">🌐</span>
                        <div>
          <p className="font-semibold text-blue-900 group-hover:text-blue-800">Website</p>
          <p className="text-blue-600 text-sm group-hover:text-blue-700">Visit site</p>
                        </div>
                        <span className="ml-auto text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
                      </a>
                    )}

                    {detail?.social_media_url && (
                      <a
                        href={detail.social_media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 group"
                      >
                        <span className="text-xl">📱</span>
                        <div>
                          <p className="font-semibold text-purple-900 group-hover:text-purple-800">Social media</p>
                          <p className="text-purple-600 text-sm group-hover:text-purple-700">Follow us</p>
                        </div>
                        <span className="ml-auto text-purple-500 group-hover:translate-x-1 transition-transform">→</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}