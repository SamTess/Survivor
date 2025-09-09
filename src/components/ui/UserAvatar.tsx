"use client";
import React from 'react';
import Image from 'next/image';

type Props = {
    uid: number;
    name?: string | null;
    size?: number;
    className?: string;
};

export function UserAvatar({ uid, name, size = 56, className }: Props) {
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
    const [triedApi, setTriedApi] = React.useState(false);
    const [src, setSrc] = React.useState<string>(() => `/api/users/${uid}/image`);

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
            {/* Initials always visible and faded out when the image is loaded */}
            <span className={hasImg ? 'opacity-0 transition-opacity' : 'opacity-100 transition-opacity'}>{initials}</span>
            <Image
                key={src}
                src={src}
                alt={label}
                width={size}
                height={size}
                className="absolute inset-0 w-full h-full object-cover"
                unoptimized
                style={{ display: hasImg ? 'block' : 'none' }}
                onLoad={() => setHasImg(true)}
                onLoadingComplete={() => setHasImg(true)}
                onError={() => {
                    if (!triedApi) {
                        setTriedApi(true);
                        setSrc(`/users/${uid}/image`);
                        setHasImg(false);
                    } else {
                        setHasImg(false);
                    }
                }}
            />
        </div>
    );
}

export default UserAvatar;
