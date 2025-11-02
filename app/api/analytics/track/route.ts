import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Track analytics events server-side
 * Stores events in database for business intelligence
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, properties, userId, timestamp } = body;

    if (!event) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Get session to identify user
    const session = await getServerSession(authOptions);
    const eventUserId = userId || (session?.user as any)?.id;

    // Store analytics event
    // Note: You might want to create an AnalyticsEvent model in Prisma for production
    // For now, we'll just log it
    console.log('Analytics event:', {
      event,
      properties,
      userId: eventUserId,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    });

    // In production, you could store this in a database:
    // await prisma.analyticsEvent.create({
    //   data: {
    //     event,
    //     properties: properties || {},
    //     userId: eventUserId,
    //     metadata: {
    //       userAgent: req.headers.get('user-agent'),
    //       ip: req.headers.get('x-forwarded-for'),
    //     },
    //   },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    // Don't fail the request - analytics should be non-blocking
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// Also accept GET for simpler tracking (e.g., from images)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const event = searchParams.get('event');
  const properties = searchParams.get('properties');

  if (!event) {
    return NextResponse.json(
      { error: 'Event name is required' },
      { status: 400 }
    );
  }

  try {
    const parsedProperties = properties ? JSON.parse(properties) : {};

    console.log('Analytics event (GET):', {
      event,
      properties: parsedProperties,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

