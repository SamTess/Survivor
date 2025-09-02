import { InteractionEvent, RecordInteractionInput } from "../../../domain/entities/analytics/InteractionEvent";

export interface InteractionEventRepository {
  record(data: RecordInteractionInput): Promise<InteractionEvent>;
}
