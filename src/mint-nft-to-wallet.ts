import { generateSigner, createSignerFromKeypair, signerIdentity, transactionBuilder, publicKey, percentAmount } from '@metaplex-foundation/umi'
import { createCollection, createV1, mplCore } from '@metaplex-foundation/mpl-core'
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';
import { createUmiInstance } from './utils/helpers';

const { umi, secretKey } = createUmiInstance();

const signer = createSignerFromKeypair(umi, umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secretKey)));

umi.use(signerIdentity(signer)).use(mplCore()).use(irysUploader());

(async () => {

    const uri = "METADATA_URI"
    const collection = publicKey('COLLECTION_ADDRESS');
    const name = "NFT_NAME";

    // List of wallet addresses to mint to
    const ownerList: string[] = [
        "wallet-address-1",
        "wallet-address-2",
        "wallet-address-3",
        "wallet-address-4",
    ]

    
    for (let i = 0; i < ownerList.length; i += 4) {
        const batch = ownerList.slice(i, i + 4);
        
        let tx = transactionBuilder(); 

        for (const owner of batch) {

            tx = tx.add(createV1(umi, {
                asset: generateSigner(umi),
                collection,
                owner: publicKey(owner),
                name,
                uri,
                authority: signer,
            }));

        }

        await umi.rpc.sendTransaction(await tx.buildAndSign(umi));
    }
})();