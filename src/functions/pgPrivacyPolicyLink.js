const { app } = require('@azure/functions');
const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require('@azure/identity');
require("dotenv").config();

app.http('pgPrivacyPolicyLink', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const locale = request.query.get('locale')
        const region = request.query.get('region')

        try{
            const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
            if (!accountName) throw Error('Azure Storage accountName not found');
            const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
            if (!containerName) throw Error('Azure Storage containerName not found');
            const blobName = process.env.AZURE_STORAGE_BLOB_NAME;
            if (!blobName) throw Error('Azure Storage blobName not found');

            const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`,
            new DefaultAzureCredential()
            );
            const containerClient = blobServiceClient.getContainerClient(containerName);

            const blobClient = containerClient.getBlockBlobClient(blobName);

            let downloadBlockBlobResponse = await blobClient.download(0);
            console.log('\nDownloaded blob content...');

            let blobText = await streamToText(downloadBlockBlobResponse.readableStreamBody)

            blobJSON = JSON.parse(blobText);
           
            var foundReg = blobJSON[region]
            if(!foundReg)
                return {status:404}
            
            var link = foundReg[locale];
            if(link)
                return {status:200, body: `${link}!` };
            else
                return {status:404}


        }catch(err){
            context.log('error has occured', err)
            return {status: 500}
        }

    }
});

async function streamToText(readable) {
  readable.setEncoding('utf8');
  let data = '';
  for await (const chunk of readable) {
    data += chunk;
  }
  return data;
}