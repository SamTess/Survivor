import { notFound } from 'next/navigation';
import prisma from '@/infrastructure/persistence/prisma/client';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = params;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{project.name}</h1>

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
              {project.founders.map((founder) => (
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