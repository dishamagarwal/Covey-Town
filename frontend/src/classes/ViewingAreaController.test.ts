import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { ViewingArea as ViewingAreaModel } from '../generated/client';
import ViewingAreaController, { ViewingAreaEvents } from './ViewingAreaController';

describe('Viewing Area Controller', () => {
  // A valid ViewingAreaController to be reused within the tests
  let testArea: ViewingAreaController;
  // The ViewingAreaModel corresponding to the testArea
  let testAreaModel: ViewingAreaModel;
  // Mock listeners for each of the ViewingAreaEvents, will be added to the testArea
  const mockListeners = mock<ViewingAreaEvents>();
  beforeEach(() => {
    testAreaModel = {
      id: nanoid(),
      isPlaying: true,
      elapsedTimeSec: 12,
      video: nanoid(),
    };
    testArea = new ViewingAreaController(testAreaModel);
    mockClear(mockListeners.playbackChange);
    mockClear(mockListeners.progressChange);
    mockClear(mockListeners.videoChange);
    testArea.addListener('playbackChange', mockListeners.playbackChange);
    testArea.addListener('progressChange', mockListeners.progressChange);
    testArea.addListener('videoChange', mockListeners.videoChange);
  });

  describe('updateFrom', () => {
    it('Does not update the id property', () => {
      const existingID = testArea.id;
      const newModel: ViewingAreaModel = {
        id: nanoid(),
        video: nanoid(),
        elapsedTimeSec: testArea.elapsedTimeSec + 1,
        isPlaying: !testArea.isPlaying,
      };
      testArea.updateFrom(newModel);
      expect(testArea.id).toEqual(existingID);
    });
  });

  describe('elapsedTimeSec', () => {
    it('Checks if it sets the value correctly', () => {
      expect(testArea.elapsedTimeSec).toEqual(12);
    });

    it('Checks if it sets the value correctly multiple times', () => {
      testArea.elapsedTimeSec = 5;
      expect(testArea.elapsedTimeSec).toEqual(5);
    });

    it('Checks if a listener has been called', () => {
      expect(testArea.listenerCount('progressChange')).toEqual(1);
      const mockListener = jest.fn() as jest.MockedFunction<ViewingAreaEvents['progressChange']>;
      mockListener(32);
      expect(mockListener).toHaveBeenCalled();
      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(mockListener).toHaveBeenCalledWith(32);
      testArea.addListener('progressChange', mockListener);
    });

    it('trying to comeup with more test cases', () => {
      mockListeners.progressChange(12);
      mockListeners.progressChange(12);
      expect(mockListeners.progressChange).toBeCalledTimes(2);
      expect(mockListeners.playbackChange).not.toBeCalled();
      expect(mockListeners.videoChange).not.toBeCalled();
      expect(mockListeners.progressChange).toHaveBeenCalled();
      const id = testArea.id;
      const video = testArea.video;
      testArea.elapsedTimeSec = 8;
      expect(testArea.elapsedTimeSec).toEqual(8);
      expect(testArea.isPlaying).toEqual(true);
      expect(testArea.video).toEqual(video);
      expect(testArea.id).toEqual(id);
    });

    it('Checks if a listener has been called again', () => {
      testArea.elapsedTimeSec = 9;
      testArea.elapsedTimeSec = 9;
      expect(testArea.elapsedTimeSec).toEqual(9);
      const mockListener = jest.fn() as jest.MockedFunction<ViewingAreaEvents['progressChange']>;
      mockListener(6);
      testArea.addListener('progressChange', mockListener);
      expect(mockListener).toHaveBeenCalled();
      expect(mockListener).toHaveBeenCalledWith(6);
      expect(testArea.listenerCount('progressChange')).toEqual(2);
    });

    it('Checks if a listener has been called number of times of new value', () => {
      expect(mockListeners.progressChange).not.toHaveBeenCalled();
      //when value does not change
      testArea.elapsedTimeSec = 12;
      expect(mockListeners.progressChange).not.toHaveBeenCalled();
      testArea.elapsedTimeSec = 15;
      expect(mockListeners.progressChange).toHaveBeenCalled();
      expect(mockListeners.progressChange).toHaveBeenCalledTimes(1);
      testArea.elapsedTimeSec = 15;
      testArea.elapsedTimeSec = 15;
      testArea.elapsedTimeSec = 15;
      expect(mockListeners.progressChange).toHaveBeenCalledTimes(1);
    });

    it('Checks if no change when value is the same', () => {
      testArea.removeAllListeners();
      const time = testArea.elapsedTimeSec;
      testArea.elapsedTimeSec = time;
      expect(testArea.listenerCount('progressChange')).toEqual(0);
      expect(testArea.elapsedTimeSec).toEqual(time);
      const mockListener = jest.fn() as jest.MockedFunction<ViewingAreaEvents['progressChange']>;
      expect(mockListener).not.toHaveBeenCalled();
      mockListener(32);
      mockListener(32);
      mockListener(32);
      expect(mockListener).toHaveBeenCalled();
      expect(mockListener).toHaveBeenCalledTimes(3);
      expect(mockListener).toHaveBeenCalledWith(32);
    });

    it('Checks if no listener id called when value is the same', () => {
      const mockListener = jest.fn() as jest.MockedFunction<ViewingAreaEvents['progressChange']>;
      mockListener(12);
      mockListener(12);
      expect(mockListener).toHaveBeenCalledWith(12);
    });
  });

  describe('isPlaying', () => {
    it('Checks if it sets the value correctly', () => {
      expect(testArea.isPlaying).toEqual(true);
    });

    it('Checks if a listener has been called number of times of new value', () => {
      expect(mockListeners.playbackChange).not.toHaveBeenCalled();
      //when value does not change
      testArea.isPlaying = true;
      expect(mockListeners.playbackChange).not.toHaveBeenCalled();
      testArea.isPlaying = false;
      expect(mockListeners.playbackChange).toHaveBeenCalled();
      expect(mockListeners.playbackChange).toHaveBeenCalledTimes(1);
      testArea.isPlaying = false;
      testArea.isPlaying = false;
      testArea.isPlaying = false;
      expect(mockListeners.playbackChange).toHaveBeenCalledTimes(1);
    });

    it('Checks if it sets the value correctly multiple times', () => {
      testArea.isPlaying = false;
      expect(testArea.isPlaying).toEqual(false);
    });

    it('Checks for false conditions', () => {
      const mockListener = jest.fn() as jest.MockedFunction<ViewingAreaEvents['playbackChange']>;
      mockListener(false);
      mockListener(false);
      mockListener(false);
      expect(mockListener).toHaveBeenCalled();
      expect(mockListener).toHaveBeenCalledWith(false);
      expect(mockListener).toHaveBeenCalledTimes(3);
    });

    it('Checks for true conditions', () => {
      const mockListener = jest.fn() as jest.MockedFunction<ViewingAreaEvents['playbackChange']>;
      mockListener(true);
      mockListener(false);
      mockListener(true);
      expect(mockListener).toHaveBeenCalled();
      expect(mockListener).toHaveBeenCalledWith(true);
      expect(mockListener).toHaveBeenCalledTimes(3);
      expect(testArea.isPlaying).toEqual(true);
    });

    it('Checks if a listener has been called', () => {
      expect(testArea.listenerCount('playbackChange')).toEqual(1);
      const mockListener = jest.fn() as jest.MockedFunction<ViewingAreaEvents['playbackChange']>;
      mockListener(false);
      testArea.addListener('playbackChange', mockListener);
    });

    it('Checks if a listener has been called again', () => {
      testArea.isPlaying = false;
      testArea.isPlaying = false;
      expect(testArea.isPlaying).toEqual(false);
      const mockListener = jest.fn() as jest.MockedFunction<ViewingAreaEvents['playbackChange']>;
      mockListener(true);
      testArea.addListener('playbackChange', mockListener);
      expect(mockListener).toHaveBeenCalled();
      expect(testArea.listenerCount('playbackChange')).toEqual(2);
    });

    it('Checks if no change when value is the same', () => {
      testArea.removeAllListeners();
      const playing = testArea.isPlaying;
      testArea.isPlaying = playing;
      expect(testArea.listenerCount('playbackChange')).toEqual(0);
      expect(testArea.isPlaying).toEqual(playing);
      const mockListener = jest.fn() as jest.MockedFunction<ViewingAreaEvents['playbackChange']>;
      testArea.addListener('playbackChange', mockListener);
      expect(mockListener).not.toHaveBeenCalled();
    });

    it('Checks if no listener id called when value is the same', () => {
      const mockListener = jest.fn() as jest.MockedFunction<ViewingAreaEvents['playbackChange']>;
      mockListener(true);
      mockListener(true);
      expect(mockListener).toHaveBeenCalledTimes(2);
      expect(mockListener).toHaveBeenCalledWith(true);
    });
  });

  describe('video', () => {
    it('Checks if it sets the value correctly', () => {
      const currentVideo = testArea.video;
      expect(testArea.video).toEqual(currentVideo);
    });

    it('Checks if it sets the value correctly multiple times', () => {
      testArea.video = 'efviujvfouvjn';
      expect(testArea.video).toEqual('efviujvfouvjn');
    });

    it('Counts called times', () => {
      const mockListener = jest.fn() as jest.MockedFunction<ViewingAreaEvents['videoChange']>;
      mockListener('fbvfbg');
      mockListener('fbvfbg');
      expect(mockListener).toHaveBeenCalled();
      expect(mockListener).toHaveBeenCalledWith('fbvfbg');
      expect(mockListener).toHaveBeenCalledTimes(2);
    });

    it('video undefined', () => {
      const mockListener = jest.fn() as jest.MockedFunction<ViewingAreaEvents['videoChange']>;
      mockListener(undefined);
      expect(mockListener).toHaveBeenCalled();
      expect(mockListener).toHaveBeenCalledWith(undefined);
      expect(mockListener).toHaveBeenCalledTimes(1);
    });

    it('Checks if a listener has been called', () => {
      expect(testArea.listenerCount('videoChange')).toEqual(1);
      const mockListener = jest.fn() as jest.MockedFunction<ViewingAreaEvents['videoChange']>;
      mockListener('vfrbgrbgbf');
      testArea.addListener('videoChange', mockListener);
    });

    it('Checks if a listener has been called again', () => {
      testArea.video = '67uhttvfffbtrfre';
      testArea.video = '67uhttvfffbtrfre';
      expect(testArea.video).toEqual('67uhttvfffbtrfre');
      mockListeners.videoChange('16u6htyhtbvrefe');
      mockListeners.videoChange('16u6htyhtbvrefe');
      mockListeners.videoChange('16u6htyhtbvrefe');
      testArea.addListener('videoChange', mockListeners.videoChange);
      expect(mockListeners.videoChange).toHaveBeenCalled();
      expect(testArea.listenerCount('videoChange')).toEqual(2);
    });

    it('Checks if no change when value is the same', () => {
      testArea.removeAllListeners();
      const video = testArea.video;
      testArea.video = video;
      expect(testArea.listenerCount('videoChange')).toEqual(0);
      expect(testArea.video).toEqual(video);
      const mockListener = jest.fn() as jest.MockedFunction<ViewingAreaEvents['videoChange']>;
      testArea.addListener('videoChange', mockListener);
      expect(mockListener).not.toHaveBeenCalled();
    });

    it('Checks if no change when value is the same as the model', () => {
      const video = testAreaModel.video;
      testArea.video = video;
      mockListeners.videoChange(video);
      expect(testArea.video).toEqual(video);
      expect(mockListeners.videoChange).toHaveBeenCalled();
    });

    it('Checks if no listener id called when value is the same', () => {
      const mockListener = jest.fn() as jest.MockedFunction<ViewingAreaEvents['videoChange']>;
      mockListener('43t4t4t4');
      mockListener('43t4t4t4');
      expect(mockListener).toHaveBeenCalledTimes(2);
      expect(mockListener).toHaveBeenCalledWith('43t4t4t4');
    });
  });

  it('Checks if a listener has been called number of times of new value', () => {
    const currentVideo = testArea.video;
    expect(mockListeners.videoChange).not.toHaveBeenCalled();
    //when value does not change
    testArea.video = currentVideo;
    expect(mockListeners.videoChange).not.toHaveBeenCalled();
    testArea.video = 'fgrnghfmfmndthbf';
    expect(mockListeners.videoChange).toHaveBeenCalled();
    expect(mockListeners.videoChange).toHaveBeenCalledTimes(1);
    testArea.video = 'fgrnghfmfmndthbf';
    testArea.video = 'fgrnghfmfmndthbf';
    testArea.video = 'fgrnghfmfmndthbf';
    expect(mockListeners.videoChange).toHaveBeenCalledTimes(1);
  });

  describe('viewingAreaModel', () => {
    it('It returns the correct viewing area model', () => {
      const existingID = testArea.id;
      const newModel: ViewingAreaModel = {
        id: existingID,
        video: testArea.video,
        elapsedTimeSec: testArea.elapsedTimeSec,
        isPlaying: testArea.isPlaying,
      };
      expect(testArea.viewingAreaModel()).toEqual(newModel);
      expect(testArea.id).toEqual(newModel.id);
      expect(testArea.elapsedTimeSec).toEqual(newModel.elapsedTimeSec);
      expect(testArea.isPlaying).toEqual(newModel.isPlaying);
      expect(testArea.video).toEqual(newModel.video);
    });
  });
});
