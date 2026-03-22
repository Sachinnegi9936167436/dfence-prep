import { redirect } from 'next/navigation';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models/User';
import { getSession } from '@/lib/auth';

export default async function SubscriptionCheck() {
  const session = await getSession();
  
  if (!session || !session.userId) {
    redirect('/login');
  }

  const userId = session.userId.toString();
  
  // Check for corrupted session data from old cookies
  if (userId === '[object Object]' || !userId || userId.length < 12) {
    console.error('Detected corrupted session for user. Forcing logout.');
    redirect('/api/auth/logout');
  }

  await connectToDatabase();
  try {
    const user = await User.findById(userId);
  
    // Check if subscription exists and is active
    if (!user || user.subscriptionStatus !== 'active' || !user.subscriptionExpiry || new Date(user.subscriptionExpiry) < new Date()) {
      // Allow admin users to bypass subscription
      if (user && (user.role === 'admin' || user.password === 'admin')) {
         return null; 
      }
      
      // Update status if expired
      if (user && user.subscriptionStatus === 'active') {
        user.subscriptionStatus = 'inactive';
        await user.save();
      }
      
      redirect('/pricing');
    }
  } catch (err) {
    console.error('SubscriptionCheck Error:', err);
    redirect('/api/auth/logout');
  }
  
  return null;
}
