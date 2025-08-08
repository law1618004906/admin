import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check if default campaign already exists
    const existingCampaign = await db.campaign.findFirst({
      where: {
        OR: [
          { title: 'Default Campaign' },
          { titleAr: 'الحملة الافتراضية' }
        ]
      }
    });

    if (existingCampaign) {
      return NextResponse.json({
        success: true,
        message: 'Default campaign already exists',
        data: existingCampaign
      });
    }

    // Create default campaign
    const defaultCampaign = await db.campaign.create({
      data: {
        title: 'Default Campaign',
        titleAr: 'الحملة الافتراضية',
        description: 'Default campaign for leaders and individuals management',
        descriptionAr: 'حملة افتراضية لإدارة القادة والأفراد',
        startDate: new Date(),
        status: 'ACTIVE',
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Default campaign created successfully',
      data: defaultCampaign
    });

  } catch (error) {
    console.error('Error creating default campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const campaign = await db.campaign.findFirst({
      where: {
        OR: [
          { title: 'Default Campaign' },
          { titleAr: 'الحملة الافتراضية' }
        ]
      }
    });

    if (!campaign) {
      return NextResponse.json({
        success: false,
        message: 'Default campaign not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: campaign
    });

  } catch (error) {
    console.error('Error fetching default campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}