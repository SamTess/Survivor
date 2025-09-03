"use client"

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePathname } from 'next/navigation';
import { FaHome, FaCalendarAlt, FaProjectDiagram, FaNewspaper, FaUsers } from 'react-icons/fa';
import Link from 'next/link';
import DarkModeToggle from '../layout/DarkModeToggle';

type SidebarItem = { icon: React.ComponentType<{ className?: string }>; redirection: string; text: string; roles?: ('USER'|'ADMIN'|'MODERATOR')[]; permissions?: string[] };
const adminSidebarItems: SidebarItem[] = [
  { icon: FaHome, redirection: '/home', text: 'Home' },
  { icon: FaCalendarAlt, redirection: '/admin/events-management', text: 'Events', roles: ['ADMIN','MODERATOR'] },
  { icon: FaProjectDiagram, redirection: '/admin/projects-management', text: 'Projects', roles: ['ADMIN'] },
  { icon: FaNewspaper, redirection: '/admin/news-management', text: 'News', roles: ['ADMIN','MODERATOR'] },
  { icon: FaUsers, redirection: '/admin/users-management', text: 'Users', roles: ['ADMIN'] },
];

const AdminSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const { hasRole, hasPermission } = useAuth();

  if (!pathname || !pathname.startsWith('/admin'))
    return null;
  return (
    <div
      className={`bg-indigo-600 text-white transition-all duration-200 ease-in-out h-screen fixed z-50 select-none ${
        isExpanded ? 'w-52' : 'w-14'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <nav>
        <ul>

          {adminSidebarItems.filter(i => {
            if (i.roles && !hasRole(i.roles)) return false;
            if (i.permissions && !hasPermission(i.permissions)) return false;
            return true;
          }).map((item, index) => (
            <Link href={item.redirection} key={index} className={`m-1 px-3 py-5 flex flex-row items-center transition-all ease-in-out duration-50 rounded-md ${pathname === item.redirection ? 'bg-indigo-500' : ' hover:bg-indigo-400 active:bg-accent-color'}`}>
              <item.icon className="m-0.5 text-xl opacity-100 fixed"/>
              <p className={`fixed font-bold transition-all ease-in-out duration-200 text-sm ${isExpanded ? 'ml-10' : 'ml-0 opacity-0'}`}>{item.text}</p>
            </Link>
          ))}
        </ul>
      </nav>
      <div className="fixed m-4 pl-0.5 bottom-0">
        <DarkModeToggle />
      </div>
    </div>
  );
};

export default AdminSidebar;
