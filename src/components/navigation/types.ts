export type NavItem = {
  href: string
  label: string
}

export type NavbarState = {
  isMenuOpen: boolean
  isProfileDropdownOpen: boolean
  isSearchOpen: boolean
}

export type NavbarRefs = {
  profileDropdownRef: React.RefObject<HTMLDivElement | null>
  searchDropdownRef: React.RefObject<HTMLDivElement | null>
  menuButtonRef: React.RefObject<HTMLButtonElement | null>
  profileButtonRef: React.RefObject<HTMLButtonElement | null>
  searchButtonRef: React.RefObject<HTMLButtonElement | null>
}
