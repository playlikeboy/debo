import { AgentState } from '../state';

export async function planNode(state: AgentState): Promise<Partial<AgentState>> {
  const query = state.query.toLowerCase();
  const plan: string[] = [];

  // Identify information retrieval keywords
  if (
    query.includes('what') ||
    query.includes('who') ||
    query.includes('when') ||
    query.includes('where') ||
    query.includes('remember') ||
    query.includes('recall') ||
    query.includes('history') ||
    query.includes('how')
  ) {
    plan.push(`Search personal memory context for '${state.query}'`);
  }

  // Identify tool/action intents
  if (query.includes('send') || query.includes('email') || query.includes('message')) {
    plan.push('Prepare communication action');
  } else if (query.includes('create issue') || query.includes('github')) {
    plan.push('Prepare developer issue action');
  } else if (query.includes('delete') || query.includes('purge')) {
    plan.push('Prepare destructive action with mandatory human approval');
  }

  if (plan.length === 0) {
    plan.push(`Synthesize context and answer '${state.query}'`);
  }

  return {
    plan,
    stepCount: state.stepCount + 1,
  };
}
