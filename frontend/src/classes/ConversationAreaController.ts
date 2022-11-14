import EventEmitter from 'events';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import TypedEmitter from 'typed-emitter';
import { ConversationArea as ConversationAreaModel } from '../types/CoveyTownSocket';
import PlayerController from './PlayerController';

/**
 * The events that the ConversationAreaController emits to subscribers. These events
 * are only ever emitted to local components (not to the townService).
 */
export type ConversationAreaEvents = {
  topicChange: (newTopic: string | undefined) => void;
  occupantsChange: (newOccupants: PlayerController[]) => void;
};

// The special string that will be displayed when a conversation area does not have a topic set
export const NO_TOPIC_STRING = '(No topic)';
/**
 * A ConversationAreaController manages the local behavior of a conversation area in the frontend,
 * implementing the logic to bridge between the townService's interpretation of conversation areas and the
 * frontend's. The ConversationAreaController emits events when the conversation area changes.
 */
export default class ConversationAreaController extends (EventEmitter as new () => TypedEmitter<ConversationAreaEvents>) {
  private _id: string;

  private _topic?: string;

  private _occupants: PlayerController[];

  /**
   * Create a new ConversationAreaController
   * @param id
   * @param topic
   */
  constructor(id: string, topic?: string) {
    super();
    this._id = id;
    this._topic = topic;
    this._occupants = [];
  }

  /**
   * The ID of this conversation area (read only)
   */
  get id(): string {
    return this._id;
  }

  /**
   * The list of occupants in this conversation area. Changing the set of occupants
   * will emit an occupantsChange event.
   */
  set occupants(newOccupants: PlayerController[]) {
    if (
      this._occupants.length !== newOccupants.length ||
      _.xor(newOccupants, this._occupants).length > 0
    ) {
      this._occupants = newOccupants;
      this.emit('occupantsChange', newOccupants);
    }
  }

  get occupants(): PlayerController[] {
    return this._occupants;
  }

  /**
   * The topic of the conversation area. Changing the topic will emit a topicChange event
   *
   * Setting the topic to the value `undefined` will indicate that the conversation area is not active
   */
  set topic(newTopic: string | undefined) {
    if (this._topic !== newTopic) {
      this.emit('topicChange', newTopic);
      this._topic = newTopic;
    }
  }

  get topic(): string | undefined {
    return this._topic;
  }

  /**
   * A conversation area is empty if there are no occupants in it, or the topic is undefined.
   */
  isEmpty(): boolean {
    if (this.occupants.length === 0 || this.topic === undefined) {
      return true;
    }
    return false;
  }

  /**
   * Return a representation of this ConversationAreaController that matches the
   * townService's representation and is suitable for transmitting over the network.
   */
  toConversationAreaModel(): ConversationAreaModel {
    return {
      id: this.id,
      topic: this.topic,
      occupantsByID: this.occupants.map(occupant => occupant.id),
    };
  }

  /**
   * Create a new ConversationAreaController to match a given ConversationAreaModel
   * @param convAreaModel Conversation area to represent
   * @param playerFinder A function that will return a list of PlayerController's
   *                     matching a list of Player ID's
   */
  static fromConversationAreaModel(
    convAreaModel: ConversationAreaModel,
    playerFinder: (playerIDs: string[]) => PlayerController[],
  ): ConversationAreaController {
    const ret = new ConversationAreaController(convAreaModel.id, convAreaModel.topic);
    ret.occupants = playerFinder(convAreaModel.occupantsByID);
    return ret;
  }
}

/**
 * A react hook to retrieve the occupants of a ConversationAreaController, returning an array of PlayerController.
 *
 * This hook will re-render any components that use it when the set of occupants changes.
 */
export function useConversationAreaOccupants(area: ConversationAreaController): PlayerController[] {
  const [currentOccupants, setCurrentOccupants] = useState<PlayerController[]>(area.occupants);
  useEffect(() => {
    area.addListener('occupantsChange', setCurrentOccupants);
    return () => {
      area.removeListener('occupantsChange', setCurrentOccupants);
    };
  }, [area]);
  return currentOccupants;
}

/**
 * A react hook to retrieve the topic of a ConversationAreaController.
 * If there is currently no topic defined, it will return NO_TOPIC_STRING.
 *
 * This hook will re-render any components that use it when the topic changes.
 */
export function useConversationAreaTopic(area: ConversationAreaController): string {
  const [currentTopic, setCurrentTopic] = useState<string | undefined>(area.topic);
  useEffect(() => {
    area.addListener('topicChange', setCurrentTopic);
    return () => {
      area.removeListener('topicChange', setCurrentTopic);
    };
  }, [area]);
  return currentTopic || NO_TOPIC_STRING;
}
