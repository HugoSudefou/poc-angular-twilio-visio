export class Room {
  accountSid: string;
  dateCreated: string;
  dateUpdated: string;
  duration: number;
  enableTurn: boolean;
  endTime: string;
  links: {
    recordings: string;
    participants: string;
  }
  maxParticipants: number;
  mediaRegion: string;
  recordParticipantsOnConnect: boolean;
  sid: string;
  status: string;
  statusCallback: string;
  statusCallbackMethod: string;
  type: string;
  uniqueName: string;
  url: string;
  videoCodecs: string[];
}
