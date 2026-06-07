import { auth, db } from '../services/firebaseConfig';
import { signInAnonymously } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

export async function testFirebaseConnection() {
  try {
    console.log('🔄 Testing Firebase connection...');
    
    // Test 1: Auth connection
    const authResult = await signInAnonymously(auth);
    console.log('✅ Auth connected:', authResult.user.uid);
    
    // Test 2: Firestore connection
    const testCollection = collection(db, 'test');
    const snapshot = await getDocs(testCollection);
    console.log('✅ Firestore connected, docs count:', snapshot.size);
    
    return {
      success: true,
      auth: 'Connected',
      firestore: 'Connected',
      userId: authResult.user.uid
    };
  } catch (error: any) {
    console.error('❌ Firebase connection failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
