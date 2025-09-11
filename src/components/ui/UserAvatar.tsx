"use client";
import React from 'react';
import Image from 'next/image';

type Props = {
    uid: number;
    name?: string | null;
    size?: number;
    className?: string;
    refreshKey?: string | number;
};

export function UserAvatar({ uid, name, size = 56, className, refreshKey }: Props) {
    const label = name && name.trim() ? name : `#${uid}`;
    const initials = label
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
    const hue = (uid * 47) % 360;
    const [hasImg, setHasImg] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);

    const src = React.useMemo(() => {
        const baseUrl = `/api/users/${uid}/image`;
        return refreshKey ? `${baseUrl}?v=${refreshKey}` : baseUrl;
    }, [uid, refreshKey]);

    React.useEffect(() => {
        setHasImg(false);
        setImageError(false);
    }, [refreshKey]);

    const handleImageLoad = () => {
        setHasImg(true);
        setImageError(false);
    };

    const handleImageError = () => {
        console.log(`Failed to load image for user ${uid} from ${src}`);
        console.log(`Image error details:`, { uid, src, refreshKey });
        setHasImg(false);
        setImageError(true);
    };

    return (
        <div
            className={`relative rounded-full overflow-hidden flex items-center justify-center text-white font-bold ring-2 ring-white ${className ?? ''}`}
            style={{
                width: size,
                height: size,
                backgroundColor: `hsl(${hue} 70% 45%)`,
                fontSize: Math.max(12, Math.floor(size * 0.36)),
            }}
            title={label}
        >
            {/* Initials - always visible, becomes transparent when image loads */}
            <span
                className={`transition-opacity duration-300 ${hasImg ? 'opacity-0' : 'opacity-100'}`}
            >
                {initials}
            </span>

            {/* Avatar image - only render if we haven't encountered an error */}
            {!imageError && (
                <Image
                    key={src} // Use src as key to force re-render when it changes
                    src={src}
                    alt={label}
                    width={size}
                    height={size}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hasImg ? 'opacity-100' : 'opacity-0'}`}
                    unoptimized
                    onLoad={handleImageLoad}
                    onLoadingComplete={handleImageLoad}
                    onError={handleImageError}
                    priority={false}
                />
            )}
        </div>
    );
}export default UserAvatar;
