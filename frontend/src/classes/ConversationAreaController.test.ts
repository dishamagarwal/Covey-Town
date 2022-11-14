import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { PlayerLocation } from '../types/CoveyTownSocket';
import ConversationAreaController, { ConversationAreaEvents } from './ConversationAreaController';
import PlayerController from './PlayerController';

describe('ConversationArea', () => {
  // A valid ConversationAreaController to be reused within the tests
  let testArea: ConversationAreaController;
  // Mock listeners for each of the ConversationAreaEvents, will be added to the testArea
  const mockListeners = mock<ConversationAreaEvents>();
  beforeEach(() => {
    const playerLocation: PlayerLocation = {
      moving: false,
      x: 0,
      y: 0,
      rotation: 'front',
    };
    testArea = new ConversationAreaController(nanoid(), nanoid());
    testArea.occupants = [
      new PlayerController(nanoid(), nanoid(), playerLocation),
      new PlayerController(nanoid(), nanoid(), playerLocation),
      new PlayerController(nanoid(), nanoid(), playerLocation),
    ];
    mockClear(mockListeners.occupantsChange);
    mockClear(mockListeners.topicChange);
    testArea.addListener('occupantsChange', mockListeners.occupantsChange);
    testArea.addListener('topicChange', mockListeners.topicChange);
  });
  describe('isEmpty', () => {
    it('Returns true if the occupants list is empty', () => {
      testArea.occupants = [];
      expect(testArea.isEmpty()).toEqual(true);
    });

    it('Returns true if the topic is undefined', () => {
      testArea.topic = undefined;
      expect(testArea.isEmpty()).toEqual(true);
    });

    it('Returns false if the topic is defined and occupants exist', () => {
      expect(testArea.isEmpty()).toEqual(false);
    });

    it('Returns false if the topic is defined and occupants exist', () => {
      testArea.topic = 'something';
      const playerLocation: PlayerLocation = {
        moving: false,
        x: 0,
        y: 0,
        rotation: 'front',
      };
      testArea.occupants = [new PlayerController(nanoid(), nanoid(), playerLocation)];
      expect(testArea.isEmpty()).toEqual(false);
    });

    it('Checks if a listener has been called number of times of new value', () => {
      const current = testArea.topic;
      expect(mockListeners.topicChange).not.toHaveBeenCalled();
      //when value does not change
      testArea.topic = current;
      expect(mockListeners.topicChange).not.toHaveBeenCalled();
      testArea.topic = 'fgrnghfmfmndthbf';
      expect(mockListeners.topicChange).toHaveBeenCalled();
      expect(mockListeners.topicChange).toHaveBeenCalledTimes(1);
      testArea.topic = 'fgrnghfmfmndthbf';
      testArea.topic = 'fgrnghfmfmndthbf';
      testArea.topic = 'fgrnghfmfmndthbf';
      expect(mockListeners.topicChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('occupants', () => {
    it('Checks if it sets the value correctly', () => {
      expect(testArea.occupants.length).toEqual(3);
    });

    it('Checks if it sets the value correctly multiple times', () => {
      const playerLocation: PlayerLocation = {
        moving: false,
        x: 0,
        y: 0,
        rotation: 'front',
      };
      testArea.occupants = [new PlayerController(nanoid(), nanoid(), playerLocation)];
      expect(testArea.occupants.length).toEqual(1);
    });

    it('check if occupants is not the same', () => {
      const mockListener = jest.fn() as jest.MockedFunction<
        ConversationAreaEvents['occupantsChange']
      >;
      expect(mockListener).not.toHaveBeenCalled();
      mockListener(testArea.occupants);
      expect(mockListener).toHaveBeenCalled();
      expect(mockListener).toHaveBeenCalledWith(testArea.occupants);
      mockListener([]);
      expect(mockListener).toHaveBeenCalled();
      expect(mockListener).toHaveBeenCalledWith([]);
    });

    it('Checks if a listener has been called', () => {
      expect(testArea.listenerCount('occupantsChange')).toEqual(1);
      const mockListener = jest.fn() as jest.MockedFunction<
        ConversationAreaEvents['occupantsChange']
      >;
      const playerLocation: PlayerLocation = {
        moving: false,
        x: 0,
        y: 0,
        rotation: 'front',
      };
      mockListener([new PlayerController(nanoid(), nanoid(), playerLocation)]);
      testArea.addListener('occupantsChange', mockListener);
    });

    it('Checks if a listener has been called number of times of new value', () => {
      const playerLocation: PlayerLocation = {
        moving: false,
        x: 0,
        y: 0,
        rotation: 'front',
      };
      const current = testArea.occupants;
      expect(mockListeners.occupantsChange).not.toHaveBeenCalled();
      //when value does not change
      testArea.occupants = current;
      const occupant = [new PlayerController(nanoid(), nanoid(), playerLocation)];
      expect(mockListeners.occupantsChange).not.toHaveBeenCalled();
      testArea.occupants = occupant;
      expect(mockListeners.occupantsChange).toHaveBeenCalled();
      expect(mockListeners.occupantsChange).toHaveBeenCalledTimes(1);
      testArea.occupants = occupant;
      testArea.occupants = occupant;
      testArea.occupants = occupant;
      expect(mockListeners.occupantsChange).toHaveBeenCalledTimes(1);
    });

    it('Checks if a listener has been called again', () => {
      const playerLocation: PlayerLocation = {
        moving: false,
        x: 0,
        y: 0,
        rotation: 'front',
      };
      const newListOfOccupants = [new PlayerController(nanoid(), nanoid(), playerLocation)];
      testArea.occupants = newListOfOccupants;
      testArea.occupants = newListOfOccupants;
      expect(testArea.occupants.length).toEqual(1);
      const mockListener = jest.fn() as jest.MockedFunction<
        ConversationAreaEvents['occupantsChange']
      >;
      const newListOfOccupants2 = [
        new PlayerController(nanoid(), nanoid(), playerLocation),
        new PlayerController(nanoid(), nanoid(), playerLocation),
      ];
      mockListener(newListOfOccupants2);
      testArea.addListener('occupantsChange', mockListener);
      expect(mockListener).toHaveBeenCalled();
      expect(testArea.listenerCount('occupantsChange')).toEqual(2);
    });

    it('Checks if no change when value is the same', () => {
      testArea.removeAllListeners();
      const occupants = testArea.occupants;
      testArea.occupants = occupants;
      expect(testArea.listenerCount('occupantsChange')).toEqual(0);
      expect(testArea.occupants).toEqual(occupants);
      const mockListener = jest.fn() as jest.MockedFunction<
        ConversationAreaEvents['occupantsChange']
      >;
      testArea.addListener('occupantsChange', mockListener);
      expect(mockListener).not.toHaveBeenCalled();
    });

    it('Checks if no listener id called when value is the same', () => {
      const mockListener = jest.fn() as jest.MockedFunction<
        ConversationAreaEvents['occupantsChange']
      >;
      const playerLocation: PlayerLocation = {
        moving: false,
        x: 0,
        y: 0,
        rotation: 'front',
      };
      const newListOfOccupants = [
        new PlayerController(nanoid(), nanoid(), playerLocation),
        new PlayerController(nanoid(), nanoid(), playerLocation),
      ];
      mockListener(newListOfOccupants);
      // expect(mockListener).toHaveBeenCalledTimes(2);
      expect(mockListener).toHaveBeenCalledWith(newListOfOccupants);
    });
  });

  describe('topic', () => {
    it('Checks if it sets the value correctly', () => {
      const topic = testArea.topic;
      expect(testArea.topic).toEqual(topic);
    });

    it('Checks if it sets the value correctly multiple times', () => {
      testArea.topic = undefined;
      expect(testArea.topic).toEqual(undefined);
    });

    it('Checks if a listener has been called', () => {
      expect(testArea.listenerCount('topicChange')).toEqual(1);
      const mockListener = jest.fn() as jest.MockedFunction<ConversationAreaEvents['topicChange']>;
      mockListener('hello kitty');
      expect(mockListener).toHaveBeenCalledTimes(1);
      testArea.addListener('topicChange', mockListener);
    });

    it('Checks if a listener has been called again', () => {
      testArea.topic = 'hello world';
      testArea.topic = 'hello world';
      expect(mockListeners.topicChange).toHaveBeenCalled();
      expect(mockListeners.topicChange).toHaveBeenCalledTimes(1);
      expect(testArea.topic).toEqual('hello world');
      const mockListener = jest.fn() as jest.MockedFunction<ConversationAreaEvents['topicChange']>;
      mockListener('hello kitty');
      mockListener('hello kitty');
      expect(mockListener).toHaveBeenCalled();
      expect(mockListener).toHaveBeenCalledWith('hello kitty');
      expect(mockListener).toHaveBeenCalledTimes(2);
      expect(testArea.listenerCount('topicChange')).toEqual(1);
    });

    it('Checks if no change when value is the same', () => {
      const mockListener = jest.fn() as jest.MockedFunction<ConversationAreaEvents['topicChange']>;
      expect(mockListener).not.toHaveBeenCalled();
      mockListener(undefined);
      expect(mockListener).toHaveBeenCalled();
      expect(mockListener).toHaveBeenCalledWith(undefined);
      testArea.removeAllListeners();
      testArea.topic = 'hello kitty';
      expect(testArea.listenerCount('topicChange')).toEqual(0);
      expect(testArea.topic).toEqual('hello kitty');
    });

    it('Checks if no listener id called when value is the same', () => {
      const mockListener = jest.fn() as jest.MockedFunction<ConversationAreaEvents['topicChange']>;
      testArea.topic = 'hello kitty';
      expect(mockListener).toHaveBeenCalledTimes(0);
      testArea.topic = 'not hello kitty';
      expect(mockListeners.topicChange).toHaveBeenCalledWith('not hello kitty');
    });
  });

  describe('toConversationAreaModel', () => {
    it('', () => {
      const model = testArea.toConversationAreaModel();
      expect(model.id).toEqual(testArea.id);
      expect(model.topic).toEqual(testArea.topic);
      expect(model.occupantsByID.length).toEqual(testArea.occupants.length);
      expect(model.occupantsByID).toEqual(testArea.occupants.map(occupant => occupant.id));
    });
  });
});
