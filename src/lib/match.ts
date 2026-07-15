type MatchableJob = { title: string; description: string; categoryName: string };

export function matchScore(userSkills: string, job: MatchableJob): number {
  const skills = userSkills
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (skills.length === 0) return 0;

  const category = job.categoryName.toLowerCase().trim();
  const haystack = `${job.title} ${job.description}`.toLowerCase();

  let score = 0;
  for (const skill of skills) {
    if (category === skill) score += 3;
    if (haystack.includes(skill)) score += 1;
  }
  return score;
}

export function rankJobs<T extends MatchableJob>(userSkills: string, jobs: T[]): (T & { score: number })[] {
  return jobs
    .map((j) => ({ ...j, score: matchScore(userSkills, j) }))
    .filter((j) => j.score > 0)
    .sort((a, b) => b.score - a.score);
}
