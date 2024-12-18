import dotenv from 'dotenv';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { homedir } from 'os';
import { readFileSync } from 'fs';
import { mplToolbox } from '@metaplex-foundation/mpl-toolbox';

// Load environment variables from .env file
dotenv.config();

export const NETWORK = {
    MAINNET: process.env.RPC_URL_MAINNET,
    DEVNET: process.env.RPC_URL_DEVNET
} as const;

export const getNetwork = () => {
    return process.env.SOLANA_NETWORK === 'mainnet' 
        ? NETWORK.MAINNET 
        : NETWORK.DEVNET;
};

export const createUmiInstance = () => {
    const network = getNetwork();
    const umi = createUmi(network, "finalized").use(mplToolbox());
    
    const walletOption = process.env.WALLET;
    let secretKey;
    switch (walletOption) {
        case 'local':
            secretKey = getLocalWallet();
            break;
        default:
            secretKey = getAdvenCalenderWallet(walletOption);
            break;
    }
    
    return { umi, secretKey };
};

const getAdvenCalenderWallet = (prefix: string) => {
    const secretKey = require(`../../.keys/${process.env.WALLET}-wallet.json`);

    const secretKeyBuffer = Buffer.from(secretKey.privateKey, 'base64');
    const secretKeyUint8Array = new Uint8Array(secretKeyBuffer);

    return secretKeyUint8Array;
}

const getLocalWallet = () => {
    const secretKey = JSON.parse(
        readFileSync(`${homedir()}/.config/solana/id.json`, 'utf-8')
    );

    return secretKey;
}
