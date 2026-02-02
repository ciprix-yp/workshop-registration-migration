import { NextRequest, NextResponse } from 'next/server';
import { getWorkshopConfig } from '@/config/workshops';

/**
 * GET /api/workshop/[slug]
 *
 * Get workshop configuration by slug
 * Returns public workshop data (excluding sensitive config)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const config = getWorkshopConfig(slug);

    if (!config || !config.active) {
      return NextResponse.json(
        { error: 'Workshop nu a fost găsit sau nu este activ' },
        { status: 404 }
      );
    }

    // Return only public data
    return NextResponse.json({
      slug: config.slug,
      name: config.name,
      active: config.active,
    });
  } catch (error) {
    console.error('Error fetching workshop config:', error);
    return NextResponse.json(
      { error: 'Eroare la încărcarea configurației workshop-ului' },
      { status: 500 }
    );
  }
}
