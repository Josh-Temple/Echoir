export const playAudio = async (audioPath: string): Promise<{ ok: boolean; message?: string }> => {
  const audio = new Audio(audioPath);

  try {
    await audio.play();
    return { ok: true };
  } catch {
    return { ok: false, message: 'Audio unavailable for this item.' };
  }
};
