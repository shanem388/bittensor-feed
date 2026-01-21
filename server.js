const express = require('express');
const cron = require('node-cron');
const path = require('path');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// Fallback articles (will be supplemented by live scraping)
let articles = [
  { title: "Astrid Intelligence Expands Decentralized AI Operations on Bittensor", url: "https://ca.investing.com/news/company-news/astrid-intelligence-expands-decentralized-ai-operations-on-bittensor-93CH-4384364", source: "Investing.com", dateFormatted: "January 11, 2026", timestamp: new Date("2026-01-11").getTime(), category: "subnet" },
  { title: "Grayscale Launches Bittensor Trust: Is Decentralized AI the Next Big Bet?", url: "https://ambcrypto.com/grayscale-launches-bittensor-trust-is-decentralized-ai-the-next-big-bet/", source: "AMBCrypto", dateFormatted: "January 7, 2026", timestamp: new Date("2026-01-07").getTime(), category: "institutional" },
  { title: "Loosh AI Launches on Bittensor Subnet 78 with Yuma Accelerator Support", url: "https://www.thestreet.com/crypto/newsroom/loosh-ai-builds-the-cognition-layer-launching-on-bittensor", source: "TheStreet", dateFormatted: "January 11, 2026", timestamp: new Date("2026-01-11").getTime(), category: "subnet" },
  { title: "GTAO: The 227% Anomaly - Why Wall Street is Paying Triple for Bittensor", url: "https://subnetedge.substack.com/p/gtao-the-227-anomaly", source: "SubnetEdge", dateFormatted: "January 9, 2026", timestamp: new Date("2026-01-09").getTime(), category: "institutional" },
  { title: "Bittensor Teams Up with HackQuest to Launch Global Subnet Ideathon", url: "https://chainwire.org/2026/01/09/bittensor-teams-up-with-hackquest-to-launch-global-subnet-ideathon-and-learning-path/", source: "Chainwire", dateFormatted: "January 9, 2026", timestamp: new Date("2026-01-09").getTime(), category: "partnership" },
  { title: "Why Bittensor (TAO) Could Be One of the Best Crypto Plays in the AI Sector", url: "https://captainaltcoin.com/why-bittensor-tao-could-be-one-of-the-best-crypto-plays-in-the-ai-sector/", source: "CaptainAltcoin", dateFormatted: "January 9, 2026", timestamp: new Date("2026-01-09").getTime(), category: "ecosystem" },
  { title: "The 2026 Guide to Bittensor Wallets: Which One Fits You?", url: "https://www.abittensorjourney.com/p/the-2026-guide-to-bittensor-wallets", source: "A Bittensor Journey", dateFormatted: "January 8, 2026", timestamp: new Date("2026-01-08").getTime(), category: "ecosystem" },
  { title: "Bittensor Jumps 10% After Grayscale Officially Unveils TAO Trust", url: "https://finance.yahoo.com/news/bittensor-jumps-10-grayscale-officially-220933599.html", source: "Yahoo Finance", dateFormatted: "January 6, 2026", timestamp: new Date("2026-01-06").getTime(), category: "institutional" },
  { title: "VERIFIED: The $1.3M Signal - Chutes Revenue, DSperse Rebrand, Tenexium Deregistration", url: "https://subnetedge.substack.com/p/verified-the-13m-signal", source: "SubnetEdge", dateFormatted: "January 5, 2026", timestamp: new Date("2026-01-05").getTime(), category: "subnet" },
  { title: "Bittensor and HackQuest Launch Build on Bittensor Developer Program", url: "https://www.chaincatcher.com/en/article/2234753", source: "ChainCatcher", dateFormatted: "January 5, 2026", timestamp: new Date("2026-01-05").getTime(), category: "partnership" },
  { title: "EXPLOIT: Subnet 67 Tenexium Exit Results in $2.8M Loss - Full Investigation", url: "https://subnetedge.substack.com/p/exploit", source: "SubnetEdge", dateFormatted: "January 4, 2026", timestamp: new Date("2026-01-04").getTime(), category: "security" },
  { title: "Grayscale Investments Focuses On Decentralized AI With Bittensor Trust ETF Filing", url: "https://www.crowdfundinsider.com/2026/01/257026-grayscale-investments-focuses-on-decentralized-ai-with-bittensor-trust-etf-filing/", source: "CrowdFund Insider", dateFormatted: "January 4, 2026", timestamp: new Date("2026-01-04").getTime(), category: "institutional" },
  { title: "Grayscale Files for Bittensor Spot ETF Under GTAO Ticker", url: "https://finance.yahoo.com/news/grayscale-files-bittensor-spot-etf-114048967.html", source: "Yahoo Finance", dateFormatted: "January 3, 2026", timestamp: new Date("2026-01-03").getTime(), category: "institutional" },
  { title: "Understanding and Mastering SubnetEdge Recon: Daily Intelligence Guide", url: "https://subnetedge.substack.com/p/understanding-and-mastering-subnetedge", source: "SubnetEdge", dateFormatted: "December 31, 2025", timestamp: new Date("2025-12-31").getTime(), category: "research" },
  { title: "Bitwise Files for 11 New Crypto ETFs Tracking Bittensor, Tron and Others", url: "https://www.theblock.co/post/384026/bitwise-crypto-strategy-etfs", source: "The Block", dateFormatted: "December 31, 2025", timestamp: new Date("2025-12-31").getTime(), category: "institutional" },
  { title: "Bitwise Eyes AI and DeFi Tokens with 11 New Crypto Strategy ETFs", url: "https://www.coindesk.com/markets/2025/12/31/bitwise-files-for-11-strategy-etfs-tracking-tokens-including-aave-zec-tao", source: "CoinDesk", dateFormatted: "December 31, 2025", timestamp: new Date("2025-12-31").getTime(), category: "institutional" },
  { title: "Grayscale Files Registration for Bittensor ETP", url: "https://cointelegraph.com/news/grayscale-bittensor-etp-filing-sec", source: "Cointelegraph", dateFormatted: "December 30, 2025", timestamp: new Date("2025-12-30").getTime(), category: "institutional" },
  { title: "Grayscale Files for Spot Bittensor ETF Following Network's First Halving", url: "https://www.theblock.co/post/383965/grayscale-files-spot-bittensor-etf-networks-first-halving-event", source: "The Block", dateFormatted: "December 30, 2025", timestamp: new Date("2025-12-30").getTime(), category: "institutional" },
  { title: "Grayscale Seeks U.S. Listing for Bittensor ETP in First Institutional Bet on Decentralized AI", url: "https://www.coindesk.com/business/2025/12/30/grayscale-files-for-first-u-s-bittensor-etp-as-decentralized-ai-gains-momentum", source: "CoinDesk", dateFormatted: "December 30, 2025", timestamp: new Date("2025-12-30").getTime(), category: "institutional" },
  { title: "REALITY CHECK: MEV Shield Activated, Chutes Dominates, Dojo Suspends Operations", url: "https://subnetedge.substack.com/p/reality-check", source: "SubnetEdge", dateFormatted: "December 28, 2025", timestamp: new Date("2025-12-28").getTime(), category: "subnet" },
  { title: "FLOW OR DIE: Code Over Narrative in the Post-Halving Era", url: "https://subnetedge.substack.com/p/flow-or-die", source: "SubnetEdge", dateFormatted: "December 26, 2025", timestamp: new Date("2025-12-26").getTime(), category: "ecosystem" },
  { title: "Theses 2026: Crypto x AI – Why BitTensor Could Be the Bitcoin of Open AI Competition", url: "https://messari.io/research/newsletter-and-podcast", source: "Messari", dateFormatted: "December 23, 2025", timestamp: new Date("2025-12-23").getTime(), category: "research" },
  { title: "TAO is Down, So What? Darwinian Selection and Holder Conviction Post-Halving", url: "https://subnetedge.substack.com/p/tao-is-down-so-what", source: "SubnetEdge", dateFormatted: "December 21, 2025", timestamp: new Date("2025-12-21").getTime(), category: "ecosystem" },
  { title: "Bittensor 2025 End of Year Report Card", url: "https://www.abittensorjourney.com/p/bittensor-2025-end-of-year-report", source: "A Bittensor Journey", dateFormatted: "December 20, 2025", timestamp: new Date("2025-12-20").getTime(), category: "ecosystem" },
  { title: "CONTRACTION: Bittensor Crosses First Scarcity Threshold - Halving Week Analysis", url: "https://subnetedge.substack.com/p/contraction", source: "SubnetEdge", dateFormatted: "December 15, 2025", timestamp: new Date("2025-12-15").getTime(), category: "protocol" },
  { title: "Bittensor Expands to 129 Active Subnets Across Compute, Storage, and AI Agents", url: "https://research.grayscale.com/reports/bittensor-on-the-eve-of-the-first-halving", source: "Grayscale Research", dateFormatted: "December 15, 2025", timestamp: new Date("2025-12-15").getTime(), category: "subnet" },
  { title: "Happy Holidays & a Lifetime Gift: SubnetEdge Hits #40 in Technology", url: "https://subnetedge.substack.com/p/happy-holidays-and-a-lifetime-gift", source: "SubnetEdge", dateFormatted: "December 14, 2025", timestamp: new Date("2025-12-14").getTime(), category: "ecosystem" },
  { title: "Bittensor Completes First Halving, Cuts Daily TAO Emissions by 50%", url: "https://www.theblock.co/post/383965/grayscale-files-spot-bittensor-etf-networks-first-halving-event", source: "The Block", dateFormatted: "December 14, 2025", timestamp: new Date("2025-12-14").getTime(), category: "protocol" },
  { title: "Grayscale Bittensor Trust (GTAO) Begins Trading on OTCQX Market", url: "https://messari.io/project/bittensor", source: "Messari", dateFormatted: "December 11, 2025", timestamp: new Date("2025-12-11").getTime(), category: "institutional" },
  { title: "Macrocosmos Index on Menta+: How Apex, Iota, and Data Universe Generate 106% APY", url: "https://subnetedge.substack.com/p/macrocosmos-index-on-menta-dont-just", source: "SubnetEdge", dateFormatted: "December 10, 2025", timestamp: new Date("2025-12-10").getTime(), category: "subnet" },
  { title: "Chutes Emerges as Leading Inference Provider on OpenRouter via Bittensor", url: "https://research.grayscale.com/reports/bittensor-on-the-eve-of-the-first-halving", source: "Grayscale Research", dateFormatted: "December 10, 2025", timestamp: new Date("2025-12-10").getTime(), category: "subnet" },
  { title: "CRUNCH TIME: T-Minus 4 Days to Halving - Dippy at 9M Users, Grayscale Filing", url: "https://subnetedge.substack.com/p/crunch-time", source: "SubnetEdge", dateFormatted: "December 8, 2025", timestamp: new Date("2025-12-08").getTime(), category: "protocol" },
  { title: "Bittensor Set for First TAO Halving on Dec. 14", url: "https://cointelegraph.com/news/crypto-other-halving-bittensor-maturation-milestone", source: "Cointelegraph", dateFormatted: "December 7, 2025", timestamp: new Date("2025-12-07").getTime(), category: "protocol" },
  { title: "VoidAI SN106: Bittensor's Deflationary Liquidity Engine - Cross-Chain Composability", url: "https://subnetedge.substack.com/p/voidai-sn106-bittensors-deflationary", source: "SubnetEdge", dateFormatted: "December 5, 2025", timestamp: new Date("2025-12-05").getTime(), category: "subnet" },
  { title: "Bittensor on the Eve of the First Halving - Grayscale Research Report", url: "https://research.grayscale.com/reports/bittensor-on-the-eve-of-the-first-halving", source: "Grayscale Research", dateFormatted: "December 3, 2025", timestamp: new Date("2025-12-03").getTime(), category: "research" },
  { title: "IOTA: From 70 Miners to Millions - Training at Home + Base Integration by Q1 2026", url: "https://subnetedge.substack.com/p/iota-from-70-miners-to-millions", source: "SubnetEdge", dateFormatted: "December 3, 2025", timestamp: new Date("2025-12-03").getTime(), category: "subnet" },
  { title: "The Week Bittensor Grew: Alpha Tokens Get Access to $4.3B Base Infrastructure", url: "https://subnetedge.substack.com/p/the-week-bittensor-grew", source: "SubnetEdge", dateFormatted: "November 23, 2025", timestamp: new Date("2025-11-23").getTime(), category: "ecosystem" },
  { title: "Project Rubicon: Bittensor Meets Global Liquidity", url: "https://subnetedge.substack.com/p/project-rubicon-bittensor-meets-global", source: "SubnetEdge", dateFormatted: "November 19, 2025", timestamp: new Date("2025-11-19").getTime(), category: "partnership" },
  { title: "Execution: Revenue Subnets Winning, Infrastructure Live, Halving in 25 Days", url: "https://subnetedge.substack.com/p/execution", source: "SubnetEdge", dateFormatted: "November 16, 2025", timestamp: new Date("2025-11-16").getTime(), category: "research" },
  { title: "James Altucher & JJ: Bittensor, the Open Source 2.0 Reinventing Capitalism", url: "https://subnetedge.substack.com/p/james-altucher-and-jj-bittensor-the", source: "SubnetEdge", dateFormatted: "November 13, 2025", timestamp: new Date("2025-11-13").getTime(), category: "ecosystem" },
  { title: "Bittensor's Financial Infrastructure: Mapping Capital Access Points", url: "https://subnetedge.substack.com/p/bittensors-financial-infrastructure", source: "SubnetEdge", dateFormatted: "November 4, 2025", timestamp: new Date("2025-11-04").getTime(), category: "research" },
  { title: "Bittensor Subnets: Strategic Analysis - Data and Market Intelligence", url: "https://subnetedge.substack.com/p/bittensor-subnets-strategic-analysis", source: "SubnetEdge", dateFormatted: "November 3, 2025", timestamp: new Date("2025-11-03").getTime(), category: "research" },
  { title: "Bittensor From Vision to Execution: Incentive Layer's Evolution", url: "https://subnetedge.substack.com/p/bittensor-from-vision-to-execution", source: "SubnetEdge", dateFormatted: "November 1, 2025", timestamp: new Date("2025-11-01").getTime(), category: "research" },
  { title: "Inside Actual Computer Subnet 95: The Quietest High-Conviction Bet (+110%)", url: "https://subnetedge.substack.com/p/inside-actual-computer-subnet-95", source: "SubnetEdge", dateFormatted: "October 29, 2025", timestamp: new Date("2025-10-29").getTime(), category: "subnet" },
  { title: "Bittensor's Path Forward: Dynamic TAO and Smart Contracts", url: "https://messari.io/report/bittensor-s-path-forward-dynamic-tao-and-smart-contracts", source: "Messari", dateFormatted: "October 24, 2025", timestamp: new Date("2025-10-24").getTime(), category: "protocol" },
  { title: "Deutsche Digital Assets Launches Bittensor Staked TAO ETP on SIX Swiss Exchange", url: "https://finance.yahoo.com/news/grayscale-files-bittensor-spot-etf-114048967.html", source: "Yahoo Finance", dateFormatted: "October 15, 2025", timestamp: new Date("2025-10-15").getTime(), category: "institutional" },
  { title: "Yuma Asset Management Launches Fund for Bittensor Subnet Exposure", url: "https://research.grayscale.com/reports/bittensor-on-the-eve-of-the-first-halving", source: "Grayscale Research", dateFormatted: "October 12, 2025", timestamp: new Date("2025-10-12").getTime(), category: "institutional" },
  { title: "Novelty Search 064: Targon and the Rise of Trusted Compute on Bittensor", url: "https://subnetedge.substack.com/p/novelty-search-064-targon-and-the", source: "SubnetEdge", dateFormatted: "October 10, 2025", timestamp: new Date("2025-10-10").getTime(), category: "subnet" },
  { title: "Stillcore Capital Launches Investment Fund Focused on Subnet Tokens", url: "https://research.grayscale.com/reports/bittensor-on-the-eve-of-the-first-halving", source: "Grayscale Research", dateFormatted: "October 10, 2025", timestamp: new Date("2025-10-10").getTime(), category: "institutional" },
  { title: "Grayscale Files Form 10 with SEC for Bittensor Trust", url: "https://research.grayscale.com/reports/bittensor-on-the-eve-of-the-first-halving", source: "Grayscale Research", dateFormatted: "October 8, 2025", timestamp: new Date("2025-10-08").getTime(), category: "institutional" },
  { title: "Bittensor (TAO) Leads AI Token Rally with 160%+ Monthly Gain", url: "https://cointelegraph.com/news/bittensor-tao-leads-ai-token-rally-with-160-monthly-gain", source: "Cointelegraph", dateFormatted: "October 7, 2025", timestamp: new Date("2025-10-07").getTime(), category: "ecosystem" },
  { title: "Hippius Becomes First Bittensor Subnet Token Listed on Centralized Exchange", url: "https://research.grayscale.com/reports/bittensor-on-the-eve-of-the-first-halving", source: "Grayscale Research", dateFormatted: "October 5, 2025", timestamp: new Date("2025-10-05").getTime(), category: "subnet" },
  { title: "TGIFT: Goodbye Free Lunch, Hello Fat Stack - Bittensor Town Hall Recap", url: "https://subnetedge.substack.com/p/tgift-goodbye-free-lunch-hello-fat", source: "SubnetEdge", dateFormatted: "October 3, 2025", timestamp: new Date("2025-10-03").getTime(), category: "ecosystem" },
  { title: "Bittensor Ecosystem Surges With Subnet Expansion, Institutional Access - Yuma Report", url: "https://www.coindesk.com/business/2025/09/13/bittensor-ecosystem-surges-with-subnet-expansion-institutional-access", source: "CoinDesk", dateFormatted: "September 15, 2025", timestamp: new Date("2025-09-15").getTime(), category: "ecosystem" },
  { title: "Bittensor Subnets: Building Real Utility Amid the Battle", url: "https://subnetedge.substack.com/p/bittensor-subnets-building-real-utility", source: "SubnetEdge", dateFormatted: "September 4, 2025", timestamp: new Date("2025-09-04").getTime(), category: "subnet" },
  { title: "Subnet 26: From Digital Art to Decentralized Robotics", url: "https://subnetedge.substack.com/p/subnet-26-from-digital-art-to-decentralized", source: "SubnetEdge", dateFormatted: "August 27, 2025", timestamp: new Date("2025-08-27").getTime(), category: "subnet" },
  { title: "Manifesto: Decentralized AI is Not a Slogan, It is a Protocol", url: "https://subnetedge.substack.com/p/manifesto", source: "SubnetEdge", dateFormatted: "August 26, 2025", timestamp: new Date("2025-08-26").getTime(), category: "research" },
  { title: "UK Company Satsuma Technology Raises $135M, Runs Bittensor Subnets", url: "https://cointelegraph.com/news/uk-firm-smashes-2025-local-bitcoin-treasury-record-with-135m-raise", source: "Cointelegraph", dateFormatted: "July 24, 2025", timestamp: new Date("2025-07-24").getTime(), category: "subnet" },
  { title: "Subnet 33: ReadyAI - Messari Research Report", url: "https://messari.io/project/bittensor/research", source: "Messari", dateFormatted: "June 25, 2025", timestamp: new Date("2025-06-25").getTime(), category: "research" },
  { title: "DNA Fund is 'Entrenched' in Bittensor, Decentralized AI, CEO Says", url: "https://cointelegraph.com/news/decentralized-ai-bittensor-dna-fund-ceo", source: "Cointelegraph", dateFormatted: "May 26, 2025", timestamp: new Date("2025-05-26").getTime(), category: "institutional" },
  { title: "Subnet 14: TAO Hash - Messari Research Report", url: "https://messari.io/project/bittensor/research", source: "Messari", dateFormatted: "May 16, 2025", timestamp: new Date("2025-05-16").getTime(), category: "research" },
  { title: "Rayon Labs: The Subnet Trifecta - Messari Research Report", url: "https://messari.io/project/bittensor/research", source: "Messari", dateFormatted: "April 25, 2025", timestamp: new Date("2025-04-25").getTime(), category: "research" },
  { title: "Dynamic TAO (dTAO) Upgrade Enables Subnets to Become Directly Investible", url: "https://research.grayscale.com/reports/bittensor-on-the-eve-of-the-first-halving", source: "Grayscale Research", dateFormatted: "February 15, 2025", timestamp: new Date("2025-02-15").getTime(), category: "protocol" },
  { title: "Beyond the Cluster: Reimagining AI Training in a Decentralized World", url: "https://messari.io/project/bittensor/research", source: "Messari", dateFormatted: "February 13, 2025", timestamp: new Date("2025-02-13").getTime(), category: "research" },
  { title: "DCG Backs TaoFi with Strategic Investment to Bring DeFi to Bittensor", url: "https://cointelegraph.com/press-releases/dcg-backs-taofi-with-strategic-investment-to-bring-defi-to-bittensor", source: "Cointelegraph", dateFormatted: "February 11, 2025", timestamp: new Date("2025-02-11").getTime(), category: "partnership" },
  { title: "Grayscale Introduces Bittensor and Sui Trust Products", url: "https://cointelegraph.com/news/grayscale-bittensor-sui-trust-products-launch", source: "Cointelegraph", dateFormatted: "August 7, 2024", timestamp: new Date("2024-08-07").getTime(), category: "institutional" }
];

