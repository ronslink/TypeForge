import { describe, expect, it, vi } from 'vitest';
import { COMPOSITION_INPUT_VERSION, IMEHandler } from './ime.js';

describe('IMEHandler', () => {
  it('keeps pre-edit text uncommitted and emits only the final composition', () => {
    const handler = new IMEHandler();
    const onCommit = vi.fn();
    handler.onCommit(onCommit);

    handler.handleCompositionStart();
    handler.handleCompositionUpdate({ data: 'に' });
    handler.handleInput({
      data: 'に',
      value: 'に',
      inputType: 'insertCompositionText',
      isComposing: true,
    });

    expect(handler.state).toEqual({ isComposing: true, compositionText: 'に' });
    expect(onCommit).not.toHaveBeenCalled();

    const commit = handler.handleCompositionEnd({ data: '日本' });
    expect(commit).toMatchObject({
      committed: '日本',
      inputVersion: COMPOSITION_INPUT_VERSION,
      source: 'composition',
    });
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it('does not double-commit the input event echoed after compositionend', () => {
    const handler = new IMEHandler();
    const onCommit = vi.fn();
    handler.onCommit(onCommit);

    handler.handleCompositionStart();
    handler.handleCompositionEnd({ data: '한' });
    handler.handleInput({ data: '한', value: '한', inputType: 'insertText' });

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(expect.objectContaining({ committed: '한' }));
  });

  it('cancels composition without scoring pre-edit', () => {
    const handler = new IMEHandler();
    const onCommit = vi.fn();
    handler.onCommit(onCommit);

    handler.handleCompositionStart();
    handler.handleCompositionUpdate({ data: '候補' });
    handler.handleCompositionCancel();

    expect(handler.state).toEqual({ isComposing: false, compositionText: '' });
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('emits ordinary native input without requiring a keydown', () => {
    const handler = new IMEHandler();
    const onCommit = vi.fn();
    handler.onCommit(onCommit);

    const commit = handler.handleInput({ data: 'é', inputType: 'insertText' });

    expect(commit).toMatchObject({ committed: 'é', source: 'input' });
    expect(onCommit).toHaveBeenCalledTimes(1);
  });
});
