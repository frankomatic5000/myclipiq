import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface MemoryItem {
  id: string;
  content: string;
  tags: string[];
  created_at: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface MaintenanceSummary {
  timestamp: string;
  reviewQueueSize: number;
  autoApproved: number;
  flaggedForReview: number;
  duplicatesFound: number;
  errors: string[];
}

function runBrvCommand(command: string): string {
  try {
    return execSync(`brv ${command}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (error: any) {
    // brv may exit non-zero when no results, that's ok
    return error.stdout?.toString() || '';
  }
}

function parseItems(output: string): MemoryItem[] {
  const items: MemoryItem[] = [];
  const lines = output.split('\n').filter(l => l.trim());

  // Simple parsing - assumes brv outputs lines with id and tags
  for (const line of lines) {
    const tags: string[] = [];
    let impact: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';

    if (line.includes('#system') || line.includes('#routine')) impact = 'LOW';
    if (line.includes('#decision') || line.includes('#architecture') || line.includes('#security')) impact = 'HIGH';

    const tagMatches = line.match(/#\w+/g);
    if (tagMatches) tags.push(...tagMatches);

    if (line.length > 10) {
      items.push({
        id: `item-${items.length}`,
        content: line,
        tags,
        created_at: new Date().toISOString(),
        impact
      });
    }
  }

  return items;
}

function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export async function runMaintenance(): Promise<MaintenanceSummary> {
  const summary: MaintenanceSummary = {
    timestamp: new Date().toISOString(),
    reviewQueueSize: 0,
    autoApproved: 0,
    flaggedForReview: 0,
    duplicatesFound: 0,
    errors: []
  };

  try {
    // 1. Check review queue
    const pendingOutput = runBrvCommand('review pending');
    const pendingItems = parseItems(pendingOutput);
    summary.reviewQueueSize = pendingItems.length;

    // 2. Auto-approve LOW-impact items pending > 7 days
    for (const item of pendingItems) {
      const age = daysSince(item.created_at);
      if (item.impact === 'LOW' && age > 7) {
        try {
          runBrvCommand(`review approve ${item.id}`);
          summary.autoApproved++;
        } catch (e: any) {
          summary.errors.push(`Failed to approve ${item.id}: ${e.message}`);
        }
      }
    }

    // 3. Flag HIGH-impact items for review
    const highImpactSearch = runBrvCommand('search "#decision OR #architecture OR #security" --since "7 days ago"');
    const highImpactItems = parseItems(highImpactSearch);
    summary.flaggedForReview = highImpactItems.length;

    // 4. Search for duplicates (consolidation pass)
    const dupSearch1 = runBrvCommand('search "merge decision"');
    const dupSearch2 = runBrvCommand('search "deploy success"');
    const dupSearch3 = runBrvCommand('search "rollback"');

    const allDupCandidates = [
      ...parseItems(dupSearch1),
      ...parseItems(dupSearch2),
      ...parseItems(dupSearch3)
    ];

    // Simple duplicate detection: similar content
    const seen = new Set<string>();
    for (const item of allDupCandidates) {
      const key = item.content.toLowerCase().slice(0, 60);
      if (seen.has(key)) {
        summary.duplicatesFound++;
      } else {
        seen.add(key);
      }
    }

    // 5. Write summary JSON
    const outputDir = path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const reportPath = path.join(outputDir, `memory-maintenance-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));

    console.log('Memory maintenance complete');
    console.log(JSON.stringify(summary, null, 2));

    return summary;
  } catch (error: any) {
    summary.errors.push(`Fatal error: ${error.message}`);
    return summary;
  }
}

// Run if executed directly
if (require.main === module) {
  runMaintenance().catch(console.error);
}
