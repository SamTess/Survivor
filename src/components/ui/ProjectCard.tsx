'use client';

import { useRouter } from 'next/navigation';
import TiltedCard from './TiltedCard';
import LikeButton from './LikeButton';
import { ContentType } from '@/domain/enums/Analytics';

interface Startup {
  id: number;
  name: string;
  sector: string;
  maturity: string;
  description: string;
  address: string;
  likesCount?: number;
  details: Array<{
    website_url?: string;
    project_status?: string;
  }>;
  founders?: Array<{
    user: {
      name: string;
    };
  }>;
}

interface ProjectCardProps {
  startup: Startup & { image: string };
}

const getSectorGradient = (sector: string, index: number) => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff8a80 0%, #ff80ab 100%)',
  ];
  const gradientIndex = index % gradients.length;
  return gradients[gradientIndex];
};

export default function ProjectCard({ startup }: ProjectCardProps) {
  const router = useRouter();
  const location = startup.address ? startup.address.split(',').slice(-2).join(',').trim() : '';
  const gradient = getSectorGradient(startup.sector, startup.id);

  const handleCardClick = () => {
    router.push(`/projects/${startup.id}`);
  };

  const overlayContent = (
    <div
      className="absolute bottom-0 left-0 w-full p-1.5 md:p-2 text-white rounded-[15px] overflow-hidden"
      style={{
        background: gradient,
        width: '328px',
        maxWidth: '100%'
      }}
    >
      <div className="backdrop-blur-sm bg-black/30 rounded-[12px] p-1.5 w-full">
        <div className="flex justify-between items-start gap-2">
          {/* Left side - Main info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xs md:text-sm font-bold mb-0.5 line-clamp-1 leading-tight">{startup.name}</h3>
            <p className="text-xs opacity-90 mb-0.5">{startup.sector}</p>
            {location && (
              <p className="text-xs opacity-75 line-clamp-1">{location}</p>
            )}
          </div>

          {/* Right side - Tags and Like */}
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <div className="flex items-center gap-1">
              <span className="px-1 py-0.5 bg-white/20 rounded-full text-xs whitespace-nowrap text-center">
                {(startup.founders?.length || 0)} Founder{(startup.founders?.length || 0) !== 1 ? 's' : ''}
              </span>
              <LikeButton
                contentType={ContentType.STARTUP}
                contentId={startup.id}
                initialLikeCount={startup.likesCount || 0}
                userId={null} // TODO: Get from auth context
                sessionId={null} // TODO: Get from session context
                size="small"
                variant="minimal"
                className="text-white"
              />
            </div>
            <span className="px-1 py-0.5 bg-white/20 rounded-full text-xs whitespace-nowrap text-center">
              {startup.maturity === 'Early-stage' ? 'Early' : startup.maturity === 'Seed-stage' ? 'Seed' : startup.maturity}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="group flex justify-center w-full cursor-pointer"
      onClick={handleCardClick}
    >
      <TiltedCard
        imageSrc={startup.image}
        altText={startup.name}
        captionText={`${startup.name} - ${startup.sector}`}
        containerHeight="380px"
        containerWidth="328px"
        imageHeight="328px"
        imageWidth="328px"
        scaleOnHover={1.05}
        rotateAmplitude={12}
        showMobileWarning={false}
        showTooltip={true}
        overlayContent={overlayContent}
        displayOverlayContent={true}
      />
    </div>
  );
}
