export enum OpportunityDirection {
  'S->I' = 'S->I',
  'S->P' = 'S->P',
  'I->S' = 'I->S',
  'P->S' = 'P->S',
}

export enum EntityType {
  STARTUP = 'STARTUP',
  INVESTOR = 'INVESTOR',
  PARTNER = 'PARTNER',
}

export enum OpportunityStatus {
  NEW = 'new',
  QUALIFIED = 'qualified',
  CONTACTED = 'contacted',
  IN_DISCUSSION = 'in_discussion',
  PILOT = 'pilot',
  DEAL = 'deal',
  LOST = 'lost',
}

export enum OpportunityEventType {
  AUTO_CREATED = 'auto_created',
  RESCORED = 'rescored',
  STATUS_CHANGED = 'status_changed',
  NOTE = 'note',
  EMAIL_SENT = 'email_sent',
  MEETING = 'meeting',
  PILOT_STARTED = 'pilot_started',
  DEAL_SIGNED = 'deal_signed',
}