let lastScrapedAt = new Date();

// Generic HTTP/HTTPS GET with redirect support
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 15000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
          const urlObj = new URL(url);
          redirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
        }
        httpGet(redirectUrl).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

function categorize(title) {
  const t = title.toLowerCase();
  if (/subnet|sn\d+|targon|chutes|hippius|loosh|iota|voidai|macrocosmos|dippy|dojo|astrid|rayon|nineteen|corcel|taoshi|bitmind|tensorplex|gradients|manifold/i.test(t)) return 'subnet';
  if (/etf|etp|grayscale|bitwise|institutional|trust|fund|dcg|yuma|stillcore|deutsche/i.test(t)) return 'institutional';
  if (/partner|hackquest|teams\s+up|taofi|rubicon|collab|integrat/i.test(t)) return 'partnership';
  if (/halving|dtao|upgrade|emission|mev|dynamic\s*tao|contraction|protocol|update/i.test(t)) return 'protocol';
  if (/exploit|hack|loss|security|vulnerab|attack/i.test(t)) return 'security';
  if (/manifesto|vision|execution|strategic|analysis|intelligence|report|research|thesis|deep\s*dive/i.test(t)) return 'research';
  return 'ecosystem';
}

function isSpamArticle(title) {
  const t = title.toLowerCase();
  const spamPatterns = [
    /price prediction/i, /price forecast/i, /price analysis/i, /price target/i,
    /price rally/i, /price rise/i, /price surge/i, /will reach \$/i,
    /could hit \$/i, /could reach \$/i, /eyes \$\d+/i, /targets \$\d+/i,
    /toward \$\d+/i, /\$\d+,?\d* by 202/i, /\$\d+k/i,
    /technical analysis/i, /technical signal/i, /resistance around/i,
    /support level/i, /key.*close above/i, /signal.*rally/i,
    /what traders should/i, /trading view/i,
    /buy or sell/i, /should you buy/i, /best crypto.*buy/i,
    /top.*crypto.*buy/i, /cryptos to buy/i, /coins to buy/i,
    /best altcoin/i, /altcoins to watch/i, /must.buy/i,
    /pump/i, /moon/i, /100x/i, /1000x/i, /millionaire/i,
    /get rich/i, /retire.*millionaire/i,
    /presale/i, /blockdag/i, /ahead of.*deadline/i,
    /mexc/i, /bitget\.com/i, /kucoin news/i, /tradingview/i,
    /coinpedia/i, /2 urban girls/i
  ];
  return spamPatterns.some(pattern => pattern.test(t));
}

