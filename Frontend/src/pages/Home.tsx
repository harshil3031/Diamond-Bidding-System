import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

interface Diamond {
  id: string;
  name: string;
  image_url: string | null;
  base_price: string;
}

interface ActiveBid {
  id: string;
  diamond_id: string;
  base_bid_price: string;
  start_time: string;
  end_time: string;
  status: string;
  time_remaining_ms?: number;
  statistics?: {
    total_participants: number;
    highest_bid: number;
  };
  Diamond?: Diamond;
}

interface Stats {
  activeAuctions: number;
  totalBids: number;
  avgValue: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [activeBids, setActiveBids] = useState<ActiveBid[]>([]);
  const [featuredDiamonds, setFeaturedDiamonds] = useState<Diamond[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState<Stats>({
    activeAuctions: 0,
    totalBids: 0,
    avgValue: '₹0'
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Debug: Log when featured diamonds change
  useEffect(() => {
    console.log('Featured diamonds state updated:', featuredDiamonds.length, featuredDiamonds);
  }, [featuredDiamonds]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch active bids (public endpoint - no auth needed for home page)
      const response = await fetch('http://localhost:5000/api/public/bids/active');
      console.log('Fetching active bids...');
      if (response.ok) {
        const data = await response.json();
        const bids = data.data || [];
        setActiveBids(bids.slice(0, 6)); // Show first 6 bids
        
        // Calculate stats
        const totalParticipants = bids.reduce((sum: number, bid: ActiveBid) => 
          sum + (bid.statistics?.total_participants || 0), 0
        );
        
        const avgBid = bids.length > 0
          ? bids.reduce((sum: number, bid: ActiveBid) => 
              sum + (bid.statistics?.highest_bid || 0), 0
            ) / bids.length
          : 0;

        setStats({
          activeAuctions: bids.length,
          totalBids: totalParticipants,
          avgValue: `₹${Math.round(avgBid / 1000)}K`
        });
      }

      // Fetch all diamonds for featured section
      const diamondsRes = await fetch('http://localhost:5000/api/public/diamonds');
      if (diamondsRes.ok) {
        const data = await diamondsRes.json();
        console.log('Raw diamonds response:', data);
        const allDiamonds = data.data || [];
        console.log('Fetched diamonds count:', allDiamonds.length);
        console.log('Fetched diamonds:', allDiamonds);
        allDiamonds.forEach((d: Diamond, i: number) => {
          console.log(`Diamond ${i + 1}:`, { id: d.id, name: d.name, base_price: d.base_price, has_image: !!d.image_url });
        });
        setFeaturedDiamonds(allDiamonds.slice(0, 6)); // Get up to 6 diamonds for carousel
      } else {
        console.error('Failed to fetch diamonds:', diamondsRes.status);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-rotate carousel
  useEffect(() => {
    if (featuredDiamonds.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredDiamonds.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [featuredDiamonds]);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: { [key: string]: string } = {};
      activeBids.forEach((bid) => {
        const now = new Date().getTime();
        const end = new Date(bid.end_time).getTime();
        const distance = end - now;

        if (distance < 0) {
          newTimeLeft[bid.id] = 'ENDED';
        } else {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          newTimeLeft[bid.id] = `${hours}h ${minutes}m ${seconds}s`;
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeBids]);

  const getImageUrl = (diamond?: Diamond) => {
    if (!diamond?.image_url) {
      return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop';
    }
    return diamond.image_url;
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredDiamonds.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredDiamonds.length) % featuredDiamonds.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

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
              <div className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500 text-xs uppercase tracking-[0.2em] font-semibold">
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
                  className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold uppercase tracking-wider rounded-lg transition-all duration-300 shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-105 flex items-center gap-2"
                >
                  Explore Collection
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="group-hover:translate-x-1 transition-transform">
                    <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-700/50">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-amber-500">{stats.activeAuctions}</div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Active Auctions</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-amber-500">{stats.totalBids}</div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Total Participants</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-amber-500">{stats.avgValue}</div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Average Bid</div>
                </div>
              </div>
            </div>

            {/* Hero Image Carousel */}
            <div className="relative group animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-600/20 blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 shadow-2xl shadow-amber-500/10 group-hover:shadow-amber-500/20 transition-all duration-500">
                {featuredDiamonds.length > 0 ? (
                  <>
                    {/* Carousel Images */}
                    <div className="relative h-[600px]">
                      {featuredDiamonds.map((diamond, index) => (
                        <div
                          key={diamond.id}
                          className={`absolute inset-0 transition-opacity duration-1000 ${
                            index === currentSlide ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <img 
                            src={getImageUrl(diamond)}
                            alt={diamond.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Darker gradient overlay for better text visibility */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                          
                          {/* Diamond info overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-black/80 to-transparent">
                            {activeBids.length > 0 && index === currentSlide && (
                              <div className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-3 animate-pulse">
                                LIVE NOW
                              </div>
                            )}
                            <h3 
                              className="text-3xl font-bold mb-2 text-white"
                              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)' }}
                            >
                              {diamond.name || 'Unnamed Diamond'}
                            </h3>
                            <p 
                              className="text-xl text-amber-400 font-bold"
                              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.8)' }}
                            >
                              Starting at ₹{parseFloat(diamond.base_price).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Previous Button */}
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900/80 hover:bg-slate-900 backdrop-blur-sm border border-amber-500/30 rounded-full flex items-center justify-center text-amber-500 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                      aria-label="Previous slide"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6"/>
                      </svg>
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900/80 hover:bg-slate-900 backdrop-blur-sm border border-amber-500/30 rounded-full flex items-center justify-center text-amber-500 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                      aria-label="Next slide"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {featuredDiamonds.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentSlide
                              ? 'bg-amber-500 w-8'
                              : 'bg-slate-500 hover:bg-slate-400'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-[600px] bg-slate-800 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-8xl mb-4">💎</div>
                      <p className="text-slate-400">No diamonds available</p>
                    </div>
                  </div>
                )}
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
            {activeBids.length > 0 && (
              <div className="inline-block px-4 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-red-500 text-xs uppercase tracking-[0.2em] font-semibold mb-2">
                Live Now
              </div>
            )}
            <h2 className="text-5xl font-bold">
              {activeBids.length > 0 ? 'Active Auctions' : 'Featured Diamonds'}
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              {activeBids.length > 0 
                ? 'Bid on exceptional pieces from our curated collection'
                : 'Explore our exclusive diamond collection'
              }
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent"></div>
              <p className="mt-4 text-slate-400">Loading auctions...</p>
            </div>
          ) : activeBids.length > 0 ? (
            /* Active Bids Grid */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeBids.map((bid, index) => (
                <div 
                  key={bid.id} 
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Card Image */}
                  <div className="relative overflow-hidden aspect-square">
                    <img 
                      src={getImageUrl(bid.Diamond)}
                      alt={bid.Diamond?.name || 'Diamond'}
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
                          {timeLeft[bid.id] || 'Calculating...'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-amber-500 transition-colors">
                        {bid.Diamond?.name || 'Diamond Auction'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 1l2.5 3.5L8 14 5.5 4.5 8 1z"/>
                          </svg>
                          {bid.statistics?.total_participants || 0} Participants
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                          {bid.statistics?.highest_bid ? 'Highest Bid' : 'Starting Price'}
                        </div>
                        <div className="text-2xl font-bold text-amber-500">
                          ₹{(bid.statistics?.highest_bid || parseFloat(bid.base_bid_price)).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold uppercase tracking-wider text-sm rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-500/20"
                      >
                        Place Bid
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Featured Diamonds when no active bids */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDiamonds.map((diamond, index) => (
                <div 
                  key={diamond.id} 
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="relative overflow-hidden aspect-square">
                    <img 
                      src={getImageUrl(diamond)}
                      alt={diamond.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-2xl font-bold text-white group-hover:text-amber-500 transition-colors">
                      {diamond.name || 'Unnamed Diamond'}
                    </h3>
                    <div className="pt-4 border-t border-slate-700/50">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Base Price</div>
                      <div className="text-2xl font-bold text-amber-500">
                        ₹{parseFloat(diamond.base_price).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 border-2 border-amber-500/50 hover:border-amber-500 hover:bg-amber-500/10 text-amber-500 font-bold uppercase tracking-wider rounded-lg transition-all duration-300"
            >
              {activeBids.length > 0 ? 'View All Auctions' : 'Start Bidding'}
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
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
                {/* Step Number */}
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
              className="px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 text-lg font-bold uppercase tracking-wider rounded-lg transition-all duration-300 shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105"
            >
              Create Account
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
