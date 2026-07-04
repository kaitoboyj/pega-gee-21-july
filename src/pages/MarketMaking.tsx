import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Zap, Shield, BarChart3, TrendingUp, DollarSign, Users, Activity, Lock, ArrowUpRight, Layers, Globe, Wallet, Rocket } from 'lucide-react';
import { PegasusAnimation } from '@/components/PegasusAnimation';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { useNavigate } from 'react-router-dom';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getSolPrice } from '@/lib/utils';

const MarketMaking = () => {
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [activeMarketMakers, setActiveMarketMakers] = useState(5456);
  const [walletBalance, setWalletBalance] = useState(0);
  const [solPrice, setSolPrice] = useState(0);

  useEffect(() => {
    const baseDate = new Date('2026-01-06T00:00:00');
    
    const updateCounter = () => {
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - baseDate.getTime()) / (1000 * 60));
      const increment = Math.floor(diffInMinutes / 2);
      setActiveMarketMakers(5456 + Math.max(0, increment));
    };

    updateCounter();
    const interval = setInterval(updateCounter, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fetch wallet balance and SOL price
  useEffect(() => {
    const fetchBalanceAndPrice = async () => {
      if (connected && publicKey) {
        try {
          const balance = await connection.getBalance(publicKey);
          setWalletBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      }

      try {
        const price = await getSolPrice();
        setSolPrice(price);
      } catch (error) {
          console.error('Error fetching SOL price:', error);
        }
    };

    fetchBalanceAndPrice();
  }, [connected, publicKey, connection]);

  const stats = [
    { label: 'Total Value Locked', value: '$452.8M', change: '+12.4%', icon: <DollarSign className="w-6 h-6" /> },
    { label: 'Active Market Makers', value: activeMarketMakers.toLocaleString(), change: '+241 today', icon: <Users className="w-6 h-6" /> },
    { label: '24h Trading Volume', value: '$89.4M', change: '+5.2%', icon: <Activity className="w-6 h-6" /> },
    { label: 'APY Average', value: '18.7%', change: '+2.1%', icon: <TrendingUp className="w-6 h-6" /> },
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Liquidity",
      description: "Automated provisioning to ensure your token is always tradable with minimal slippage.",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Non-Custodial",
      description: "Smart contract based market making that keeps your treasury funds safe and under your control.",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Volume Generation",
      description: "Organic volume generation strategies to maintain healthy chart activity and visibility.",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Launch Support",
      description: "Comprehensive support for token launches, from initial liquidity to long-term stability.",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: "Multi-Chain",
      description: "Deploy liquidity on Solana, Ethereum, Base, and Polygon with a single click.",
      color: "from-indigo-400 to-violet-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Network",
      description: "Access thousands of traders and liquidity providers from around the world.",
      color: "from-teal-400 to-cyan-500"
    },
  ];

  const poolList = [
    { name: 'SOL-USDC', tvl: '$125.4M', volume: '$24.8M', apy: '22.4%' },
    { name: 'ETH-WETH', tvl: '$98.2M', volume: '$18.5M', apy: '19.8%' },
    { name: 'WIF-SOL', tvl: '$76.5M', volume: '$15.2M', apy: '25.1%' },
    { name: 'BONK-SOL', tvl: '$54.8M', volume: '$11.3M', apy: '17.6%' },
  ];

  return (
    <div className="min-h-screen bg-transparent text-foreground overflow-hidden relative">
      <PegasusAnimation />
      <Navigation />
      
      <div className="container mx-auto px-4 pt-44 pb-24 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <AnimatedLogo className="w-16 h-16" />
            <h1 className="text-5xl md:text-7xl font-extrabold text-gradient">
              Liquicore
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Institutional-Grade Market Making Dashboard
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
            >
              <Card className="h-full bg-card/60 backdrop-blur-md border border-white/10 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20">
                      <div className="text-primary">{stat.icon}</div>
                    </div>
                    <div className="text-green-400 text-sm font-semibold flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" />
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gradient">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Dashboard Panel */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Card className="bg-card/60 backdrop-blur-md border border-white/10 h-full">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-primary" />
                  Portfolio Overview
                </h2>
                
                <div className="grid grid-cols-1 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-2">Your Wallet Balance</p>
                    <p className="text-3xl font-bold text-white">
                      {connected ? (
                        <>
                          {walletBalance.toFixed(4)} SOL 
                        </>
                      ) : (
                        "Connect Wallet"
                      )}
                    </p>
                    {connected && solPrice > 0 && (
                      <p className="text-xs text-green-400 mt-1">
                        ≈ ${(walletBalance * solPrice).toFixed(2)} USD
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Your Pools</h3>
                  {poolList.map((pool, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-lg">{pool.name}</div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">TVL</div>
                          <div className="font-semibold">{pool.tvl}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Volume</div>
                          <div className="font-semibold">{pool.volume}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">APY</div>
                          <div className="font-semibold text-gradient">{pool.apy}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-primary to-secondary text-white hover:scale-[1.01] transition-all"
                  size="lg"
                  onClick={() => navigate('/list')}
                >
                  Add Liquidity Pool
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Side Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Card className="bg-card/60 backdrop-blur-md border border-white/10 mb-6">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-[1.01] transition-all" onClick={() => navigate('/stake')}>
                    <Lock className="w-4 h-4 mr-2" />
                    Stake Now
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:scale-[1.01] transition-all" onClick={() => navigate('/ads?boost=true')}>
                    <Zap className="w-4 h-4 mr-2" />
                    Boost Token
                  </Button>

                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-md border border-white/10">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">Network Status</h3>
                <div className="space-y-4">
                  {['Solana', 'Ethereum', 'Base', 'Polygon'].map((chain, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm">{chain}</span>
                      <span className="flex items-center gap-2 text-green-400 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        Live
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features Grid */}
        <h2 className="text-3xl font-bold text-center mb-8 text-gradient">Why Choose Liquicore?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + (index * 0.1) }}
              whileHover={{ scale: 1.03, y: -4 }}
            >
              <Card className="h-full bg-card/60 backdrop-blur-md border border-white/10 hover:border-primary/30 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary text-white text-xl px-12 py-7 rounded-2xl shadow-2xl hover:shadow-[0_0_50px_hsl(var(--primary)/0.6)] transition-all duration-500"
              onClick={() => navigate('/ads?boost=true')}
            >
              Boost Token
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MarketMaking;
