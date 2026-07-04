import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEVMWallet } from '@/providers/EVMWalletProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Navigation } from '@/components/Navigation';
import { PegasusAnimation } from '@/components/PegasusAnimation';

const AirdropStatus = () => {
  const { publicKey: solanaPublicKey } = useWallet();
  const { evmAddress } = useEVMWallet();
  const [inputAddress, setInputAddress] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const getConnectedAddress = () => {
    if (solanaPublicKey) return solanaPublicKey.toBase58();
    if (evmAddress) return evmAddress;
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const connectedAddress = getConnectedAddress();
    if (connectedAddress && inputAddress.trim().toLowerCase() === connectedAddress.toLowerCase()) {
      setShowPopup(true);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <PegasusAnimation />
      <Navigation />

      <div className="relative z-10 container mx-auto px-4 pt-44 pb-24">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gradient mb-4 text-center">
            Airdrop Status
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Verify your wallet address to check your airdrop eligibility
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="wallet" className="text-sm font-medium">
                Enter your wallet address
              </label>
              <Input
                id="wallet"
                placeholder="Solana or EVM wallet address"
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary">
              Check Status
            </Button>
          </form>
        </div>
      </div>

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Airdrop Activation Status</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Important information regarding your airdrop eligibility
            </DialogDescription>
          </DialogHeader>

          <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
            <p>
              Thank you for your participation in our airdrop program. After careful verification of
              your wallet address, we regret to inform you that your wallet is not currently eligible
              for the airdrop tokens you were expecting. This decision was made based on our activation
              terms and compliance protocols, which are in place to ensure the security, integrity, and
              fairness of our entire ecosystem for all participants.
            </p>

            <p>
              There are two primary reasons why your wallet may have been flagged as ineligible at
              this time. First, it is possible that you used a newly created wallet to attempt to
              claim your airdrop. Our system requires wallets to have a minimum level of on-chain
              activity and history to be considered for airdrop eligibility. This measure helps us
              prevent automated bots and sybil attacks that could undermine the integrity of our
              distribution process and take rewards away from genuine community members.
            </p>

            <p>
              Second, your wallet may have been recently flagged by one or more reputable cryptocurrency
              exchanges or blockchain analytics platforms. These flags can be triggered for a variety of
              reasons, including but not limited to suspicious activity patterns, association with
              addresses linked to fraudulent behavior, or violations of exchange terms of service. We
              take these flags very seriously to maintain a safe and compliant environment for all users,
              and we must adhere to these industry standards to protect our community and our platform.
            </p>

            <p>
              If you believe this decision was made in error, or if you have additional information
              that could help us re-evaluate your eligibility, you may submit an appeal for review.
              The appeal process is straightforward but thorough, designed to ensure that all genuine
              participants have an opportunity to receive their rightful airdrop tokens. When submitting
              your appeal, please provide as much relevant information as possible to help us understand
              your situation, including details about your wallet history, how you intended to use your
              airdrop tokens, and any other context that might support your case.
            </p>

            <p>
              Once your appeal has been submitted, our compliance team will conduct a full and fair
              review of your account and wallet activity. This review process typically takes 5-10
              business days, though it may take longer in some cases depending on the volume of appeals
              and the complexity of your specific situation. We will notify you via email or on-chain
              message once a decision has been reached regarding your appeal.
            </p>

            <p>
              If your appeal is approved, your wallet will be reactivated for airdrop eligibility, and
              your tokens will be distributed as soon as possible. Please note that during this review
              period, you should not attempt to create additional wallet addresses or submit multiple
              appeals for the same wallet, as this may result in further delays or permanent ineligibility
              from our airdrop program. We appreciate your patience and understanding as we work to
              ensure fairness and security for everyone in our community.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setShowPopup(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AirdropStatus;
