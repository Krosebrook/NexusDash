import { DashboardMetric, AuditLog, CostRecord, IntegrationError } from '../types';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate random ID
const uuid = () => Math.random().toString(36).substr(2, 9);

// State to track resolved issues during the session
let resolvedIssues = new Set<string>();

export const resolveIssue = async (source: string): Promise<boolean> => {
  await delay(1500); // Simulate processing time
  resolvedIssues.add(source.toLowerCase());
  return true;
};

export const fetchDashboardMetrics = async (): Promise<DashboardMetric[]> => {
  await delay(800 + Math.random() * 1000); // Simulate 0.8s - 1.8s latency

  const now = new Date();

  // 1. Success Case: HubSpot Deals
  const deals: DashboardMetric = {
    id: uuid(),
    source: 'hubspot',
    sourceKey: 'hubspot:deals:closed_won',
    label: 'Closed Won Deals (Q3)',
    value: 142500,
    unit: 'currency',
    trend: 'up',
    changePercent: 12.5,
    timestamp: now,
    refreshedAt: now,
    refreshInterval: 300000,
  };

  // 2. Success Case: Freshdesk Tickets
  const tickets: DashboardMetric = {
    id: uuid(),
    source: 'freshdesk',
    sourceKey: 'freshdesk:tickets:open',
    label: 'Open Support Tickets',
    value: 24,
    unit: 'count',
    trend: 'down',
    changePercent: -5.2,
    timestamp: now,
    refreshedAt: now,
    refreshInterval: 60000,
  };

  // 3. Conditional Case: GitHub (Rate Limited -> Fixed)
  let prs: DashboardMetric;
  if (resolvedIssues.has('github')) {
    prs = {
      id: uuid(),
      source: 'github',
      sourceKey: 'github:prs:open',
      label: 'Open Pull Requests',
      value: 12,
      unit: 'count',
      trend: 'flat',
      changePercent: 0,
      timestamp: now,
      refreshedAt: now,
      refreshInterval: 300000,
    };
  } else {
    const githubError: IntegrationError = {
      source: 'github',
      code: 'RATE_LIMIT',
      cause: 'API Rate limit exceeded (5000/5000)',
      fix: 'Quota resets in 14 minutes. Upgrade plan or reduce polling.',
      retryable: true,
      retryAfter: new Date(now.getTime() + 14 * 60000),
      timestamp: now,
    };
    prs = {
      id: uuid(),
      source: 'github',
      sourceKey: 'github:prs:open',
      label: 'Open Pull Requests',
      value: 0,
      unit: 'count',
      timestamp: now,
      refreshedAt: now,
      refreshInterval: 300000,
      error: githubError,
    };
  }

  // 4. Success Case: Gemini Token Usage
  const aiTokens: DashboardMetric = {
    id: uuid(),
    source: 'gemini',
    sourceKey: 'gemini:tokens:used_today',
    label: 'Gemini 1.5 Pro Token Usage',
    value: 843921,
    unit: 'count',
    trend: 'up',
    changePercent: 45.2,
    timestamp: now,
    refreshedAt: now,
    refreshInterval: 300000,
  };

  // 5. Conditional Case: Stripe (Auth Error -> Fixed)
  let revenue: DashboardMetric;
  if (resolvedIssues.has('stripe')) {
    revenue = {
      id: uuid(),
      source: 'stripe',
      sourceKey: 'stripe:mrr',
      label: 'Monthly Recurring Revenue',
      value: 42590,
      unit: 'currency',
      trend: 'up',
      changePercent: 8.4,
      timestamp: now,
      refreshedAt: now,
      refreshInterval: 3600000,
    };
  } else {
    const stripeError: IntegrationError = {
      source: 'stripe',
      code: 'AUTH_FAILED',
      cause: '401 Unauthorized: Invalid API Key',
      fix: 'Rotate API keys in Settings > Integrations.',
      retryable: false,
      timestamp: now,
    };
    revenue = {
      id: uuid(),
      source: 'stripe',
      sourceKey: 'stripe:mrr',
      label: 'Monthly Recurring Revenue',
      value: 0,
      unit: 'currency',
      timestamp: now,
      refreshedAt: now,
      refreshInterval: 3600000,
      error: stripeError,
    };
  }

  // 6. Success Case: Slack
  const slackMsgs: DashboardMetric = {
    id: uuid(),
    source: 'slack',
    sourceKey: 'slack:messages:today',
    label: 'Slack Messages (Today)',
    value: 1240,
    unit: 'count',
    trend: 'up',
    changePercent: 18.2,
    timestamp: now,
    refreshedAt: now,
    refreshInterval: 60000,
  };

  // 7. Success Case: Jira
  const jiraIssues: DashboardMetric = {
    id: uuid(),
    source: 'jira',
    sourceKey: 'jira:issues:critical',
    label: 'Critical Jira Bugs',
    value: 3,
    unit: 'count',
    trend: 'down',
    changePercent: -25.0,
    timestamp: now,
    refreshedAt: now,
    refreshInterval: 120000,
  };

  return [deals, tickets, prs, aiTokens, revenue, slackMsgs, jiraIssues];
};

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  await delay(400);
  const sources: any[] = ['hubspot', 'gemini', 'stripe', 'github', 'slack', 'jira'];
  const actions: any[] = ['FETCH', 'WEBHOOK', 'AUTH', 'ERROR'];
  const logs: AuditLog[] = [];

  for (let i = 0; i < 15; i++) {
    const isError = Math.random() > 0.85;
    logs.push({
      id: uuid(),
      action: actions[Math.floor(Math.random() * actions.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      status: isError ? 'failure' : 'success',
      details: isError ? 'Connection timeout after 3000ms' : 'Successfully synced records',
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)),
      requestId: `req_${uuid()}`,
    });
  }
  
  // Add fix logs if any
  resolvedIssues.forEach(source => {
     logs.unshift({
        id: uuid(),
        action: 'CONFIG_CHANGE',
        source: source as any,
        status: 'success',
        details: 'Automated remediation applied via Nexus Assistant',
        timestamp: new Date(),
        requestId: `req_${uuid()}`,
     });
  });

  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const fetchCostData = async (): Promise<CostRecord[]> => {
  return [
    { month: '2023-10', source: 'gemini', cost: 12.50, currency: 'USD' },
    { month: '2023-10', source: 'hubspot', cost: 45.00, currency: 'USD' },
    { month: '2023-10', source: 'slack', cost: 12.00, currency: 'USD' },
    { month: '2023-10', source: 'jira', cost: 65.00, currency: 'USD' },
    { month: '2023-11', source: 'gemini', cost: 28.40, currency: 'USD' },
    { month: '2023-11', source: 'hubspot', cost: 45.00, currency: 'USD' },
    { month: '2023-11', source: 'slack', cost: 12.00, currency: 'USD' },
    { month: '2023-11', source: 'jira', cost: 65.00, currency: 'USD' },
    { month: '2023-12', source: 'gemini', cost: 42.10, currency: 'USD' },
    { month: '2023-12', source: 'hubspot', cost: 45.00, currency: 'USD' },
    { month: '2023-12', source: 'slack', cost: 14.00, currency: 'USD' },
    { month: '2023-12', source: 'jira', cost: 65.00, currency: 'USD' },
  ];
};