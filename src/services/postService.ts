import { WorkerPost, WorkerPostComment } from '../types';
import { PLACEHOLDER_WORKER_POSTS } from '../data/mockData';

const STORAGE_KEY = 'tegagn_worker_posts_v3';

// Fair trade market benchmarks in ETB by trade category
export const TRADE_PRICE_BENCHMARKS: Record<string, { label: string; fairRange: string; benchmarkMax: number }> = {
  plumbing: { label: 'Plumbing Works', fairRange: '500 - 900 ETB', benchmarkMax: 850 },
  electrician: { label: 'Electrical Wiring & Breakers', fairRange: '600 - 1,100 ETB', benchmarkMax: 1000 },
  carpenter: { label: 'Carpentry & Cabinetry', fairRange: '1,200 - 2,500 ETB', benchmarkMax: 2200 },
  painter: { label: 'Wall Painting & Plastering', fairRange: '500 - 950 ETB', benchmarkMax: 850 },
  masonry: { label: 'Tile & Masonry Works', fairRange: '800 - 1,600 ETB', benchmarkMax: 1400 },
  hvac: { label: 'Ventilation & Cooling', fairRange: '700 - 1,400 ETB', benchmarkMax: 1200 },
};

export const getTradeBenchmark = (category: string) => {
  const normalized = category.toLowerCase().trim();
  return TRADE_PRICE_BENCHMARKS[normalized] || {
    label: 'General Trade Service',
    fairRange: '500 - 1,000 ETB',
    benchmarkMax: 900
  };
};

class PostService {
  private readStorage(): WorkerPost[] {
    if (typeof window === 'undefined') return PLACEHOLDER_WORKER_POSTS;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(PLACEHOLDER_WORKER_POSTS));
        return PLACEHOLDER_WORKER_POSTS;
      }
      return JSON.parse(data);
    } catch {
      return PLACEHOLDER_WORKER_POSTS;
    }
  }

  private writeStorage(posts: WorkerPost[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
      window.dispatchEvent(new Event('tegagn_posts_changed'));
    } catch (e) {
      console.error('Failed to save worker posts to storage', e);
    }
  }

  /**
   * Returns all posts across the system
   */
  getAllPosts(): WorkerPost[] {
    return this.readStorage();
  }

  /**
   * Customer Hub Feed: Only returns posts approved by the platform administrator
   */
  getApprovedPosts(): WorkerPost[] {
    return this.readStorage().filter(p => !p.approvalStatus || p.approvalStatus === 'approved');
  }

  /**
   * Admin Control Queue: Returns posts waiting for regulatory approval or price check
   */
  getPendingPosts(): WorkerPost[] {
    return this.readStorage().filter(p => p.approvalStatus === 'pending');
  }

  /**
   * Worker Dashboard: Returns posts published by this specific worker
   */
  getWorkerPosts(workerId: string): WorkerPost[] {
    return this.readStorage().filter(p => p.workerId === workerId);
  }

  /**
   * When a worker releases a new job:
   * It goes FIRST to the Admin queue with 'pending' status for price and quality check.
   */
  createPost(payload: {
    workerId: string;
    workerName: string;
    workerTrade: string;
    workerAvatar: string;
    workerRating?: number;
    workerHourlyRate?: number;
    workerExperience?: number;
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    priceCharged: number;
    currency: string;
    duration: string;
    location: string;
    lat: number;
    lng: number;
  }): WorkerPost {
    const benchmark = getTradeBenchmark(payload.category);
    const isExcessive = payload.priceCharged > benchmark.benchmarkMax * 1.6;

    const newPost: WorkerPost = {
      id: `post-${Date.now()}`,
      workerId: payload.workerId,
      workerName: payload.workerName,
      workerTrade: payload.workerTrade,
      workerAvatar: payload.workerAvatar,
      workerRating: payload.workerRating || 4.9,
      workerHourlyRate: payload.workerHourlyRate || 350,
      workerExperience: payload.workerExperience || 5,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      imageUrl: payload.imageUrl,
      priceCharged: payload.priceCharged,
      currency: payload.currency || 'ETB',
      duration: payload.duration,
      location: payload.location,
      gpsCoordinates: {
        lat: payload.lat,
        lng: payload.lng,
        label: payload.location
      },
      likesCount: 0,
      isLiked: false,
      comments: [],
      createdAt: new Date().toISOString(),
      // Regulatory flow: Worker jobs MUST be controlled by admin first
      approvalStatus: 'pending',
      isPriceFlagged: isExcessive,
      benchmarkPrice: benchmark.benchmarkMax
    };

    const current = this.readStorage();
    this.writeStorage([newPost, ...current]);
    return newPost;
  }

  /**
   * Admin Action: Approve worker job to release it to the customer public marketplace
   */
  approvePost(postId: string, feedback?: string): void {
    const current = this.readStorage();
    const updated = current.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        approvalStatus: 'approved' as const,
        isPriceFlagged: false,
        adminFeedback: feedback || 'Approved by Platform Oversight Authority. Released to Customer Hub.',
        approvedAt: new Date().toISOString()
      };
    });
    this.writeStorage(updated);
  }

  /**
   * Admin Action: Cap high price to fair market benchmark and release
   */
  capPriceAndApprove(postId: string, cappedPrice: number, feedback: string): void {
    const current = this.readStorage();
    const updated = current.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        priceCharged: cappedPrice,
        approvalStatus: 'approved' as const,
        isPriceFlagged: false,
        adminFeedback: feedback || `Admin price intervention: Capped price to ${cappedPrice} ETB fair ceiling.`,
        approvedAt: new Date().toISOString()
      };
    });
    this.writeStorage(updated);
  }

  /**
   * Admin Action: Reject worker job posting
   */
  rejectPost(postId: string, reason: string): void {
    const current = this.readStorage();
    const updated = current.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        approvalStatus: 'rejected' as const,
        adminFeedback: reason || 'Post rejected by platform regulator. Please adjust description or pricing.'
      };
    });
    this.writeStorage(updated);
  }

  /**
   * Customer Hub: Toggle Like
   */
  toggleLike(postId: string): void {
    const current = this.readStorage();
    const updated = current.map(p => {
      if (p.id !== postId) return p;
      const isLiked = !p.isLiked;
      return {
        ...p,
        isLiked,
        likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
      };
    });
    this.writeStorage(updated);
  }

  /**
   * Customer Hub: Add Comment
   */
  addComment(postId: string, comment: WorkerPostComment): void {
    const current = this.readStorage();
    const updated = current.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: [...p.comments, comment]
      };
    });
    this.writeStorage(updated);
  }
}

export const postService = new PostService();
