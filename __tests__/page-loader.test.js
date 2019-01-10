import os from 'os';
import path from 'path';
import url from 'url';
import { promises as fs } from 'fs';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';

import pageLoader from '../src';

nock.disableNetConnect();

axios.defaults.adapter = httpAdapter;

const host = 'http://ru.hexlet.io/';

const mainUri = '/courses';
const cssUri = '/assets/application.css';
const imgUri = '/assets/hexlet-logo-e99fc2b3b7c1eec88899f3af1435a39aaac6fd29d011dfe2342499c0884b7a96.png';
const scriptUri = '/assets/script.js';

const fixturesPath = './__tests__/__fixtures__/';
const fixturesPathHtml = path.join(fixturesPath, '/mock-hexlet-courses.html');
// const fixturesPathExpectedHtml = path.join(fixturesPath, '/mock-hexlet-courses-loaded.html');
const fixturesPathExpectedCss = path.join(fixturesPath, cssUri);
const fixturesPathExpectedImg = path.join(fixturesPath, imgUri);
const fixturesPathExpectedScript = path.join(fixturesPath, scriptUri);

const htmlName = 'ru-hexlet-io-courses.html';
const assetsDirName = 'ru-hexlet-io-courses_files';
const cssName = 'assets-application.css';
const imgName = 'assets-hexlet-logo-e99fc2b3b7c1eec88899f3af1435a39aaac6fd29d011dfe2342499c0884b7a96.png';
const scriptName = 'assets-script.js';

const address = url.resolve(host, mainUri);

let expectedHtml;
let expectedCss;
let expectedImg;
let expectedScript;

let output;

beforeAll(async () => {
  output = await fs.mkdtemp(path.resolve(os.tmpdir(), 'page-loader-'));
  expectedHtml = await fs.readFile(fixturesPathHtml, 'utf-8');
  expectedCss = await fs.readFile(fixturesPathExpectedCss, 'utf-8');
  expectedImg = await fs.readFile(fixturesPathExpectedImg, 'utf-8');
  expectedScript = await fs.readFile(fixturesPathExpectedScript, 'utf-8');

  nock(host)
    .get(mainUri)
    .reply(200, expectedHtml);

  nock(host)
    .get(cssUri)
    .reply(200, expectedCss);

  nock(host)
    .get(imgUri)
    .reply(200, expectedImg);

  nock(host)
    .get(scriptUri)
    .reply(200, expectedScript);

  await pageLoader(address, output);
});

describe('load page and resources', () => {
  it('#getBody', async () => {
    const htmlFilePath = path.join(output, htmlName);
    const responseHtml = await fs.readFile(htmlFilePath, 'utf-8');
    expect(responseHtml).toMatchSnapshot();
  });

  it('#checkCss', async () => {
    const cssFilePath = path.join(output, assetsDirName, cssName);
    const responseCss = await fs.readFile(cssFilePath, 'utf-8');
    expect(responseCss).toBe(expectedCss);
  });

  it('#checkImg', async () => {
    const imgFilePath = path.join(output, assetsDirName, imgName);
    const responseImg = await fs.readFile(imgFilePath, 'utf-8');
    expect(responseImg).toBe(expectedImg);
  });

  it('#checkScript', async () => {
    const scriptFilePath = path.join(output, assetsDirName, scriptName);
    const responseScript = await fs.readFile(scriptFilePath, 'utf-8');
    expect(responseScript).toBe(expectedScript);
  });

  it('#error1', async () => {
    try {
      await pageLoader('unknown', output);
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
  });
});
