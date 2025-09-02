// Domain-level enums (découplés de Prisma) reflétant les valeurs de schema.prisma
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
  BOOKMARK = "BOOKMARK",
  SHARE = "SHARE",
  FOLLOW = "FOLLOW",
  UNFOLLOW = "UNFOLLOW",
  SIGNUP = "SIGNUP",
  LOGIN = "LOGIN",
  COMMENT = "COMMENT",
}
