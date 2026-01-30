import { NextResponse } from 'next/server';
import { adminMessaging, adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { calleeId, callerName, callId, callType } = await request.json();

    if (!calleeId || !callerName) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (!adminDb || !adminMessaging) {
        console.error('Firebase Admin not initialized properly');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Get callee's FCM token
    let fcmToken: string | undefined;

    if (!calleeId || typeof calleeId !== 'string') {
        console.warn(`[NotifyMissed] Invalid calleeId: ${calleeId}`);
        return NextResponse.json({ error: 'Invalid calleeId' }, { status: 400 });
    }

    try {
        console.log(`[NotifyMissed] Fetching user doc for calleeId: "${calleeId}"`);
        
        // Timeout the DB request after 5 seconds to avoid long hangs
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 5000));
        const dbPromise = adminDb.collection('users').doc(calleeId).get();
        
        const userDoc = await Promise.race([dbPromise, timeoutPromise]) as FirebaseFirestore.DocumentSnapshot;
        
        if (!userDoc.exists) {
            console.warn(`[NotifyMissed] User not found: ${calleeId}`);
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const userData = userDoc.data();
        fcmToken = userData?.fcmToken;

        if (!fcmToken) {
             console.log(`[NotifyMissed] User has no FCM token: ${calleeId}`);
             return NextResponse.json({ message: 'User has no FCM token' }, { status: 200 });
        }
    } catch (dbError) {
        console.error('[NotifyMissed] Database/Auth Error:', dbError);
        return NextResponse.json({ error: 'Database access failed' }, { status: 500 });
    }

    // Send notification
    try {
        await adminMessaging.send({
          token: fcmToken,
          notification: {
            title: 'Missed Call',
            body: `You missed a ${callType || 'video'} call from ${callerName}`,
          },
          data: {
            type: 'missed_call',
            callId: callId || '',
            callerName: callerName,
            url: '/' 
          },
          android: {
            priority: 'high',
            notification: {
                channelId: 'missed_calls',
                priority: 'max',
                defaultSound: true
            }
          },
          apns: {
            payload: {
                aps: {
                    sound: 'default'
                }
            }
          }
        });

        return NextResponse.json({ success: true });
    } catch (msgError) {
        console.error('[NotifyMissed] Messaging Error:', msgError);
        // We consider this a partial success or soft failure? 
        // Returning 500 is fine but let's be specific
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
