import { Hash } from 'viem';
import { isNonEmptyArray, NonEmptyArray } from '../../common/utils';

export type EventLogTopic = Hash;
export type EventLogTopics = NonEmptyArray<EventLogTopic>;

export function isEventLogTopic(topic: string): topic is EventLogTopic {
  return topic.length === 66 && topic.startsWith('0x') && /^0x[0-9a-f]{64}$/.test(topic);
}

export function isEventLogTopics(topics: string[]): topics is EventLogTopics {
  return isNonEmptyArray(topics) && topics.every(isEventLogTopic);
}

export function getEventLogTopics(topics: string[]): EventLogTopics {
  if (!isEventLogTopics(topics)) {
    throw new Error('Invalid event log topics');
  }
  return topics;
}
