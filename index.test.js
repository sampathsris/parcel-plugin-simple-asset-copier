const fs = require('fs-extra');
const path = require('path');

jest.mock('fs-extra');
let consoleErrorSpy;

const copyAssets = require('.');

const bundledEvent = 'bundled';
const assets = './assets';
const bundleName = 'mock.html';
const dest = path.dirname(bundleName);

let bundleMock;
let bundlerOnFn;
let bundlerMock;

beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error');

    bundleMock = {
        name: bundleName
    };
    bundlerOnFn = jest.fn((_, innerCallback) => innerCallback(bundleMock));
    bundlerMock = {
        on: bundlerOnFn
    };
});

afterEach(() => {
    consoleErrorSpy.mockRestore();
});

describe('when everything works', () => {
    beforeEach(() => {
        fs.access.mockReturnValueOnce(Promise.resolve());
        fs.copy.mockReturnValueOnce(Promise.resolve());

        copyAssets(bundlerMock);
    });

    it('must call "bundled" event handler with a function', () => {
        expect(bundlerOnFn).toBeCalledWith(bundledEvent, expect.any(Function));
    });
    
    it('must check if assets directory is accessible', () => {
        expect(fs.access).toBeCalledWith(assets, fs.F_OK | fs.R_OK);
    });

    it('must call fs.copy with correct arguments', () => {
        expect(fs.copy).toBeCalledWith(assets, dest, expect.any(Object));
        expect(fs.copy.mock.calls[0][2]).toMatchObject({
            overwrite: true,
            preserveTimestamps: true
        });
    });
});

describe('when assets folder is not accessible/non-existent', () => {
    const mockAccessError = 'Unspecified error in fs.access';
    
    beforeEach(() => {
        fs.access.mockReturnValueOnce(Promise.reject(mockAccessError));

        copyAssets(bundlerMock);
    });
    
    it('must print an error to the console', () => {
        expect(consoleErrorSpy).toBeCalledWith(`Could not read assets directory: ${mockAccessError}`);
    });
});

describe('when fs.copy fails', () => {
    const mockCopyError = 'Unspecified error in fs.copy';

    beforeEach(() => {
        fs.access.mockReturnValueOnce(Promise.resolve());
        fs.copy.mockReturnValueOnce(Promise.reject(mockCopyError));
        
        copyAssets(bundlerMock);
    });

    it('must print an error to the console', () => {
        expect(consoleErrorSpy).toBeCalledWith(`Could not copy files from ${assets} to ${dest}: ${mockCopyError}`);
    });
});