function isBittensorRelated(title) {
  const t = title.toLowerCase();
  return /bittensor|tao|subnet|dtao|opentensor/i.test(t);
}

// Parse RSS/XML feed items
function parseRSSItems(text) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = itemRegex.exec(text)) !== null) {
    const item = match[1];
    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) || 
                       item.match(/<title>(.*?)<\/title>/i);
    const linkMatch = item.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/i) ||
                      item.match(/<link>(.*?)<\/link>/i);
    const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/i) ||
                      item.match(/<dc:date>(.*?)<\/dc:date>/i);
    
    if (titleMatch && linkMatch) {
      items.push({
        title: titleMatch[1].trim()
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/<[^>]*>/g, ''),
        url: linkMatch[1].trim(),
        date: dateMatch ? new Date(dateMatch[1]) : new Date()
      });
    }
  }
  return items;
}

// Scrape RSS feed
async function scrapeRSS(url, sourceName, filterBittensor = false) {
  try {
    const text = await httpGet(url);
    const items = parseRSSItems(text);
    const results = [];
    
    for (const item of items) {
      if (isSpamArticle(item.title)) continue;
      if (filterBittensor && !isBittensorRelated(item.title)) continue;
      
      results.push({
        title: item.title,
        url: item.url,
        source: sourceName,
        timestamp: item.date.getTime(),
        dateFormatted: item.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        category: categorize(item.title)
      });
    }
    
    console.log(`✓ ${sourceName}: ${results.length} articles`);
    return results;
  } catch (err) {
    console.log(`✗ ${sourceName}: ${err.message}`);
    return [];
  }
}

