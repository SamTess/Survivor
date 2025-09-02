'use client';

import { useRouter } from 'next/navigation';
import TiltedCard from './TiltedCard';
import { useEffect, useState } from 'react';

interface Startup {
  id: number;
  name: string;
  sector: string;
  maturity: string;
  description: string;
  address: string;
  details: Array<{
    website_url?: string;
    project_status?: string;
  }>;
  founders: Array<{
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

export default function ResponsiveProjectCard({ startup }: ProjectCardProps) {
  const router = useRouter();
  const [cardDimensions, setCardDimensions] = useState({
    containerHeight: '380px',
    containerWidth: '328px',
    imageHeight: '328px',
    imageWidth: '328px'
  });

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      
      if (width < 640) { // mobile
        setCardDimensions({
          containerHeight: '320px',
          containerWidth: '280px',
          imageHeight: '280px',
          imageWidth: '280px'
        });
      } else if (width < 1024) { // tablet
        setCardDimensions({
          containerHeight: '350px',
          containerWidth: '300px',
          imageHeight: '300px',
          imageWidth: '300px'
        });
      } else { // desktop
        setCardDimensions({
          containerHeight: '380px',
          containerWidth: '328px',
          imageHeight: '328px',
          imageWidth: '328px'
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const location = startup.address ? startup.address.split(',').slice(-2).join(',').trim() : '';
  const gradient = getSectorGradient(startup.sector, startup.id);

  const handleCardClick = () => {
    router.push(`/projects/${startup.id}`);
  };

  const overlayContent = (
    <div 
      className="absolute bottom-0 left-0 right-0 w-full p-3 md:p-4 text-white cursor-pointer rounded-b-[15px]"
      style={{ background: gradient }}
      onClick={handleCardClick}
    >
      <div className="backdrop-blur-sm bg-black/30 rounded-lg p-2 md:p-3 w-full">
        <h3 className="text-sm md:text-lg font-bold mb-1 line-clamp-1">{startup.name}</h3>
        <p className="text-xs md:text-sm opacity-90 mb-2">{startup.sector}</p>
        <div className="flex justify-between items-center text-xs">
          <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-white/20 rounded-full text-xs">
            {startup.founders.length} founder{startup.founders.length !== 1 ? 's' : ''}
          </span>
          <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-white/20 rounded-full text-xs">
            {startup.maturity}
          </span>
        </div>
        {location && (
          <p className="text-xs opacity-75 mt-1 md:mt-2">{location}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="group flex justify-center w-full">
      <TiltedCard
        imageSrc={startup.image}
        altText={startup.name}
        captionText={`${startup.name} - ${startup.sector}`}
        containerHeight={cardDimensions.containerHeight}
        containerWidth={cardDimensions.containerWidth}
        imageHeight={cardDimensions.imageHeight}
        imageWidth={cardDimensions.imageWidth}
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
