import { AgentState } from '../state';

export async function respondNode(state: AgentState): Promise<Partial<AgentState>> {
  const content = state.finalResponse ?? 'No response generated.';
  const messages = [...state.messages, { role: 'assistant' as const, content }];

  return {
    messages,
    stepCount: state.stepCount + 1,
  };
}
