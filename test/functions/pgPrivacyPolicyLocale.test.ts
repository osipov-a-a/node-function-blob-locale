jest.mock("@azure/functions");
jest.mock("@azure/storage-blob");
jest.mock("@azure/identity")

import * as func from "@azure/functions";
import { BlobDownloadResponseParsed, BlobServiceClient, BlockBlobClient, ContainerClient, BlobDownloadResponseModel } from '@azure/storage-blob'
import { DefaultAzureCredential } from '@azure/identity'
import * as dotenv from 'dotenv'
import { pgPrivacyPolicyLocale } from "../../src/functions/pgPrivacyPolicyLocale"
import { ReadableStream } from "node:stream/web";

const {HttpRequest} = jest.requireActual("@azure/functions")

dotenv.config()

describe("pgPrivacyPolicyLocale method", () => {

  const logMock = jest.fn();
  const getContainerClientMock = jest.fn().mockReturnValue(new ContainerClient("",""));
  const blockBlobClientMock = jest.fn().mockReturnValue(new BlockBlobClient(""));
  const downloadMock = jest.fn().mockReturnValue({readableStreamBody:null});

  jest.spyOn(func.InvocationContext.prototype, "log").mockImplementation(logMock);
  jest.spyOn(BlobServiceClient.prototype,"getContainerClient").mockImplementation(getContainerClientMock);
  jest.spyOn(ContainerClient.prototype,"getBlockBlobClient").mockImplementation(blockBlobClientMock);
  jest.spyOn(BlockBlobClient.prototype,"download").mockImplementation(downloadMock);

  it('should return 500 if no params are set', async () =>{
    const req = new HttpRequest({
     url:"https://localhost:300/test",
     method: "GET",
     query:{locale:"",region:""}
     })
    const resp: func.HttpResponseInit = await pgPrivacyPolicyLocale(req, new func.InvocationContext)
    
    expect(resp.status).toBe(500)
  });
  it('should return 404 with actual params', async () =>{
    const req = new HttpRequest({
     url:"https://localhost:300/test",
     method: "GET",
     query:{locale:"test",region:"test"}
     })
    const resp: func.HttpResponseInit = await pgPrivacyPolicyLocale(req, new func.InvocationContext)
    
    expect(resp.status).toBe(404)
  })
  

})