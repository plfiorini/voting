export async function saveVote(voterId: string, vote: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const object = { voterId: voterId, vote: vote };
    // TODO: Save data
    resolve();
  });
}
