import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

interface DiamondItem {
  id: number;
  name: string;
  carat: number;
  price: string;
  endTime: Date;
  image: string;
}

interface Stats {
  activeAuctions: number;
  totalBids: number;
  avgValue: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: string }>({});

  const featuredDiamonds: DiamondItem[] = [
    {
      id: 1,
      name: 'The Azure Crown',
      carat: 8.42,
      price: '$850,000',
      endTime: new Date(Date.now() + 14 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop'
    },
    {
      id: 2,
      name: 'Midnight Eclipse',
      carat: 5.18,
      price: '$425,000',
      endTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=400&h=400&fit=crop'
    },
    {
      id: 3,
      name: 'Rose Constellation',
      carat: 6.75,
      price: '$620,000',
      endTime: new Date(Date.now() + 22 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop'
    }
  ];

  const stats: Stats = {
    activeAuctions: 24,
    totalBids: 1847,
    avgValue: '$485K'
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: { [key: number]: string } = {};
      featuredDiamonds.forEach((diamond) => {
        const now = new Date().getTime();
        const end = diamond.endTime.getTime();
        const distance = end - now;

        if (distance < 0) {
          newTimeLeft[diamond.id] = 'ENDED';
        } else {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          newTimeLeft[diamond.id] = `${hours}h ${minutes}m ${seconds}s`;
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black text-white">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.03),transparent_50%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8 animate-fadeIn">
              <div className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs uppercase tracking-[0.2em] font-semibold">
                Exclusive Auction House
              </div>
              
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                Where Brilliance
                <br />
                Meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 animate-shimmer">Legacy</span>
              </h1>
              
              <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
                Curated collection of the world's most extraordinary diamonds.
                Join the elite circle of collectors and investors.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold uppercase tracking-wider transition-all duration-300 shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-105 flex items-center gap-2"
                >
                  Explore Collection
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="group-hover:translate-x-1 transition-transform">
                    <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                
                <button className="group px-8 py-4 border border-amber-500/50 hover:border-amber-500 hover:bg-amber-500/10 text-amber-500 font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="group-hover:scale-110 transition-transform">
                    <path d="M10 0a10 10 0 100 20 10 10 0 000-20zm-1 14.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                  Watch Video
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-700/50">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-amber-500">{stats.activeAuctions}</div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Active Auctions</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-amber-500">{stats.totalBids.toLocaleString()}</div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Bids Placed Today</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-amber-500">{stats.avgValue}</div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Average Value</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative group animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-600/20 blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 shadow-2xl shadow-amber-500/10 group-hover:shadow-amber-500/20 transition-all duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop" 
                  alt="Featured Diamond"
                  className="w-full h-auto transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="inline-block px-3 py-1 bg-red-500/90 text-white text-xs font-bold uppercase tracking-wider mb-3 animate-pulse">
                    LIVE NOW
                  </div>
                  <h3 className="text-2xl font-bold mb-1">Imperial Radiance</h3>
                  <p className="text-slate-400">12.5 Carats • Starting at $1.2M</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section id="auctions" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block px-4 py-1.5 bg-red-500/10 border border-red-500/30 text-red-500 text-xs uppercase tracking-[0.2em] font-semibold mb-2">
              Live Now
            </div>
            <h2 className="text-5xl font-bold">Featured Auctions</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Bid on exceptional pieces from our curated collection
            </p>
          </div>

          {/* Diamonds Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDiamonds.map((diamond, index) => (
              <div 
                key={diamond.id} 
                className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 animate-fadeIn"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Card Image */}
                <div className="relative overflow-hidden aspect-square">
                  <img 
                    src={diamond.image} 
                    alt={diamond.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                  
                  {/* Live Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-full">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      LIVE
                    </span>
                  </div>

                  {/* Timer */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-amber-500/30">
                      <div className="text-xs text-slate-400 mb-1">Ends in</div>
                      <div className="text-amber-500 font-mono font-bold">
                        {timeLeft[diamond.id] || 'Calculating...'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-amber-500 transition-colors">
                      {diamond.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 1l2.5 3.5L8 14 5.5 4.5 8 1z"/>
                        </svg>
                        {diamond.carat} Carats
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current Bid</div>
                      <div className="text-2xl font-bold text-amber-500">{diamond.price}</div>
                    </div>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold uppercase tracking-wider text-sm transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-500/20"
                    >
                      Place Bid
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 border border-amber-500/50 hover:border-amber-500 hover:bg-amber-500/10 text-amber-500 font-bold uppercase tracking-wider transition-all duration-300"
            >
              View All Auctions
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-5xl font-bold">How It Works</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Start your journey in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: '01',
                title: 'Register & Verify',
                description: 'Create your account and complete our secure verification process to access exclusive auctions.',
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                )
              },
              {
                number: '02',
                title: 'Browse Collection',
                description: 'Explore our curated selection of certified diamonds with detailed specifications and authenticity guarantees.',
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                )
              },
              {
                number: '03',
                title: 'Place Your Bid',
                description: 'Participate in live auctions and place competitive bids on diamonds that match your investment goals.',
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 12l10 10 10-10L12 2z"/>
                  </svg>
                )
              }
            ].map((step, index) => (
              <div 
                key={index}
                className="group relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 hover:border-amber-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/10 animate-fadeIn"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
               id="how-it-works"  {/* Step Number */}
                <div className="absolute top-8 right-8 text-7xl font-bold text-slate-700/30 group-hover:text-amber-500/20 transition-colors">
                  {step.number}
                </div>

                <div className="relative space-y-4">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>

                  <h3 className="text-2xl font-bold group-hover:text-amber-500 transition-colors">
                    {step.title}
                  </h3>
                  
                  <p className="text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 px-6 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-amber-500/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-bold">Ready to Start Bidding?</h2>
          <p className="text-xl text-slate-400">
            Join thousands of collectors and investors in the most prestigious diamond auction platform
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 text-lg font-bold uppercase tracking-wider transition-all duration-300 shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105"
            >
              Create Account
            </button>
            <button className="px-10 py-5 border-2 border-amber-500/50 hover:border-amber-500 hover:bg-amber-500/10 text-amber-500 text-lg font-bold uppercase tracking-wider transition-all duration-300">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-shimmer {
          background-size: 1000px 100%;
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
