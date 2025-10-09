import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

interface QuizResponses {
  climate: string;
  firearms: string;
  marijuana: string;
  lgbtq: string;
  costOfLiving: string;
  taxes: string;
  lifestyle: string;
  vaFacilities: string;
  safety: string;
  gasPrices: string;
}

export async function POST(request: NextRequest) {
  try {
    const responses: QuizResponses = await request.json();
    const data = await database.getData();
    const locations = data.locations || [];

    // Calculate match scores for each location
    const locationsWithScores = locations.map((location: any) => {
      let score = 0;
      let maxScore = 0;

      // Climate (warm weather preference)
      const climateImportance = parseInt(responses.climate) || 0;
      maxScore += climateImportance;
      if (climateImportance >= 3) {
        const avgHighSummer = location.climate?.avgHighSummer || 0;
        if (avgHighSummer >= 85) score += climateImportance;
        else if (avgHighSummer >= 75) score += climateImportance * 0.7;
        else if (avgHighSummer >= 65) score += climateImportance * 0.3;
      } else {
        score += climateImportance;
      }

      // Firearms
      const firearmsImportance = parseInt(responses.firearms) || 0;
      maxScore += firearmsImportance;
      if (firearmsImportance >= 3) {
        const laws = location.firearms?.laws || '';
        if (laws === 'Constitutional Carry' || laws === 'Constitutional carry')
          score += firearmsImportance;
        else if (laws.includes('Shall issue')) score += firearmsImportance * 0.7;
        else score += firearmsImportance * 0.3;
      } else {
        score += firearmsImportance;
      }

      // Marijuana
      const marijuanaImportance = parseInt(responses.marijuana) || 0;
      maxScore += marijuanaImportance;
      if (marijuanaImportance >= 3) {
        const status = location.marijuana?.status || '';
        if (status === 'Legal' || status === 'Recreational')
          score += marijuanaImportance;
        else if (status.includes('Medical')) score += marijuanaImportance * 0.6;
        else score += marijuanaImportance * 0.2;
      } else {
        score += marijuanaImportance;
      }

      // LGBTQ friendliness (lower rank is better)
      const lgbtqImportance = parseInt(responses.lgbtq) || 0;
      maxScore += lgbtqImportance;
      if (lgbtqImportance >= 3) {
        const rank = location.lgbtq?.rank || 999;
        if (rank <= 50) score += lgbtqImportance;
        else if (rank <= 100) score += lgbtqImportance * 0.7;
        else if (rank <= 150) score += lgbtqImportance * 0.4;
        else score += lgbtqImportance * 0.1;
      } else {
        score += lgbtqImportance;
      }

      // Cost of Living (lower is better)
      const costImportance = parseInt(responses.costOfLiving) || 0;
      maxScore += costImportance;
      if (costImportance >= 3) {
        const costOfLiving = parseFloat(location.economy?.costOfLiving) || 100;
        if (costOfLiving <= 90) score += costImportance;
        else if (costOfLiving <= 100) score += costImportance * 0.7;
        else if (costOfLiving <= 110) score += costImportance * 0.4;
        else score += costImportance * 0.2;
      } else {
        score += costImportance;
      }

      // Taxes (no income tax is best)
      const taxesImportance = parseInt(responses.taxes) || 0;
      maxScore += taxesImportance;
      if (taxesImportance >= 3) {
        const incomeTax = location.taxes?.incomeTax || 10;
        if (incomeTax === 0) score += taxesImportance;
        else if (incomeTax <= 3) score += taxesImportance * 0.6;
        else if (incomeTax <= 5) score += taxesImportance * 0.3;
        else score += taxesImportance * 0.1;
      } else {
        score += taxesImportance;
      }

      // Lifestyle (urban vs rural)
      const lifestyle = responses.lifestyle || '';
      if (lifestyle) {
        const density = location.density || 0;
        if (lifestyle === 'urban' && density > 3000) score += 5;
        else if (lifestyle === 'suburban' && density >= 1000 && density <= 3000)
          score += 5;
        else if (lifestyle === 'rural' && density < 1000) score += 5;
        else score += 2;
        maxScore += 5;
      }

      // VA Facilities
      const vaImportance = parseInt(responses.vaFacilities) || 0;
      maxScore += vaImportance;
      if (vaImportance >= 3) {
        if (location.vaFacilities) score += vaImportance;
        else score += vaImportance * 0.2;
      } else {
        score += vaImportance;
      }

      // Safety (lower crime index is better)
      const safetyImportance = parseInt(responses.safety) || 0;
      maxScore += safetyImportance;
      if (safetyImportance >= 3) {
        const crimeIndex = location.crime?.totalIndex || 10;
        if (crimeIndex <= 3) score += safetyImportance;
        else if (crimeIndex <= 5) score += safetyImportance * 0.7;
        else if (crimeIndex <= 7) score += safetyImportance * 0.4;
        else score += safetyImportance * 0.2;
      } else {
        score += safetyImportance;
      }

      // Gas Prices (lower is better)
      const gasImportance = parseInt(responses.gasPrices) || 0;
      maxScore += gasImportance;
      if (gasImportance >= 3) {
        const gasPrice = location.economy?.avgGasPrice || 5;
        if (gasPrice <= 3.0) score += gasImportance;
        else if (gasPrice <= 3.5) score += gasImportance * 0.7;
        else if (gasPrice <= 4.0) score += gasImportance * 0.4;
        else score += gasImportance * 0.2;
      } else {
        score += gasImportance;
      }

      // Calculate percentage match
      const matchPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

      return {
        ...location,
        matchScore: matchPercent,
      };
    });

    // Sort by match score descending and take top 20
    const topMatches = locationsWithScores
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, 20);

    return NextResponse.json({
      locations: topMatches,
      criteria: responses,
    });
  } catch (error) {
    console.error('Error processing quiz results:', error);
    return NextResponse.json(
      { error: 'Error processing quiz results' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

