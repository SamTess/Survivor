// Domain-level enums (decoupled from Prisma) reflecting schema.prisma values
export enum ContentType {
  USER = "USER",
  STARTUP = "STARTUP",
  EVENT = "EVENT",
  NEWS = "NEWS",
  PAGE = "PAGE",
}

export enum EventType {
  VIEW = "VIEW",
  CLICK = "CLICK",
  LIKE = "LIKE",
  UNLIKE = "UNLIKE",
  BOOKMARK = "BOOKMARK",
  SHARE = "SHARE",
  FOLLOW = "FOLLOW",
  UNFOLLOW = "UNFOLLOW",
  SIGNUP = "SIGNUP",
  LOGIN = "LOGIN",
  COMMENT = "COMMENT",
}
