import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ProfitabilityResult } from '../profitability/profitability.service';

export interface RecommendationInput {
  productTitle: string;
  productCategory?: string;
  purchasePrice: number;
  sellPrice: number;
  profitability: ProfitabilityResult;
  demandScore: number;
  competitionLevel: string;
  estimatedMonthlySales: number;
  bsr?: number;
  totalSellers: number;
  fbaSellerCount: number;
  budget: number;
}

export interface AIRecommendation {
  recommendation: 'BUY' | 'STRONG_BUY' | 'HOLD' | 'AVOID' | 'NEUTRAL';
  recommendedQuantity: number;
  bestMarketplace: string;
  riskLevel: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  estimatedDaysToSell: number;
  summary: string;
  reasons: string[];
  warnings: string[];
  score: number;
}

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);
  private openai: OpenAI | null = null;

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OpenAI not configured. Using rule-based recommendations.');
    }
  }

  async generateRecommendation(input: RecommendationInput): Promise<AIRecommendation> {
    // Rule-based recommendation first (always works)
    const ruleBasedRec = this.ruleBasedRecommendation(input);

    // Try AI if available
    if (this.openai) {
      try {
        return await this.aiRecommendation(input, ruleBasedRec);
      } catch (error) {
        this.logger.warn('AI recommendation failed, using rule-based: ' + error.message);
      }
    }

    return ruleBasedRec;
  }

  private ruleBasedRecommendation(input: RecommendationInput): AIRecommendation {
    const { profitability, demandScore, competitionLevel, estimatedMonthlySales, totalSellers } = input;
    const reasons: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    // ROI score (0-30 points)
    if (profitability.roi >= 50) { score += 30; reasons.push(`Excellent ROI of ${profitability.roi.toFixed(1)}%`); }
    else if (profitability.roi >= 30) { score += 20; reasons.push(`Good ROI of ${profitability.roi.toFixed(1)}%`); }
    else if (profitability.roi >= 15) { score += 10; reasons.push(`Acceptable ROI of ${profitability.roi.toFixed(1)}%`); }
    else { score -= 10; warnings.push(`Low ROI of ${profitability.roi.toFixed(1)}% — below 15% threshold`); }

    // Net profit score (0-20 points)
    if (profitability.netProfit >= 20) { score += 20; reasons.push(`Strong net profit of $${profitability.netProfit.toFixed(2)}/unit`); }
    else if (profitability.netProfit >= 10) { score += 12; reasons.push(`Decent net profit of $${profitability.netProfit.toFixed(2)}/unit`); }
    else if (profitability.netProfit >= 5) { score += 5; }
    else if (profitability.netProfit < 3) { score -= 15; warnings.push('Net profit below $3/unit — not recommended'); }

    // Demand score (0-25 points)
    if (demandScore >= 80) { score += 25; reasons.push('Very high demand'); }
    else if (demandScore >= 60) { score += 15; reasons.push('High demand'); }
    else if (demandScore >= 40) { score += 8; }
    else { warnings.push('Low demand signals'); }

    // Competition (0-15 points)
    const compMap: Record<string, number> = { 'VERY_LOW': 15, 'LOW': 10, 'MEDIUM': 5, 'HIGH': 0, 'VERY_HIGH': -10 };
    const compScore = compMap[competitionLevel] ?? 5;
    score += compScore;
    if (competitionLevel === 'VERY_LOW' || competitionLevel === 'LOW') reasons.push('Low competition');
    else if (competitionLevel === 'HIGH' || competitionLevel === 'VERY_HIGH') warnings.push('High competition — buy box may be difficult');

    // Monthly sales viability (0-10 points)
    if (estimatedMonthlySales >= 100) { score += 10; reasons.push(`High velocity: ~${estimatedMonthlySales} units/month`); }
    else if (estimatedMonthlySales >= 30) { score += 5; }
    else if (estimatedMonthlySales < 10) { warnings.push('Very slow-moving product (<10/month)'); }

    // Recommendation based on score
    let recommendation: AIRecommendation['recommendation'];
    if (score >= 70)     recommendation = 'STRONG_BUY';
    else if (score >= 50) recommendation = 'BUY';
    else if (score >= 30) recommendation = 'HOLD';
    else if (score >= 15) recommendation = 'NEUTRAL';
    else                  recommendation = 'AVOID';

    // Risk level
    let riskLevel: AIRecommendation['riskLevel'];
    if (score >= 70)      riskLevel = 'VERY_LOW';
    else if (score >= 55) riskLevel = 'LOW';
    else if (score >= 35) riskLevel = 'MEDIUM';
    else if (score >= 20) riskLevel = 'HIGH';
    else                  riskLevel = 'VERY_HIGH';

    // Recommended quantity
    const maxByBudget = Math.floor(input.budget / input.purchasePrice);
    const maxByDemand = Math.ceil(estimatedMonthlySales * 1.5);
    let recommendedQuantity = Math.min(maxByBudget, maxByDemand);
    if (recommendation === 'AVOID') recommendedQuantity = 0;
    else if (recommendation === 'HOLD') recommendedQuantity = Math.min(3, recommendedQuantity);
    else if (recommendation === 'NEUTRAL') recommendedQuantity = Math.min(5, recommendedQuantity);

    // Estimated days to sell
    const dailySales = estimatedMonthlySales > 0 ? estimatedMonthlySales / 30 : 0.1;
    const estimatedDaysToSell = Math.ceil(recommendedQuantity / dailySales);

    const summary = `This product shows a ROI of ${profitability.roi.toFixed(1)}%, net profit of $${profitability.netProfit.toFixed(2)}/unit, ${competitionLevel.toLowerCase().replace('_', ' ')} competition and ${demandScore >= 60 ? 'strong' : demandScore >= 40 ? 'moderate' : 'weak'} demand. Recommendation: ${recommendation === 'STRONG_BUY' ? `buy up to ${recommendedQuantity} units` : recommendation === 'BUY' ? `buy ${recommendedQuantity} units` : recommendation}.`;

    return {
      recommendation,
      recommendedQuantity,
      bestMarketplace: 'AMAZON',
      riskLevel,
      estimatedDaysToSell,
      summary,
      reasons,
      warnings,
      score,
    };
  }

  private async aiRecommendation(input: RecommendationInput, fallback: AIRecommendation): Promise<AIRecommendation> {
    const prompt = `You are a retail arbitrage expert. Analyze this opportunity and provide a JSON recommendation.

Product: ${input.productTitle}
Category: ${input.productCategory ?? 'Unknown'}
Purchase Price: $${input.purchasePrice}
Expected Sale Price: $${input.sellPrice}
Net Profit/unit: $${input.profitability.netProfit.toFixed(2)}
ROI: ${input.profitability.roi.toFixed(1)}%
Margin: ${input.profitability.margin.toFixed(1)}%
FBA Fee: $${input.profitability.fulfillmentFee.toFixed(2)}
Referral Fee: $${input.profitability.referralFee.toFixed(2)}
Total Fees: $${(input.profitability.referralFee + input.profitability.fulfillmentFee).toFixed(2)}
Demand Score: ${input.demandScore}/100
Competition: ${input.competitionLevel} (${input.totalSellers} sellers, ${input.fbaSellerCount} FBA)
Est. Monthly Sales: ${input.estimatedMonthlySales}
Budget: $${input.budget}

Respond with JSON only:
{
  "recommendation": "STRONG_BUY|BUY|HOLD|NEUTRAL|AVOID",
  "recommendedQuantity": <number>,
  "bestMarketplace": "AMAZON|WALMART|EBAY",
  "riskLevel": "VERY_LOW|LOW|MEDIUM|HIGH|VERY_HIGH",
  "estimatedDaysToSell": <number>,
  "summary": "<1-2 sentence executive summary>",
  "reasons": ["<reason1>", "<reason2>"],
  "warnings": ["<warning1>"],
  "score": <0-100>
}`;

    const resp = await this.openai!.chat.completions.create({
      model: this.config.get('OPENAI_MODEL', 'gpt-4o-mini'),
      messages: [{ role: 'user', content: prompt }],
      max_tokens: this.config.get<number>('OPENAI_MAX_TOKENS', 500),
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = resp.choices[0]?.message?.content;
    if (!content) return fallback;

    const parsed = JSON.parse(content);
    return { ...fallback, ...parsed };
  }
}
