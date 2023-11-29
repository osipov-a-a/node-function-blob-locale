import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlobDownloadResponseParsed, BlobServiceClient, BlockBlobClient, ContainerClient } from '@azure/storage-blob'
import { DefaultAzureCredential } from '@azure/identity'
import * as dotenv from 'dotenv'

dotenv.config()


export async function pgPrivacyPolicyLocale(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`)

    const locale: string | null = request.query.get('locale')
    if(!locale) throw Error('locale parameter missing')
    const region: string | null= request.query.get('region')
    if(!region) throw Error('region parameter is missing')

    try {
      const accountName: string | undefined = process.env.AZURE_STORAGE_ACCOUNT_NAME
      if (!accountName) throw Error('Azure Storage accountName not found')
      const containerName: string | undefined = process.env.AZURE_STORAGE_CONTAINER_NAME
      if (!containerName) throw Error('Azure Storage containerName not found')
      const blobName: string | undefined = process.env.AZURE_STORAGE_BLOB_NAME
      if (!blobName) throw Error('Azure Storage blobName not found')

      const blobServiceClient: BlobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential()
      )
      const containerClient: ContainerClient = blobServiceClient.getContainerClient(containerName)

      const blobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName)

      const downloadBlockBlobResponse: BlobDownloadResponseParsed = await blobClient.download(0)
      console.log('\nDownloaded blob content...')

      const blobText: string = await streamToText(downloadBlockBlobResponse.readableStreamBody)

      const blobJSON: JSON = JSON.parse(blobText)
      
      const foundReg: JSON = blobJSON[region]
      if (!foundReg) { return { status: 404 } }

      const link:string = foundReg[locale]
      if (link) { return { status: 200, body: `${link}` } } else { return { status: 404 } }     
      
    } catch (err:any) {
      context.log('error has occured', err)
      return { status: 500 }
    }
};

app.http('pgPrivacyPolicyLocale', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: pgPrivacyPolicyLocale
});

async function streamToText (readable: NodeJS.ReadableStream | undefined) {
  let data:string = ''
  if (readable){
    readable.setEncoding('utf8')
    
    for await (const chunk of readable) {
      data += chunk
    }
  }
  return data
}