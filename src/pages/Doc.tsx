import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { PegasusAnimation } from '@/components/PegasusAnimation';
import { motion } from 'framer-motion';

const Doc = () => {
  const [openSection, setOpenSection] = useState<number | null>(0);

  const sections = [
    {
      id: 0,
      title: '1. Introduction to Pegasus Swap',
      content: [
        'Pegasus Swap is a cutting-edge decentralized finance (DeFi) platform designed to revolutionize the way users interact with blockchain-based assets. With a comprehensive suite of tools and features, Pegasus Swap provides a one-stop destination for swapping tokens, accessing over-the-counter (OTC) trading services, and participating in crypto market making initiatives that drive token growth and project development.',
        'In the ever-evolving world of decentralized finance, having a reliable, feature-rich platform is essential for both new and experienced users. Pegasus Swap combines intuitive user interfaces with powerful backend infrastructure to deliver an unparalleled trading experience. Whether you\'re looking to swap tokens quickly and efficiently, engage in OTC trades for large orders without slippage, or participate in market making to boost your project\'s visibility and liquidity, Pegasus Swap has you covered.',
        'The platform\'s name, inspired by the mythical winged horse Pegasus, embodies our vision of soaring above traditional financial barriers. Pegasus Swap represents freedom, speed, and innovation in the DeFi space. Just as Pegasus was a symbol of power and agility in ancient mythology, our platform aims to empower users with the tools they need to navigate the complex world of decentralized finance with ease and confidence.',
        'Built on cutting-edge blockchain technology, Pegasus Swap offers a secure, transparent, and efficient ecosystem for users to manage their digital assets. Our commitment to security, reliability, and user experience sets us apart from other DeFi platforms, making Pegasus Swap the preferred choice for traders, investors, and project developers alike.'
      ]
    },
    {
      id: 1,
      title: '2. Real Swap: The Core Trading Engine',
      content: [
        'At the heart of Pegasus Swap is our Real Swap feature, a sophisticated token swapping engine powered by Jupiter, the leading decentralized exchange (DEX) aggregator on Solana. Real Swap provides users with access to the best possible token swap rates by aggregating liquidity from multiple DEXs across the Solana ecosystem.',
        'Unlike traditional DEXs that rely on a single liquidity pool, Real Swap scans all available DEXs simultaneously to find the optimal route for your token swap. This means you always get the best possible price, with minimal slippage and maximum efficiency. The integration with Jupiter ensures that every swap is executed with precision and speed, giving you the confidence that you\'re getting the most out of your trades.',
        'The Real Swap interface is designed with user experience in mind. Whether you\'re a seasoned trader or new to DeFi, you\'ll find the platform intuitive and easy to use. The clean, modern design allows you to focus on what matters most: your trades. With clear visuals, real-time price updates, and straightforward controls, swapping tokens has never been easier.',
        'One of the key benefits of using Real Swap is its ability to handle large volume trades without significant slippage. By splitting orders across multiple liquidity pools, Real Swap ensures that even substantial trades are executed at fair market prices. This is particularly important for institutional traders and large holders who need to move significant amounts of capital without negatively impacting the market.',
        'In addition to its powerful swapping capabilities, Real Swap also features a user-friendly token search function, allowing you to quickly find and select the tokens you want to trade. With support for thousands of tokens on the Solana network, you\'ll never be limited in your trading options. Whether you\'re looking for well-established tokens or newly launched projects, Real Swap has you covered.'
      ]
    },
    {
      id: 2,
      title: '3. OTC Trading: Over-the-Counter Solutions',
      content: [
        'For users looking to execute large volume trades without the slippage typically associated with traditional DEXs, Pegasus Swap offers a comprehensive OTC (Over-the-Counter) trading platform. OTC trading allows buyers and sellers to transact directly with each other, often with the assistance of a broker or intermediary, to execute large orders at negotiated prices.',
        'One of the biggest advantages of OTC trading is that it allows you to execute large orders without significantly impacting the market price. When you trade large amounts on a traditional DEX, the size of your order can move the market against you, resulting in slippage and a less favorable price. With OTC trading, you can negotiate a fixed price for your entire order, ensuring that you get the exact amount you want at the price you agreed upon.',
        'Pegasus Swap\'s OTC platform connects buyers and sellers in a secure, transparent environment. Whether you\'re looking to buy or sell large quantities of tokens, our OTC platform provides the tools and resources you need to execute trades efficiently and securely. With support for a wide range of tokens on the Solana network, you can trade virtually any asset you\'re interested in.'
      ]
    },
    {
      id: 3,
      title: '4. Crypto Market Making: Boosting Token Growth',
      content: [
        'For project developers and token issuers, one of the biggest challenges is establishing and maintaining liquidity for their token. Without sufficient liquidity, tokens can become illiquid, making it difficult for users to buy or sell, and potentially hindering the project\'s growth. That\'s where Pegasus Swap\'s Crypto Market Making program comes in.',
        'Market making is the practice of providing liquidity to a market by simultaneously placing buy and sell orders for a particular asset. In return for providing this liquidity, market makers earn the spread between the bid and ask price. Market making plays a crucial role in ensuring that markets remain liquid and efficient, and Pegasus Swap\'s market making program is designed to help projects achieve just that.'
      ]
    },
    {
      id: 4,
      title: '5. The Pegasus Swap Ecosystem',
      content: [
        'Pegasus Swap is more than just a DEX or a single service—it\'s a comprehensive ecosystem designed to support the growth and development of the entire Solana DeFi community. From swapping tokens to market making, OTC trading to project support, Pegasus Swap provides a wide range of services and resources to help users and projects succeed.'
      ]
    },
    {
      id: 5,
      title: '6. Getting Started with Pegasus Swap',
      content: [
        'Getting started with Pegasus Swap is easy and straightforward. In just a few simple steps, you can be up and running, swapping tokens, participating in OTC trades, or joining our market making program. Whether you\'re completely new to DeFi or an experienced user, you\'ll find the platform intuitive and easy to use.'
      ]
    },
    {
      id: 6,
      title: '7. Security and Safety on Pegasus Swap',
      content: [
        'Security is our top priority at Pegasus Swap. We understand that when you use our platform, you\'re trusting us with your valuable digital assets, and we take that responsibility very seriously. That\'s why we\'ve implemented a comprehensive set of security measures to protect our users and their funds.'
      ]
    },
    {
      id: 7,
      title: '8. The Future of Pegasus Swap',
      content: [
        'The world of decentralized finance is constantly evolving, and at Pegasus Swap, we\'re committed to staying at the forefront of that evolution. We have an ambitious roadmap for the future, with plans to add new features and services, expand our ecosystem, and continue to innovate and improve the platform.'
      ]
    },
    {
      id: 8,
      title: '9. Conclusion',
      content: [
        'In this documentation, we\'ve provided a comprehensive overview of Pegasus Swap and its many features and services. From our powerful Real Swap engine powered by Jupiter, to our OTC trading platform, to our Crypto Market Making program for boosting token growth, Pegasus Swap provides a one-stop destination for all your DeFi needs.',
        'Welcome to Pegasus Swap—where the future of decentralized finance takes flight!'
      ]
    }
  ];

  const toggleSection = (id: number) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <PegasusAnimation />
      <Navigation />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient mb-4">
              Pegasus Swap Documentation
            </h1>
            <p className="text-xl text-muted-foreground">
              Your complete guide to navigating the Pegasus Swap ecosystem
            </p>
          </motion.div>
          
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 transition-all"
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      {section.title}
                    </h2>
                    <motion.div
                      animate={{ rotate: openSection === section.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-2xl text-primary"
                    >
                      ▼
                    </motion.div>
                  </button>
                  {openSection === section.id && (
                    <div className="px-6 py-5 text-muted-foreground">
                      <div className="space-y-4">
                        {section.content.map((paragraph, i) => (
                          <p key={i} className="leading-relaxed text-base sm:text-lg">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-12 text-center"
          >
            <div className="glass-card rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-gradient mb-4">
                Need help?
              </h3>
              <p className="text-muted-foreground mb-6">
                If you have any questions, our support team is here for you 24/7.
              </p>
              <button className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:scale-105 transition-transform">
                Contact Support
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Doc;