// Scrape Medium RSS feed
async function scrapeMedium(username, sourceName) {
  try {
    const url = `https://medium.com/feed/@${username}`;
    return await scrapeRSS(url, sourceName);
  } catch (err) {
    console.log(`✗ ${sourceName} (Medium): ${err.message}`);
    return [];
  }
}

// Scrape Google News RSS
async function scrapeGoogleNews() {
  const results = [];
  const queries = [
    'https://news.google.com/rss/search?q=bittensor&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=bittensor+TAO+crypto&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=bittensor+subnet&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=%22bittensor%22&hl=en-US&gl=US&ceid=US:en'
  ];
  
  for (const url of queries) {
    try {
      const text = await httpGet(url);
      const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
      let match;
      
      while ((match = itemRegex.exec(text)) !== null) {
        const item = match[1];
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) || 
                           item.match(/<title>(.*?)<\/title>/i);
        const linkMatch = item.match(/<link>(.*?)<\/link>/i);
        const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/i);
        const sourceMatch = item.match(/<source[^>]*>(.*?)<\/source>/i);
        
        if (titleMatch && linkMatch) {
          const title = titleMatch[1].trim()
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"');
          
          if (isSpamArticle(title)) continue;
          
          const date = dateMatch ? new Date(dateMatch[1]) : new Date();
          results.push({
            title,
            url: linkMatch[1].trim(),
            source: sourceMatch ? sourceMatch[1].trim() : 'Google News',
            timestamp: date.getTime(),
            dateFormatted: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            category: categorize(title)
          });
        }
      }
    } catch (err) {
      // Silent fail
    }
  }
  
  // Dedupe
  const seen = new Set();
  const unique = results.filter(a => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
  
  console.log(`✓ Google News: ${unique.length} articles`);
  return unique;
}

