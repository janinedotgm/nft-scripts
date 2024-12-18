import { publicKey } from '@metaplex-foundation/umi';
import fs from 'fs';
import { getNetwork } from './utils/helpers';

const collectionAddress = publicKey('COLLECTION_ADDRESS');
const url = getNetwork();

interface NFTOwner {
    NFTAddress: string;
    OwnerAddress: string;
}

// Fetch all assets in the collection
const getAssetsByGroup = async () => {
    let page = 1;
    let assetList: NFTOwner[] = [];
  
    while (page > -1) {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "my-id",
          method: "getAssetsByGroup",
          params: {
            groupKey: "collection",
            groupValue: collectionAddress,
            page: page,
            limit: 1000,
          },
        }),
      });
      const { result } = await response.json();
  
      const owners = result.items.map((item) => ({
        NFTAddress: item.id,
        OwnerAddress: item.ownership.owner,
      }));
      assetList.push(...owners);
      if (result.total !== 1000) {
        page = -1;
      } else {
        page++;
      }
    }
    const resultData = {
      totalResults: assetList.length,
      results: assetList,
    };

    // Create data directory if it doesn't exist
    const dataDir = './data';
    if (!fs.existsSync(dataDir)){
        fs.mkdirSync(dataDir);
    }

    // Write to file in the data directory
    const filePath = `${dataDir}/nft-holders-${collectionAddress}.json`;
    fs.writeFileSync(filePath, JSON.stringify(resultData, null, 2));
    console.log(`Data written to ${filePath}`);
    
    console.timeEnd("getAssetsByGroup");
};
  
  getAssetsByGroup();