// Main scrape function
async function scrapeAll() {
  console.log('\n🚀 Scraping all sources...\n');
  
  // ===== BITTENSOR-SPECIFIC SUBSTACKS =====
  console.log('--- SUBSTACK SOURCES ---');
  const substackSources = [
    scrapeRSS('https://subnetedge.substack.com/feed', 'SubnetEdge'),
    scrapeRSS('https://www.abittensorjourney.com/feed', 'A Bittensor Journey'),
    scrapeRSS('https://macrocosmosai.substack.com/feed', 'Macrocosmos AI'),
    scrapeRSS('https://asymmetricjump.substack.com/feed', 'Asymmetric Jump'),
    scrapeRSS('https://simplytao.substack.com/feed', 'Simply TAO'),
  ];
  
  // ===== MEDIUM SOURCES =====
  console.log('\n--- MEDIUM SOURCES ---');
  const mediumSources = [
    scrapeMedium('tensorplexlabs', 'Tensorplex Labs'),
    scrapeMedium('bitmindlabs', 'BitMind AI'),
    scrapeMedium('0xgreythorn', 'Greythorn Asset'),
    scrapeMedium('opentensor', 'Opentensor Foundation'),
    scrapeMedium('ibsvalidator', 'IBS Validator'),
    scrapeMedium('0xai.dev', '0xAI'),
    scrapeRSS('https://medium.com/feed/collab-currency', 'Collab+Currency'),
  ];
  
  // ===== OFFICIAL BITTENSOR BLOG =====
  console.log('\n--- OFFICIAL BLOGS ---');
  const officialBlogs = [
    scrapeRSS('https://blog.bittensor.com/feed', 'Bittensor Blog'),
    scrapeRSS('https://medium.com/feed/@opentensor', 'Opentensor'),
  ];
  
  // ===== RESEARCH & ANALYSIS SITES =====
  console.log('\n--- RESEARCH SITES ---');
  const researchSites = [
    scrapeRSS('https://oakresearch.substack.com/feed', 'OAK Research'),
    scrapeRSS('https://subnetalpha.substack.com/feed', 'Subnet Alpha'),
  ];
  
  // ===== OFFICIAL SUBNET TEAM BLOGS =====
  console.log('\n--- SUBNET TEAM BLOGS ---');
  const subnetBlogs = [
    // Rayon Labs (SN19, SN56, SN64)
    scrapeRSS('https://blog.chutes.ai/feed', 'Chutes'),
    scrapeRSS('https://blog.nineteen.ai/feed', 'Nineteen AI'),
    scrapeRSS('https://blog.gradients.io/feed', 'Gradients'),
    // Taoshi (SN8)
    scrapeRSS('https://blog.taoshi.io/feed', 'Taoshi'),
    scrapeRSS('https://taoshi.io/blog/rss', 'Taoshi'),
    // BitMind (SN34)
    scrapeRSS('https://blog.bitmind.ai/feed', 'BitMind'),
    // Hippius (SN75)
    scrapeRSS('https://news.hippius.com/feed', 'Hippius'),
    scrapeRSS('https://hippius.substack.com/feed', 'Hippius'),
    // Manifold / Targon (SN4)
    scrapeRSS('https://blog.manifold.inc/feed', 'Manifold Labs'),
    scrapeRSS('https://blog.targon.com/feed', 'Targon'),
    // Corcel
    scrapeRSS('https://blog.corcel.io/feed', 'Corcel'),
    // Dippy AI (SN11)
    scrapeRSS('https://blog.dippy.ai/feed', 'Dippy AI'),
    // Tensorplex / Dojo (SN52)
    scrapeRSS('https://blog.tensorplex.ai/feed', 'Tensorplex'),
    // Macrocosmos (SN1, SN9, SN13, SN25)
    scrapeRSS('https://blog.macrocosmos.ai/feed', 'Macrocosmos'),
  ];
  
  // ===== GENERAL CRYPTO NEWS (filtered) =====
  console.log('\n--- CRYPTO NEWS ---');
  const cryptoNews = [
    scrapeRSS('https://cointelegraph.com/rss', 'Cointelegraph', true),
    scrapeRSS('https://www.coindesk.com/arc/outboundfeeds/rss/', 'CoinDesk', true),
    scrapeRSS('https://www.theblock.co/rss.xml', 'The Block', true),
    scrapeRSS('https://decrypt.co/feed', 'Decrypt', true),
    scrapeRSS('https://cryptoslate.com/feed/', 'CryptoSlate', true),
    scrapeRSS('https://cryptopotato.com/feed/', 'CryptoPotato', true),
    scrapeRSS('https://ambcrypto.com/feed/', 'AMBCrypto', true),
    scrapeRSS('https://u.today/rss', 'U.Today', true),
    scrapeRSS('https://beincrypto.com/feed/', 'BeInCrypto', true),
    scrapeRSS('https://dailyhodl.com/feed/', 'Daily Hodl', true),
    scrapeRSS('https://www.newsbtc.com/feed/', 'NewsBTC', true),
    scrapeRSS('https://blockonomi.com/feed/', 'Blockonomi', true),
    scrapeRSS('https://dlnews.com/feed/', 'DL News', true),
    scrapeRSS('https://www.altcoinbuzz.io/feed/', 'Altcoin Buzz', true),
  ];
  
  // ===== GOOGLE NEWS =====
  console.log('\n--- GOOGLE NEWS ---');
  const googleNews = scrapeGoogleNews();
  
  // Wait for all
  const [substackResults, mediumResults, officialResults, researchResults, subnetResults, cryptoResults, googleResults] = await Promise.all([
    Promise.all(substackSources),
    Promise.all(mediumSources),
    Promise.all(officialBlogs),
    Promise.all(researchSites.map(p => p.catch(() => []))),
    Promise.all(subnetBlogs.map(p => p.catch(() => []))),
    Promise.all(cryptoNews),
    googleNews
  ]);
  
  // Flatten
  const newArticles = [
    ...substackResults.flat(),
    ...mediumResults.flat(),
    ...officialResults.flat(),
    ...researchResults.flat(),
    ...subnetResults.flat(),
    ...cryptoResults.flat(),
    ...googleResults
  ];
  
  // Combine with fallback
  const all = [...newArticles, ...articles];
  
  // Dedup functions
  function normalizeHeadline(title) {
    return title
      .toLowerCase()
      .replace(/\s*-\s*(aol|yahoo|motley fool|coindesk|cointelegraph|the block|decrypt|bloomberg|reuters|forbes|cnbc|thestreet|investing\.com|ambcrypto|cryptoslate|u\.today|beincrypto|daily hodl|newsbtc|cryptopotato|blockonomi|google news)[^a-z]*/gi, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  function areSimilarHeadlines(title1, title2) {
    const norm1 = normalizeHeadline(title1);
    const norm2 = normalizeHeadline(title2);
    if (norm1 === norm2) return true;
    
    const words1 = new Set(norm1.split(' ').filter(w => w.length > 2));
    const words2 = new Set(norm2.split(' ').filter(w => w.length > 2));
    if (words1.size === 0 || words2.size === 0) return false;
    
    const intersection = [...words1].filter(w => words2.has(w)).length;
    const smaller = Math.min(words1.size, words2.size);
    return (intersection / smaller) >= 0.8;
  }
  
  // Deduplicate
  const seenUrls = new Set();
  const seenHeadlines = [];
  
  articles = all.filter(a => {
    const normalizedUrl = a.url.replace(/\/$/, '').toLowerCase();
    if (seenUrls.has(normalizedUrl)) return false;
    
    for (const existing of seenHeadlines) {
      if (areSimilarHeadlines(a.title, existing)) return false;
    }
    
    seenUrls.add(normalizedUrl);
    seenHeadlines.push(a.title);
    return true;
  });
  
  // Sort newest first
  articles.sort((a, b) => b.timestamp - a.timestamp);
  
  lastScrapedAt = new Date();
  console.log(`\n✅ Total unique articles: ${articles.length}\n`);
}

// API endpoints
app.get('/api/news', (req, res) => {
  res.json({ success: true, count: articles.length, lastScrapedAt, articles });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', articles: articles.length, lastScrapedAt });
});

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Scrape every hour
cron.schedule('0 * * * *', scrapeAll);

// Start server
app.listen(PORT, async () => {
  console.log(`\n🧠 Bittensor News Aggregator on port ${PORT}\n`);
  await scrapeAll();
});
